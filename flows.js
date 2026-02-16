/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * Flows & Positioning Dashboard for QRD
 * Aggregates COT positioning, options sentiment, and fund flow indicators
 */

// ============================================================
// Configuration
// ============================================================

const FLOWS_CONFIG = {
    COT_CACHE_KEY: 'qrd_cot_cache',
    FLOWS_CACHE_KEY: 'qrd_flows_cache',
    CACHE_TTL: 24 * 60 * 60 * 1000,
    EXTREME_ZSCORE: 2.0,
    contracts: {
        'ES': { name: 'S&P 500', category: 'equity' },
        'TY': { name: '10Y T-Note', category: 'fixed-income' },
        'GC': { name: 'Gold', category: 'commodity' },
        'CL': { name: 'Crude Oil', category: 'commodity' },
        'NG': { name: 'Nat Gas', category: 'energy' },
        'EC': { name: 'Euro FX', category: 'fx' },
        'JY': { name: 'Yen', category: 'fx' },
        'DX': { name: 'Dollar Index', category: 'fx' }
    }
};

// ============================================================
// Module State
// ============================================================

let flowsState = {
    cotData: {},
    optionsSentiment: {},
    extremes: [],
    isLoading: false,
    lastUpdated: null,
    timeframe: 52,
    categoryFilter: 'all'
};

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    initFlowsDashboard();
});

function initFlowsDashboard() {
    bindFlowsControls();
    loadCOTData();
    flowsState.optionsSentiment = generateOptionsSentiment();
    flowsState.lastUpdated = new Date();
    renderFlowsDashboard();
}

function bindFlowsControls() {
    const timeframeSel = document.getElementById('flowsTimeframe');
    const categorySel = document.getElementById('flowsCategory');

    if (timeframeSel) {
        timeframeSel.addEventListener('change', function () {
            flowsState.timeframe = parseInt(this.value, 10);
            flowsState.extremes = findExtremes();
            renderFlowsDashboard();
        });
    }

    if (categorySel) {
        categorySel.addEventListener('change', function () {
            flowsState.categoryFilter = this.value;
            renderFlowsDashboard();
        });
    }
}

// ============================================================
// Data Loading
// ============================================================

function loadCOTData() {
    try {
        const raw = localStorage.getItem(FLOWS_CONFIG.COT_CACHE_KEY);
        if (raw) {
            const cached = JSON.parse(raw);
            const age = Date.now() - cached.timestamp;
            if (age < FLOWS_CONFIG.CACHE_TTL && cached.data) {
                flowsState.cotData = cached.data;
                console.log('[Flows] Loaded COT data from shared cache (' + cached.source + ')');
                flowsState.extremes = findExtremes();
                return;
            }
        }
    } catch (e) {
        console.warn('[Flows] Cache read error:', e);
    }

    console.log('[Flows] No COT cache available, generating simulated data');
    flowsState.cotData = generateSimulatedFlowsData();
    flowsState.extremes = findExtremes();
}

// ============================================================
// Simulated Data Generator
// ============================================================

