# CongressWatch Developer API Specification (v1)

> **Status:** Planned Future Release  
> **Base URL:** `https://api.congresswatch.org/v1`  
> **Authentication:** Bearer API Token (`Authorization: Bearer cw_live_...`)  
> **Format:** JSON (UTF-8), RFC 7807 Problem Details for Errors

---

## 1. Authentication & Security Architecture

- **Token Structure**:
  - `cw_live_<32_random_bytes>` (Production)
  - `cw_test_<32_random_bytes>` (Sandbox / Development)
- **Validation**:
  - Keys are hashed with SHA-256 before verification against Cloudflare D1 (`api_keys`).
  - Scopes are enforced at the Cloudflare Worker gateway level before hitting handlers.
- **Rate Limiting & Metering**:
  - Driven by Cloudflare Workers Rate Limiting & Monetization Gateway.
  - Standard headers returned on every response:
    - `X-RateLimit-Limit`: Requests per minute permitted.
    - `X-RateLimit-Remaining`: Requests left in current window.
    - `X-RateLimit-Reset`: Epoch timestamp when quota resets.

---

## 2. API Endpoints Map

### A. Bills & Legislative Lifecycle
| Method | Endpoint | Description | Scopes Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/bills` | Search & list bills (filtering by status, sponsor, committee, date) | `bills:read` |
| `GET` | `/bills/:billId` | Get complete bill dossier with deterministic & AI summaries | `bills:read` |
| `GET` | `/bills/:billId/versions` | List all published text versions (`IH`, `RH`, `EH`, `ENR`) | `bills:read` |
| `GET` | `/bills/:billId/diff` | Fetch Myers/token redline diff between any two versions | `bills:read` |
| `GET` | `/bills/:billId/amendments` | Retrieve submitted and adopted amendments | `bills:read` |
| `GET` | `/bills/:billId/timeline` | KnightLab TimelineJS-compatible chronological JSON | `bills:read` |

### B. Members & Congressional Districts
| Method | Endpoint | Description | Scopes Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/members` | List members with party, state, chamber, net worth, and stats | `members:read` |
| `GET` | `/members/:bioguideId` | Full member profile, committee assignments, and contact data | `members:read` |
| `GET` | `/members/:bioguideId/trades` | Filterable disclosure history of stock transactions | `trades:read` |
| `GET` | `/members/:bioguideId/tweets` | Cached public statements & tweets (via RSSHub rsstown.com) | `social:read` |
| `GET` | `/districts/:districtCode` | GeoJSON boundary + Census demographics & voting breakdown | `districts:read` |

### C. Predictive Intelligence & Market Modeling
| Method | Endpoint | Description | Scopes Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/predictions/bills/:billId` | ML passage probability, committee hurdle score, and feature weights | `predictions:read` |
| `GET` | `/markets/correlations` | Sector volatility & equity price impacts tied to legislative events | `markets:read` |
| `GET` | `/infrastructure/impacts` | Map bills to critical infrastructure nodes & mineral dependencies | `infrastructure:read` |

### D. Regulatory & Executive Alignments
| Method | Endpoint | Description | Scopes Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/agencies/rulemakings` | Federal Register notices and rules cross-referenced by bill ID | `agencies:read` |
| `GET` | `/appropriations/line-items` | Federal budget line-items, earmarks, and policy riders | `appropriations:read` |
| `GET` | `/sanctions/correlations` | OFAC/BIS/ITAR entities impacted by legislation | `sanctions:read` |

### E. Semantic Smart+ AI Search (RAG)
| Method | Endpoint | Description | Scopes Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/search/smart` | Vector search + Llama 3.3 70B conversational synthesis with citations | `ai:search` |

---

## 3. Webhook Event System (Real-Time Push Subscriptions)

Developers configure webhook URLs with an HMAC-SHA256 signature secret.

### Supported Event Types:
- `bill.introduced`
- `bill.status_changed` (e.g., reported out of committee, passed floor)
- `bill.amendment_offered`
- `trade.disclosed` (new Senate/House periodic transaction report)
- `rulemaking.published` (new agency rule tied to a statute)
- `prediction.recalculated` (major shift in passage probability)

### Webhook Signature Header:
```http
X-CongressWatch-Signature: t=1729000000,v1=5d41402abc4b2a76b9719d911017c592...
```

