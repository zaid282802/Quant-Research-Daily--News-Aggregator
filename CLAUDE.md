# CLAUDE.md — Quant Research Daily (QRD)

## Project Overview
Static GitHub Pages site — a financial news aggregator for quantitative researchers. No build step, no bundler. All files are served directly.

- **Repo:** github.com/zaid282802/Quant-Research-Daily--News-Aggregator
- **Deploy:** GitHub Pages from `main` branch (push = deploy, ~2 min rebuild)
- **Author:** Zaid Annigeri (copyright 2025-2026, MIT License)

## File Structure

### HTML Pages (10 total)
| File | Purpose |
|------|---------|
| `index.html` | Main news feed with market bar, hero news, sidebar widgets |
| `dashboard.html` | Analytics dashboard (VIX, factors, TradingView charts) |
| `archive.html` | Saved news archive with search/filter/export |
| `research-ideas.html` | Research idea tracker with Prove-It badge system |
| `calendar.html` | Economic calendar, FOMC countdown, OpEx dates, global CB calendar |
| `cot.html` | CFTC Commitment of Traders positioning dashboard |
| `papers.html` | arXiv q-fin academic paper tracker |
| `correlations.html` | Cross-asset correlation heatmap and regime alerts |
| `regime.html` | Market regime dashboard (6 indicators, D3 gauge, change log) |
| `flows.html` | Flows & positioning dashboard (COT, options sentiment, fund flows) |

### JavaScript
| File | Purpose |
|------|---------|
| `sources-config.js` | Central source/category/sub-filter config (67+ sources, 14 categories) |
| `app.js` | Core news feed logic (RSS fetching, rendering, categories, alerts) |
| `storage.js` | IndexedDB/localStorage abstraction |
| `volatility.js` | VIX term structure and volatility regime tracking |
| `factors.js` | Fama-French factor ETF proxy tracking |
| `charts.js` | D3.js chart utilities (bar charts, heatmaps, term structure) |
| `calendar.js` | Economic calendar + global central bank calendar |
| `cot.js` | COT data fetching and rendering |
| `papers.js` | arXiv RSS fetching and paper card rendering |
| `correlations.js` | Correlation matrix computation and heatmap |
| `regime.js` | Market regime dashboard (6 indicators, D3 gauge) |
| `flows.js` | Flows & positioning dashboard (COT bars, options gauge) |
| `backtest-templates.js` | Python backtest code generation templates |

### Other
| File | Purpose |
|------|---------|
| `styles.css` | Single shared stylesheet, dark-only theme |
| `sw.js` | Service worker for offline caching |
| `favicon.svg` | Site icon |

## Key Conventions

### Dark-Only Theme
- **No light mode.** The site is dark-only (`color-scheme: dark`).
- Every HTML page has inline critical dark CSS in a `<style>` block **before** the `<link>` to `styles.css`. This prevents flash-of-white from stale SW cache.
- The `<body>` tag also has `style="background:#0d1117;color:#e6edf3;"` as a fallback.
- CSS variables are defined in `:root` in `styles.css` starting with `--bg-primary: #0d1117`.

### Service Worker Cache
- `sw.js` uses a versioned cache name: `STATIC_CACHE = 'qrd-static-v4'`
- **When changing any cached asset (CSS, JS, HTML), bump the version** (e.g., v2 → v3) so the activate handler deletes the old cache.
- Static assets use cache-first strategy; API calls use network-first.

### Copyright / Attribution
- All JS files have a copyright header block at the top.
- All HTML pages have a `<meta name="author">` and `<meta name="copyright">` tag.
- All pages have a footer with copyright and GitHub link.

### Page Structure Pattern
Each HTML page follows this pattern:
```
<head>
  <meta tags>
  <style> /* inline critical dark CSS */ </style>
  <link rel="stylesheet" href="styles.css">
  <style> /* page-specific styles (if any) */ </style>
</head>
<body style="background:#0d1117;color:#e6edf3;">
  <div class="app-container">
    <header class="header">...</header>
    <!-- page content -->
  </div>
  <footer>...</footer>
  <script src="..."></script>
</body>
```

## External Dependencies
- **Google Fonts:** Inter + JetBrains Mono (loaded via `<link>`)
- **D3.js v7:** Used on dashboard.html and correlations.html (loaded via CDN)
- **TradingView widgets:** Used on dashboard.html (loaded via CDN script)
- **rss2json API:** Used by app.js to proxy RSS feeds (with allorigins.win fallback)
- **CFTC API:** Used by cot.js and flows.js for COT positioning data

## Development Notes
- No package.json, no npm, no build tools — edit files directly
- Test locally by opening HTML files or using a local server
- All data fetching happens client-side (RSS via rss2json, Yahoo Finance API)
- localStorage is used for: news archive, research ideas, paper cache, correlation alerts, regime state, smart alerts, market data
- IndexedDB (via storage.js) for larger data storage
