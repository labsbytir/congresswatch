# Changelog

All notable changes to the **CongressWatch** platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **UI & Brand**:
  - Sticky black institutional header with local Indian Type Foundry **Satoshi** font family.
  - Official `Congress Watch Logo Grey.svg` branding and default Open Graph card.
  - OpenSecrets-inspired investigative editorial layout with Chart.js visualizations.
- **Search & AI**:
  - Universal Search Engine with Classic (keyword/phrase) and Smart+ (Conversational RAG) toggles.
  - Integration with Cloudflare AI Search, Vectorize, and Together AI (`Llama-3.3-70B-Turbo`).
  - Standalone Orama Search Cluster microservice for VPS deployment with disk persistence.
  - Conversational Workspace Drawer with chronological session history.
- **Data Pipelines & Ingestion**:
  - Official `api.congress.gov` synchronization pipeline for bills, roll call votes, and members.
  - SAM.gov Public Opportunities ingestion pipeline with automated statutory regex linking (`P.L. XX-XX`, `H.R. XXXX`) and NAICS-to-Committee mapping.
  - Playwright Stealth VPS scraper for downloading public SAM.gov contract attachments directly into Cloudflare R2.
  - Senate Financial Disclosures & Financial Modeling Prep insider trading integration.
  - RSSHub Twitter/X public statement caching via `rsstown.com` instance.
  - Federal Register REST API regulatory rulemaking and executive order tracker.
  - LegiScan 50-state cross-jurisdictional legislation matching.
- **Document Intelligence**:
  - Mozilla PDF.js embedded streaming viewer with highlight synchronization.
  - KnightLab TimelineJS interactive legislative milestone component.
  - Myers / Python `difflib` redline diff engine for bill versions and markup amendments.
  - MasoudKaviani deterministic non-AI sentence-ranking extractive summarizer.
  - Dynamic OpenGraph engine (`og-img`) rendering 3D cascading 3-page bill decks.
- **User Collaboration & Enterprise**:
  - WorkOS AuthKit integration for user authentication and enterprise SSO.
  - Password-protected shared AI chats (`/share/:id`) with frozen snapshots in Cloudflare KV.
  - External viewer "Fork and Continue" conversation flow.
  - Grounding Sources right sidebar displaying official source URLs and retrieval timestamps.
  - Developer API platform with Durable Object sliding-window rate limiters (100/day, 1,500/month).
  - Fantasy Congress leagues, play-money prediction markets, and Whip Count simulator.

