# CongressWatch

> An enterprise-grade legislative intelligence platform built on Cloudflare Workers, Cloudflare D1, Cloudflare R2, Cloudflare Vectorize, and Workers AI.

CongressWatch continuously monitors congressional activity, bills, amendments, member profiles, insider stock transactions, committee referrals, and public social statements. It features semantic conversational search, interactive district demographics, GitHub-style redline text comparisons, and high-performance document viewers.

---

## Key Features

- **Google-Style Dual Search Engine**:
  - **Classic**: High-speed keyword, phrase, and faceted filter search across bills, OCR text, and legislators.
  - **Smart+**: Conversational RAG driven by **Cloudflare Vectorize** and **Workers AI** with page-level bill citations.
- **ChatGPT-Style Persistent History**:
  - Left navigation drawer organizing prior searches and AI chat sessions chronologically (Today, Last 7 Days, Last 30 Days).
- **Congress & Legislators**:
  - Dynamic **Congress** directory with opposing continuous-motion parallax background rows (partisan color wash: Democrat blue vs. Republican red).
  - Member profiles with term length, bills proposed/sponsored, net worth estimate, committee roles, and contact information.
- **Interactive Congressional District Maps**:
  - Demographic and electoral overlays: population, median household income, average household size, historical voter turnout, and party affiliation ratio.
- **Congressional Insider Trading Tracker**:
  - Single-ingest data pipeline tracking stock transactions from Senate eFD disclosures and financial datasets, stored in R2 and queryable via D1 and Vectorize.
- **Member Social Feeds (Twitter/X via RSSHub)**:
  - Automated single-ingest feed powered by `https://rsstown.com` for member tweets, cross-referencing mentioned bills automatically.
- **Document Viewing & Historical Milestones**:
  - **Mozilla PDF.js** embedded viewer for streaming OCR-processed bill PDFs with highlight synchronization.
  - **KnightLab TimelineJS** interactive visual timelines documenting bill stages, committee markups, and historical amendments.
  - **GitHub-Style Redline Diff**: Side-by-side split and unified diff comparison across bill versions (`IH`, `RH`, `EH`, `ENR`) and amendments.
- **Dynamic OpenGraph Engine (`og-img`)**:
  - Edge-generated 1200x630 WebP preview cards featuring bill titles, introduction dates, sponsor portrait badges, and a 3D cascading 3-page bill stack.
- **WorkOS AuthKit & Alerts**:
  - Multi-user authentication, saved bills, team workspaces, CRM outreach logs, and custom multi-channel alerts (Custom SMTP + Cloudflare Email Routing).

---

## Tech Stack

- **Edge Runtime & APIs**: Cloudflare Workers, Cloudflare D1 (SQLite), Cloudflare R2 (Object Storage), Cloudflare Vectorize, Workers AI.
- **Web Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Hermes Agent-inspired 3-layer palette using CSS `color-mix()`, and shadcn/ui-styled components.
- **Document & Visual Libraries**:
  - [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) (PDF rendering & text highlight sync)
  - [KnightLab TimelineJS](https://timeline.knightlab.com/docs/index.html) (Bill milestone & amendment timelines)
  - [fabian-hiller/og-img](https://github.com/fabian-hiller/og-img) (Dynamic edge OpenGraph cards)
  - [OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF) (Searchable PDF OCR layer)

---

## Cloudflare R2 Storage Hierarchy

All assets are organized within the main bucket `watchers` under the root project directory `/watchers/congresswatch/`:

```
/watchers/congresswatch/
├── bills/
│   └── {congress}/{bill_type}/{bill_number}/
│       ├── original.pdf
│       ├── ocr.pdf
│       ├── text.json
│       ├── versions/
│       │   └── {version_code}/ (bill.pdf, bill.xml, bill.html, bill.md)
│       └── amendments/
│           └── {amendment_number}/ (text.md, metadata.json)
├── opengraph/
│   ├── {bill_id}.webp
│   └── pages/{bill_id}/
│       ├── page-1.png
│       ├── page-2.png
│       └── page-3.png
├── members/
│   ├── {bioguide_id}.json
│   └── {bioguide_id}.jpg
├── congressional-trading/
│   ├── transactions.json
│   ├── senate/{year}/{bioguide_id}.json
│   └── house/{year}/{bioguide_id}.json
├── social/
│   └── twitter/{bioguide_id}/feed.json
└── districts/
    ├── geojson/{state}_{district}.geojson
    └── demographics/{state}_{district}.json
```

---

## Setup Instructions

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0 or pnpm >= 9.0.0
- Cloudflare Wrangler CLI (`npx wrangler`)
- Python 3.10+ (for OCR & ingestion pipelines)

### Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/labsbytir/congresswatch.git
   cd congresswatch
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .dev.vars
   ```
   Fill in your API keys for:
   - `CONGRESS_API_KEY` (from https://api.congress.gov/)
   - `WORKOS_API_KEY` & `WORKOS_CLIENT_ID`
   - `FMP_API_KEY` (Financial Modeling Prep for senate insider trades)

4. **Initialize Cloudflare D1 Local Database**:
   ```bash
   npx wrangler d1 migrations apply DB --local
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Continuous Deployment

This repository connects natively to Cloudflare Workers via the Cloudflare GitHub integration. Pushes to `main` automatically deploy to edge production. Pull requests trigger preview environments.

