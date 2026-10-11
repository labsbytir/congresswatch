export interface RateLimitResult {
  allowed: boolean;
  dailyRemaining: number;
  monthlyRemaining: number;
  resetDailyEpoch: number;
  resetMonthlyEpoch: number;
  error?: string;
}

export class RateLimiterDO implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const dailyLimit = parseInt(url.searchParams.get("dailyLimit") || "100", 10);
    const monthlyLimit = parseInt(url.searchParams.get("monthlyLimit") || "1500", 10);

    const now = Date.now();
    const currentDay = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD
    const currentMonth = new Date(now).toISOString().slice(0, 7); // YYYY-MM

    // Atomic storage reads via Durable Object SQLite / storage
    const storage = this.state.storage;
    let storedDay = (await storage.get<string>("last_day")) || currentDay;
    let dayCount = (await storage.get<number>("day_count")) || 0;

    let storedMonth = (await storage.get<string>("last_month")) || currentMonth;
    let monthCount = (await storage.get<number>("month_count")) || 0;

    // Daily reset check
    if (storedDay !== currentDay) {
      dayCount = 0;
      storedDay = currentDay;
      await storage.put("last_day", currentDay);
    }

    // Monthly reset check
    if (storedMonth !== currentMonth) {
      monthCount = 0;
      storedMonth = currentMonth;
      await storage.put("last_month", currentMonth);
    }

    // Check limits
    if (dayCount >= dailyLimit) {
      return new Response(JSON.stringify({
        allowed: false,
        dailyRemaining: 0,
        monthlyRemaining: Math.max(0, monthlyLimit - monthCount),
        error: "Daily rate limit of 100 requests exceeded. Resets at midnight UTC."
      } satisfies RateLimitResult), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    if (monthCount >= monthlyLimit) {
      return new Response(JSON.stringify({
        allowed: false,
        dailyRemaining: Math.max(0, dailyLimit - dayCount),
        monthlyRemaining: 0,
        error: "Monthly quota of 1,500 requests exceeded. Resets on the 1st of next month."
      } satisfies RateLimitResult), { status: 429, headers: { "Content-Type": "application/json" } });
    }

    // Increment atomically
    dayCount += 1;
    monthCount += 1;
    await storage.put("day_count", dayCount);
    await storage.put("month_count", monthCount);

    return new Response(JSON.stringify({
      allowed: true,
      dailyRemaining: dailyLimit - dayCount,
      monthlyRemaining: monthlyLimit - monthCount,
      resetDailyEpoch: Math.floor(new Date(currentDay + "T23:59:59Z").getTime() / 1000),
      resetMonthlyEpoch: Math.floor(new Date(currentMonth + "-28T23:59:59Z").getTime() / 1000)
    } satisfies RateLimitResult), { headers: { "Content-Type": "application/json" } });
  }
}

