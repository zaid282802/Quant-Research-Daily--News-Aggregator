/**
 * Quant Research Daily - News Aggregator
 * Fetches and displays financial news for quantitative researchers
 * Enhanced with real-time market data and research tools
 */

// =====================================================
// Configuration
// =====================================================

const CONFIG = {
    // RSS Feed sources using public RSS-to-JSON APIs
    RSS_API: 'https://api.rss2json.com/v1/api.json?rss_url=',

    // Alternative RSS parsers (fallback)
    RSS_APIS: [
        'https://api.rss2json.com/v1/api.json?rss_url=',
        'https://rss2json.com/api.json?rss_url='
    ],

    // News Sources - RSS Feeds (Expanded)
    SOURCES: {
        // ==================== HIGH PRIORITY ====================
        // WSJ RSS Feeds
        wsj_markets: {
            name: 'WSJ Markets',
            url: 'https://feeds.wsj.com/wsj/xml/rss/3_7455.xml',
            category: 'markets',
            priority: 'high'
        },
        wsj_economy: {
            name: 'WSJ Economy',
            url: 'https://feeds.wsj.com/wsj/xml/rss/3_7014.xml',
            category: 'macro',
            priority: 'high'
        },

        // Federal Reserve
        fed_press: {
            name: 'Federal Reserve',
            url: 'https://www.federalreserve.gov/feeds/press_all.xml',
            category: 'central-banks',
            priority: 'high'
        },

        // ECB
        ecb_press: {
            name: 'ECB',
            url: 'https://www.ecb.europa.eu/rss/press.html',
            category: 'central-banks',
            priority: 'high'
        },

        // Bank of England
        boe_news: {
            name: 'Bank of England',
            url: 'https://www.bankofengland.co.uk/rss/news',
            category: 'central-banks',
            priority: 'high'
        },

        // ==================== QUANT RESEARCH ====================
        // Alpha Architect (Factor Research)
        alpha_architect: {
            name: 'Alpha Architect',
            url: 'https://alphaarchitect.com/feed/',
            category: 'factors',
            priority: 'high'
        },

        // Quantocracy (Quant Blog Aggregator)
        quantocracy: {
            name: 'Quantocracy',
            url: 'https://quantocracy.com/feed/',
            category: 'systematic',
            priority: 'high'
        },

        // SSRN Finance
        ssrn_finance: {
            name: 'SSRN Finance',
            url: 'https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=1927431&Network=no&lim=false&npage=1',
            category: 'systematic',
            priority: 'high'
        },

        // ==================== MEDIUM PRIORITY ====================
        // Reuters RSS Feeds
        reuters_business: {
            name: 'Reuters Business',
            url: 'https://feeds.reuters.com/reuters/businessNews',
            category: 'markets',
            priority: 'medium'
        },
        reuters_markets: {
            name: 'Reuters Markets',
            url: 'https://feeds.reuters.com/reuters/companyNews',
            category: 'markets',
            priority: 'medium'
        },

        // Financial Times (Alphaville)
        ft_markets: {
            name: 'FT Markets',
            url: 'https://www.ft.com/markets?format=rss',
            category: 'markets',
            priority: 'medium'
        },

        // Bloomberg (via Google News)
        bloomberg_markets: {
            name: 'Bloomberg',
            url: 'https://news.google.com/rss/search?q=site:bloomberg.com+markets&hl=en-US&gl=US&ceid=US:en',
            category: 'markets',
            priority: 'medium'
        },

        // Yahoo Finance
        yahoo_finance: {
            name: 'Yahoo Finance',
            url: 'https://finance.yahoo.com/rss/topstories',
            category: 'markets',
            priority: 'medium'
        },

        // CNBC
        cnbc_markets: {
            name: 'CNBC Markets',
            url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
            category: 'markets',
            priority: 'medium'
        },

        // MarketWatch
        marketwatch: {
            name: 'MarketWatch',
            url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
            category: 'markets',
            priority: 'medium'
        },

        // Investing.com
        investing_news: {
            name: 'Investing.com',
            url: 'https://www.investing.com/rss/news.rss',
            category: 'markets',
            priority: 'medium'
        },

        // ==================== DERIVATIVES & VOL ====================
        // CBOE Insights
        cboe_insights: {
            name: 'CBOE',
            url: 'https://news.google.com/rss/search?q=site:cboe.com+vix+volatility&hl=en-US&gl=US&ceid=US:en',
            category: 'volatility',
            priority: 'high'
        },

        // Risk.net (via Google)
        risk_net: {
            name: 'Risk.net',
            url: 'https://news.google.com/rss/search?q=site:risk.net+derivatives&hl=en-US&gl=US&ceid=US:en',
            category: 'volatility',
            priority: 'medium'
        },

        // ==================== COMMODITIES & FX ====================
        // Oil Price
        oilprice: {
            name: 'OilPrice',
            url: 'https://oilprice.com/rss/main',
            category: 'commodities',
            priority: 'medium'
        },

        // Kitco (Gold/Metals)
        kitco_news: {
            name: 'Kitco',
            url: 'https://news.google.com/rss/search?q=site:kitco.com+gold&hl=en-US&gl=US&ceid=US:en',
            category: 'commodities',
            priority: 'low'
        },

        // ==================== FIXED INCOME ====================
        // Bond Buyer
        bond_buyer: {
            name: 'Bond Buyer',
            url: 'https://news.google.com/rss/search?q=treasury+yields+bonds&hl=en-US&gl=US&ceid=US:en',
            category: 'fixed-income',
            priority: 'medium'
        },

        // ==================== HEDGE FUNDS ====================
        // Institutional Investor
        institutional_investor: {
            name: 'Institutional Investor',
            url: 'https://news.google.com/rss/search?q=site:institutionalinvestor.com+hedge+fund&hl=en-US&gl=US&ceid=US:en',
            category: 'systematic',
            priority: 'medium'
        },

        // Hedge Fund specific news
        hedge_fund_news: {
            name: 'Hedge Fund News',
            url: 'https://news.google.com/rss/search?q=renaissance+technologies+OR+citadel+OR+two+sigma+OR+aqr+hedge+fund&hl=en-US&gl=US&ceid=US:en',
            category: 'systematic',
            priority: 'high'
        },

        // ==================== LOW PRIORITY ====================
        // Seeking Alpha
        seeking_alpha: {
            name: 'Seeking Alpha',
            url: 'https://seekingalpha.com/market_currents.xml',
            category: 'markets',
            priority: 'low'
        },

        // Zerohedge (contrarian)
        zerohedge: {
            name: 'ZeroHedge',
            url: 'https://feeds.feedburner.com/zerohedge/feed',
            category: 'markets',
            priority: 'low'
        },

        // ==================== TIER 1: ALPHA-GENERATING RESEARCH ====================
        arxiv_qfin: {
            name: 'arXiv q-fin',
            url: 'https://rss.arxiv.org/rss/q-fin',
            category: 'academic',
            priority: 'critical'
        },
        aqr_insights: {
            name: 'AQR Insights',
            url: 'https://www.aqr.com/Insights/Research/feed',
            category: 'factors',
            priority: 'critical'
        },
        quantpedia: {
            name: 'Quantpedia',
            url: 'https://quantpedia.com/feed/',
            category: 'systematic',
            priority: 'critical'
        },
        two_sigma: {
            name: 'Two Sigma',
            url: 'https://www.twosigma.com/insights/feed/',
            category: 'systematic',
            priority: 'critical'
        },

        // ==================== TIER 2: MARKET-MOVING INTELLIGENCE ====================
        ny_fed_liberty: {
            name: 'NY Fed Liberty Street',
            url: 'https://libertystreeteconomics.newyorkfed.org/feed/',
            category: 'macro',
            priority: 'high'
        },
        stlouis_fed: {
            name: 'St. Louis Fed Blog',
            url: 'https://fredblog.stlouisfed.org/feed/',
            category: 'macro',
            priority: 'high'
        },
        bis_research: {
            name: 'BIS',
            url: 'https://www.bis.org/doclist/bis_fsi_publs.rss',
            category: 'macro',
            priority: 'high'
        },
        imf_blog: {
            name: 'IMF Blog',
            url: 'https://www.imf.org/en/Blogs/rss',
            category: 'macro',
            priority: 'high'
        },

        // ==================== TIER 3: PRACTITIONER INSIGHTS ====================
        wilmott: {
            name: 'Wilmott',
            url: 'https://wilmott.com/feed/',
            category: 'academic',
            priority: 'medium'
        },
        epsilon_theory: {
            name: 'Epsilon Theory',
            url: 'https://www.epsilontheory.com/feed/',
            category: 'macro',
            priority: 'medium'
        },
        nber_papers: {
            name: 'NBER',
            url: 'https://www.nber.org/rss/new.xml',
            category: 'academic',
            priority: 'medium'
        },
        macrosynergy: {
            name: 'Macrosynergy',
            url: 'https://macrosynergy.com/feed/',
            category: 'macro',
            priority: 'medium'
        },
        quantstreet: {
            name: 'QuantStreet Capital',
            url: 'https://quantstreetcapital.com/feed/',
            category: 'systematic',
            priority: 'medium'
        },
        ibkr_quant: {
            name: 'IBKR Quant',
            url: 'https://www.interactivebrokers.com/campus/ibkr-quant-news/feed/',
            category: 'systematic',
            priority: 'medium'
        },
        eia_energy: {
            name: 'EIA Energy',
            url: 'https://www.eia.gov/rss/todayinenergy.xml',
            category: 'energy',
            priority: 'medium'
        },
        calculated_risk: {
            name: 'Calculated Risk',
            url: 'https://www.calculatedriskblog.com/feeds/posts/default',
            category: 'macro',
            priority: 'low'
        },
        cme_research: {
            name: 'CME Group',
            url: 'https://www.cmegroup.com/rss/',
            category: 'commodities',
            priority: 'low'
        },
        man_institute: {
            name: 'Man Institute',
            url: 'https://www.man.com/insights/feed',
            category: 'systematic',
            priority: 'critical'
        }
    },

    // Category keywords for auto-classification (Enhanced)
    CATEGORIES: {
        'volatility': [
            'vix', 'volatility', 'options', 'derivatives', 'gamma', 'delta',
            'implied vol', 'variance swap', 'straddle', 'strangle', 'skew',
            'vol surface', 'term structure', 'cboe', 'puts', 'calls',
            'vega', 'theta', 'greeks', 'black-scholes', 'ivol', 'rvol',
            'volatility smile', 'vol-of-vol', 'vvix', 'dispersion',
            'correlation', 'tail risk', 'crash protection', 'hedging'
        ],
        'central-banks': [
            'federal reserve', 'fed', 'fomc', 'powell', 'ecb', 'lagarde',
            'bank of japan', 'boj', 'bank of england', 'boe', 'pboc',
            'interest rate', 'rate hike', 'rate cut', 'monetary policy',
            'quantitative easing', 'qe', 'qt', 'taper', 'dot plot',
            'hawkish', 'dovish', 'inflation target', 'balance sheet',
            'overnight rate', 'fed funds', 'discount rate', 'repo'
        ],
        'systematic': [
            'hedge fund', 'quant', 'algorithmic', 'systematic', 'hft',
            'high frequency', 'renaissance', 'citadel', 'two sigma', 'de shaw',
            'aqr', 'bridgewater', 'winton', 'stat arb', 'market making',
            'alpha', 'sharpe', 'drawdown', 'backtesting', 'overfitting',
            'machine learning', 'deep learning', 'neural network', 'nlp',
            'alternative data', 'satellite', 'sentiment analysis',
            'execution', 'slippage', 'market impact', 'transaction cost'
        ],
        'factors': [
            'factor', 'momentum', 'value investing', 'quality', 'size',
            'low volatility', 'growth vs value', 'factor rotation',
            'fama french', 'anomaly', 'premium', 'crowding',
            'smart beta', 'risk parity', 'carry', 'defensive',
            'profitability', 'investment', 'book-to-market', 'earnings yield',
            'price momentum', 'earnings momentum', 'reversal'
        ],
        'fixed-income': [
            'treasury', 'bond', 'yield curve', 'credit spread', 'corporate bond',
            'high yield', 'investment grade', 'duration', 'coupon', 'tips',
            '10-year', '2-year', 'inverted', 'steepening', 'flattening',
            'convexity', 'mbs', 'abs', 'clo', 'cds', 'credit default',
            'sovereign debt', 'gilt', 'bund', 'jgb', 'auction',
            'term premium', 'breakeven inflation', 'real yield'
        ],
        'macro': [
            'gdp', 'inflation', 'cpi', 'pce', 'employment', 'nonfarm',
            'payroll', 'unemployment', 'retail sales', 'pmi', 'ism',
            'consumer confidence', 'housing', 'recession', 'economic data',
            'leading indicator', 'nowcast', 'gdp growth', 'productivity',
            'wage growth', 'labor market', 'business cycle', 'fiscal policy',
            'deficit', 'debt ceiling', 'stimulus', 'economic outlook'
        ],
        'commodities': [
            'oil', 'crude', 'wti', 'brent', 'natural gas', 'gold', 'silver',
            'copper', 'commodity', 'opec', 'fx', 'forex', 'dollar', 'euro',
            'yen', 'currency', 'dxy', 'carry trade', 'lng', 'metals',
            'agriculture', 'wheat', 'corn', 'soybeans', 'platinum',
            'palladium', 'iron ore', 'aluminum', 'energy', 'futures'
        ],
        'academic': [
            'paper', 'working paper', 'preprint', 'arxiv', 'ssrn', 'nber',
            'journal', 'peer review', 'empirical', 'theoretical', 'econometric',
            'methodology', 'model', 'estimation', 'calibration', 'simulation',
            'stochastic', 'martingale', 'ito', 'diffusion', 'pricing model',
            'microstructure', 'market design', 'optimal execution', 'order book'
        ],
        'energy': [
            'natural gas', 'lng', 'pipeline', 'eia', 'opec+', 'shale',
            'renewable', 'solar', 'wind power', 'nuclear', 'electricity',
            'power grid', 'carbon', 'emissions', 'refinery', 'gasoline',
            'heating oil', 'energy transition', 'baseload', 'peak demand'
        ]
    },

    // Storage keys
    STORAGE: {
        NEWS_CACHE: 'qrd_news_cache',
        NEWS_ARCHIVE: 'qrd_news_archive',
        LAST_FETCH: 'qrd_last_fetch',
        SETTINGS: 'qrd_settings',
        RESEARCH_IDEAS: 'qrd_research_ideas',
        MARKET_DATA_CACHE: 'qrd_market_data'
    },

    // Cache duration (30 minutes)
    CACHE_DURATION: 30 * 60 * 1000,

    // Market data cache (5 minutes)
    MARKET_CACHE_DURATION: 5 * 60 * 1000,

    // Archive retention (7 days)
    ARCHIVE_RETENTION: 7 * 24 * 60 * 60 * 1000,

    // Claim tagging keywords
    CLAIM_TAGS: {
        'data-driven': [
            'data shows', 'according to data', 'statistics', 'survey results',
            'report shows', 'numbers', 'percent', 'basis points', 'bps',
            'year-over-year', 'quarter-over-quarter', 'seasonally adjusted',
            'consensus estimate', 'beat expectations', 'missed expectations',
            'actual vs', 'revised to', 'preliminary', 'index rose', 'index fell'
        ],
        'institutional': [
            'federal reserve', 'ecb', 'bank of japan', 'bank of england',
            'imf', 'world bank', 'bis', 'treasury department', 'sec',
            'cftc', 'official statement', 'press conference', 'minutes show',
            'policy decision', 'regulatory'
        ],
        'narrative': [
            'could', 'might', 'may', 'expected to', 'likely', 'unlikely',
            'analysts expect', 'traders bet', 'market believes', 'sentiment',
            'fears', 'hopes', 'optimism', 'pessimism', 'speculation',
            'rumor', 'sources say', 'according to sources', 'prediction'
        ]
    }
};

