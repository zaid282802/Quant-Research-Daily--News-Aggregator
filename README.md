# Quant Research Daily (QRD)

A professional-grade news aggregator, research dashboard, and market intelligence terminal built for quantitative finance researchers. Aggregates 40+ financial news sources, provides real-time market data with intelligent tooltips, tracks research ideas with falsifiable hypotheses, generates Python backtest code skeletons, and enforces a "prove it or shut up" research discipline.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Sources](https://img.shields.io/badge/RSS%20sources-40%2B-orange.svg)
![Pages](https://img.shields.io/badge/pages-8-purple.svg)

## What Makes QRD Different

Most news aggregators collect headlines. QRD builds a **research pipeline**:

```
News --> Observation --> Falsifiable Hypothesis --> Backtest Code --> Statistical Validation --> Accept/Reject
```

Every research idea requires a testable prediction. Every backtest reports t-statistics and applies the Harvey-Liu-Zhu (2016) multiple testing threshold. No hand-waving allowed.

---

## Features

### News Aggregation (40+ Sources)

| Tier | Sources | Priority | Signal Quality |
|------|---------|----------|----------------|
| **Tier 1** | arXiv q-fin, AQR, Quantpedia, Two Sigma, Alpha Architect, Quantocracy | 10 | Alpha-generating research |
| **Tier 2** | Federal Reserve, ECB, NY Fed, St. Louis Fed, BIS, IMF | 8-9 | Market-moving intelligence |
| **Tier 3** | CBOE, Wilmott, NBER, Epsilon Theory, Macrosynergy, IBKR Quant | 6-7 | Practitioner insights |
| **Tier 4** | WSJ, Reuters, Bloomberg, FT, CNBC, MarketWatch, EIA | 4-5 | News & market color |

- **Smart Auto-Categorization**: Classifies into 10 categories including Academic Research and Energy
- **Priority Scoring**: Articles scored 1-10 based on source tier, category, and recency
- **Claim Tagging**: Every article tagged as:
  - `Data` (green) -- contains numbers, statistics, reported data
  - `Official` (blue) -- from Fed, ECB, IMF, or other institutional sources
  - `Narrative` (amber) -- opinion, forecast, prediction

### Market Data Bar (12 Instruments)

| Instrument | Category | Key Signal |
|------------|----------|------------|
| S&P 500 | Equity | Risk-on/off sentiment |
| NASDAQ | Equity | Tech/growth indicator |
| Dow Jones | Equity | Blue-chip industrial |
| VIX | Volatility | Fear gauge (4 regime levels) |
| 10Y Yield | Fixed Income | Rate expectations |
| 5Y Yield | Fixed Income | Mid-curve, mortgage proxy |
| **2s10s Spread** | Fixed Income | **Recession predictor** (shows INVERTED badge when negative) |
| Gold | Commodity | Safe haven, inflation hedge |
| WTI Oil | Commodity | Energy, inflation pressure |
| EUR/USD | Currency | Fed vs ECB dynamics |
| **Bitcoin** | Crypto | Risk-on / liquidity indicator |
| **DXY** | FX | Dollar strength vs 6 majors |
| **Copper** | Commodity | Dr. Copper -- economic barometer |

- **Smart Fallback Chain**: Live Yahoo Finance --> Cached data --> Simulated demo data
- **Data Source Indicator**: Green (live), Yellow (cached), Gray (demo)
- **Rich Hover Tooltips**: Bullish/bearish interpretation, key support/resistance levels

### Event Countdown Bar

Live countdown to next market-moving events, displayed below the market bar:
- **FOMC decisions** (red, critical)
- **CPI releases** (orange, high impact)
- **Non-Farm Payrolls** (orange, high impact)
- **Options Expiration** (blue, medium impact)

Links to the full Economic Calendar page.

---

## Pages (8 Total)

### 1. News Feed (`index.html`)
- Hero breaking news section with auto-rotation
- Market bar with 12 instruments + hover tooltips
- Event countdown bar (next FOMC, CPI, NFP, OpEx)
- News grid with priority badges, category colors, claim tags
- Hot news floating panel with critical keyword detection
- Sidebar: Economic calendar, volatility monitor, recent papers, correlation alerts, research ideas, factor performance
- Category tabs: All, Volatility, Central Banks, Systematic, Factors, Fixed Income, Macro, Commodities, Academic Research, Energy

### 2. Analytics Dashboard (`dashboard.html`)
- VIX term structure (contango/backwardation)
- Factor performance: Momentum, Value, Quality, Size, Low Vol via ETF proxies
- TradingView embedded charts: S&P 500, sector heatmap
- D3.js interactive visualizations

### 3. Archive (`archive.html`)
- Historical news search with date/category/source filters
- Export to CSV
- 7-day retention (configurable)

### 4. Research Ideas (`research-ideas.html`) -- Prove-It Enhanced
- **Falsifiable Hypothesis** (required) -- forces "If X, then Y" framing
- **Expected Effect Size** -- < 50bp, 50-100bp, 100-300bp, 300bp+
- **Timeframe** -- Intraday through 3-12 months
- **Asset Class** -- Equity, Fixed Income, Commodities, FX, Vol, Cross-Asset
- **Backtest Results Section** (collapsible per idea):
  - Sharpe Ratio, t-Statistic, Max Drawdown, Win Rate, Number of Trades
  - In-Sample and Out-of-Sample periods
- **Prove-It Badges**:
  - PROVEN (green): t-stat > 3.0, has OOS results, Sharpe > 0.5
  - MARGINAL (yellow): 2.0 < t-stat < 3.0 or missing OOS
  - UNPROVEN (red): t-stat < 2.0 or no backtest
  - HLZ WARNING: "Multiple Testing Risk" when t-stat < 3.0
- **Research Scorecard**: Total ideas, tested %, passing (green) count, success rate, avg Sharpe
- **Sorting**: By date, status, prove-it badge, or effect size
- **Test This**: Generate Python backtest code from templates
- Export to JSON/CSV (includes hypothesis, badge, Sharpe, t-stat columns)

### 5. Economic Calendar (`calendar.html`)
- **TradingView Economic Calendar Widget** -- NFP, CPI, FOMC, PMI, GDP, Jobless Claims
- **Fed Speaker Schedule** -- All 15 FOMC members with hawk/dove/neutral classification and voting status
- **FOMC Meeting Dates** -- Full 2026 schedule with countdown to next meeting
- **OpEx Calendar** -- Monthly options expiration (3rd Friday) + Quad Witching dates (Mar/Jun/Sep/Dec)

### 6. CFTC COT Positioning Dashboard (`cot.html`)
- **8 Key Futures Contracts**: E-Mini S&P 500, 10Y T-Note, Gold, WTI Crude, Natural Gas, Euro FX, Yen, Dollar Index
- **Data Source**: CFTC Socrata API (free, public domain) with simulated fallback for CORS
- **Per-Contract Cards**:
  - Net speculative position (long - short) with weekly change
  - Net as % of open interest
  - Z-score bar (-3sigma to +3sigma) with color-coded fill
  - SVG sparkline of historical positioning
  - "EXTREME LONG" / "EXTREME SHORT" badge at |z| > 2.0
- **Extreme Alert System**: Auto-flags contracts at > 2 standard deviations from mean
- **Timeframe Selector**: 13wk, 26wk, 52wk, 104wk lookback
- **24hr localStorage Cache**

### 7. Academic Paper Tracker (`papers.html`)
- **arXiv q-fin RSS**: All subcategories -- Statistical Finance, Computational Finance, Risk Management, Trading & Microstructure, Portfolio Management, Mathematical Finance, plus stat.ML
- **Author Watchlist**: Cartea, Avellaneda, Lopez de Prado, Bryan Kelly, Novy-Marx, Cliff Asness, Pedersen, Moskowitz, Dacheng Xiu, Stefan Nagel, Malamud, Bouchaud
  - Watched author papers get gold border + badge
- **Paper Cards**: Title (linked to arXiv), authors, truncated abstract, subcategory badges, date
- **Save to Research Ideas**: Pre-fills idea with paper title and link
- **Auto-Template Suggestion**: Maps subcategory to backtest template (e.g., q-fin.RM -> Risk/VaR template)
- **Search/Filter**: By subcategory, date range, author

### 8. Cross-Asset Correlation Monitor (`correlations.html`)
- **8-Asset Universe**: SPY, TLT, GLD, DXY, VIX, HYG, USO, EEM
- **Rolling Correlation Heatmap**: 30-day, 60-day, 90-day windows via D3.js
- **Regime Detection Alerts**:
  - SPY-TLT sign flip (stock-bond correlation turning positive = inflation regime)
  - VIX-SPY weakening (less negative = tail risk may be underpriced)
  - DXY-EEM decoupling (dollar-EM sensitivity shifting)
  - Any pair deviating > 0.30 from 1-year baseline
- **Historical Comparison**: Current correlation matrix vs 1Y/5Y averages
- **Alert Caching**: Regime alerts cached to localStorage for main page indicator

---

## Backtest Templates

Generate Python code skeletons linked to your research ideas:

| Template | Based On | Use Case | Key Features |
|----------|----------|----------|--------------|
| Macro Signal | `unemployment_alpha_model/` | Economic indicators --> allocation | FRED API, rebalancing, position sizing |
| Commodity | `Nat_Gas/` | Walk-forward commodity trading | Expanding window, sklearn, directional accuracy |
| Risk/VaR | `portfolio_var_analysis/` | VaR calculation and validation | Historical/Parametric/Monte Carlo VaR, Kupiec test |
| Factor | Standalone | Factor timing and rotation | 7 factor ETFs, momentum-based rotation |
| **COT Positioning** | Standalone | Contrarian signals from CFTC data | Z-score extremes, CFTC API fetch, mean reversion |

**All Templates Auto-Include**:
- Transaction cost model (configurable, default 5-10bp)
- Prove-It validation: t-statistic, Sharpe, max drawdown, Harvey-Liu-Zhu threshold check
- Walk-forward out-of-sample split (70/30 default)
- Results summary with pass/marginal/fail classification

---

## File Structure

```
News/
├── index.html              # Main news feed (hero, market bar, countdown, widgets)
├── dashboard.html          # Analytics dashboard (VIX, factors, TradingView)
├── archive.html            # Historical news archive
├── research-ideas.html     # Research ideas with Prove-It system
├── calendar.html           # Economic calendar + Fed speakers + OpEx
├── cot.html                # CFTC COT positioning dashboard
├── papers.html             # Academic paper tracker (arXiv)
├── correlations.html       # Cross-asset correlation monitor
├── styles.css              # Global styling (~2100 lines, dark theme)
├── app.js                  # Core logic (~2400 lines): sources, market data, tooltips
├── backtest-templates.js   # Python code generators (5 templates + prove-it validation)
├── calendar.js             # Fed speakers, FOMC dates, OpEx calendar
├── cot.js                  # COT data fetching, z-score, sparklines
├── papers.js               # arXiv RSS, author watchlist, paper cards
├── correlations.js         # Rolling correlation, Cholesky sim, regime detection
├── storage.js              # IndexedDB storage module
├── volatility.js           # VIX tracking module
├── factors.js              # Factor performance module
├── charts.js               # D3.js chart components
├── sw.js                   # Service Worker (caches all 8 pages + modules)
├── favicon.svg             # Site favicon
└── README.md               # This file
```

---

## Quick Start

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator.git
cd Quant-Research-Daily--News-Aggregator

# Start the local server
python -m http.server 8000

# Open http://localhost:8000
```

### Alternative
```bash
npx serve .                          # Node.js
```
Or right-click `index.html` --> "Open with Live Server" in VS Code.

---

## API Integrations

| API | Purpose | Auth | Rate Limit |
|-----|---------|------|------------|
| rss2json.com | RSS feed parsing | None | 10K/day |
| Yahoo Finance | Market data (12 instruments) | None | Varies (CORS fallback) |
| CFTC Socrata | COT positioning data | None | Unlimited (public domain) |
| arXiv | Academic paper feeds | None | Unlimited |
| TradingView | Embedded widgets + econ calendar | None | Free embeds |
| Finnhub (optional) | Real-time quotes | Free key | 60/min |

---

## Research Workflow

### Daily Routine
1. **Morning (15 min)**: Refresh --> Scan high-priority --> Check VIX regime --> Glance at countdown bar
2. **During Day**: Save articles with a click --> Check hot news panel --> Note COT extremes
3. **Evening (20 min)**: Review saved ideas --> Add falsifiable hypotheses --> Check correlation alerts
4. **Weekend**: Generate backtest code --> Run analysis --> Record results --> Earn prove-it badges

### Prove-It Pipeline
```
News Article
  --> Save as Research Idea (hypothesis REQUIRED)
    --> "If [X], then [Y] within [timeframe]"
      --> Test This --> Python backtest code
        --> Run --> Record Sharpe, t-stat, drawdown
          --> Badge: PROVEN / MARGINAL / UNPROVEN
            --> Scorecard: batting average across all ideas
```

### Interview Value
When asked "How do you stay on top of markets?", QRD is the answer:
- **Vol Surface knowledge** --> CBOE feed + VIX regime tracking
- **Cross-Asset thinking** --> Correlation monitor + 12-instrument market bar
- **Statistical rigor** --> Prove-It system = t > 3.0 or it's noise
- **Market awareness** --> Economic calendar + COT positioning + countdown timer
- **Research process** --> Hypothesis --> Backtest --> Validate --> Accept/Reject

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Refresh news |
| 1-9 | Switch category tabs |
| Esc | Close modals |

---

## Customization

### Add a News Source
Edit `app.js` --> `CONFIG.SOURCES`:
```javascript
new_source: {
    name: 'Source Name',
    url: 'https://example.com/rss.xml',
    category: 'academic',  // or energy, systematic, factors, etc.
    priority: 10           // 1-10 scale
}
```

### Add a Market Instrument
Edit `app.js` --> `INSTRUMENT_INFO`:
```javascript
'New Instrument': {
    symbol: 'SYMBOL',
    name: 'Full Name',
    category: 'Category',
    description: 'What it measures',
    interpretation: {
        bullish: 'What rising means',
        bearish: 'What falling means'
    },
    keyLevels: { support: [100, 95], resistance: [110, 120] }
}
```

### Add a Backtest Template
Edit `backtest-templates.js`:
```javascript
new_template: {
    name: 'Template Name',
    description: 'What it does',
    dependencies: ['pandas', 'numpy'],
    generate: (config) => `... Python code ...`
}
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| News not loading | Check console; RSS-to-JSON may be rate-limited |
| Market data shows "Demo" | Yahoo Finance CORS blocked; demo data is the fallback |
| COT data shows "Simulated" | CFTC API CORS from browser; simulated data is realistic |
| Papers not loading | arXiv RSS via rss2json; check rate limits |
| Tooltips not appearing | Wait ~200ms after hover; check console |
| Service Worker stale | Hard refresh (Ctrl+Shift+R) or clear site data |

---

## Tech Stack

- **Frontend**: Pure HTML5/CSS3/JavaScript (ES6+) -- no frameworks
- **Charts**: D3.js, TradingView widgets
- **Storage**: LocalStorage + IndexedDB
- **Offline**: Service Worker with cache-first strategy
- **Fonts**: Inter + JetBrains Mono
- **Theme**: Dark mode with custom CSS properties

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- **Tier 1 Sources**: arXiv, AQR, Quantpedia, Two Sigma, Alpha Architect, Quantocracy
- **Institutional Sources**: Federal Reserve, ECB, NY Fed, BIS, IMF, NBER
- **Data**: CFTC (COT reports), Yahoo Finance, TradingView
- **Research**: Harvey, Liu & Zhu (2016) -- "...and the Cross-Section of Expected Returns" (t > 3.0 threshold)
- **Fonts**: Inter, JetBrains Mono (Google Fonts)
- **Charts**: D3.js, TradingView

---

**Built for Quantitative Researchers. Prove It or Shut Up.**
