<p align="center">
  <a href="https://github.com/labsbytir/congresswatch">
    <img src="https://raw.githubusercontent.com/labsbytir/congresswatch/main/public/brand/logo.svg" alt="Congress Watch Logo" width="420" />
  </a>
</p>

<p align="center">
  <strong>An enterprise-grade legislative intelligence, procurement tracking, and civic engagement platform.</strong><br />
  Built on Cloudflare Workers, Cloudflare D1, Cloudflare R2, Cloudflare Vectorize, Orama, and Together AI.
</p>

<p align="center">
  <a href="https://github.com/labsbytir/congresswatch/actions">
    <img src="https://img.shields.io/badge/CI-Passing-success?style=flat-square&logo=github" alt="CI Status" />
  </a>
  <a href="https://discord.gg/vXkPvAkuvN">
    <img src="https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=flat-square&logo=discord&logoColor=white" alt="Discord Server" />
  </a>
  <a href="https://buymeacoffee.com/postdated">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-Donate-FFDD00?style=flat-square&logo=buymeacoffee&logoColor=black" alt="Buy Me A Coffee Badge" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square" alt="License" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Cloudflare_D1-SQLite-F38020?style=flat-square&logo=sqlite&logoColor=white" alt="Cloudflare D1" />
  <img src="https://img.shields.io/badge/Cloudflare_R2-Storage-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare R2" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20+-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Orama-Search-FF6000?style=flat-square" alt="Orama" />
  <img src="https://img.shields.io/badge/Together_AI-Llama_3.3_70B-7928CA?style=flat-square&logo=meta&logoColor=white" alt="Together AI" />
  <img src="https://img.shields.io/badge/Playwright-Stealth-2EAD33?style=flat-square&logo=playwright&logoColor=white" alt="Playwright" />
</p>

<p align="center">
  <a href="https://buymeacoffee.com/postdated" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="42" />
  </a>
</p>

---

## Overview

**CongressWatch** monitors the United States Congress, bridging statutory law, regulatory enforcement, federal procurement, insider financial disclosures, and public rhetoric into a unified investigative portal. Designed with an editorial aesthetic inspired by **OpenSecrets**, the platform provides deep transparency for policy analysts, journalists, compliance officers, and engaged citizens.

---

## Key Features

