# Quant Research Daily (QRD)

A professional-grade news aggregator and analytics dashboard designed for quantitative finance researchers. Features real-time market data, intelligent tooltips, factor performance tracking, and research workflow tools.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### News Aggregation
- **23+ News Sources**: WSJ, FT, Bloomberg, Reuters, Fed, ECB, BOE, Alpha Architect, Quantocracy, and more
- **Smart Categorization**: Auto-classifies news into quant-relevant categories
- **Priority Scoring**: Highlights critical market updates with visual badges
- **Hero Section**: Rotating breaking news display with auto-advance

### Market Data Dashboard
- **Real-time Quotes**: S&P 500, NASDAQ, VIX, 10Y Yield, Gold, EUR/USD, WTI Oil, Dow Jones
- **Smart Fallbacks**: Live data → Cached data → Simulated demo data
- **Data Source Indicator**: Visual indicator (green=live, yellow=cached, gray=demo)
- **Hover Tooltips**: Rich instrument details on hover

### Intelligent Hover Tooltips

#### Market Instrument Tooltips
Hover over any market item to see:
- Full instrument name and symbol
- Market interpretation (bullish/bearish signals)
- Key support/resistance levels
- Related news article count
- Trading hours

#### Category Tooltips
Hover over any category badge to see:
- Category description
- Key metrics to watch
- Why it matters for quants
- Trading implications
- Current article count

### Hot News Panel
- **Floating Alert Widget**: Real-time critical news in bottom-right corner
- **Keyword Detection**: Monitors for VIX spikes, FOMC, rate decisions, crashes
- **Category Filtering**: Filter alerts by category
- **Collapsible Design**: Minimize when not needed

### Research Tools
- **Research Ideas Tracker**: Save articles with one click (💡 button)
- **Status Workflow**: New → In Progress → Completed → Archived
- **Test This Feature**: Generate Python backtest code skeletons
- **Backtest Results Tracking**: Store Sharpe, max drawdown, win rate

### Test This - Backtest Code Generator

Generate Python backtest code based on your research ideas:

| Template | Based On | Use Case |
|----------|----------|----------|
| Macro Signal | `unemployment_alpha_model/` | Economic indicators → allocation |
| Commodity | `Nat_Gas/` | Walk-forward commodity backtesting |
| Risk/VaR | `portfolio_var_analysis/` | VaR calculation and validation |
| Factor | Standalone | Factor timing and rotation |

### Analytics Dashboard
- **Factor Performance**: Track Momentum, Value, Quality, Size, Low Vol via ETF proxies
- **VIX Term Structure**: Real-time contango/backwardation analysis
- **D3.js Charts**: Interactive visualizations
- **TradingView Integration**: Embedded professional charts

### Enhanced Storage
- **IndexedDB**: Large-capacity local storage
- **Service Worker**: Offline access to cached news
- **Automatic Cleanup**: Manages old data

## Quick Start

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/quant-research-daily.git
cd quant-research-daily

# Start the local server
python -m http.server 8000