function generateSimulatedFlowsData() {
    const data = {};
    const weeks = 52;

    const baseParams = {
        'ES': { baseLong: 280000, baseShort: 210000, baseOI: 2800000, drift: 0.02, vol: 0.08, meanRevert: 0.05 },
        'TY': { baseLong: 420000, baseShort: 550000, baseOI: 4200000, drift: -0.01, vol: 0.06, meanRevert: 0.04 },
        'GC': { baseLong: 310000, baseShort: 85000, baseOI: 520000, drift: 0.015, vol: 0.10, meanRevert: 0.03 },
        'CL': { baseLong: 520000, baseShort: 180000, baseOI: 1900000, drift: -0.005, vol: 0.12, meanRevert: 0.04 },
        'NG': { baseLong: 120000, baseShort: 160000, baseOI: 1200000, drift: -0.02, vol: 0.15, meanRevert: 0.06 },
        'EC': { baseLong: 195000, baseShort: 140000, baseOI: 680000, drift: 0.01, vol: 0.09, meanRevert: 0.05 },
        'JY': { baseLong: 55000, baseShort: 150000, baseOI: 260000, drift: -0.015, vol: 0.11, meanRevert: 0.04 },
        'DX': { baseLong: 32000, baseShort: 12000, baseOI: 58000, drift: 0.008, vol: 0.10, meanRevert: 0.05 }
    };

    Object.keys(FLOWS_CONFIG.contracts).forEach(function (symbol) {
        const params = baseParams[symbol];
        const records = [];
        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() - (weeks * 7));

        let currentLong = params.baseLong;
        let currentShort = params.baseShort;
        let currentOI = params.baseOI;

        for (let i = 0; i < weeks; i++) {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + (i * 7));

            var longMR = (params.baseLong - currentLong) * params.meanRevert;
            var shortMR = (params.baseShort - currentShort) * params.meanRevert;
            var longShock = currentLong * params.vol * flowsGaussian() * 0.05;
            var shortShock = currentShort * params.vol * flowsGaussian() * 0.05;
            var longDrift = currentLong * params.drift * 0.02;
            var shortDrift = currentShort * (-params.drift) * 0.02;

            currentLong = Math.max(1000, Math.round(currentLong + longMR + longDrift + longShock));
            currentShort = Math.max(1000, Math.round(currentShort + shortMR + shortDrift + shortShock));
            var totalPositions = currentLong + currentShort;
            currentOI = Math.max(totalPositions * 1.5, Math.round(params.baseOI + params.baseOI * flowsGaussian() * 0.03));

            var net = currentLong - currentShort;
            records.push({
                date: date.toISOString().split('T')[0],
                longAll: currentLong,
                shortAll: currentShort,
                openInterest: currentOI,
                net: net,
                netPctOI: (net / currentOI) * 100
            });
        }

        data[symbol] = records;
    });

    return data;
}

function flowsGaussian() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ============================================================
// Z-Score & Extreme Calculations
// ============================================================

function calculateZScores(records, lookback) {
    if (!records || records.length === 0) return null;

    var sliced = records.slice(-lookback);
    if (sliced.length < 2) return null;

    var current = sliced[sliced.length - 1];
    var previous = sliced.length >= 2 ? sliced[sliced.length - 2] : current;
    var nets = sliced.map(function (r) { return r.net; });
    var mean = nets.reduce(function (s, v) { return s + v; }, 0) / nets.length;
    var variance = nets.reduce(function (s, v) { return s + Math.pow(v - mean, 2); }, 0) / nets.length;
    var stdDev = Math.sqrt(variance);
    var zScore = stdDev > 0 ? (current.net - mean) / stdDev : 0;
    var weeklyChange = current.net - previous.net;

    return {
        currentNet: current.net,
        currentLong: current.longAll,
        currentShort: current.shortAll,
        openInterest: current.openInterest,
        netPctOI: current.netPctOI,
        zScore: zScore,
        mean: mean,
        stdDev: stdDev,
        weeklyChange: weeklyChange,
        isExtreme: Math.abs(zScore) > FLOWS_CONFIG.EXTREME_ZSCORE,
        extremeType: Math.abs(zScore) > FLOWS_CONFIG.EXTREME_ZSCORE ? (zScore > 0 ? 'LONG' : 'SHORT') : null,
        history: sliced
    };
}

function findExtremes() {
    var extremes = [];
    Object.keys(FLOWS_CONFIG.contracts).forEach(function (symbol) {
        var records = flowsState.cotData[symbol];
        if (!records) return;
        var metrics = calculateZScores(records, flowsState.timeframe);
        if (metrics && metrics.isExtreme) {
            extremes.push({ symbol: symbol, zScore: metrics.zScore, type: metrics.extremeType, net: metrics.currentNet });
        }
    });
    extremes.sort(function (a, b) { return Math.abs(b.zScore) - Math.abs(a.zScore); });
    return extremes;
}

// ============================================================
// Options Sentiment Generator
// ============================================================

function generateOptionsSentiment() {
    var indices = [
        { name: 'SPX', label: 'S&P 500' },
        { name: 'NDX', label: 'Nasdaq 100' },
        { name: 'RUT', label: 'Russell 2000' },
        { name: 'VIX', label: 'VIX Options' }
    ];

    var sentiment = {};
    indices.forEach(function (idx) {
        var pcr = 0.6 + Math.random() * 0.8; // PCR between 0.6 and 1.4
        var prevPcr = pcr + (Math.random() - 0.5) * 0.15;
        var regime;
        if (pcr < 0.7) regime = 'bullish';
        else if (pcr <= 1.0) regime = 'neutral';
        else regime = 'bearish';

        sentiment[idx.name] = {
            label: idx.label,
            pcr: pcr,
            prevPcr: prevPcr,
            change: pcr - prevPcr,
            regime: regime,
            callVolume: Math.round(500000 + Math.random() * 1500000),
            putVolume: Math.round(500000 + Math.random() * 1500000)
        };
    });
    return sentiment;
}