// =====================================================
// Claim Tagging
// =====================================================

function tagClaim(title, content, sourceKey) {
    const text = `${title} ${content}`.toLowerCase();
    const tags = [];

    // Check institutional sources first (always tagged)
    const institutionalSources = ['fed_press', 'ecb_press', 'boe_news', 'ny_fed_liberty',
        'stlouis_fed', 'bis_research', 'imf_blog'];
    if (institutionalSources.includes(sourceKey)) {
        tags.push('institutional');
    }

    // Check keyword matches
    for (const [tag, keywords] of Object.entries(CONFIG.CLAIM_TAGS)) {
        if (tags.includes(tag)) continue;
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                tags.push(tag);
                break;
            }
        }
    }

    // Default to narrative if no tags
    if (tags.length === 0) tags.push('narrative');

    return tags;
}

// =====================================================
// State Management
// =====================================================

let state = {
    news: [],
    filteredNews: [],
    currentCategory: 'all',
    currentSource: 'all',
    currentTimeFilter: 'today',
    isLoading: false,
    lastUpdated: null,
    marketData: null,
    marketDataSource: 'unknown', // 'live', 'cached', 'simulated'
    researchIdeas: [],
    hotNews: []
};

// =====================================================
// Utility Functions
// =====================================================

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function classifyCategory(title, content) {
    const text = `${title} ${content}`.toLowerCase();

    for (const [category, keywords] of Object.entries(CONFIG.CATEGORIES)) {
        for (const keyword of keywords) {
            if (text.includes(keyword.toLowerCase())) {
                return category;
            }
        }
    }

    return 'markets'; // Default category
}

function calculatePriority(item, sourceConfig) {
    let priority = 0;

    // Source priority
    if (sourceConfig.priority === 'critical') priority += 4;
    else if (sourceConfig.priority === 'high') priority += 3;
    else if (sourceConfig.priority === 'medium') priority += 2;
    else priority += 1;

    // Category priority for quants
    const highPriorityCategories = ['volatility', 'central-banks', 'systematic', 'factors', 'academic'];
    if (highPriorityCategories.includes(item.category)) priority += 2;

    // Recency bonus
    const age = Date.now() - new Date(item.pubDate).getTime();
    if (age < 3600000) priority += 3; // Less than 1 hour
    else if (age < 86400000) priority += 1; // Less than 1 day

    // Keyword boost for very relevant terms
    const criticalKeywords = ['vix spike', 'fed rate', 'fomc', 'volatility surge', 'market crash', 'black swan'];
    const titleLower = item.title.toLowerCase();
    for (const keyword of criticalKeywords) {
        if (titleLower.includes(keyword)) {
            priority += 2;
            break;
        }
    }

    return priority;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const messageEl = toast.querySelector('.toast-message');

    messageEl.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function getFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Storage read error:', e);
        return null;
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Storage write error:', e);
    }
}

// =====================================================
// Real-Time Market Data (Using Free APIs)
// =====================================================

