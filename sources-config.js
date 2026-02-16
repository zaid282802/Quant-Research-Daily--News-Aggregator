/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * Sources Configuration for QRD
 * All RSS feed sources, category definitions, sub-filters, and fetch tier config.
 * Extracted from app.js for cleaner source management.
 */

// =====================================================
// Fetch Tiers — controls refresh frequency
// =====================================================

const FETCH_TIERS = {
    fast: 15 * 60 * 1000,   // 15 minutes — critical + high priority
    slow: 30 * 60 * 1000    // 30 minutes — medium + low priority
};

// =====================================================
// RSS Feed Sources (67+ sources)
// =====================================================

const SOURCE_CONFIG = {

    // ==================== HIGH PRIORITY ====================

    // WSJ RSS Feeds
    wsj_markets: {
        name: 'WSJ Markets',
        url: 'https://feeds.wsj.com/wsj/xml/rss/3_7455.xml',
        category: 'markets',
        priority: 'high',
        tier: 'fast'
    },
    wsj_economy: {
        name: 'WSJ Economy',
        url: 'https://feeds.wsj.com/wsj/xml/rss/3_7014.xml',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },

    // Federal Reserve
    fed_press: {
        name: 'Federal Reserve',
        url: 'https://www.federalreserve.gov/feeds/press_all.xml',
        category: 'central-banks',
        priority: 'high',
        tier: 'fast'
    },
    fed_speeches: {
        name: 'Fed Speeches',
        url: 'https://www.federalreserve.gov/feeds/speeches.xml',
        category: 'central-banks',
        priority: 'high',
        tier: 'fast'
    },
    fed_feds_papers: {
        name: 'FEDS Papers',
        url: 'https://www.federalreserve.gov/feeds/feds.xml',
        category: 'central-banks',
        priority: 'medium',
        tier: 'slow'
    },

    // ECB
    ecb_press: {
        name: 'ECB',
        url: 'https://www.ecb.europa.eu/rss/press.html',
        category: 'central-banks',
        priority: 'high',
        tier: 'fast'
    },

    // Bank of England
    boe_news: {
        name: 'Bank of England',
        url: 'https://www.bankofengland.co.uk/rss/news',
        category: 'central-banks',
        priority: 'high',
        tier: 'fast'
    },

    // Bank of Japan
    boj_news: {
        name: 'Bank of Japan',
        url: 'https://news.google.com/rss/search?q=site:boj.or.jp+monetary+policy&hl=en-US&gl=US&ceid=US:en',
        category: 'central-banks',
        priority: 'high',
        tier: 'fast'
    },

    // Reserve Bank of Australia
    rba_news: {
        name: 'RBA',
        url: 'https://news.google.com/rss/search?q=site:rba.gov.au+monetary+policy&hl=en-US&gl=US&ceid=US:en',
        category: 'central-banks',
        priority: 'medium',
        tier: 'slow'
    },

    // Bank of Canada
    boc_news: {
        name: 'Bank of Canada',
        url: 'https://news.google.com/rss/search?q=site:bankofcanada.ca+interest+rate&hl=en-US&gl=US&ceid=US:en',
        category: 'central-banks',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== QUANT RESEARCH ====================

    alpha_architect: {
        name: 'Alpha Architect',
        url: 'https://alphaarchitect.com/feed/',
        category: 'factors',
        priority: 'high',
        tier: 'fast'
    },
    quantocracy: {
        name: 'Quantocracy',
        url: 'https://quantocracy.com/feed/',
        category: 'systematic',
        priority: 'high',
        tier: 'fast'
    },
    ssrn_finance: {
        name: 'SSRN Finance',
        url: 'https://papers.ssrn.com/sol3/Jeljour_results.cfm?form_name=journalBrowse&journal_id=1927431&Network=no&lim=false&npage=1',
        category: 'systematic',
        priority: 'high',
        tier: 'fast'
    },

    // ==================== MEDIUM PRIORITY ====================

    reuters_business: {
        name: 'Reuters Business',
        url: 'https://feeds.reuters.com/reuters/businessNews',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    reuters_markets: {
        name: 'Reuters Markets',
        url: 'https://feeds.reuters.com/reuters/companyNews',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    ft_markets: {
        name: 'FT Markets',
        url: 'https://www.ft.com/markets?format=rss',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    bloomberg_markets: {
        name: 'Bloomberg',
        url: 'https://news.google.com/rss/search?q=site:bloomberg.com+markets&hl=en-US&gl=US&ceid=US:en',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    yahoo_finance: {
        name: 'Yahoo Finance',
        url: 'https://finance.yahoo.com/rss/topstories',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    cnbc_markets: {
        name: 'CNBC Markets',
        url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    marketwatch: {
        name: 'MarketWatch',
        url: 'https://feeds.marketwatch.com/marketwatch/topstories/',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },
    investing_news: {
        name: 'Investing.com',
        url: 'https://www.investing.com/rss/news.rss',
        category: 'markets',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== DERIVATIVES & VOL ====================

    cboe_insights: {
        name: 'CBOE',
        url: 'https://news.google.com/rss/search?q=site:cboe.com+vix+volatility&hl=en-US&gl=US&ceid=US:en',
        category: 'volatility',
        priority: 'high',
        tier: 'fast'
    },
    risk_net: {
        name: 'Risk.net',
        url: 'https://news.google.com/rss/search?q=site:risk.net+derivatives&hl=en-US&gl=US&ceid=US:en',
        category: 'volatility',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== COMMODITIES & FX ====================

    oilprice: {
        name: 'OilPrice',
        url: 'https://oilprice.com/rss/main',
        category: 'commodities',
        priority: 'medium',
        tier: 'slow'
    },
    kitco_news: {
        name: 'Kitco',
        url: 'https://news.google.com/rss/search?q=site:kitco.com+gold&hl=en-US&gl=US&ceid=US:en',
        category: 'commodities',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== FIXED INCOME ====================

    bond_buyer: {
        name: 'Bond Buyer',
        url: 'https://news.google.com/rss/search?q=treasury+yields+bonds&hl=en-US&gl=US&ceid=US:en',
        category: 'fixed-income',
        priority: 'medium',
        tier: 'slow'
    },
    treasury_direct: {
        name: 'Treasury Direct',
        url: 'https://news.google.com/rss/search?q=site:treasurydirect.gov+OR+site:treasury.gov+auction&hl=en-US&gl=US&ceid=US:en',
        category: 'fixed-income',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== HEDGE FUNDS & SYSTEMATIC ====================

    institutional_investor: {
        name: 'Institutional Investor',
        url: 'https://news.google.com/rss/search?q=site:institutionalinvestor.com+hedge+fund&hl=en-US&gl=US&ceid=US:en',
        category: 'systematic',
        priority: 'medium',
        tier: 'slow'
    },
    hedge_fund_news: {
        name: 'Hedge Fund News',
        url: 'https://news.google.com/rss/search?q=renaissance+technologies+OR+citadel+OR+two+sigma+OR+aqr+hedge+fund&hl=en-US&gl=US&ceid=US:en',
        category: 'systematic',
        priority: 'high',
        tier: 'fast'
    },

    // ==================== LOW PRIORITY ====================

    seeking_alpha: {
        name: 'Seeking Alpha',
        url: 'https://seekingalpha.com/market_currents.xml',
        category: 'markets',
        priority: 'low',
        tier: 'slow'
    },
    zerohedge: {
        name: 'ZeroHedge',
        url: 'https://feeds.feedburner.com/zerohedge/feed',
        category: 'markets',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== TIER 1: ALPHA-GENERATING RESEARCH ====================

    arxiv_qfin: {
        name: 'arXiv q-fin',
        url: 'https://rss.arxiv.org/rss/q-fin',
        category: 'academic',
        priority: 'critical',
        tier: 'fast'
    },
    aqr_insights: {
        name: 'AQR Insights',
        url: 'https://www.aqr.com/Insights/Research/feed',
        category: 'factors',
        priority: 'critical',
        tier: 'fast'
    },
    quantpedia: {
        name: 'Quantpedia',
        url: 'https://quantpedia.com/feed/',
        category: 'systematic',
        priority: 'critical',
        tier: 'fast'
    },
    two_sigma: {
        name: 'Two Sigma',
        url: 'https://www.twosigma.com/insights/feed/',
        category: 'systematic',
        priority: 'critical',
        tier: 'fast'
    },
    man_institute: {
        name: 'Man Institute',
        url: 'https://www.man.com/insights/feed',
        category: 'systematic',
        priority: 'critical',
        tier: 'fast'
    },

    // ==================== TIER 2: MARKET-MOVING INTELLIGENCE ====================

    ny_fed_liberty: {
        name: 'NY Fed Liberty Street',
        url: 'https://libertystreeteconomics.newyorkfed.org/feed/',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },
    stlouis_fed: {
        name: 'St. Louis Fed Blog',
        url: 'https://fredblog.stlouisfed.org/feed/',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },
    bis_research: {
        name: 'BIS',
        url: 'https://www.bis.org/doclist/bis_fsi_publs.rss',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },
    imf_blog: {
        name: 'IMF Blog',
        url: 'https://www.imf.org/en/Blogs/rss',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },

    // ==================== TIER 3: PRACTITIONER INSIGHTS ====================

    wilmott: {
        name: 'Wilmott',
        url: 'https://wilmott.com/feed/',
        category: 'academic',
        priority: 'medium',
        tier: 'slow'
    },
    epsilon_theory: {
        name: 'Epsilon Theory',
        url: 'https://www.epsilontheory.com/feed/',
        category: 'macro',
        priority: 'medium',
        tier: 'slow'
    },
    nber_papers: {
        name: 'NBER',
        url: 'https://www.nber.org/rss/new.xml',
        category: 'academic',
        priority: 'medium',
        tier: 'slow'
    },
    macrosynergy: {
        name: 'Macrosynergy',
        url: 'https://macrosynergy.com/feed/',
        category: 'macro',
        priority: 'medium',
        tier: 'slow'
    },
    quantstreet: {
        name: 'QuantStreet Capital',
        url: 'https://quantstreetcapital.com/feed/',
        category: 'systematic',
        priority: 'medium',
        tier: 'slow'
    },
    ibkr_quant: {
        name: 'IBKR Quant',
        url: 'https://www.interactivebrokers.com/campus/ibkr-quant-news/feed/',
        category: 'systematic',
        priority: 'medium',
        tier: 'slow'
    },
    eia_energy: {
        name: 'EIA Energy',
        url: 'https://www.eia.gov/rss/todayinenergy.xml',
        category: 'energy',
        priority: 'medium',
        tier: 'slow'
    },
    calculated_risk: {
        name: 'Calculated Risk',
        url: 'https://www.calculatedriskblog.com/feeds/posts/default',
        category: 'macro',
        priority: 'low',
        tier: 'slow'
    },
    cme_research: {
        name: 'CME Group',
        url: 'https://www.cmegroup.com/rss/',
        category: 'commodities',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== NEW: QUANT BLOG SOURCES ====================

    quantstart: {
        name: 'QuantStart',
        url: 'https://www.quantstart.com/articles/feed/',
        category: 'systematic',
        priority: 'medium',
        tier: 'slow'
    },
    robot_wealth: {
        name: 'Robot Wealth',
        url: 'https://robotwealth.com/feed/',
        category: 'systematic',
        priority: 'medium',
        tier: 'slow'
    },
    flirting_models: {
        name: 'Flirting with Models',
        url: 'https://blog.thinknewfound.com/feed/',
        category: 'factors',
        priority: 'medium',
        tier: 'slow'
    },
    capital_spectator: {
        name: 'Capital Spectator',
        url: 'https://www.capitalspectator.com/feed/',
        category: 'macro',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== NEW: MACRO DATA SOURCES ====================

    atlanta_fed_gdpnow: {
        name: 'Atlanta Fed GDPNow',
        url: 'https://news.google.com/rss/search?q=site:atlantafed.org+GDPNow&hl=en-US&gl=US&ceid=US:en',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },
    bls_news: {
        name: 'BLS News',
        url: 'https://news.google.com/rss/search?q=site:bls.gov+employment+OR+CPI+OR+PPI&hl=en-US&gl=US&ceid=US:en',
        category: 'macro',
        priority: 'high',
        tier: 'fast'
    },
    bea_news: {
        name: 'BEA News',
        url: 'https://news.google.com/rss/search?q=site:bea.gov+GDP+OR+income&hl=en-US&gl=US&ceid=US:en',
        category: 'macro',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== NEW: ACADEMIC SOURCES ====================

    ssrn_fen: {
        name: 'SSRN FEN',
        url: 'https://news.google.com/rss/search?q=site:ssrn.com+financial+economics&hl=en-US&gl=US&ceid=US:en',
        category: 'academic',
        priority: 'medium',
        tier: 'slow'
    },
    liberty_street: {
        name: 'Liberty Street Economics',
        url: 'https://libertystreeteconomics.newyorkfed.org/feed/',
        category: 'academic',
        priority: 'high',
        tier: 'fast'
    },

    // ==================== NEW CATEGORY: ALT DATA & SENTIMENT ====================

    google_alt_data: {
        name: 'Alt Data News',
        url: 'https://news.google.com/rss/search?q=alternative+data+hedge+fund+OR+satellite+data+OR+sentiment+analysis+finance&hl=en-US&gl=US&ceid=US:en',
        category: 'alt-data',
        priority: 'medium',
        tier: 'slow'
    },
    nasdaq_data_link: {
        name: 'Nasdaq Data Link',
        url: 'https://news.google.com/rss/search?q=site:data.nasdaq.com+OR+%22nasdaq+data+link%22+alternative+data&hl=en-US&gl=US&ceid=US:en',
        category: 'alt-data',
        priority: 'medium',
        tier: 'slow'
    },
    gdelt_news: {
        name: 'GDELT Project',
        url: 'https://news.google.com/rss/search?q=GDELT+project+geopolitical+data&hl=en-US&gl=US&ceid=US:en',
        category: 'alt-data',
        priority: 'low',
        tier: 'slow'
    },
    estimize_news: {
        name: 'Estimize',
        url: 'https://news.google.com/rss/search?q=estimize+earnings+estimates+crowdsource&hl=en-US&gl=US&ceid=US:en',
        category: 'alt-data',
        priority: 'low',
        tier: 'slow'
    },
    sec_insider: {
        name: 'SEC Insider Filings',
        url: 'https://news.google.com/rss/search?q=SEC+insider+filing+form+4+OR+13F&hl=en-US&gl=US&ceid=US:en',
        category: 'alt-data',
        priority: 'medium',
        tier: 'slow'
    },

    // ==================== NEW CATEGORY: MICROSTRUCTURE & LIQUIDITY ====================

    ny_fed_markets: {
        name: 'NY Fed Markets',
        url: 'https://news.google.com/rss/search?q=site:newyorkfed.org+markets+OR+liquidity+OR+repo&hl=en-US&gl=US&ceid=US:en',
        category: 'microstructure',
        priority: 'high',
        tier: 'fast'
    },
    ofr_blog: {
        name: 'OFR Financial Stress',
        url: 'https://news.google.com/rss/search?q=site:financialresearch.gov+OR+%22Office+of+Financial+Research%22+stress&hl=en-US&gl=US&ceid=US:en',
        category: 'microstructure',
        priority: 'medium',
        tier: 'slow'
    },
    chicago_fed: {
        name: 'Chicago Fed NFCI',
        url: 'https://news.google.com/rss/search?q=site:chicagofed.org+financial+conditions&hl=en-US&gl=US&ceid=US:en',
        category: 'microstructure',
        priority: 'medium',
        tier: 'slow'
    },
    fia_news: {
        name: 'FIA',
        url: 'https://news.google.com/rss/search?q=site:fia.org+futures+OR+derivatives+OR+clearing&hl=en-US&gl=US&ceid=US:en',
        category: 'microstructure',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== NEW CATEGORY: POSITIONING & FLOWS ====================

    aaii_sentiment: {
        name: 'AAII Sentiment',
        url: 'https://news.google.com/rss/search?q=AAII+sentiment+survey+bullish+bearish&hl=en-US&gl=US&ceid=US:en',
        category: 'positioning',
        priority: 'medium',
        tier: 'slow'
    },
    ici_fund_flows: {
        name: 'ICI Fund Flows',
        url: 'https://news.google.com/rss/search?q=ICI+fund+flows+OR+mutual+fund+flows+OR+ETF+flows&hl=en-US&gl=US&ceid=US:en',
        category: 'positioning',
        priority: 'medium',
        tier: 'slow'
    },
    cftc_news: {
        name: 'CFTC News',
        url: 'https://news.google.com/rss/search?q=CFTC+commitment+traders+OR+speculative+positioning&hl=en-US&gl=US&ceid=US:en',
        category: 'positioning',
        priority: 'medium',
        tier: 'slow'
    },
    etf_com: {
        name: 'ETF.com',
        url: 'https://news.google.com/rss/search?q=site:etf.com+flows+OR+positioning+OR+allocation&hl=en-US&gl=US&ceid=US:en',
        category: 'positioning',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== NEW CATEGORY: CRYPTO & DIGITAL ASSETS ====================

    coindesk: {
        name: 'CoinDesk',
        url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
        category: 'crypto',
        priority: 'medium',
        tier: 'slow'
    },
    cointelegraph: {
        name: 'CoinTelegraph',
        url: 'https://cointelegraph.com/rss',
        category: 'crypto',
        priority: 'medium',
        tier: 'slow'
    },
    blockworks: {
        name: 'Blockworks',
        url: 'https://blockworks.co/feed',
        category: 'crypto',
        priority: 'medium',
        tier: 'slow'
    },
    the_block: {
        name: 'The Block',
        url: 'https://news.google.com/rss/search?q=site:theblock.co+crypto+OR+bitcoin+OR+ethereum&hl=en-US&gl=US&ceid=US:en',
        category: 'crypto',
        priority: 'medium',
        tier: 'slow'
    },
    glassnode: {
        name: 'Glassnode Insights',
        url: 'https://news.google.com/rss/search?q=site:insights.glassnode.com+bitcoin+OR+ethereum+on-chain&hl=en-US&gl=US&ceid=US:en',
        category: 'crypto',
        priority: 'low',
        tier: 'slow'
    },
    deribit_insights: {
        name: 'Deribit Insights',
        url: 'https://news.google.com/rss/search?q=site:insights.deribit.com+OR+deribit+options+crypto&hl=en-US&gl=US&ceid=US:en',
        category: 'crypto',
        priority: 'low',
        tier: 'slow'
    },

    // ==================== NEW CATEGORY: ML/AI & QUANT RESEARCH ====================

    arxiv_cs_lg: {
        name: 'arXiv cs.LG',
        url: 'https://rss.arxiv.org/rss/cs.LG',
        category: 'ml-quant',
        priority: 'medium',
        tier: 'slow'
    },
    arxiv_stat_ml: {
        name: 'arXiv stat.ML',
        url: 'https://rss.arxiv.org/rss/stat.ML',
        category: 'ml-quant',
        priority: 'medium',
        tier: 'slow'
    },
    openai_blog: {
        name: 'OpenAI Blog',
        url: 'https://news.google.com/rss/search?q=site:openai.com+research+OR+blog&hl=en-US&gl=US&ceid=US:en',
        category: 'ml-quant',
        priority: 'low',
        tier: 'slow'
    },
    deepmind_blog: {
        name: 'DeepMind Blog',
        url: 'https://news.google.com/rss/search?q=site:deepmind.google+research+OR+blog&hl=en-US&gl=US&ceid=US:en',
        category: 'ml-quant',
        priority: 'low',
        tier: 'slow'
    },
    towards_data_science: {
        name: 'Towards Data Science',
        url: 'https://news.google.com/rss/search?q=site:towardsdatascience.com+machine+learning+finance+OR+trading&hl=en-US&gl=US&ceid=US:en',
        category: 'ml-quant',
        priority: 'low',
        tier: 'slow'
    }
};

// =====================================================
// Category Definitions (keyword-based classification)
// =====================================================

const CATEGORY_CONFIG = {
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
        'overnight rate', 'fed funds', 'discount rate', 'repo',
        'rba', 'bank of canada', 'boc', 'rbnz', 'riksbank', 'snb'
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
    ],
    'alt-data': [
        'alternative data', 'satellite imagery', 'web scraping', 'sentiment score',
        'social media sentiment', 'google trends', 'credit card data', 'foot traffic',
        'app usage', 'geolocation', 'nlp sentiment', 'earnings estimate',
        'insider filing', 'form 4', '13f', 'sec filing', 'crowdsourced',
        'nowcasting', 'real-time data', 'unstructured data'
    ],
    'microstructure': [
        'market microstructure', 'order book', 'bid-ask spread', 'liquidity',
        'market depth', 'dark pool', 'price impact', 'information asymmetry',
        'high frequency', 'latency', 'colocation', 'maker-taker',
        'financial conditions', 'stress index', 'repo rate', 'libor',
        'sofr', 'clearing', 'margin call', 'collateral'
    ],
    'positioning': [
        'cot report', 'commitment of traders', 'speculative positioning',
        'fund flows', 'etf flows', 'mutual fund', 'aaii', 'investor sentiment',
        'put call ratio', 'options flow', 'gamma exposure', 'dealer positioning',
        'cta', 'risk parity allocation', 'margin debt', 'short interest',
        'crowded trade', 'pain trade'
    ],
    'crypto': [
        'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain',
        'defi', 'nft', 'stablecoin', 'binance', 'coinbase',
        'mining', 'halving', 'on-chain', 'whale', 'mempool',
        'layer 2', 'rollup', 'solana', 'altcoin', 'digital asset',
        'crypto regulation', 'spot etf', 'bitcoin etf'
    ],
    'ml-quant': [
        'machine learning trading', 'deep learning finance', 'reinforcement learning',
        'neural network', 'transformer', 'gpt', 'llm', 'large language model',
        'nlp finance', 'text mining', 'feature engineering', 'gradient boosting',
        'random forest', 'xgboost', 'lightgbm', 'automl', 'hyperparameter',
        'cross-validation', 'overfitting', 'regularization',
        'ai trading', 'artificial intelligence finance'
    ]
};

// =====================================================
// Sub-Filter Definitions
// =====================================================

const SUB_FILTER_CONFIG = {
    'volatility': [
        { id: 'options-flow', label: 'Options Flow', keywords: ['options', 'puts', 'calls', 'flow', 'gamma', 'open interest'] },
        { id: 'vix', label: 'VIX', keywords: ['vix', 'vvix', 'volatility index'] },
        { id: 'term-structure', label: 'Term Structure', keywords: ['term structure', 'contango', 'backwardation', 'futures curve'] },
        { id: 'skew', label: 'Skew', keywords: ['skew', 'smile', 'risk reversal', 'put skew'] }
    ],
    'central-banks': [
        { id: 'fed', label: 'Fed', keywords: ['federal reserve', 'fed', 'fomc', 'powell', 'fed funds'] },
        { id: 'ecb', label: 'ECB', keywords: ['ecb', 'lagarde', 'eurozone', 'euro area'] },
        { id: 'boj', label: 'BOJ', keywords: ['bank of japan', 'boj', 'yen', 'yield curve control'] },
        { id: 'other-cb', label: 'Other CBs', keywords: ['boe', 'rba', 'boc', 'rbnz', 'snb', 'riksbank'] }
    ],
    'macro': [
        { id: 'employment', label: 'Employment', keywords: ['nonfarm', 'payroll', 'unemployment', 'jobs', 'labor', 'employment'] },
        { id: 'inflation', label: 'Inflation', keywords: ['cpi', 'pce', 'inflation', 'prices', 'deflation'] },
        { id: 'growth', label: 'Growth', keywords: ['gdp', 'growth', 'recession', 'expansion', 'pmi', 'ism'] },
        { id: 'housing', label: 'Housing', keywords: ['housing', 'home sales', 'mortgage', 'construction'] }
    ],
    'crypto': [
        { id: 'bitcoin', label: 'Bitcoin', keywords: ['bitcoin', 'btc', 'halving', 'bitcoin etf'] },
        { id: 'ethereum', label: 'Ethereum', keywords: ['ethereum', 'eth', 'layer 2', 'rollup'] },
        { id: 'defi', label: 'DeFi', keywords: ['defi', 'decentralized', 'yield farming', 'liquidity pool'] },
        { id: 'regulation', label: 'Regulation', keywords: ['regulation', 'sec', 'compliance', 'crypto law'] }
    ],
    'ml-quant': [
        { id: 'deep-learning', label: 'Deep Learning', keywords: ['deep learning', 'neural network', 'transformer', 'attention'] },
        { id: 'nlp', label: 'NLP', keywords: ['nlp', 'text mining', 'sentiment', 'language model', 'llm', 'gpt'] },
        { id: 'rl', label: 'Reinforcement', keywords: ['reinforcement learning', 'rl', 'policy gradient', 'reward'] },
        { id: 'tabular', label: 'Tabular ML', keywords: ['xgboost', 'lightgbm', 'random forest', 'gradient boosting', 'feature'] }
    ],
    'fixed-income': [
        { id: 'treasuries', label: 'Treasuries', keywords: ['treasury', 'T-note', 'T-bond', 'auction', 'tips'] },
        { id: 'credit', label: 'Credit', keywords: ['credit spread', 'high yield', 'investment grade', 'corporate bond', 'cds'] },
        { id: 'curve', label: 'Yield Curve', keywords: ['yield curve', 'inverted', 'steepening', 'flattening', '2s10s'] }
    ],
    'commodities': [
        { id: 'metals', label: 'Metals', keywords: ['gold', 'silver', 'copper', 'platinum', 'palladium', 'iron ore'] },
        { id: 'energy-comm', label: 'Energy', keywords: ['oil', 'crude', 'wti', 'brent', 'natural gas'] },
        { id: 'fx', label: 'FX', keywords: ['forex', 'currency', 'dollar', 'euro', 'yen', 'dxy'] },
        { id: 'agriculture', label: 'Agriculture', keywords: ['wheat', 'corn', 'soybeans', 'agriculture', 'crop'] }
    ]
};

// =====================================================
// Per-Source Error Tracking
// =====================================================

const SOURCE_ERROR_TRACKER = {};

/**
 * Record a fetch failure for a source
 * @param {string} sourceKey
 */
function recordSourceError(sourceKey) {
    if (!SOURCE_ERROR_TRACKER[sourceKey]) {
        SOURCE_ERROR_TRACKER[sourceKey] = { count: 0, backoffUntil: 0 };
    }
    const tracker = SOURCE_ERROR_TRACKER[sourceKey];
    tracker.count++;
    if (tracker.count >= 3) {
        // Backoff for 1 hour after 3 consecutive failures
        tracker.backoffUntil = Date.now() + (60 * 60 * 1000);
        console.warn(`[Sources] ${sourceKey}: 3 failures, backing off for 1 hour`);
    }
}

/**
 * Record a successful fetch for a source
 * @param {string} sourceKey
 */
function recordSourceSuccess(sourceKey) {
    if (SOURCE_ERROR_TRACKER[sourceKey]) {
        SOURCE_ERROR_TRACKER[sourceKey].count = 0;
        SOURCE_ERROR_TRACKER[sourceKey].backoffUntil = 0;
    }
}

/**
 * Check if a source is in backoff state
 * @param {string} sourceKey
 * @returns {boolean}
 */
function isSourceInBackoff(sourceKey) {
    const tracker = SOURCE_ERROR_TRACKER[sourceKey];
    if (!tracker) return false;
    if (tracker.backoffUntil > Date.now()) return true;
    // Backoff expired, reset
    if (tracker.backoffUntil > 0 && tracker.backoffUntil <= Date.now()) {
        tracker.count = 0;
        tracker.backoffUntil = 0;
    }
    return false;
}

// =====================================================
// Fallback CORS Proxy
// =====================================================

const CORS_FALLBACK_PROXY = 'https://api.allorigins.win/raw?url=';