// ============================================================
// Fund Flow Proxy Data
// ============================================================

function generateFlowIndicators() {
    var indicators = [
        { label: 'SPY ETF Volume', value: (Math.random() * 120 + 40).toFixed(1) + 'M', change: (Math.random() - 0.4) * 30, unit: 'shares' },
        { label: 'HYG Flows (1W)', value: (Math.random() > 0.5 ? '+' : '-') + '$' + (Math.random() * 2).toFixed(1) + 'B', change: (Math.random() - 0.5) * 100, unit: '' },
        { label: 'TLT Flows (1W)', value: (Math.random() > 0.5 ? '+' : '-') + '$' + (Math.random() * 1.5).toFixed(1) + 'B', change: (Math.random() - 0.5) * 80, unit: '' },
        { label: 'GLD Flows (1W)', value: (Math.random() > 0.5 ? '+' : '-') + '$' + (Math.random() * 0.8).toFixed(1) + 'B', change: (Math.random() - 0.5) * 60, unit: '' },
        { label: 'VIX Term Slope', value: (0.85 + Math.random() * 0.3).toFixed(2), change: (Math.random() - 0.5) * 10, unit: 'ratio' },
        { label: 'EM Equity Flows', value: (Math.random() > 0.5 ? '+' : '-') + '$' + (Math.random() * 3).toFixed(1) + 'B', change: (Math.random() - 0.5) * 50, unit: '' },
        { label: 'Corp Bond Spread', value: (80 + Math.random() * 120).toFixed(0) + 'bp', change: (Math.random() - 0.5) * 20, unit: 'bps' },
        { label: 'AAII Bull/Bear', value: (35 + Math.random() * 20).toFixed(1) + '%', change: (Math.random() - 0.5) * 10, unit: 'bull%' }
    ];
    return indicators;
}

// ============================================================
// Rendering Orchestrator
// ============================================================

function renderFlowsDashboard() {
    renderExtremeAlertBanner();
    renderCOTPositioning('cotPositioning');
    renderOptionsGauge('optionsSentiment');
    renderFlowIndicators('fundFlows');
}

// ============================================================
// Extreme Alert Banner
// ============================================================

