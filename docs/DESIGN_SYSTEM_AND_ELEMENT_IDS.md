# CongressWatch Global Design System & Standardized Element IDs

This specification defines the global styling mandates and uniform Element ID hierarchy across all CongressWatch pages, ensuring accessible typography, pure black hero staging, glass borders, and standardized DOM selectors.

---

## 1. Global Styling & Color Mandates

### A. Header & Glass Separation
- **Header Background**: Pure Black (`#000000`).
- **Header Bottom Border (`#cw-header-border`)**: Glass-like semi-transparent border:
  `border-b border-white/15 shadow-[0_4px_20px_-4px_rgba(255,255,255,0.05)] backdrop-blur-md`
  Provides clean visual separation between the sticky black header and the black hero section.

### B. Hero Section (`#cw-hero-section`)
- **Background**: Pure Black (`#000000` / `bg-black`).
- **Hero Title (`#cw-hero-title`)**: Strictly pure white (`#ffffff` / `text-white`) using **Satoshi Weight 800+** with high contrast against the dark background.
- **Hero Subtitle (`#cw-hero-subtitle`)**: High-contrast off-white (`text-neutral-300` / `text-neutral-200`), font-medium (500).

### C. Search Bar & Heavy Glass Button
- **Search Bar Input (`#cw-search-input`)**: Clean padding with **NO interior left icon**.
- **Search Toggle (`#cw-search-toggle-slider`)**: Compact slider pill between **Basic** and **Smart+ AI**.
  - **Basic Mode**: Executes live reactive filtering as the user types.
  - **Smart+ AI Mode**: Wait for user to hit Enter or click the submit button (no live streaming on raw keystrokes).
- **Search Submit Button (`#cw-search-submit-btn`)**: Heavy magnifying glass SVG icon button (`w-5 h-5` stroke-width 2.5), removing textual "Search" labels for a sleek, tactile action target.

### D. Trending Legislation Pills (`#cw-trending-container`)
- **Layout**: Larger, prominent banner presentation.
- **Pill Style (`#cw-trending-pill`)**:
  - **Background**: Pure White (`#ffffff` / `bg-white`).
  - **Text**: Pure Black Bold (`#000000` / `text-black font-extrabold`).
  - **Border**: Subtle border with hover elevation.

---

## 2. Standardized Uniform Element IDs (Reused Across Site)

| Element Type | Standardized ID | Purpose |
| :--- | :--- | :--- |
| **Site Header** | `cw-header` | Sticky root navigation bar |
| **Header Glass Border** | `cw-header-border` | Glass separation line between header and hero |
| **Hero Section** | `cw-hero-section` | Pure black hero banner container |
| **Hero Title** | `cw-hero-title` | Pure white Satoshi 800+ primary title |
| **Hero Subtitle** | `cw-hero-subtitle` | Lead descriptive paragraph |
| **Search Form Container** | `cw-search-container` | Centralized search box |
| **Search Input Field** | `cw-search-input` | Clean input without left icons |
| **Search Toggle Slider** | `cw-search-toggle-slider` | Basic vs Smart+ mode switch |
| **Search Submit Button** | `cw-search-submit-btn` | Heavy magnifying glass trigger |
| **Trending Pills Container**| `cw-trending-container` | Wrapper for prominent trending topics |
| **Trending Pill Item** | `cw-trending-pill` | White background, bold black text pills |
| **Executive Stat Card** | `cw-stat-card` | Numeric summary blocks |
| **Parallax Rails Section**| `cw-marquee-section` | Opposing bi-directional lawmaker ribbons |
| **Lawmaker Card** | `cw-lawmaker-card` | Individual interactive representative card |
| **Data Table Container** | `cw-table-container` | High-density legislative dossier table |
| **Data Table Row** | `cw-table-row` | Interactive clickable bill row |
| **Status Badge Pill** | `cw-status-badge` | Single-line encapsulated status pill |
| **View Dossier Button** | `cw-action-btn` | Primary action button |
| **AI Chat Drawer** | `cw-chat-drawer` | On-demand slide-over conversational assistant |