async function fetchMarketData() {
    // Show loading state immediately
    renderMarketBar(null, { isLoading: true });

    // Check cache first
    const cached = getFromStorage(CONFIG.STORAGE.MARKET_DATA_CACHE);

    // If we have cached data, show it immediately while fetching fresh data
    if (cached && cached.data) {
        const cacheAge = Date.now() - cached.timestamp;
        state.marketDataSource = cacheAge < CONFIG.MARKET_CACHE_DURATION ? 'cached' : 'stale';
        state.marketData = cached.data;
        renderMarketBar(cached.data, { source: state.marketDataSource, cacheAge });

        // If cache is fresh enough, don't refetch
        if (cacheAge < CONFIG.MARKET_CACHE_DURATION) {
            return cached.data;
        }
    }

    try {
        // Fetch from Yahoo Finance via a proxy/CORS-friendly endpoint
        // Using multiple free APIs for redundancy
        const marketData = await fetchYahooFinanceData();

        // Check if we got real data (not simulated)
        const hasRealData = marketData && marketData.length > 0 && !marketData[0].simulated;
        state.marketDataSource = hasRealData ? 'live' : 'simulated';
        state.marketData = marketData;

        saveToStorage(CONFIG.STORAGE.MARKET_DATA_CACHE, {
            data: marketData,
            timestamp: Date.now(),
            source: state.marketDataSource
        });

        renderMarketBar(marketData, { source: state.marketDataSource });
        return marketData;
    } catch (error) {
        console.warn('Failed to fetch market data:', error);
        // Use fallback/last known data or simulated
        if (cached && cached.data) {
            state.marketDataSource = 'cached';
            state.marketData = cached.data;
            renderMarketBar(cached.data, { source: 'cached', cacheAge: Date.now() - cached.timestamp });
        } else {
            // Use simulated data as last resort
            const simulatedData = await fetchAlternativeMarketData();
            state.marketData = simulatedData;
            renderMarketBar(simulatedData, { source: 'simulated' });
        }
        return state.marketData;
    }
}

