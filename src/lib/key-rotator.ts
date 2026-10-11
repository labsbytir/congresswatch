export class ApiKeyRotator {
  private keys: string[] = [];
  private currentIndex = 0;

  constructor(keysStringOrArray?: string | string[]) {
    if (Array.isArray(keysStringOrArray)) {
      this.keys = keysStringOrArray.filter(Boolean);
    } else if (typeof keysStringOrArray === 'string') {
      this.keys = keysStringOrArray
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
    }
  }

  addKey(key?: string) {
    if (key && !this.keys.includes(key.trim())) {
      this.keys.push(key.trim());
    }
  }

  getKey(): string {
    if (this.keys.length === 0) return '';
    const key = this.keys[this.currentIndex % this.keys.length];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }

  totalKeys(): number {
    return this.keys.length;
  }
}

export function getRotatedCongressKey(env: any): string {
  const keys: string[] = [];

  // 1. Support comma-separated CONGRESS_API_KEYS
  if (env.CONGRESS_API_KEYS) {
    keys.push(...env.CONGRESS_API_KEYS.split(',').map((k: string) => k.trim()));
  }

  // 2. Support individual numbered keys CONGRESS_API_KEY_1, CONGRESS_API_KEY_2, etc.
  for (let i = 1; i <= 6; i++) {
    const keyVal = env[`CONGRESS_API_KEY_${i}`];
    if (keyVal) keys.push(keyVal.trim());
  }

  // 3. Fallback to standard CONGRESS_API_KEY
  if (env.CONGRESS_API_KEY) {
    keys.push(env.CONGRESS_API_KEY.trim());
  }

  const uniqueKeys = Array.from(new Set(keys)).filter(Boolean);
  if (uniqueKeys.length === 0) return 'DEMO_KEY';

  // Pseudorandom / rotation selection
  const randIndex = Math.floor(Math.random() * uniqueKeys.length);
  return uniqueKeys[randIndex];
}