### 🏛️ Legislative Intelligence & Monitoring
- **Real-Time Congress Tracking**: Automated synchronization with [Congress.gov](https://api.congress.gov/) for bill introductions, committee markups, roll-call floor votes, and presidential actions.
- **Side-by-Side Redline Diff**: GitHub-style split and unified diff comparison engine highlighting additions and deletions across bill versions (`IH`, `RH`, `EH`, `ENR`) and proposed amendments.
- **Embedded Document Viewers**:
  - [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for streaming official bill PDFs with real-time text highlight synchronization.
  - [KnightLab TimelineJS](https://timeline.knightlab.com/docs/index.html) for visual chronological tracking of a bill's lifecycle.
- **Dual Summarization Engine**:
  - *Deterministic*: Algorithmic sentence ranking via the [MasoudKaviani Extractor](https://gist.github.com/MasoudKaviani/d3b213d0d184bd1fe77601a249f9f61d) for verbatim, un-hallucinated citations.
  - *Executive Synthesis*: Conversational analysis powered by Together AI's `meta-llama/Llama-3.3-70B-Instruct-Turbo` and Cloudflare Workers AI.

### 🔍 Search Architecture: Dual-Engine
- **Universal Search Bar**: Clean centralized interface with category selectors (Bills, Lawmakers, Lobbyists, Trades, Contracts).
  - **Classic Mode**: Sub-millisecond keyword, exact-phrase, and faceted filtering (Chamber, Party, Committee, Status, Date) powered by our standalone **Orama Search Cluster** on VPS.
  - **Smart+ Mode**: Conversational RAG driven by **Cloudflare AI Search** and **Vectorize**, synthesizing answers with footnote citations linking to exact pages and paragraphs.
- **Conversational Workspace Drawer**: Persistent left navigation drawer organizing prior searches and research sessions chronologically (Today, Last 7 Days, Last 30 Days).

### 💼 SAM.gov Federal Procurement & Congressional Linking
- **Statutory Authority Linking**: Real-time regex engine parsing federal solicitations and Statement of Work (SOW) documents for Public Law numbers (`P.L. XX-XX`) and bill numbers (`H.R. XXXX`, `S. XXXX`).
- **NAICS Code to Committee Matrix**: Relational mapping aligning 6-digit industry sectors (e.g., Biotechnology R&D `541715`) with the congressional committees holding budget jurisdiction over them.
- **Dual Procurement Ingestion**:
  - Cloudflare Worker ingestion for direct public API opportunities.
  - Playwright Stealth VPS scraper for downloading public solicitation attachments directly into Cloudflare R2 (`/watchers/congresswatch/procurement/`).

### 📈 Financial Tracking & Member Profiles
- **Congressional Insider Trading**: Ingests periodic transaction reports from Senate eFD and financial disclosures, vectorizing trades so users can search portfolio shifts against legislative actions.
- **Dynamic Congress Directory**: Bi-directional continuous-motion parallax background rows with subtle partisan duotone color washes (Democrat Blue vs. Republican Red).
- **Interactive District Demographic Maps**: [Mapbox GL JS](https://www.mapbox.com/) / [Leaflet](https://leafletjs.com/) maps rendering congressional district boundaries with US Census population, household income, and historical voter turnout.
- **Social Media Radar**: Single-ingest caching of congressional tweets via [RSSHub](https://rsshub-doc.pages.dev/en/parameter.html) on `rsstown.com`, cross-referencing legislation automatically.

### 🔒 Shared AI Chats & Provenance Verification
- **Frozen Session Snapshots (`/share/:id`)**: Share research sessions in their exact state at the moment of sharing. Subsequent turns do not alter the public link.
- **Scrape Defense & Password Protection**: Optional password protection hashed in Cloudflare KV (`API_CACHE_KV`) preventing automated bot scraping.
- **External Viewer Fork Flow**: Visitors can read the chat and type into the input bar. Submitting redirects to WorkOS AuthKit and forks the session with its full prior context into their personal workspace.
- **Grounding Sources Sidebar**: Persistent right sidebar detailing official source URLs, extracted sections, and exact retrieval timestamps for complete auditability.

### 🎮 Gamification & Community Engagement
- **Fantasy Congress**: Draft rosters of legislators and earn civic points based on floor votes, passed bills, and bipartisan co-sponsors.
- **Play-Money Prediction Markets**: 1,000 free starting tokens to forecast legislative milestones.
- **The Whip Count Simulator**: Virtual majority whip clipboard to model floor vote outcomes.

---

## Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Local Satoshi Font Family, Chart.js, Mozilla PDF.js, KnightLab TimelineJS, Mapbox/Leaflet |
| **Edge Compute & Hosting** | Cloudflare Workers (V8), Cloudflare Assets, Cloudflare Workflows, Cloudflare Queues |
| **Data Storage** | Cloudflare D1 (SQLite), Cloudflare R2 (`watchers` bucket), Cloudflare KV |
| **Search Engines** | Standalone Orama Search Cluster (VPS), Cloudflare AI Search & Vectorize |
| **AI Models** | Together AI (`Llama-3.3-70B-Turbo`), Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`) |
| **Python Pipelines** | Playwright Stealth, OCRmyPDF, `difflib`, `boto3`, `requests` |
| **Auth & Security** | WorkOS AuthKit, Cloudflare Durable Objects (Rate Limiter: 100/day, 1,500/month), Cloudflare Turnstile |

---

## Cloudflare R2 Storage Hierarchy

All files live within the root bucket `watchers` under `/watchers/congresswatch/`:

```
/watchers/congresswatch/
├── bills/
│   └── {congress}/{bill_type}/{bill_number}/
│       ├── original.pdf                    (official PDF from Congress.gov)
│       ├── ocr.pdf                         (OCRmyPDF output with text layer)
│       ├── text.json                       (extracted text chunks)
│       ├── diffs/{v1}_vs_{v2}.json         (Myers redline comparison)
│       └── versions/{version_code}/        (bill.pdf, bill.xml, bill.html, bill.md)
├── opengraph/
│   ├── {bill_id}.webp                      (dynamic 1200x630 card via og-img)
│   └── pages/{bill_id}/page-{1,2,3}.png
├── members/
│   ├── {bioguide_id}.json                  (bio, terms, committees, stats)
│   └── {bioguide_id}.jpg                   (official portrait)
├── congressional-trading/
│   ├── transactions.json                   (single-ingest master registry)
│   └── senate/{year}/{bioguide_id}.json
├── procurement/
│   └── attachments/{solicitation_id}.pdf   (SAM.gov public solicitation docs)
└── districts/
    ├── geojson/{state}_{district}.geojson
    └── demographics/{state}_{district}.json
```

---

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Cloudflare Wrangler CLI (`npx wrangler`)
- Python 3.10+ (for ingestion pipelines & scrapers)

### Quickstart Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/labsbytir/congresswatch.git
   cd congresswatch
   ```

2. **Install frontend & edge dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   Configure your keys for `CONGRESS_API_KEY`, `DATA_GOV_API_KEY`, `TOGETHER_API_KEY`, and `WORKOS_API_KEY`.

4. **Initialize Cloudflare D1 Local Database**:
   ```bash
   npx wrangler d1 migrations apply DB --local
   ```

5. **Start local development server**:
   ```bash
   npm run dev
   ```

### Standalone Orama & Scraper Deployment on VPS
Detailed step-by-step instructions for deploying your Orama search node and Playwright scraper on an Ubuntu 24.04 server are available in the [VPS Deployment Guide](docs/VPS_SETUP_GUIDE.md).

---

## Changelog

Detailed release history and changelog notes are maintained in [CHANGELOG.md](CHANGELOG.md).

---

## Community & Support

- **Discord**: Join our community for live discussions, feedback, and policy tech collaboration at [discord.gg/vXkPvAkuvN](https://discord.gg/vXkPvAkuvN).
- **Support the Project**: If you find CongressWatch valuable, consider supporting development via [Buy Me a Coffee](https://buymeacoffee.com/postdated).

---

## License

This project is licensed under the Apache-2.0 License. See the [LICENSE](LICENSE) file for details.