async function fetchYahooFinanceData() {
    // Symbols to fetch
    const symbols = [
        { symbol: '^GSPC', label: 'S&P 500' },
        { symbol: '^IXIC', label: 'NASDAQ' },
        { symbol: '^VIX', label: 'VIX' },
        { symbol: '^TNX', label: '10Y Yield' },
        { symbol: 'GC=F', label: 'Gold' },
        { symbol: 'EURUSD=X', label: 'EUR/USD' },
        { symbol: 'CL=F', label: 'WTI Oil' },
        { symbol: '^DJI', label: 'Dow Jones' },
        { symbol: 'BTC-USD', label: 'Bitcoin' },
        { symbol: 'DX-Y.NYB', label: 'DXY' },
        { symbol: 'HG=F', label: 'Copper' },
        { symbol: '^FVX', label: '5Y Yield' }
    ];

    // Try Yahoo Finance API via a CORS proxy
    const results = [];

    for (const { symbol, label } of symbols) {
        try {
            // Using a public CORS proxy (you can self-host one for production)
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;

            // Try direct fetch (works if CORS is allowed)
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];

                if (result) {
                    const meta = result.meta;
                    const price = meta.regularMarketPrice;
                    const prevClose = meta.chartPreviousClose || meta.previousClose;
                    const change = prevClose ? ((price - prevClose) / prevClose * 100) : 0;

                    results.push({
                        label,
                        symbol,
                        value: formatPrice(price, label),
                        change: formatChange(change),
                        changeNum: change,
                        positive: change >= 0
                    });
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch ${symbol}:`, e.message);
        }
    }

    // Log new instrument data
    const newInstruments = results.filter(r => ['BTC-USD', 'DX-Y.NYB', 'HG=F', '^FVX'].includes(r.symbol));
    if (newInstruments.length > 0) {
        console.log('New instrument data fetched:', newInstruments.map(i => `${i.label}: ${i.value}`).join(', '));
    }

    // Calculate 2s10s spread (10Y Yield - 5Y Yield)
    const tenYear = results.find(r => r.symbol === '^TNX');
    const fiveYear = results.find(r => r.symbol === '^FVX');
    if (tenYear && fiveYear) {
        const tenYValue = parseFloat(tenYear.value);
        const fiveYValue = parseFloat(fiveYear.value);
        if (!isNaN(tenYValue) && !isNaN(fiveYValue)) {
            const spread = tenYValue - fiveYValue;
            const spreadBps = (spread * 100).toFixed(0);
            const isInverted = spread < 0;
            console.log(`2s10s spread calculated: ${spread.toFixed(2)}% (${spreadBps}bp) ${isInverted ? '- INVERTED' : ''}`);
            results.push({
                label: '2s10s',
                symbol: '2s10s',
                value: `${spreadBps}bp`,
                change: isInverted ? 'INVERTED' : 'Normal',
                changeNum: spread,
                positive: !isInverted,
                is2s10s: true,
                inverted: isInverted
            });
        }
    }

    // If no results, try alternative API
    if (results.length === 0) {
        return await fetchAlternativeMarketData();
    }

    return results;
}

async function fetchAlternativeMarketData() {
    // Fallback: Return simulated data with realistic values
    // These are approximate market values for demonstration
    state.marketDataSource = 'simulated';

    const tenYValue = 4.52;
    const fiveYValue = 4.25;
    const spread = tenYValue - fiveYValue;
    const spreadBps = (spread * 100).toFixed(0);
    const isInverted = spread < 0;

    return [
        { label: 'S&P 500', value: '5,842', change: '+0.35%', changeNum: 0.35, positive: true, simulated: true },
        { label: 'NASDAQ', value: '18,456', change: '+0.52%', changeNum: 0.52, positive: true, simulated: true },
        { label: 'VIX', value: '14.82', change: '-2.1%', changeNum: -2.1, positive: false, simulated: true },
        { label: '10Y Yield', value: '4.52%', change: '+0.03%', changeNum: 0.03, positive: true, simulated: true },
        { label: 'Gold', value: '2,035', change: '+0.18%', changeNum: 0.18, positive: true, simulated: true },
        { label: 'EUR/USD', value: '1.0842', change: '-0.12%', changeNum: -0.12, positive: false, simulated: true },
        { label: 'WTI Oil', value: '76.45', change: '+1.24%', changeNum: 1.24, positive: true, simulated: true },
        { label: 'Bitcoin', symbol: 'BTC-USD', value: '95,000', change: '-1.20%', changeNum: -1.2, positive: false, simulated: true },
        { label: 'DXY', symbol: 'DX-Y.NYB', value: '104.50', change: '+0.30%', changeNum: 0.3, positive: true, simulated: true },
        { label: 'Copper', symbol: 'HG=F', value: '4.15', change: '-0.50%', changeNum: -0.5, positive: false, simulated: true },
        { label: '5Y Yield', symbol: '^FVX', value: '4.25%', change: '-0.02%', changeNum: -0.02, positive: false, simulated: true },
        { label: '2s10s', symbol: '2s10s', value: `${spreadBps}bp`, change: isInverted ? 'INVERTED' : 'Normal', changeNum: spread, positive: !isInverted, is2s10s: true, inverted: isInverted, simulated: true }
    ];
}

function formatPrice(price, label) {
    if (price === null || price === undefined) return '--';

    if (label === 'Bitcoin') {
        return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else if (label === 'DXY') {
        return price.toFixed(2);
    } else if (label === 'Copper') {
        return price.toFixed(2);
    } else if (label.includes('EUR') || label.includes('USD')) {
        return price.toFixed(4);
    } else if (label === 'VIX') {
        return price.toFixed(2);
    } else if (label.includes('Yield')) {
        return price.toFixed(2) + '%';
    } else if (price > 1000) {
        return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
    } else {
        return price.toFixed(2);
    }
}

function formatChange(change) {
    if (change === null || change === undefined) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

function renderMarketBar(data, options = {}) {
    const container = document.getElementById('marketBar');
    const { isLoading = false, source = 'unknown', cacheAge = 0 } = options;

    if (isLoading && !data) {
        container.innerHTML = `
            <div class="market-item loading">
                <span class="market-label">Loading market data...</span>
                <span class="loading-spinner"></span>
            </div>
        `;
        return;
    }

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="market-item">
                <span class="market-label">Market data unavailable</span>
            </div>
        `;
        return;
    }

    // Data source indicator
    const sourceIndicator = getSourceIndicator(source, cacheAge);

    container.innerHTML = `
        <div class="market-source-indicator ${source}">
            ${sourceIndicator}
        </div>
        ${data.map(item => {
            // Special rendering for 2s10s spread
            if (item.is2s10s) {
                const invertedClass = item.inverted ? 'inverted' : '';
                const spreadColor = item.inverted ? 'negative' : 'positive';
                return `
                    <div class="market-item ${item.simulated ? 'simulated' : ''} ${invertedClass}"
                         data-symbol="2s10s"
                         onmouseenter="showMarketTooltip(event, '2s10s')"
                         onmouseleave="hideMarketTooltip()">
                        <span class="market-label">2s10s</span>
                        <span class="market-value ${spreadColor}">${item.value}</span>
                        ${item.inverted ? '<span class="market-change negative inverted-badge">INVERTED</span>' : '<span class="market-change positive">Normal</span>'}
                    </div>
                `;
            }
            return `
                <div class="market-item ${item.simulated ? 'simulated' : ''}"
                     data-symbol="${item.symbol || item.label}"
                     onmouseenter="showMarketTooltip(event, '${item.label}')"
                     onmouseleave="hideMarketTooltip()">
                    <span class="market-label">${item.label}</span>
                    <span class="market-value">${item.value}</span>
                    <span class="market-change ${item.positive ? 'positive' : 'negative'}">${item.change}</span>
                </div>
            `;
        }).join('')}
    `;
}

function getSourceIndicator(source, cacheAge) {
    const cacheMinutes = Math.floor(cacheAge / 60000);

    switch (source) {
        case 'live':
            return `<span class="source-dot live"></span><span class="source-text">Live</span>`;
        case 'cached':
            return `<span class="source-dot cached"></span><span class="source-text">Cached ${cacheMinutes > 0 ? `(${cacheMinutes}m ago)` : ''}</span>`;
        case 'stale':
            return `<span class="source-dot stale"></span><span class="source-text">Stale</span>`;
        case 'simulated':
            return `<span class="source-dot simulated"></span><span class="source-text">Demo</span>`;
        default:
            return `<span class="source-dot"></span><span class="source-text">Unknown</span>`;
    }
}

// =====================================================
// Market Hover Tooltip
// =====================================================

const INSTRUMENT_INFO = {
    'S&P 500': {
        symbol: '^GSPC',
        fullName: 'S&P 500 Index',
        description: 'Market-cap weighted index of 500 large-cap US stocks',
        category: 'Equity Index',
        interpretation: {
            bullish: 'Risk-on sentiment, economic optimism',
            bearish: 'Risk-off sentiment, economic concerns'
        },
        relatedNews: ['markets', 'macro'],
        keyLevels: { support: 5700, resistance: 6000 },
        tradingHours: '9:30 AM - 4:00 PM ET'
    },
    'NASDAQ': {
        symbol: '^IXIC',
        fullName: 'NASDAQ Composite',
        description: 'Tech-heavy index of 3,000+ stocks on NASDAQ exchange',
        category: 'Equity Index',
        interpretation: {
            bullish: 'Growth/tech optimism, risk appetite',
            bearish: 'Tech selloff, rate hike fears'
        },
        relatedNews: ['markets', 'systematic'],
        keyLevels: { support: 18000, resistance: 19000 },
        tradingHours: '9:30 AM - 4:00 PM ET'
    },
    'VIX': {
        symbol: '^VIX',
        fullName: 'CBOE Volatility Index',
        description: 'Implied volatility of S&P 500 options (30-day)',
        category: 'Volatility',
        interpretation: {
            low: '< 15: Complacency, low fear',
            normal: '15-20: Normal market conditions',
            elevated: '20-30: Increased uncertainty',
            high: '> 30: High fear, potential capitulation'
        },
        relatedNews: ['volatility'],
        keyLevels: { complacent: 12, normal: 18, fear: 25, panic: 35 },
        tradingHours: '3:15 AM - 9:15 AM, 9:30 AM - 4:15 PM ET'
    },
    '10Y Yield': {
        symbol: '^TNX',
        fullName: '10-Year Treasury Yield',
        description: 'Yield on US 10-year government bonds',
        category: 'Fixed Income',
        interpretation: {
            rising: 'Higher growth/inflation expectations, Fed hawkish',
            falling: 'Lower growth expectations, flight to safety'
        },
        relatedNews: ['fixed-income', 'central-banks'],
        keyLevels: { low: 3.5, neutral: 4.25, high: 5.0 },
        tradingHours: '24/5'
    },
    'Gold': {
        symbol: 'GC=F',
        fullName: 'Gold Futures',
        description: 'COMEX Gold futures contract',
        category: 'Commodity',
        interpretation: {
            bullish: 'Inflation hedge, safe haven demand, weak USD',
            bearish: 'Risk-on sentiment, strong USD, rising real rates'
        },
        relatedNews: ['commodities', 'macro'],
        keyLevels: { support: 1950, resistance: 2100 },
        tradingHours: '6:00 PM - 5:00 PM ET (Sun-Fri)'
    },
    'EUR/USD': {
        symbol: 'EURUSD=X',
        fullName: 'Euro / US Dollar',
        description: 'Exchange rate of Euro to US Dollar',
        category: 'Currency',
        interpretation: {
            rising: 'Euro strength, USD weakness, ECB hawkish vs Fed',
            falling: 'USD strength, Euro weakness, Fed hawkish vs ECB'
        },
        relatedNews: ['central-banks', 'macro'],
        keyLevels: { support: 1.05, parity: 1.00, resistance: 1.12 },
        tradingHours: '24/5'
    },
    'WTI Oil': {
        symbol: 'CL=F',
        fullName: 'WTI Crude Oil Futures',
        description: 'West Texas Intermediate crude oil futures',
        category: 'Commodity',
        interpretation: {
            bullish: 'Strong demand, supply constraints, geopolitical risk',
            bearish: 'Weak demand, oversupply, recession fears'
        },
        relatedNews: ['commodities', 'macro'],
        keyLevels: { support: 70, resistance: 85 },
        tradingHours: '6:00 PM - 5:00 PM ET (Sun-Fri)'
    },
    'Dow Jones': {
        symbol: '^DJI',
        fullName: 'Dow Jones Industrial Average',
        description: 'Price-weighted index of 30 large-cap US stocks',
        category: 'Equity Index',
        interpretation: {
            bullish: 'Blue-chip strength, industrial optimism',
            bearish: 'Industrial weakness, economic concerns'
        },
        relatedNews: ['markets'],
        keyLevels: { support: 38000, resistance: 40000 },
        tradingHours: '9:30 AM - 4:00 PM ET'
    },
    'Bitcoin': {
        symbol: 'BTC-USD',
        fullName: 'Bitcoin',
        description: 'Largest cryptocurrency by market cap. Risk-on/liquidity indicator.',
        category: 'Crypto',
        interpretation: {
            bullish: 'Risk-on sentiment, abundant liquidity, crypto adoption',
            bearish: 'Risk-off, liquidity tightening, regulatory concerns'
        },
        relatedNews: ['markets', 'macro'],
        keyLevels: { support: [80000, 70000, 60000], resistance: [100000, 110000, 120000] },
        tradingHours: '24/7'
    },
    'DXY': {
        symbol: 'DX-Y.NYB',
        fullName: 'US Dollar Index (DXY)',
        description: 'Dollar strength vs basket of 6 major currencies. Key macro indicator.',
        category: 'FX',
        interpretation: {
            bullish: 'EM weakness, commodity pressure, dollar assets preferred',
            bearish: 'Risk appetite, commodity tailwind, EM recovery'
        },
        relatedNews: ['commodities', 'macro', 'central-banks'],
        keyLevels: { support: [100, 98, 95], resistance: [105, 108, 110] },
        tradingHours: '24/5'
    },
    'Copper': {
        symbol: 'HG=F',
        fullName: 'Copper (Dr. Copper)',
        description: 'Industrial metal barometer. Leading indicator of economic activity.',
        category: 'Commodity',
        interpretation: {
            bullish: 'Economy expanding, industrial demand up, China recovery',
            bearish: 'Recession signal, China slowdown, demand destruction'
        },
        relatedNews: ['commodities', 'macro'],
        keyLevels: { support: [3.5, 3.0, 2.5], resistance: [4.5, 5.0, 5.5] },
        tradingHours: '6:00 PM - 5:00 PM ET (Sun-Fri)'
    },
    '5Y Yield': {
        symbol: '^FVX',
        fullName: '5-Year Treasury Yield',
        description: 'Mid-curve yield. Key for mortgage rates and Fed policy expectations.',
        category: 'Fixed Income',
        interpretation: {
            bullish: 'Tighter conditions, hawkish Fed',
            bearish: 'Easing expectations, flight to safety'
        },
        relatedNews: ['fixed-income', 'central-banks'],
        keyLevels: { support: [3.5, 3.0, 2.5], resistance: [4.5, 5.0, 5.5] },
        tradingHours: '24/5'
    },
    '2s10s': {
        symbol: '2s10s',
        fullName: '2s10s Yield Spread',
        description: 'Difference between 10Y and short-term yields. Classic recession predictor.',
        category: 'Fixed Income',
        interpretation: {
            bullish: 'Normal curve — expansion expected',
            bearish: 'INVERTED — historically precedes recessions by 6-18 months'
        },
        relatedNews: ['fixed-income', 'macro', 'central-banks'],
        keyLevels: { support: [-0.5, 0], resistance: [0.5, 1.0, 1.5] },
        tradingHours: '24/5'
    }
};

let tooltipTimeout = null;

function showMarketTooltip(event, label) {
    // Clear any existing timeout
    if (tooltipTimeout) clearTimeout(tooltipTimeout);

    // Small delay before showing tooltip
    tooltipTimeout = setTimeout(() => {
        const info = INSTRUMENT_INFO[label];
        if (!info) return;

        // Get market data for this instrument
        const marketItem = state.marketData?.find(m => m.label === label);

        // Create tooltip
        let tooltip = document.getElementById('marketTooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'marketTooltip';
            tooltip.className = 'market-tooltip';
            document.body.appendChild(tooltip);
        }

        // Get related news count
        const relatedNewsCount = state.news.filter(n =>
            info.relatedNews.includes(n.category)
        ).length;

        // Build interpretation section based on category
        let interpretationHtml = '';
        if (label === 'VIX') {
            const vixValue = parseFloat(marketItem?.value) || 15;
            let vixLevel = 'normal';
            if (vixValue < 15) vixLevel = 'low';
            else if (vixValue > 25) vixLevel = 'elevated';
            else if (vixValue > 30) vixLevel = 'high';

            interpretationHtml = `
                <div class="tooltip-interpretation">
                    <div class="interp-item ${vixLevel === 'low' ? 'active' : ''}">
                        <span class="interp-dot low"></span>
                        <span>&lt; 15: ${info.interpretation.low}</span>
                    </div>
                    <div class="interp-item ${vixLevel === 'normal' ? 'active' : ''}">
                        <span class="interp-dot normal"></span>
                        <span>15-20: ${info.interpretation.normal}</span>
                    </div>
                    <div class="interp-item ${vixLevel === 'elevated' ? 'active' : ''}">
                        <span class="interp-dot elevated"></span>
                        <span>20-30: ${info.interpretation.elevated}</span>
                    </div>
                    <div class="interp-item ${vixLevel === 'high' ? 'active' : ''}">
                        <span class="interp-dot high"></span>
                        <span>&gt; 30: ${info.interpretation.high}</span>
                    </div>
                </div>
            `;
        } else {
            const isPositive = marketItem?.positive;
            interpretationHtml = `
                <div class="tooltip-interpretation">
                    <div class="interp-item ${isPositive ? 'active' : ''}">
                        <span class="interp-arrow up">&#9650;</span>
                        <span>${info.interpretation.bullish || info.interpretation.rising}</span>
                    </div>
                    <div class="interp-item ${!isPositive ? 'active' : ''}">
                        <span class="interp-arrow down">&#9660;</span>
                        <span>${info.interpretation.bearish || info.interpretation.falling}</span>
                    </div>
                </div>
            `;
        }

        // Build key levels HTML
        const keyLevelsHtml = Object.entries(info.keyLevels).map(([key, value]) => {
            let displayValue;
            if (Array.isArray(value)) {
                displayValue = value.map(v => typeof v === 'number' ? v.toLocaleString() : v).join(', ');
            } else if (typeof value === 'number') {
                displayValue = value.toLocaleString();
            } else {
                displayValue = value;
            }
            return `
                <span class="key-level">
                    <span class="key-level-label">${key}:</span>
                    <span class="key-level-value">${displayValue}</span>
                </span>
            `;
        }).join('');

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-title">
                    <span class="tooltip-symbol">${info.symbol}</span>
                    <span class="tooltip-name">${info.fullName}</span>
                </div>
                <span class="tooltip-category">${info.category}</span>
            </div>
            <div class="tooltip-body">
                <p class="tooltip-description">${info.description}</p>

                <div class="tooltip-section">
                    <div class="tooltip-section-title">Market Interpretation</div>
                    ${interpretationHtml}
                </div>

                <div class="tooltip-section">
                    <div class="tooltip-section-title">Key Levels</div>
                    <div class="tooltip-key-levels">${keyLevelsHtml}</div>
                </div>

                <div class="tooltip-footer">
                    <span class="tooltip-news-count">${relatedNewsCount} related articles</span>
                    <span class="tooltip-hours">${info.tradingHours}</span>
                </div>
            </div>
        `;

        // Position tooltip
        const rect = event.target.closest('.market-item').getBoundingClientRect();
        const tooltipWidth = 320;

        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        if (left < 10) left = 10;
        if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${rect.bottom + 10}px`;
        tooltip.classList.add('visible');
    }, 200);
}

function hideMarketTooltip() {
    if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
    }

    const tooltip = document.getElementById('marketTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

// =====================================================
// Category Hover Tooltip
// =====================================================

const CATEGORY_INFO = {
    'volatility': {
        name: 'Volatility & Derivatives',
        icon: '📊',
        description: 'VIX movements, options flow, volatility term structure, and derivatives market activity',
        keyMetrics: ['VIX Index', 'VIX Futures', 'Put/Call Ratio', 'Skew Index'],
        whyItMatters: 'Volatility is a key input for risk models, options pricing, and market timing strategies',
        tradingImplications: [
            'High VIX: Consider hedging, reduce position sizes',
            'Low VIX: Potential complacency, watch for vol expansion',
            'Term structure: Contango = carry, Backwardation = fear'
        ]
    },
    'central-banks': {
        name: 'Central Banks',
        icon: '🏦',
        description: 'Fed, ECB, BOE, BOJ policy decisions, speeches, and monetary policy shifts',
        keyMetrics: ['Fed Funds Rate', 'ECB Rate', 'QE/QT pace', 'Dot Plot'],
        whyItMatters: 'Central bank policy drives risk-free rates, discount rates, and market liquidity',
        tradingImplications: [
            'Hawkish: Rising yields, growth → value rotation',
            'Dovish: Falling yields, value → growth rotation',
            'Watch forward guidance for positioning'
        ]
    },
    'systematic': {
        name: 'Systematic Trading',
        icon: '🤖',
        description: 'Quantitative strategies, algorithmic trading, backtesting research, and systematic signals',
        keyMetrics: ['CTA flows', 'Risk parity', 'Momentum signals', 'Factor returns'],
        whyItMatters: 'Systematic flows can amplify moves; understanding positioning helps anticipate reversals',
        tradingImplications: [
            'Crowded trades: Watch for unwinds',
            'New research: Alpha decay, implementation',
            'Systematic deleveraging: Correlation spikes'
        ]
    },
    'factors': {
        name: 'Factor Investing',
        icon: '📈',
        description: 'Value, momentum, quality, size, and other factor performance and research',
        keyMetrics: ['HML', 'SMB', 'UMD', 'QMJ', 'BAB'],
        whyItMatters: 'Factor returns explain most portfolio performance; timing factors can add alpha',
        tradingImplications: [
            'Value/Growth spread: Mean reversion opportunities',
            'Momentum crashes: Risk management critical',
            'Factor crowding: Watch for reversals'
        ]
    },
    'fixed-income': {
        name: 'Fixed Income',
        icon: '💵',
        description: 'Bond yields, credit spreads, duration risk, and debt market developments',
        keyMetrics: ['10Y Yield', '2s10s Spread', 'IG/HY Spreads', 'TED Spread'],
        whyItMatters: 'Fixed income signals economic expectations and provides diversification insights',
        tradingImplications: [
            'Curve inversion: Recession signal (leading)',
            'Spread widening: Risk-off, credit stress',
            'Duration: Interest rate sensitivity'
        ]
    },
    'macro': {
        name: 'Macro & Economic Data',
        icon: '🌍',
        description: 'GDP, employment, inflation, PMI, and other macroeconomic indicators',
        keyMetrics: ['NFP', 'CPI', 'PMI', 'GDP', 'Retail Sales'],
        whyItMatters: 'Macro data drives Fed policy and sector rotation; surprises move markets',
        tradingImplications: [
            'Surprise index: Expectations vs reality',
            'Leading indicators: Position ahead',
            'Calendar risk: Event-driven vol'
        ]
    },
    'commodities': {
        name: 'Commodities & FX',
        icon: '🛢️',
        description: 'Oil, gold, currencies, and commodity market dynamics',
        keyMetrics: ['WTI', 'Brent', 'Gold', 'DXY', 'Copper'],
        whyItMatters: 'Commodities signal inflation and growth; FX affects multinational earnings',
        tradingImplications: [
            'Oil up: Inflation risk, energy sector',
            'Gold up: Safe haven, real rate proxy',
            'USD strength: EM pressure, earnings headwind'
        ]
    },
    'markets': {
        name: 'General Markets',
        icon: '📰',
        description: 'Broad market news, equity indices, and general financial developments',
        keyMetrics: ['S&P 500', 'NASDAQ', 'Russell 2000', 'Breadth'],
        whyItMatters: 'Market context for all trading decisions; regime identification',
        tradingImplications: [
            'Breadth divergence: Sustainability signal',
            'Index concentration: Single stock risk',
            'Sector rotation: Economic cycle'
        ]
    },
    'academic': {
        name: 'Academic Research',
        icon: '📄',
        description: 'Working papers, preprints, and peer-reviewed research in quantitative finance',
        keyMetrics: ['arXiv q-fin', 'SSRN Downloads', 'NBER WPs', 'Citation Count'],
        whyItMatters: 'Academic research is the ultimate source of new alpha ideas and risk models',
        tradingImplications: [
            'New anomalies: Test before trading',
            'Methodology papers: Improve existing models',
            'Factor papers: Challenge or confirm priors'
        ]
    },
    'energy': {
        name: 'Energy Markets',
        icon: '⚡',
        description: 'Oil, natural gas, LNG, renewables, and power market developments',
        keyMetrics: ['EIA Inventories', 'OPEC+ Output', 'Henry Hub', 'Power Prices'],
        whyItMatters: 'Energy drives inflation expectations and has distinct seasonality patterns',
        tradingImplications: [
            'Inventory surprise: Short-term price impact',
            'OPEC+ decisions: Medium-term supply dynamics',
            'Seasonal patterns: Natural gas, heating oil'
        ]
    }
};

let categoryTooltipTimeout = null;

function showCategoryTooltip(event, category) {
    if (categoryTooltipTimeout) clearTimeout(categoryTooltipTimeout);

    categoryTooltipTimeout = setTimeout(() => {
        const info = CATEGORY_INFO[category];
        if (!info) return;

        let tooltip = document.getElementById('categoryTooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'categoryTooltip';
            tooltip.className = 'category-tooltip';
            document.body.appendChild(tooltip);
        }

        // Count articles in this category
        const articleCount = state.news.filter(n => n.category === category).length;

        tooltip.innerHTML = `
            <div class="cat-tooltip-header">
                <span class="cat-tooltip-icon">${info.icon}</span>
                <span class="cat-tooltip-name">${info.name}</span>
            </div>
            <div class="cat-tooltip-body">
                <p class="cat-tooltip-desc">${info.description}</p>

                <div class="cat-tooltip-section">
                    <div class="cat-tooltip-section-title">Key Metrics</div>
                    <div class="cat-tooltip-metrics">
                        ${info.keyMetrics.map(m => `<span class="cat-metric">${m}</span>`).join('')}
                    </div>
                </div>

                <div class="cat-tooltip-section">
                    <div class="cat-tooltip-section-title">Why It Matters</div>
                    <p class="cat-tooltip-why">${info.whyItMatters}</p>
                </div>

                <div class="cat-tooltip-section">
                    <div class="cat-tooltip-section-title">Trading Implications</div>
                    <ul class="cat-tooltip-implications">
                        ${info.tradingImplications.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>

                <div class="cat-tooltip-footer">
                    <span class="cat-tooltip-count">${articleCount} articles today</span>
                </div>
            </div>
        `;

        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const tooltipWidth = 340;
        const tooltipHeight = 380;

        let left = rect.left;
        let top = rect.bottom + 8;

        // Adjust if too close to right edge
        if (left + tooltipWidth > window.innerWidth - 10) {
            left = window.innerWidth - tooltipWidth - 10;
        }

        // Adjust if too close to bottom
        if (top + tooltipHeight > window.innerHeight - 10) {
            top = rect.top - tooltipHeight - 8;
        }

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.classList.add('visible');
    }, 300);
}

function hideCategoryTooltip() {
    if (categoryTooltipTimeout) {
        clearTimeout(categoryTooltipTimeout);
        categoryTooltipTimeout = null;
    }

    const tooltip = document.getElementById('categoryTooltip');
    if (tooltip) {
        tooltip.classList.remove('visible');
    }
}

// =====================================================
// News Fetching
// =====================================================

async function fetchRSSFeed(sourceKey, sourceConfig) {
    const url = `${CONFIG.RSS_API}${encodeURIComponent(sourceConfig.url)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();

        if (data.status !== 'ok') {
            throw new Error(data.message || 'RSS fetch failed');
        }

        return data.items.map(item => ({
            id: `${sourceKey}_${item.guid || item.link}`,
            title: stripHtml(item.title),
            link: item.link,
            pubDate: item.pubDate,
            excerpt: truncateText(stripHtml(item.description || item.content || ''), 200),
            source: sourceConfig.name,
            sourceKey: sourceKey,
            category: classifyCategory(item.title, item.description || ''),
            fetchedAt: new Date().toISOString(),
            claimTags: tagClaim(item.title, item.description || '', sourceKey)
        }));
    } catch (error) {
        console.warn(`Failed to fetch ${sourceConfig.name}:`, error.message);
        return [];
    }
}

async function fetchAllNews() {
    if (state.isLoading) return;

    state.isLoading = true;
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.classList.add('loading');

    // Show loading state
    updateLoadingState(true);

    // Archive current news before fetching new
    archiveCurrentNews();

    const allNews = [];
    const fetchPromises = [];

    // Fetch from all sources in parallel
    for (const [key, config] of Object.entries(CONFIG.SOURCES)) {
        fetchPromises.push(
            fetchRSSFeed(key, config).then(items => {
                items.forEach(item => {
                    item.priority = calculatePriority(item, config);
                    allNews.push(item);
                });
            })
        );
    }

    // Fetch market data in parallel
    fetchPromises.push(fetchMarketData());

    // Wait for all fetches to complete
    await Promise.allSettled(fetchPromises);

    // Remove duplicates based on title similarity
    const uniqueNews = removeDuplicates(allNews);

    // Sort by priority and date
    uniqueNews.sort((a, b) => {
        const priorityDiff = b.priority - a.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Update state
    state.news = uniqueNews;
    state.lastUpdated = new Date();

    // Save to cache
    saveToStorage(CONFIG.STORAGE.NEWS_CACHE, {
        news: uniqueNews,
        timestamp: state.lastUpdated.toISOString()
    });

    // Update UI
    applyFilters();
    updateLastUpdated();
    updateSidebarWidgets();

    state.isLoading = false;
    refreshBtn.classList.remove('loading');
    updateLoadingState(false);

    showToast(`Loaded ${uniqueNews.length} articles from ${Object.keys(CONFIG.SOURCES).length} sources`);
}

function removeDuplicates(news) {
    const seen = new Map();

    return news.filter(item => {
        // Create a normalized title key
        const key = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);

        if (seen.has(key)) {
            // Keep the one with higher priority
            const existing = seen.get(key);
            if (item.priority > existing.priority) {
                seen.set(key, item);
                return true;
            }
            return false;
        }

        seen.set(key, item);
        return true;
    });
}

function archiveCurrentNews() {
    if (state.news.length === 0) return;

    const archive = getFromStorage(CONFIG.STORAGE.NEWS_ARCHIVE) || [];
    const cutoff = Date.now() - CONFIG.ARCHIVE_RETENTION;

    // Add current news to archive (that are old enough)
    state.news.forEach(item => {
        const itemDate = new Date(item.pubDate).getTime();
        if (itemDate > cutoff) {
            // Check if not already in archive
            if (!archive.find(a => a.id === item.id)) {
                archive.push({
                    ...item,
                    archivedAt: new Date().toISOString()
                });
            }
        }
    });

    // Remove items older than retention period
    const filteredArchive = archive.filter(item => {
        return new Date(item.pubDate).getTime() > cutoff;
    });

    // Sort by date descending
    filteredArchive.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Keep max 1000 items (increased for more sources)
    const trimmedArchive = filteredArchive.slice(0, 1000);

    saveToStorage(CONFIG.STORAGE.NEWS_ARCHIVE, trimmedArchive);
}

function loadFromCache() {
    const cache = getFromStorage(CONFIG.STORAGE.NEWS_CACHE);

    if (cache && cache.news && cache.timestamp) {
        const cacheAge = Date.now() - new Date(cache.timestamp).getTime();

        if (cacheAge < CONFIG.CACHE_DURATION) {
            state.news = cache.news;
            state.lastUpdated = new Date(cache.timestamp);
            applyFilters();
            updateLastUpdated();
            fetchMarketData(); // Always fetch fresh market data
            updateSidebarWidgets();
            return true;
        }
    }

    return false;
}

// =====================================================
// Filtering
// =====================================================

function applyFilters() {
    let filtered = [...state.news];

    // Category filter
    if (state.currentCategory !== 'all') {
        filtered = filtered.filter(item => item.category === state.currentCategory);
    }

    // Source filter
    if (state.currentSource !== 'all') {
        filtered = filtered.filter(item => {
            const sourceLower = item.source.toLowerCase();
            return sourceLower.includes(state.currentSource);
        });
    }

    // Time filter
    const now = new Date();
    if (state.currentTimeFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filtered = filtered.filter(item => new Date(item.pubDate) >= today);
    } else if (state.currentTimeFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.pubDate) >= weekAgo);
    }

    state.filteredNews = filtered;
    renderNews();
    updateHeroSection();
    updateHotNewsPanel();
}

// =====================================================
// Rendering
// =====================================================

function createNewsCard(item, isPriority = false) {
    const priorityDots = Array.from({ length: 5 }, (_, i) =>
        `<span class="priority-dot ${i < Math.ceil(item.priority / 2) ? 'active' : ''}"></span>`
    ).join('');

    // Determine priority level for styling
    const priorityClass = item.priority >= 8 ? 'priority-critical' :
                          item.priority >= 6 ? 'priority-high' : '';

    // Category class for colored border
    const categoryClass = `cat-${item.category}`;

    // Priority badge (only for high priority items)
    const priorityBadge = item.priority >= 8 ? '<span class="card-priority-badge critical">Critical</span>' :
                          item.priority >= 6 ? '<span class="card-priority-badge high">High</span>' : '';

    // Check if breaking news (less than 1 hour old and high priority)
    const isBreaking = item.priority >= 7 && (Date.now() - new Date(item.pubDate).getTime()) < 3600000;
    const breakingBadge = isBreaking ? '<span class="card-priority-badge breaking">Breaking</span>' : '';

    // Claim tag badges
    const claimBadges = (item.claimTags || []).map(tag => {
        const badges = {
            'data-driven': '<span class="claim-badge data">📊 Data</span>',
            'institutional': '<span class="claim-badge institutional">🏛️ Official</span>',
            'narrative': '<span class="claim-badge narrative">📝 Narrative</span>'
        };
        return badges[tag] || '';
    }).join('');

    return `
        <article class="news-card ${priorityClass} ${categoryClass}" onclick="window.open('${escapeHtml(item.link)}', '_blank')">
            ${breakingBadge || priorityBadge}
            <div class="news-card-header">
                <span class="news-source">${escapeHtml(item.source)}</span>
                <span class="news-time">${formatTime(item.pubDate)}</span>
            </div>
            <h3 class="news-card-title">${escapeHtml(item.title)}</h3>
            <p class="news-card-excerpt">${escapeHtml(item.excerpt)}</p>
            <div class="claim-badges">${claimBadges}</div>
            <div class="news-card-footer">
                <span class="news-category ${item.category}" onmouseenter="showCategoryTooltip(event, '${item.category}')" onmouseleave="hideCategoryTooltip()">${item.category.replace('-', ' ')}</span>
                <div class="news-priority">${priorityDots}</div>
            </div>
            <button class="save-idea-btn" onclick="event.stopPropagation(); saveResearchIdea('${escapeHtml(item.title.replace(/'/g, "\\'"))}', '${escapeHtml(item.link)}')" title="Save as research idea">
                💡
            </button>
        </article>
    `;
}

function renderNews() {
    const priorityContainer = document.getElementById('priorityNews');
    const mainContainer = document.getElementById('mainNews');
    const researchContainer = document.getElementById('researchNews');

    if (state.filteredNews.length === 0) {
        priorityContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📰</div><p>No news found for current filters</p></div>';
        mainContainer.innerHTML = '';
        researchContainer.innerHTML = '';
        return;
    }

    // Split into priority (top 4) and regular
    const priorityNews = state.filteredNews.filter(item => item.priority >= 5).slice(0, 4);
    const regularNews = state.filteredNews.filter(item => !priorityNews.includes(item)).slice(0, 24);
    const researchNews = state.filteredNews.filter(item =>
        item.category === 'systematic' || item.category === 'factors'
    ).slice(0, 8);

    // Render priority news
    if (priorityNews.length > 0) {
        priorityContainer.innerHTML = priorityNews.map(item => createNewsCard(item, true)).join('');
    } else {
        priorityContainer.innerHTML = '<div class="empty-state"><p>No high-priority updates at the moment</p></div>';
    }

    // Render main news
    if (regularNews.length > 0) {
        mainContainer.innerHTML = regularNews.map(item => createNewsCard(item)).join('');
    } else {
        mainContainer.innerHTML = '<div class="empty-state"><p>No news matching current filters</p></div>';
    }

    // Render research news
    if (researchNews.length > 0) {
        researchContainer.innerHTML = researchNews.map(item => createNewsCard(item)).join('');
    } else {
        researchContainer.innerHTML = '<div class="empty-state"><p>No research articles found</p></div>';
    }
}

function updateLoadingState(isLoading) {
    const containers = ['priorityNews', 'mainNews', 'researchNews'];

    containers.forEach(id => {
        const container = document.getElementById(id);
        if (isLoading) {
            container.innerHTML = `
                <div class="loading-placeholder">
                    <div class="loading-spinner"></div>
                    <p>Fetching news from ${Object.keys(CONFIG.SOURCES).length} sources...</p>
                </div>
            `;
        }
    });
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (state.lastUpdated) {
        el.textContent = `Last updated: ${formatDateTime(state.lastUpdated)}`;
    }
}

// =====================================================
// Sidebar Widgets (Enhanced)
// =====================================================

function updateSidebarWidgets() {
    updateEconomicCalendar();
    updateVolatilityWidget();
    updateCentralBankWidget();
    updateResearchIdeasWidget();
}

function updateEconomicCalendar() {
    const container = document.getElementById('economicCalendar');

    // Calculate upcoming dates dynamically
    const today = new Date();
    const events = generateEconomicCalendar(today);

    container.innerHTML = events.map(event => `
        <div class="calendar-event">
            <div class="event-info">
                <div class="event-name">${event.name}</div>
                <div class="event-detail">${event.detail}</div>
            </div>
            <div>
                <span class="event-time">${event.time}</span>
                <span class="event-impact ${event.impact}">${event.impact.toUpperCase()}</span>
            </div>
        </div>
    `).join('');
}

function generateEconomicCalendar(today) {
    // Regular economic events with their typical schedules
    const events = [];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // FOMC meetings (typically 8 per year)
    const fomcDates = [
        new Date(2025, 0, 29), // Jan
        new Date(2025, 2, 19), // Mar
        new Date(2025, 4, 7),  // May
        new Date(2025, 5, 18), // Jun
        new Date(2025, 6, 30), // Jul
        new Date(2025, 8, 17), // Sep
        new Date(2025, 10, 5), // Nov
        new Date(2025, 11, 17) // Dec
    ];

    // Find next FOMC
    const nextFomc = fomcDates.find(d => d > today);
    if (nextFomc) {
        events.push({
            name: 'FOMC Meeting',
            detail: 'Rate Decision',
            time: formatEventDate(nextFomc),
            impact: 'high'
        });
    }

    // NFP - First Friday of each month
    const nfpDate = getFirstFriday(currentYear, currentMonth + 1);
    if (nfpDate > today) {
        events.push({
            name: 'Non-Farm Payrolls',
            detail: 'Employment',
            time: formatEventDate(nfpDate),
            impact: 'high'
        });
    }

    // CPI - Usually mid-month (around 10th-15th)
    const cpiDate = new Date(currentYear, currentMonth, 12);
    if (cpiDate > today) {
        events.push({
            name: 'CPI Data',
            detail: 'Inflation',
            time: formatEventDate(cpiDate),
            impact: 'high'
        });
    }

    // GDP - End of month
    const gdpDate = new Date(currentYear, currentMonth, 28);
    if (gdpDate > today) {
        events.push({
            name: 'GDP (Q4)',
            detail: 'Economic Growth',
            time: formatEventDate(gdpDate),
            impact: 'high'
        });
    }

    // Retail Sales - Mid month
    const retailDate = new Date(currentYear, currentMonth, 15);
    if (retailDate > today) {
        events.push({
            name: 'Retail Sales',
            detail: 'Consumer',
            time: formatEventDate(retailDate),
            impact: 'medium'
        });
    }

    // Sort by date and return top 6
    return events.slice(0, 6);
}

function getFirstFriday(year, month) {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const daysUntilFriday = (5 - day + 7) % 7;
    date.setDate(1 + daysUntilFriday);
    return date;
}

function formatEventDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function updateVolatilityWidget() {
    const container = document.getElementById('volatilityWidget');

    // Use market data if available
    let vixValue = '--';
    let vixChange = '--';
    let vixLevel = 'medium';
    let vixPercent = 50;

    if (state.marketData) {
        const vixData = state.marketData.find(d => d.label === 'VIX');
        if (vixData && vixData.value !== '--') {
            const vix = parseFloat(vixData.value);
            vixValue = vixData.value;
            vixChange = vixData.change;

            if (vix < 15) {
                vixLevel = 'low';
                vixPercent = (vix / 15) * 33;
            } else if (vix < 25) {
                vixLevel = 'medium';
                vixPercent = 33 + ((vix - 15) / 10) * 33;
            } else {
                vixLevel = 'high';
                vixPercent = Math.min(100, 66 + ((vix - 25) / 25) * 34);
            }
        }
    }

    // Determine term structure (simplified)
    const termStructure = vixLevel === 'high' ? 'Backwardation' : 'Contango';

    container.innerHTML = `
        <div class="vol-meter">
            <span class="vol-label">VIX Index</span>
            <span class="vol-value ${vixLevel}">${vixValue}</span>
        </div>
        <div class="vol-change" style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;">
            ${vixChange !== '--' ? `Change: ${vixChange}` : ''}
        </div>
        <div class="vol-bar">
            <div class="vol-bar-fill ${vixLevel}" style="width: ${vixPercent}%"></div>
        </div>
        <div class="vol-labels">
            <span>Low (&lt;15)</span>
            <span>Med (15-25)</span>
            <span>High (&gt;25)</span>
        </div>
        <div class="vol-meter" style="margin-top: 12px;">
            <span class="vol-label">Term Structure</span>
            <span class="vol-value" style="font-size: 0.875rem; color: ${termStructure === 'Backwardation' ? 'var(--accent-red)' : 'var(--accent-green)'};">${termStructure}</span>
        </div>
        <div class="vol-note" style="font-size: 0.6875rem; color: var(--text-muted); margin-top: 8px;">
            ${vixLevel === 'low' ? '🟢 Low fear - consider selling premium' :
              vixLevel === 'high' ? '🔴 High fear - potential mean reversion' :
              '🟡 Normal volatility regime'}
        </div>
    `;
}

function updateCentralBankWidget() {
    const container = document.getElementById('centralBankWidget');

    // Current rates (update these periodically)
    const banks = [
        { name: 'Federal Reserve', rate: '4.50%', trend: 'hold', next: 'Mar 19' },
        { name: 'ECB', rate: '2.75%', trend: 'cut', next: 'Mar 6' },
        { name: 'Bank of Japan', rate: '0.50%', trend: 'hike', next: 'Mar 14' },
        { name: 'Bank of England', rate: '4.50%', trend: 'cut', next: 'Mar 20' }
    ];

    container.innerHTML = banks.map(bank => {
        const trendIcon = bank.trend === 'hike' ? '↑' : bank.trend === 'cut' ? '↓' : '→';
        const trendColor = bank.trend === 'hike' ? 'var(--accent-red)' :
                          bank.trend === 'cut' ? 'var(--accent-green)' : 'var(--text-muted)';
        return `
            <div class="cb-item">
                <div>
                    <div class="cb-name">${bank.name}</div>
                    <div class="cb-next">Next: ${bank.next}</div>
                </div>
                <div style="text-align: right;">
                    <span class="cb-rate">${bank.rate}</span>
                    <span style="color: ${trendColor}; margin-left: 4px;">${trendIcon}</span>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================================
// Research Ideas Tracker (New Feature)
// =====================================================

function updateResearchIdeasWidget() {
    const container = document.getElementById('researchIdeasWidget');
    if (!container) return;

    const ideas = getFromStorage(CONFIG.STORAGE.RESEARCH_IDEAS) || [];
    state.researchIdeas = ideas;

    if (ideas.length === 0) {
        container.innerHTML = `
            <div class="empty-ideas">
                <p>Click 💡 on any news card to save research ideas</p>
            </div>
        `;
        return;
    }

    container.innerHTML = ideas.slice(0, 5).map((idea, idx) => `
        <div class="research-idea-item">
            <div class="idea-content">
                <div class="idea-title">${truncateText(idea.title, 60)}</div>
                <div class="idea-date">${formatTime(idea.savedAt)}</div>
            </div>
            <button class="idea-delete" onclick="deleteResearchIdea(${idx})" title="Remove">×</button>
        </div>
    `).join('') + `
        <a href="research-ideas.html" class="view-all-ideas">View all ${ideas.length} ideas →</a>
    `;
}

function saveResearchIdea(title, link) {
    const ideas = getFromStorage(CONFIG.STORAGE.RESEARCH_IDEAS) || [];

    // Check if already saved
    if (ideas.find(i => i.link === link)) {
        showToast('Already saved!');
        return;
    }

    ideas.unshift({
        title,
        link,
        savedAt: new Date().toISOString(),
        notes: '',
        status: 'new'
    });

    saveToStorage(CONFIG.STORAGE.RESEARCH_IDEAS, ideas);
    updateResearchIdeasWidget();
    showToast('Saved to research ideas!');
}

function deleteResearchIdea(idx) {
    const ideas = getFromStorage(CONFIG.STORAGE.RESEARCH_IDEAS) || [];
    ideas.splice(idx, 1);
    saveToStorage(CONFIG.STORAGE.RESEARCH_IDEAS, ideas);
    updateResearchIdeasWidget();
}

// =====================================================
// Market Bar (Using Real Data)
// =====================================================

function updateMarketBar() {
    // This is now handled by fetchMarketData and renderMarketBar
    if (!state.marketData) {
        fetchMarketData();
    }
}

// =====================================================
// Hero Breaking News Section
// =====================================================

let heroState = {
    items: [],
    currentIndex: 0,
    autoRotateInterval: null
};

function updateHeroSection() {
    // Get top priority news from last 6 hours
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    const heroNews = state.news
        .filter(item => {
            const pubTime = new Date(item.pubDate).getTime();
            return pubTime > sixHoursAgo && item.priority >= 5;
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5);

    heroState.items = heroNews;

    if (heroNews.length === 0) {
        // If no breaking news, hide the section or show placeholder
        const section = document.getElementById('heroNews');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }

    const section = document.getElementById('heroNews');
    if (section) {
        section.style.display = 'block';
    }

    renderHeroContent();
    renderHeroDots();
    startHeroAutoRotate();
}

function renderHeroContent() {
    const container = document.getElementById('heroContent');
    if (!container || heroState.items.length === 0) return;

    container.innerHTML = heroState.items.map((item, idx) => `
        <div class="hero-item ${idx === heroState.currentIndex ? 'active' : ''}" data-index="${idx}">
            <span class="hero-category news-category ${item.category}">${item.category.replace('-', ' ')}</span>
            <h2 class="hero-title" onclick="window.open('${escapeHtml(item.link)}', '_blank')">
                ${escapeHtml(item.title)}
            </h2>
            <div class="hero-meta">
                <span class="hero-source">${escapeHtml(item.source)}</span>
                <span class="hero-time">${formatTime(item.pubDate)}</span>
            </div>
        </div>
    `).join('');
}

function renderHeroDots() {
    const container = document.getElementById('heroDots');
    if (!container) return;

    container.innerHTML = heroState.items.map((_, idx) => `
        <button class="hero-dot ${idx === heroState.currentIndex ? 'active' : ''}"
                onclick="goToHeroSlide(${idx})" aria-label="Go to slide ${idx + 1}"></button>
    `).join('');
}

function goToHeroSlide(index) {
    heroState.currentIndex = index;
    updateHeroDisplay();
    resetHeroAutoRotate();
}

function nextHeroNews() {
    if (heroState.items.length === 0) return;
    heroState.currentIndex = (heroState.currentIndex + 1) % heroState.items.length;
    updateHeroDisplay();
    resetHeroAutoRotate();
}

function prevHeroNews() {
    if (heroState.items.length === 0) return;
    heroState.currentIndex = (heroState.currentIndex - 1 + heroState.items.length) % heroState.items.length;
    updateHeroDisplay();
    resetHeroAutoRotate();
}

function updateHeroDisplay() {
    // Update active hero item
    const items = document.querySelectorAll('.hero-item');
    items.forEach((item, idx) => {
        item.classList.toggle('active', idx === heroState.currentIndex);
    });

    // Update dots
    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === heroState.currentIndex);
    });
}

