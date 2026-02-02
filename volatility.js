/**
 * Volatility Surface & Term Structure Module
 * Tracks VIX term structure, put/call skew, and implied volatility metrics
 */

// =====================================================
// VIX Term Structure
// =====================================================

const VOLATILITY_CONFIG = {
    // VIX Futures symbols
    VIX_FUTURES: [
        { symbol: '^VIX', label: 'VIX Spot', months: 0 },
        { symbol: 'VX=F', label: 'VX1 (Front)', months: 1 },
        { symbol: 'VXc2', label: 'VX2', months: 2 },
        { symbol: 'VXc3', label: 'VX3', months: 3 },
        { symbol: '^VIX3M', label: 'VIX3M', months: 3 }
    ],

    // Historical percentiles for VIX
    VIX_PERCENTILES: {
        10: 12.5,
        25: 14.5,
        50: 17.5,
        75: 22.0,
        90: 28.0,
        95: 35.0
    },

    CACHE_KEY: 'qrd_volatility_data',
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
};

// Volatility state
let volState = {
    vixSpot: null,
    vixFutures: [],
    termStructure: 'unknown',
    skewData: null,
    lastUpdate: null
};

/**
 * Fetch VIX term structure data
 */
async function fetchVIXTermStructure() {
    const results = [];

    for (const future of VOLATILITY_CONFIG.VIX_FUTURES) {
        try {
            const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(future.symbol)}?interval=1d&range=5d`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                const result = data.chart?.result?.[0];

                if (result) {
                    const meta = result.meta;
                    const price = meta.regularMarketPrice;
                    const prevClose = meta.chartPreviousClose || meta.previousClose;
                    const change = prevClose ? ((price - prevClose) / prevClose * 100) : 0;

                    results.push({
                        ...future,
                        price: price,
                        change: change,
                        prevClose: prevClose
                    });
                }
            }
        } catch (e) {
            console.warn(`Failed to fetch ${future.symbol}:`, e.message);
        }
    }

    return results;
}

/**
 * Calculate term structure metrics
 */
function calculateTermStructureMetrics(futures) {
    if (futures.length < 2) return null;

    const vixSpot = futures.find(f => f.symbol === '^VIX');
    const vx1 = futures.find(f => f.label.includes('VX1'));
    const vix3m = futures.find(f => f.symbol === '^VIX3M');

    if (!vixSpot) return null;

    const metrics = {
        vixSpot: vixSpot.price,
        vixChange: vixSpot.change,
        termStructure: 'flat',
        contangoBackwardation: 0,
        rollYield: 0,
        vixPercentile: calculateVIXPercentile(vixSpot.price)
    };

    // Calculate contango/backwardation
    if (vx1 && vixSpot) {
        const spread = ((vx1.price - vixSpot.price) / vixSpot.price) * 100;
        metrics.contangoBackwardation = spread;

        if (spread > 2) {
            metrics.termStructure = 'contango';
        } else if (spread < -2) {
            metrics.termStructure = 'backwardation';
        } else {
            metrics.termStructure = 'flat';
        }

        // Annualized roll yield (simplified)
        metrics.rollYield = spread * 12; // Monthly roll approximation
    }

    // VIX-VIX3M spread
    if (vix3m && vixSpot) {
        metrics.vix3mSpread = vix3m.price - vixSpot.price;
        metrics.vix3mRatio = vixSpot.price / vix3m.price;
    }

    return metrics;
}

/**
 * Calculate VIX percentile based on historical data
 */
function calculateVIXPercentile(vix) {
    const percentiles = VOLATILITY_CONFIG.VIX_PERCENTILES;

    if (vix <= percentiles[10]) return 10;
    if (vix <= percentiles[25]) return 25;
    if (vix <= percentiles[50]) return 50;
    if (vix <= percentiles[75]) return 75;
    if (vix <= percentiles[90]) return 90;
    return 95;
}

/**
 * Get volatility regime interpretation
 */
function getVolatilityRegime(vix, termStructure) {
    let regime = {
        level: 'normal',
        description: '',
        tradingImplication: '',
        color: 'var(--accent-yellow)'
    };

    if (vix < 15) {
        regime.level = 'low';
        regime.description = 'Low volatility - Complacency';
        regime.tradingImplication = 'Sell premium strategies favorable, but beware of vol spikes';
        regime.color = 'var(--accent-green)';
    } else if (vix < 20) {
        regime.level = 'normal';
        regime.description = 'Normal volatility';
        regime.tradingImplication = 'Standard market conditions';
        regime.color = 'var(--accent-yellow)';
    } else if (vix < 30) {
        regime.level = 'elevated';
        regime.description = 'Elevated volatility - Uncertainty';
        regime.tradingImplication = 'Consider reducing leverage, hedging positions';
        regime.color = 'var(--accent-orange)';
    } else {
        regime.level = 'extreme';
        regime.description = 'Extreme volatility - Fear';
        regime.tradingImplication = 'Mean reversion opportunity, but high risk';
        regime.color = 'var(--accent-red)';
    }

    // Add term structure context
    if (termStructure === 'backwardation') {
        regime.description += ' (Backwardation = Near-term fear)';
    } else if (termStructure === 'contango') {
        regime.description += ' (Contango = Normal carry)';
    }

    return regime;
}

/**
 * Render enhanced volatility widget
 */
function renderEnhancedVolatilityWidget(containerId, futures, metrics) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!metrics) {
        container.innerHTML = `
            <div class="vol-loading">
                <p>Loading volatility data...</p>
            </div>
        `;
        return;
    }

    const regime = getVolatilityRegime(metrics.vixSpot, metrics.termStructure);
    const vixPercent = Math.min(100, (metrics.vixSpot / 50) * 100);

    container.innerHTML = `
        <div class="vol-header">
            <div class="vol-main">
                <span class="vol-label">VIX Index</span>
                <span class="vol-value" style="color: ${regime.color}">${metrics.vixSpot.toFixed(2)}</span>
            </div>
            <div class="vol-change ${metrics.vixChange >= 0 ? 'positive' : 'negative'}">
                ${metrics.vixChange >= 0 ? '+' : ''}${metrics.vixChange.toFixed(2)}%
            </div>
        </div>

        <div class="vol-bar">
            <div class="vol-bar-fill" style="width: ${vixPercent}%; background: ${regime.color}"></div>
            <div class="vol-bar-markers">
                <span class="marker" style="left: 30%">15</span>
                <span class="marker" style="left: 50%">25</span>
                <span class="marker" style="left: 70%">35</span>
            </div>
        </div>

        <div class="vol-percentile">
            <span>Historical Percentile:</span>
            <strong>${metrics.vixPercentile}th</strong>
        </div>

        <div class="vol-term-structure">
            <div class="term-header">
                <span>Term Structure</span>
                <span class="term-badge ${metrics.termStructure}">${metrics.termStructure.toUpperCase()}</span>
            </div>
            <div class="term-chart" id="termStructureChart">
                ${renderTermStructureChart(futures)}
            </div>
            <div class="term-metrics">
                <div class="term-metric">
                    <span class="metric-label">VIX-VX1 Spread</span>
                    <span class="metric-value ${metrics.contangoBackwardation >= 0 ? 'positive' : 'negative'}">
                        ${metrics.contangoBackwardation >= 0 ? '+' : ''}${metrics.contangoBackwardation.toFixed(2)}%
                    </span>
                </div>
                ${metrics.vix3mSpread !== undefined ? `
                <div class="term-metric">
                    <span class="metric-label">VIX/VIX3M Ratio</span>
                    <span class="metric-value">${metrics.vix3mRatio.toFixed(3)}</span>
                </div>
                ` : ''}
                <div class="term-metric">
                    <span class="metric-label">Est. Roll Yield (Ann.)</span>
                    <span class="metric-value ${metrics.rollYield >= 0 ? 'negative' : 'positive'}">
                        ${metrics.rollYield >= 0 ? '-' : '+'}${Math.abs(metrics.rollYield).toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>

        <div class="vol-regime">
            <div class="regime-badge" style="background: ${regime.color}20; border-color: ${regime.color}; color: ${regime.color}">
                ${regime.description}
            </div>
            <p class="regime-implication">${regime.tradingImplication}</p>
        </div>
    `;
}

/**
 * Render simple ASCII term structure chart
 */
function renderTermStructureChart(futures) {
    if (!futures || futures.length < 2) return '<div class="no-data">Insufficient data</div>';

    const validFutures = futures.filter(f => f.price);
    if (validFutures.length < 2) return '<div class="no-data">Insufficient data</div>';

    const prices = validFutures.map(f => f.price);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const range = maxPrice - minPrice;

    return `
        <div class="term-chart-container">
            <div class="term-chart-y-axis">
                <span>${maxPrice.toFixed(1)}</span>
                <span>${((maxPrice + minPrice) / 2).toFixed(1)}</span>
                <span>${minPrice.toFixed(1)}</span>
            </div>
            <div class="term-chart-bars">
                ${validFutures.map((f, i) => {
                    const height = ((f.price - minPrice) / range) * 100;
                    const isSpot = f.symbol === '^VIX';
                    return `
                        <div class="term-bar-container">
                            <div class="term-bar ${isSpot ? 'spot' : ''}" style="height: ${height}%">
                                <span class="term-bar-value">${f.price.toFixed(1)}</span>
                            </div>
                            <span class="term-bar-label">${f.label.replace('(Front)', '').trim()}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

/**
 * Initialize volatility tracking
 */
async function initVolatilityTracking() {
    try {
        const futures = await fetchVIXTermStructure();
        const metrics = calculateTermStructureMetrics(futures);

        volState.vixFutures = futures;
        volState.metrics = metrics;
        volState.lastUpdate = new Date();

        // Store in cache
        saveToStorage(VOLATILITY_CONFIG.CACHE_KEY, {
            futures,
            metrics,
            timestamp: Date.now()
        });

        // Render widget
        renderEnhancedVolatilityWidget('volatilityWidget', futures, metrics);

        return { futures, metrics };
    } catch (error) {
        console.error('Failed to initialize volatility tracking:', error);
        return null;
    }
}

// Export functions
window.initVolatilityTracking = initVolatilityTracking;
window.fetchVIXTermStructure = fetchVIXTermStructure;
window.renderEnhancedVolatilityWidget = renderEnhancedVolatilityWidget;