# Open in browser
# Navigate to http://localhost:8000
```

### Alternative: Node.js
```bash
npx serve .
```

### Alternative: VS Code Live Server
Right-click `index.html` → "Open with Live Server"

## File Structure

```
News/
├── index.html              # Main news feed with hero section
├── dashboard.html          # Analytics dashboard (VIX, factors, charts)
├── archive.html            # Historical news archive
├── research-ideas.html     # Research ideas with Test This feature
├── styles.css              # All styling (dark theme, tooltips)
├── app.js                  # Core application logic + tooltips
├── backtest-templates.js   # Python code generators
├── storage.js              # IndexedDB storage module
├── volatility.js           # VIX tracking module
├── factors.js              # Factor performance module
├── charts.js               # D3.js chart components
├── sw.js                   # Service Worker for offline
├── favicon.svg             # Site favicon
└── README.md               # This file
```

## Pages

### 1. News Feed (`index.html`)
- **Hero Section**: Top 5 breaking news with auto-rotation
- **Market Bar**: Live/cached/demo data with hover tooltips
- **News Grid**: Cards with priority badges and category colors
- **Hot News Panel**: Floating critical alerts
- **Category Tabs**: Filter by Volatility, Central Banks, Factors, etc.

### 2. Analytics Dashboard (`dashboard.html`)
- **Volatility Surface**: VIX spot, term structure, regime analysis
- **Factor Dashboard**: 6 factors with multi-period returns
- **TradingView Charts**: S&P 500, sector heatmap, economic calendar
- **D3.js Visualizations**: Bar charts, correlation heatmap

### 3. Archive (`archive.html`)
- Search and filter historical news
- Export to CSV
- 7-day retention (configurable)

### 4. Research Ideas (`research-ideas.html`)
- Track ideas from news to backtest
- Status workflow with visual indicators
- Add notes and hypotheses
- **Test This**: Generate backtest code
- View past backtest results
- Export to JSON/CSV

## Hover Tooltip Reference

### Market Instruments

| Instrument | Category | Key Insight |
|------------|----------|-------------|
| S&P 500 | Equity Index | Risk-on/off sentiment |
| NASDAQ | Equity Index | Tech/growth indicator |
| VIX | Volatility | Fear gauge (4 levels shown) |
| 10Y Yield | Fixed Income | Rate expectations |
| Gold | Commodity | Safe haven, inflation hedge |
| EUR/USD | Currency | Fed vs ECB dynamics |
| WTI Oil | Commodity | Energy, inflation pressure |
| Dow Jones | Equity Index | Blue-chip industrial |

### News Categories

| Category | Icon | Key Metrics |
|----------|------|-------------|
| Volatility | 📊 | VIX, Put/Call Ratio, Skew |
| Central Banks | 🏦 | Fed Funds, ECB Rate, Dot Plot |
| Systematic | 🤖 | CTA flows, Risk parity, Momentum |
| Factors | 📈 | HML, SMB, UMD, QMJ, BAB |
| Fixed Income | 💵 | 10Y Yield, 2s10s, Spreads |
| Macro | 🌍 | NFP, CPI, PMI, GDP |
| Commodities | 🛢️ | WTI, Gold, DXY, Copper |
| Markets | 📰 | S&P 500, Breadth, Rotation |

## Factor Performance

Tracks Fama-French factors via ETF proxies:

| Factor | ETF Proxy | Description |
|--------|-----------|-------------|
| Market (Mkt-RF) | SPY | Excess return over risk-free |
| Size (SMB) | IWM vs SPY | Small minus Big |
| Value (HML) | IWD vs IWF | Value minus Growth |
| Momentum (UMD) | MTUM vs SPY | Winners minus Losers |
| Profitability (RMW) | QUAL vs SPY | Quality premium |
| Low Volatility | USMV vs SPY | Low vol premium |

**Data Sources for Research:**
- [Ken French Data Library](https://mba.tuck.dartmouth.edu/pages/faculty/ken.french/data_library.html)
- [AQR Datasets](https://www.aqr.com/Insights/Datasets)

## Volatility Analysis

### VIX Term Structure
- **Contango**: Normal market (VX1 > VIX spot) - Positive carry for short vol
- **Backwardation**: Fear/stress (VX1 < VIX spot) - Negative carry, flight to safety

### Regime Interpretation
| VIX Level | Regime | Implication |
|-----------|--------|-------------|
| < 15 | Low | Complacency, sell premium |
| 15-20 | Normal | Standard conditions |
| 20-30 | Elevated | Reduce leverage |
| > 30 | Extreme | Mean reversion opportunity |

## Hot News Keywords

The hot news panel monitors for these critical terms:
- `vix spike`, `vix surges`, `volatility surge`
- `fed rate`, `fomc`, `rate decision`, `rate cut`, `rate hike`
- `emergency`, `crash`, `plunge`, `circuit breaker`, `flash crash`
- `inflation surprise`, `cpi surprise`, `jobs report`, `nfp`
- `bank failure`, `credit crunch`, `liquidity crisis`
- `geopolitical`, `war`, `sanctions`, `tariff`

## Customization

### Add New News Source
Edit `app.js` → `CONFIG.SOURCES`:
```javascript
new_source: {
    name: 'Source Name',
    url: 'https://example.com/rss.xml',
    category: 'markets', // or volatility, factors, etc.
    priority: 'high'     // or medium, low
}
```

### Add Instrument Tooltip
Edit `app.js` → `INSTRUMENT_INFO`:
```javascript
'New Instrument': {
    symbol: 'SYMBOL',
    fullName: 'Full Name',
    description: 'What it measures',
    category: 'Category',
    interpretation: {
        bullish: 'What rising means',
        bearish: 'What falling means'
    },
    relatedNews: ['category1', 'category2'],
    keyLevels: { support: 100, resistance: 150 },
    tradingHours: '9:30 AM - 4:00 PM ET'
}
```

### Add Category Tooltip
Edit `app.js` → `CATEGORY_INFO`:
```javascript
'new-category': {
    name: 'Category Name',
    icon: '📊',
    description: 'What this covers',
    keyMetrics: ['Metric1', 'Metric2'],
    whyItMatters: 'Relevance for quants',
    tradingImplications: ['Implication 1', 'Implication 2']
}
```

### Adjust Cache Duration
Edit `app.js`:
```javascript
CACHE_DURATION: 30 * 60 * 1000,       // News: 30 min
MARKET_CACHE_DURATION: 5 * 60 * 1000  // Market data: 5 min
```

## API Integration

### Currently Used (Free, No Key Required)
- **Yahoo Finance**: Market data, ETF prices
- **RSS-to-JSON**: RSS feed parsing
- **TradingView**: Embedded charts (widgets)

### Optional API Keys (Free Tiers)
| API | Use Case | Free Tier |
|-----|----------|-----------|
| Alpha Vantage | Historical data | 500 calls/day |
| Finnhub | Real-time quotes | 60 calls/min |
| FRED | Economic data | Unlimited |
| Polygon.io | Market data | 5 calls/min |

## Research Workflow

### Daily Routine
1. **Morning (15 min)**: Refresh → Scan high-priority → Check VIX regime
2. **During Day**: Save interesting articles with 💡 → Check hot news panel
3. **Evening (20 min)**: Review saved ideas → Add research notes
4. **Weekend**: Use Test This → Generate backtest code → Run analysis

### Idea Pipeline
```
News → Observation → Hypothesis → Test This → Backtest → Results
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| R | Refresh news |
| 1-8 | Switch category tabs |
| Esc | Close modals |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### News not loading?
1. Check browser console for errors
2. Ensure running on localhost (CORS)
3. RSS-to-JSON API may have rate limits

### Market data showing "Demo"?
1. Yahoo Finance API blocked by CORS
2. Demo data is shown as fallback
3. Consider adding Finnhub API key for live data

### Tooltips not appearing?
1. Ensure JavaScript is enabled
2. Wait ~200ms after hovering (intentional delay)
3. Check console for errors

### Service Worker issues?
1. Hard refresh: Ctrl+Shift+R
2. Clear site data in DevTools
3. Unregister SW in DevTools → Application → Service Workers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- News sources: WSJ, Reuters, Bloomberg, Federal Reserve, ECB, BOE, Alpha Architect, Quantocracy
- Fonts: Inter, JetBrains Mono (Google Fonts)
- Charts: D3.js, TradingView

---

**Built for Quantitative Researchers. Signal > Noise.** 📈