function startHeroAutoRotate() {
    if (heroState.autoRotateInterval) {
        clearInterval(heroState.autoRotateInterval);
    }
    heroState.autoRotateInterval = setInterval(nextHeroNews, 8000);
}

function resetHeroAutoRotate() {
    startHeroAutoRotate();
}

// =====================================================
// Hot News Floating Panel
// =====================================================

const HOT_NEWS_CONFIG = {
    maxItems: 7,
    criticalKeywords: [
        'vix spike', 'vix surges', 'volatility surge', 'volatility spike',
        'fed rate', 'fomc', 'rate decision', 'rate cut', 'rate hike',
        'emergency', 'crash', 'plunge', 'circuit breaker', 'flash crash',
        'inflation surprise', 'cpi surprise', 'jobs report', 'nfp',
        'bank failure', 'credit crunch', 'liquidity crisis',
        'geopolitical', 'war', 'sanctions', 'tariff'
    ],
    refreshInterval: 60000 // 1 minute
};

let hotNewsFilter = 'all';

function updateHotNewsPanel() {
    const panel = document.getElementById('hotNewsBody');
    const counter = document.getElementById('hotNewsCount');
    if (!panel) return;

    // Filter for critical/hot news
    let hotNews = state.news.filter(item => isHotNews(item));

    // Apply category filter
    if (hotNewsFilter !== 'all') {
        hotNews = hotNews.filter(item => item.category === hotNewsFilter);
    }

    // Sort by priority and recency
    hotNews = hotNews
        .sort((a, b) => {
            const priorityDiff = b.priority - a.priority;
            if (priorityDiff !== 0) return priorityDiff;
            return new Date(b.pubDate) - new Date(a.pubDate);
        })
        .slice(0, HOT_NEWS_CONFIG.maxItems);

    // Update state for access elsewhere
    state.hotNews = hotNews;

    if (hotNews.length === 0) {
        panel.innerHTML = '<div class="hot-news-empty">No critical alerts at the moment</div>';
        if (counter) counter.textContent = '0 alerts';
        return;
    }

    panel.innerHTML = hotNews.map(item => `
        <div class="hot-news-item" onclick="window.open('${escapeHtml(item.link)}', '_blank')">
            <span class="hot-news-item-category news-category ${item.category}">${item.category.replace('-', ' ')}</span>
            <div class="hot-news-item-title">${escapeHtml(truncateText(item.title, 80))}</div>
            <div class="hot-news-item-meta">
                <span class="hot-news-item-source">${escapeHtml(item.source)}</span>
                <span class="hot-news-item-time">${formatTime(item.pubDate)}</span>
            </div>
        </div>
    `).join('');

    if (counter) {
        counter.textContent = `${hotNews.length} alert${hotNews.length !== 1 ? 's' : ''}`;
    }
}