function renderExtremeAlertBanner() {
    var container = document.getElementById('extremeAlerts');
    if (!container) return;

    if (flowsState.extremes.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    var html = '<span style="font-weight:600;color:var(--accent-red);white-space:nowrap;">Extreme Positioning:</span>';
    flowsState.extremes.forEach(function (ex) {
        html += renderExtremeAlert(ex.symbol, ex.zScore);
    });
    container.innerHTML = html;
}

function renderExtremeAlert(contract, zscore) {
    var isLong = zscore > 0;
    var color = isLong ? 'var(--accent-green)' : 'var(--accent-red)';
    var arrow = isLong ? '&#9650;' : '&#9660;';
    return '<span class="extreme-item">' +
        '<span style="color:' + color + ';">' + arrow + '</span>' +
        '<strong>' + contract + '</strong> ' +
        '<span style="font-family:var(--font-mono);color:' + color + ';">' +
        (zscore > 0 ? '+' : '') + zscore.toFixed(2) + '&sigma;' +
        '</span></span>';
}

// ============================================================
// COT Positioning - Horizontal Bar Chart
// ============================================================

function renderCOTPositioning(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var symbols = Object.keys(FLOWS_CONFIG.contracts);
    var filtered = symbols;

    if (flowsState.categoryFilter !== 'all') {
        filtered = symbols.filter(function (s) {
            return FLOWS_CONFIG.contracts[s].category === flowsState.categoryFilter;
        });
    }

    var html = '';
    filtered.forEach(function (symbol) {
        var info = FLOWS_CONFIG.contracts[symbol];
        var records = flowsState.cotData[symbol];
        if (!records) return;

        var metrics = calculateZScores(records, flowsState.timeframe);
        if (!metrics) return;

        var isLong = metrics.currentNet > 0;
        var barClass = isLong ? 'long' : 'short';
        var extremeClass = metrics.isExtreme ? ' cot-bar-extreme' : '';

        // Bar width: normalize net position to percentage from center
        // Max net across all contracts for normalization
        var maxNet = 1;
        symbols.forEach(function (s) {
            var r = flowsState.cotData[s];
            if (r) {
                var m = calculateZScores(r, flowsState.timeframe);
                if (m) maxNet = Math.max(maxNet, Math.abs(m.currentNet));
            }
        });

        var pct = (Math.abs(metrics.currentNet) / maxNet) * 50;
        var barStyle, fillStyle;
        if (isLong) {
            barStyle = 'left:50%;';
            fillStyle = 'width:' + pct + '%;';
        } else {
            barStyle = 'right:50%;direction:rtl;';
            fillStyle = 'width:' + pct + '%;';
        }

        var zBadge = '';
        if (metrics.isExtreme) {
            zBadge = '<span class="cot-zscore extreme">' +
                (metrics.zScore > 0 ? '+' : '') + metrics.zScore.toFixed(2) + '&sigma;</span>';
        } else {
            zBadge = '<span class="cot-zscore">' +
                (metrics.zScore > 0 ? '+' : '') + metrics.zScore.toFixed(2) + '&sigma;</span>';
        }

        html += '<div class="cot-bar-container">' +
            '<div class="cot-bar-label">' +
            '<span class="cot-bar-name">' + symbol + ' <span style="color:var(--text-secondary);font-weight:400;">' + info.name + '</span></span>' +
            '<span class="cot-bar-value" style="color:' + (isLong ? 'var(--accent-green)' : 'var(--accent-red)') + ';">' +
            flowsFormatNumber(metrics.currentNet) + ' ' + zBadge + '</span>' +
            '</div>' +
            '<div class="cot-bar' + extremeClass + '">' +
            '<div class="cot-bar-center"></div>' +
            '<div class="cot-bar-fill ' + barClass + '" style="position:absolute;' + barStyle + fillStyle + '"></div>' +
            '</div>' +
            '</div>';
    });

    container.innerHTML = html;
}

// ============================================================
// Options Sentiment Gauge (SVG semicircle)
// ============================================================

function renderOptionsGauge(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var html = '<div class="options-gauge-container">';

    Object.keys(flowsState.optionsSentiment).forEach(function (key) {
        var s = flowsState.optionsSentiment[key];
        html += buildGaugeSVG(s);
    });

    html += '</div>';
    container.innerHTML = html;
}

function buildGaugeSVG(sentiment) {
    var pcr = sentiment.pcr;
    // Map PCR (0.4 - 1.6) to angle (180 deg arc, left = bullish, right = bearish)
    var normalized = Math.max(0, Math.min(1, (pcr - 0.4) / 1.2));
    var angle = normalized * 180; // 0 = far left (bullish), 180 = far right (bearish)
    var radian = (Math.PI - angle * Math.PI / 180);
    var cx = 80, cy = 70, radius = 55;
    var needleX = cx + radius * 0.85 * Math.cos(radian);
    var needleY = cy - radius * 0.85 * Math.sin(radian);

    var regimeColor;
    if (sentiment.regime === 'bullish') regimeColor = 'var(--accent-green)';
    else if (sentiment.regime === 'bearish') regimeColor = 'var(--accent-red)';
    else regimeColor = 'var(--accent-yellow)';

    var changeArrow = sentiment.change > 0 ? '&#9650;' : sentiment.change < 0 ? '&#9660;' : '&#8212;';
    var changeColor = sentiment.change > 0 ? 'var(--accent-red)' : sentiment.change < 0 ? 'var(--accent-green)' : 'var(--text-muted)';

    return '<div style="text-align:center;min-width:160px;">' +
        '<svg width="160" height="100" viewBox="0 0 160 100">' +
        // Background arc segments: green, yellow, red
        '<path d="M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx - radius * Math.cos(Math.PI / 3)) + ' ' + (cy - radius * Math.sin(Math.PI / 3)) + '" fill="none" stroke="rgba(63,185,80,0.3)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M ' + (cx - radius * Math.cos(Math.PI / 3)) + ' ' + (cy - radius * Math.sin(Math.PI / 3)) + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx + radius * Math.cos(Math.PI / 3)) + ' ' + (cy - radius * Math.sin(Math.PI / 3)) + '" fill="none" stroke="rgba(210,153,34,0.3)" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M ' + (cx + radius * Math.cos(Math.PI / 3)) + ' ' + (cy - radius * Math.sin(Math.PI / 3)) + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx + radius) + ' ' + cy + '" fill="none" stroke="rgba(248,81,73,0.3)" stroke-width="10" stroke-linecap="round"/>' +
        // Needle
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + needleX.toFixed(1) + '" y2="' + needleY.toFixed(1) + '" stroke="' + regimeColor + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + regimeColor + '"/>' +
        // PCR value
        '<text x="' + cx + '" y="' + (cy - 10) + '" text-anchor="middle" fill="var(--text-primary)" font-size="16" font-weight="700" font-family="JetBrains Mono, monospace">' + pcr.toFixed(2) + '</text>' +
        // Labels
        '<text x="' + (cx - radius + 5) + '" y="' + (cy + 14) + '" text-anchor="start" fill="var(--text-muted)" font-size="8" font-family="Inter, sans-serif">Bull</text>' +
        '<text x="' + (cx + radius - 5) + '" y="' + (cy + 14) + '" text-anchor="end" fill="var(--text-muted)" font-size="8" font-family="Inter, sans-serif">Bear</text>' +
        '</svg>' +
        '<div style="font-size:0.8125rem;font-weight:600;margin-top:-4px;">' + sentiment.label + '</div>' +
        '<div style="font-size:0.6875rem;color:var(--text-secondary);">P/C Ratio: <span style="color:' + regimeColor + ';font-weight:600;text-transform:uppercase;">' + sentiment.regime + '</span></div>' +
        '<div style="font-size:0.6875rem;color:' + changeColor + ';">' + changeArrow + ' ' + (sentiment.change > 0 ? '+' : '') + sentiment.change.toFixed(3) + '</div>' +
        '</div>';
}

// ============================================================
// Fund Flow Indicators Grid
// ============================================================

function renderFlowIndicators(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return;

    var indicators = generateFlowIndicators();
    var html = '<div class="flow-grid">';

    indicators.forEach(function (ind) {
        var changeColor = ind.change > 0 ? 'var(--accent-green)' : ind.change < 0 ? 'var(--accent-red)' : 'var(--text-muted)';
        var changeArrow = ind.change > 0 ? '&#9650;' : ind.change < 0 ? '&#9660;' : '&#8212;';

        html += '<div class="flow-card">' +
            '<div class="flow-card-label">' + ind.label + '</div>' +
            '<div class="flow-card-value">' + ind.value + '</div>' +
            '<div class="flow-card-change" style="color:' + changeColor + ';">' +
            changeArrow + ' ' + Math.abs(ind.change).toFixed(1) + '%' +
            '</div></div>';
    });

    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// Top Extremes Sidebar Widget
// ============================================================

function renderTopExtremes() {
    var widget = document.getElementById('positioningWidget');
    if (!widget) return;

    // Ensure data is loaded
    if (Object.keys(flowsState.cotData).length === 0) {
        loadCOTData();
    }

    var extremes = flowsState.extremes.slice(0, 3);

    if (extremes.length === 0) {
        widget.innerHTML = '<div style="text-align:center;padding:12px;color:var(--text-muted);font-size:0.8125rem;">No extreme positions detected</div>';
        return;
    }

    var html = '';
    extremes.forEach(function (ex) {
        var isLong = ex.zScore > 0;
        var color = isLong ? 'var(--accent-green)' : 'var(--accent-red)';
        var arrow = isLong ? '&#9650;' : '&#9660;';
        var direction = isLong ? 'LONG' : 'SHORT';

        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">' +
            '<div>' +
            '<span style="font-weight:600;font-family:var(--font-mono);font-size:0.875rem;">' + ex.symbol + '</span>' +
            '<span style="color:var(--text-muted);font-size:0.75rem;margin-left:6px;">' + FLOWS_CONFIG.contracts[ex.symbol].name + '</span>' +
            '</div>' +
            '<div style="text-align:right;">' +
            '<span style="color:' + color + ';font-weight:700;font-family:var(--font-mono);font-size:0.8125rem;">' +
            arrow + ' ' + direction +
            '</span>' +
            '<div style="font-size:0.6875rem;font-family:var(--font-mono);color:' + color + ';">' +
            (ex.zScore > 0 ? '+' : '') + ex.zScore.toFixed(2) + '&sigma;' +
            '</div></div></div>';
    });

    widget.innerHTML = html;
}

// ============================================================
// Utility Functions
// ============================================================

function flowsFormatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return num.toLocaleString('en-US');
}

// ============================================================
// Export Globals
// ============================================================

window.initFlowsDashboard = initFlowsDashboard;
window.renderTopExtremes = renderTopExtremes;
