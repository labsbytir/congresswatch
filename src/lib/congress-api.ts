/**
 * Official Congress.gov REST API Client (v3)
 * Full endpoint coverage for bills, actions, text versions, amendments, cosponsors, and committees.
 * Official Documentation: https://api.congress.gov/
 */

export interface CongressApiConfig {
  apiKey: string;
  baseUrl?: string;
}

export class CongressApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CongressApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.congress.gov/v3';
  }

  private async request<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('format', 'json');

    for (const [key, val] of Object.entries(params)) {
      url.searchParams.set(key, String(val));
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CongressWatch-Official-Client/1.0'
      }
    });

    if (!res.ok) {
      throw new Error(`Congress.gov API Error [${res.status}]: ${await res.text()}`);
    }

    return res.json() as Promise<T>;
  }

  // 1. Bill Details
  async getBill(congress: number, type: string, number: number) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}`);
  }

  // 2. Bill Actions (Floor votes, referrals, markups)
  async getBillActions(congress: number, type: string, number: number, limit = 100) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/actions`, { limit });
  }

  // 3. Bill Cosponsors (Official bioguide mappings)
  async getBillCosponsors(congress: number, type: string, number: number, limit = 100) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/cosponsors`, { limit });
  }

  // 4. Bill Text Versions (PDF, XML, HTML download links)
  async getBillText(congress: number, type: string, number: number) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/text`);
  }

  // 5. Bill Amendments (Submitted, proposed, agreed to)
  async getBillAmendments(congress: number, type: string, number: number) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/amendments`);
  }

  // 6. Bill Committees & Referrals
  async getBillCommittees(congress: number, type: string, number: number) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/committees`);
  }

  // 7. Bill Subjects & Policy Areas
  async getBillSubjects(congress: number, type: string, number: number) {
    return this.request<any>(`/bill/${congress}/${type.toLowerCase()}/${number}/subjects`);
  }

  // 8. Official Member Dossier
  async getMember(bioguideId: string) {
    return this.request<any>(`/member/${bioguideId}`);
  }

  // 9. Committee Details
  async getCommittee(chamber: 'house' | 'senate', committeeCode: string) {
    return this.request<any>(`/committee/${chamber}/${committeeCode}`);
  }
}