function isHotNews(item) {
    const text = `${item.title} ${item.excerpt || ''}`.toLowerCase();

    // Check for critical keywords
    const hasCriticalKeyword = HOT_NEWS_CONFIG.criticalKeywords.some(kw => text.includes(kw));

    // Check for high priority
    const isHighPriority = item.priority >= 6;

    // Check for recency (last 4 hours)
    const isRecent = (Date.now() - new Date(item.pubDate).getTime()) < (4 * 60 * 60 * 1000);

    // Is hot if: (has critical keyword OR high priority) AND recent
    return (hasCriticalKeyword || isHighPriority) && isRecent;
}

function toggleHotNewsPanel() {
    const panel = document.getElementById('hotNewsPanel');
    if (panel) {
        panel.classList.toggle('collapsed');
    }
}

function filterHotNews(category) {
    hotNewsFilter = category;
    updateHotNewsPanel();
}

// =====================================================
// Event Handlers
// =====================================================

function setupEventListeners() {
    // Category tabs
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            state.currentCategory = e.target.dataset.category;
            applyFilters();
        });
    });

    // Source filter
    document.getElementById('sourceFilter').addEventListener('change', (e) => {
        state.currentSource = e.target.value;
        applyFilters();
    });

    // Time filter
    document.getElementById('timeFilter').addEventListener('change', (e) => {
        state.currentTimeFilter = e.target.value;
        applyFilters();
    });

    // Auto-refresh news every 15 minutes
    setInterval(() => {
        if (!state.isLoading) {
            fetchAllNews();
        }
    }, 15 * 60 * 1000);

    // Auto-refresh market data every 5 minutes
    setInterval(() => {
        fetchMarketData();
    }, 5 * 60 * 1000);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // R to refresh
        if (e.key === 'r' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
            fetchAllNews();
        }
        // 1-9 for category filters
        if (e.key >= '1' && e.key <= '9' && document.activeElement.tagName !== 'INPUT') {
            const tabs = document.querySelectorAll('.category-tab');
            const idx = parseInt(e.key) - 1;
            if (tabs[idx]) {
                tabs[idx].click();
            }
        }
    });
}

// =====================================================
// Initialization
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();

    // Try to load from cache first
    const cacheLoaded = loadFromCache();

    if (!cacheLoaded) {
        // Fetch fresh data
        fetchAllNews();
    } else {
        showToast('Loaded from cache');
        // Schedule a background refresh
        setTimeout(fetchAllNews, 5000);
    }
});

// Export for global access
window.fetchAllNews = fetchAllNews;
window.saveResearchIdea = saveResearchIdea;
window.deleteResearchIdea = deleteResearchIdea;
window.nextHeroNews = nextHeroNews;
window.prevHeroNews = prevHeroNews;
window.goToHeroSlide = goToHeroSlide;
window.toggleHotNewsPanel = toggleHotNewsPanel;
window.filterHotNews = filterHotNews;
window.showMarketTooltip = showMarketTooltip;
window.hideMarketTooltip = hideMarketTooltip;
window.showCategoryTooltip = showCategoryTooltip;
window.hideCategoryTooltip = hideCategoryTooltip;
