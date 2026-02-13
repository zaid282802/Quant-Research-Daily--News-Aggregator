/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * CFTC Commitment of Traders (COT) Positioning Dashboard for QRD
 * Fetches COT data from CFTC Socrata API, computes net speculative positioning,
 * z-scores, and extreme alerts. Falls back to realistic simulated data on CORS failure.
 *
 * Phase 3 of QRD Upgrade - CFTC COT Dashboard
 */

// ============================================================
// Configuration
// ============================================================

const COT_API = "https://publicreporting.cftc.gov/resource/6dca-aqww.json";

const COT_CONTRACTS = {
    "ES": { name: "E-Mini S&P 500", code: "13874A", category: "equity", priceSymbol: "^GSPC" },
    "TY": { name: "10-Year T-Note", code: "043602", category: "fixed-income", priceSymbol: "^TNX" },
    "GC": { name: "Gold", code: "088691", category: "commodity", priceSymbol: "GC=F" },
    "CL": { name: "Crude Oil WTI", code: "067651", category: "commodity", priceSymbol: "CL=F" },
    "NG": { name: "Natural Gas", code: "023651", category: "energy", priceSymbol: "NG=F" },
    "EC": { name: "Euro FX", code: "099741", category: "fx", priceSymbol: "EURUSD=X" },
    "JY": { name: "Japanese Yen", code: "097741", category: "fx", priceSymbol: "JPYUSD=X" },
    "DX": { name: "US Dollar Index", code: "098662", category: "fx", priceSymbol: "DX-Y.NYB" }
};

const COT_CACHE_KEY = 'qrd_cot_cache';
const COT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================
// Module State
// ============================================================

let cotState = {
    data: {},            // keyed by contract symbol
    timeframe: 52,       // default lookback weeks
    reportType: 'legacy',
    dataSource: 'unknown',
    lastUpdated: null,
    isLoading: false
};

// ============================================================
// Initialization
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    initCOTDashboard();
});

async function initCOTDashboard() {
    bindCOTControls();
    const cached = loadCOTCache();
    if (cached) {
        cotState.data = cached.data;
        cotState.dataSource = cached.source;
        cotState.lastUpdated = new Date(cached.timestamp);
        console.log('[COT] Loaded from localStorage cache');
        renderCOTDashboard();
    } else {
        await fetchAllCOTData();
    }
}

// ============================================================
// Event Binding
// ============================================================

function bindCOTControls() {
    const timeframeSelect = document.getElementById('cotTimeframe');
    const reportTypeSelect = document.getElementById('cotReportType');

    if (timeframeSelect) {
        timeframeSelect.addEventListener('change', function () {
            cotState.timeframe = parseInt(this.value, 10);
            renderCOTDashboard();
        });
    }

    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', function () {
            cotState.reportType = this.value;
            renderCOTDashboard();
        });
    }
}

// ============================================================
// Cache Management
// ============================================================

function loadCOTCache() {
    try {
        const raw = localStorage.getItem(COT_CACHE_KEY);
        if (!raw) return null;
        const cached = JSON.parse(raw);
        const age = Date.now() - cached.timestamp;
        if (age > COT_CACHE_TTL) {
            localStorage.removeItem(COT_CACHE_KEY);
            return null;
        }
        return cached;
    } catch (e) {
        console.warn('[COT] Cache read error:', e);
        return null;
    }
}

function saveCOTCache(data, source) {
    try {
        const payload = {
            data: data,
            source: source,
            timestamp: Date.now()
        };
        localStorage.setItem(COT_CACHE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('[COT] Cache write error:', e);
    }
}

// ============================================================
// Data Fetching
// ============================================================

async function fetchCOTData(contractCode, weeks) {
    const url = `${COT_API}?$where=cftc_contract_market_code='${contractCode}'&$order=report_date_as_yyyy_mm_dd DESC&$limit=${weeks}`;
    const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
        throw new Error(`CFTC API returned ${response.status}`);
    }
    return await response.json();
}

async function fetchAllCOTData() {
    cotState.isLoading = true;
    showCOTLoading();

    const weeks = Math.max(cotState.timeframe, 104);
    const symbols = Object.keys(COT_CONTRACTS);
    let liveSuccess = false;

    try {
        const promises = symbols.map(async (symbol) => {
            const contract = COT_CONTRACTS[symbol];
            const records = await fetchCOTData(contract.code, weeks);
            return { symbol, records };
        });

        const results = await Promise.all(promises);

        results.forEach(({ symbol, records }) => {
            cotState.data[symbol] = parseCOTRecords(records);
        });

        cotState.dataSource = 'live';
        liveSuccess = true;
        console.log('[COT] Live data fetched from CFTC Socrata API');

    } catch (err) {
        console.warn('[COT] CFTC API fetch failed (likely CORS):', err.message);
        console.log('[COT] Falling back to simulated data');
        generateSimulatedCOTData();
        cotState.dataSource = 'simulated';
    }

    cotState.lastUpdated = new Date();
    cotState.isLoading = false;
    saveCOTCache(cotState.data, cotState.dataSource);
    renderCOTDashboard();
}

function refreshCOTData() {
    localStorage.removeItem(COT_CACHE_KEY);
    fetchAllCOTData();
}

// ============================================================
// Data Parsing
// ============================================================

function parseCOTRecords(records) {
    return records.map(r => {
        const longAll = parseFloat(r.noncomm_positions_long_all) || 0;
        const shortAll = parseFloat(r.noncomm_positions_short_all) || 0;
        const oiAll = parseFloat(r.open_interest_all) || 1;
        const net = longAll - shortAll;
        return {
            date: r.report_date_as_yyyy_mm_dd || r.report_date || '',
            longAll: longAll,
            shortAll: shortAll,
            openInterest: oiAll,
            net: net,
            netPctOI: (net / oiAll) * 100
        };
    }).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================
// Simulated Data Generation
// ============================================================

function generateSimulatedCOTData() {
    const symbols = Object.keys(COT_CONTRACTS);

    const baseParams = {
        "ES": { baseLong: 280000, baseShort: 210000, baseOI: 2800000, drift: 0.02, vol: 0.08, meanRevert: 0.05 },
        "TY": { baseLong: 420000, baseShort: 550000, baseOI: 4200000, drift: -0.01, vol: 0.06, meanRevert: 0.04 },
        "GC": { baseLong: 310000, baseShort: 85000, baseOI: 520000, drift: 0.015, vol: 0.10, meanRevert: 0.03 },
        "CL": { baseLong: 520000, baseShort: 180000, baseOI: 1900000, drift: -0.005, vol: 0.12, meanRevert: 0.04 },
        "NG": { baseLong: 120000, baseShort: 160000, baseOI: 1200000, drift: -0.02, vol: 0.15, meanRevert: 0.06 },
        "EC": { baseLong: 195000, baseShort: 140000, baseOI: 680000, drift: 0.01, vol: 0.09, meanRevert: 0.05 },
        "JY": { baseLong: 55000, baseShort: 150000, baseOI: 260000, drift: -0.015, vol: 0.11, meanRevert: 0.04 },
        "DX": { baseLong: 32000, baseShort: 12000, baseOI: 58000, drift: 0.008, vol: 0.10, meanRevert: 0.05 }
    };

    const weeks = 104;

    symbols.forEach(symbol => {
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

            // Mean-reverting process with drift and noise
            const longMeanRevert = (params.baseLong - currentLong) * params.meanRevert;
            const shortMeanRevert = (params.baseShort - currentShort) * params.meanRevert;

            const longShock = currentLong * params.vol * gaussianRandom() * 0.05;
            const shortShock = currentShort * params.vol * gaussianRandom() * 0.05;

            const longDrift = currentLong * params.drift * 0.02;
            const shortDrift = currentShort * (-params.drift) * 0.02;

            currentLong = Math.max(1000, Math.round(currentLong + longMeanRevert + longDrift + longShock));
            currentShort = Math.max(1000, Math.round(currentShort + shortMeanRevert + shortDrift + shortShock));

            // OI tracks roughly with position sizes
            const totalPositions = currentLong + currentShort;
            currentOI = Math.max(totalPositions * 1.5, Math.round(params.baseOI + params.baseOI * gaussianRandom() * 0.03));

            const net = currentLong - currentShort;
            const dateStr = date.toISOString().split('T')[0];

            records.push({
                date: dateStr,
                longAll: currentLong,
                shortAll: currentShort,
                openInterest: currentOI,
                net: net,
                netPctOI: (net / currentOI) * 100
            });
        }

        cotState.data[symbol] = records;
    });
}

function gaussianRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// ============================================================
// Metrics Calculation
// ============================================================

function computeCOTMetrics(records, lookback) {
    if (!records || records.length === 0) {
        return null;
    }

    // Use last N records based on lookback
    const sliced = records.slice(-lookback);
    if (sliced.length === 0) return null;

    const current = sliced[sliced.length - 1];
    const previous = sliced.length >= 2 ? sliced[sliced.length - 2] : current;

    // Net positions array for z-score
    const netPositions = sliced.map(r => r.net);
    const mean = netPositions.reduce((s, v) => s + v, 0) / netPositions.length;
    const variance = netPositions.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / netPositions.length;
    const stdDev = Math.sqrt(variance);
    const zScore = stdDev > 0 ? (current.net - mean) / stdDev : 0;

    // % of OI array for z-score
    const pctOIArray = sliced.map(r => r.netPctOI);
    const pctMean = pctOIArray.reduce((s, v) => s + v, 0) / pctOIArray.length;
    const pctVariance = pctOIArray.reduce((s, v) => s + Math.pow(v - pctMean, 2), 0) / pctOIArray.length;
    const pctStdDev = Math.sqrt(pctVariance);
    const pctZScore = pctStdDev > 0 ? (current.netPctOI - pctMean) / pctStdDev : 0;

    // Weekly change
    const weeklyChange = current.net - previous.net;
    const weeklyChangePct = previous.net !== 0 ? ((current.net - previous.net) / Math.abs(previous.net)) * 100 : 0;

    // Is extreme
    const isExtreme = Math.abs(zScore) > 2.0;
    const extremeType = isExtreme ? (zScore > 0 ? 'LONG' : 'SHORT') : null;

    return {
        currentNet: current.net,
        currentLong: current.longAll,
        currentShort: current.shortAll,
        openInterest: current.openInterest,
        netPctOI: current.netPctOI,
        zScore: zScore,
        pctZScore: pctZScore,
        mean: mean,
        stdDev: stdDev,
        weeklyChange: weeklyChange,
        weeklyChangePct: weeklyChangePct,
        isExtreme: isExtreme,
        extremeType: extremeType,
        reportDate: current.date,
        history: sliced
    };
}

// ============================================================
// Rendering
// ============================================================

function renderCOTDashboard() {
    renderSourceIndicator();
    renderLastUpdated();
    renderSummaryStats();
    renderContractCards();
    renderExtremeAlerts();
}

function showCOTLoading() {
    const grid = document.getElementById('cotGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="cot-loading" style="grid-column: 1 / -1;">
                <div class="cot-loading-spinner"></div>
                <p>Fetching COT data from CFTC...</p>
            </div>
        `;
    }
}

function renderSourceIndicator() {
    const dot = document.getElementById('cotSourceDot');
    const label = document.getElementById('cotSourceLabel');
    const note = document.getElementById('cotProductionNote');

    if (dot && label) {
        if (cotState.dataSource === 'live') {
            dot.className = 'cot-source-dot live';
            label.textContent = 'Live CFTC Data';
            if (note) note.style.display = 'none';
        } else {
            dot.className = 'cot-source-dot simulated';
            label.textContent = 'Simulated Data';
            if (note) note.style.display = 'flex';
        }
    }
}

function renderLastUpdated() {
    const el = document.getElementById('cotLastUpdated');
    if (el && cotState.lastUpdated) {
        el.textContent = 'Last updated: ' + cotState.lastUpdated.toLocaleString();
    }
}

function renderSummaryStats() {
    const symbols = Object.keys(COT_CONTRACTS);
    let netLongCount = 0;
    let netShortCount = 0;
    let extremeCount = 0;

    symbols.forEach(symbol => {
        const metrics = computeCOTMetrics(cotState.data[symbol], cotState.timeframe);
        if (metrics) {
            if (metrics.currentNet > 0) netLongCount++;
            else netShortCount++;
            if (metrics.isExtreme) extremeCount++;
        }
    });

    const elLong = document.getElementById('cotNetLong');
    const elShort = document.getElementById('cotNetShort');
    const elExtreme = document.getElementById('cotExtremeCount');

    if (elLong) elLong.textContent = netLongCount;
    if (elShort) elShort.textContent = netShortCount;
    if (elExtreme) elExtreme.textContent = extremeCount;
}

function renderContractCards() {
    const grid = document.getElementById('cotGrid');
    if (!grid) return;

    const symbols = Object.keys(COT_CONTRACTS);
    let html = '';

    symbols.forEach(symbol => {
        const contract = COT_CONTRACTS[symbol];
        const metrics = computeCOTMetrics(cotState.data[symbol], cotState.timeframe);

        if (!metrics) {
            html += renderEmptyCard(symbol, contract);
            return;
        }

        const isLong = metrics.currentNet > 0;
        const extremeClass = metrics.isExtreme ? (isLong ? 'extreme-long' : 'extreme-short') : '';

        html += `
            <div class="cot-card ${extremeClass}">
                <div class="cot-card-header">
                    <div class="cot-card-title-group">
                        <span class="cot-card-symbol">${symbol}</span>
                        <span class="cot-card-name">${contract.name}</span>
                    </div>
                    <span class="cot-category-badge ${contract.category}">${contract.category}</span>
                </div>

                <!-- Direction Indicator -->
                <div class="cot-direction ${isLong ? 'long' : 'short'}">
                    <span class="cot-direction-arrow">${isLong ? '&#9650;' : '&#9660;'}</span>
                    <span>NET ${isLong ? 'LONG' : 'SHORT'}</span>
                    <span style="margin-left: auto;" class="cot-weekly-change ${metrics.weeklyChange > 0 ? 'up' : metrics.weeklyChange < 0 ? 'down' : 'flat'}">
                        ${metrics.weeklyChange > 0 ? '+' : ''}${formatNumber(metrics.weeklyChange)} w/w
                    </span>
                </div>

                <!-- Position Metrics -->
                <div class="cot-metrics">
                    <div class="cot-metric">
                        <span class="cot-metric-label">Net Position</span>
                        <span class="cot-metric-value ${isLong ? 'positive' : 'negative'}">${formatNumber(metrics.currentNet)}</span>
                    </div>
                    <div class="cot-metric">
                        <span class="cot-metric-label">Net % of OI</span>
                        <span class="cot-metric-value ${metrics.netPctOI > 0 ? 'positive' : 'negative'}">${metrics.netPctOI.toFixed(2)}%</span>
                    </div>
                    <div class="cot-metric">
                        <span class="cot-metric-label">Longs</span>
                        <span class="cot-metric-value">${formatCompact(metrics.currentLong)}</span>
                    </div>
                    <div class="cot-metric">
                        <span class="cot-metric-label">Shorts</span>
                        <span class="cot-metric-value">${formatCompact(metrics.currentShort)}</span>
                    </div>
                </div>

                <!-- Z-Score Bar -->
                ${renderZScoreBar(metrics.zScore, metrics.isExtreme)}

                <!-- Sparkline -->
                <div class="cot-sparkline-container">
                    <div class="cot-sparkline-label">Net Position History (${cotState.timeframe}wk)</div>
                    ${renderSparkline(metrics.history, symbol)}
                </div>

                <!-- Extreme Badge -->
                ${metrics.isExtreme ? `
                    <div class="cot-extreme-badge ${metrics.extremeType === 'LONG' ? 'long' : 'short'}">
                        &#x26A0; EXTREME ${metrics.extremeType} @ ${metrics.zScore.toFixed(2)}&sigma;
                    </div>
                ` : ''}
            </div>
        `;
    });

    grid.innerHTML = html;
}

function renderEmptyCard(symbol, contract) {
    return `
        <div class="cot-card">
            <div class="cot-card-header">
                <div class="cot-card-title-group">
                    <span class="cot-card-symbol">${symbol}</span>
                    <span class="cot-card-name">${contract.name}</span>
                </div>
                <span class="cot-category-badge ${contract.category}">${contract.category}</span>
            </div>
            <div class="cot-loading" style="padding: 24px 0;">
                <p style="color: #666; font-size: 0.8125rem;">No data available</p>
            </div>
        </div>
    `;
}

// ============================================================
// Z-Score Bar Renderer
// ============================================================

function renderZScoreBar(zScore, isExtreme) {
    // Clamp z-score display to -3 to +3
    const clampedZ = Math.max(-3, Math.min(3, zScore));
    const zClass = zScore >= 0 ? 'positive' : 'negative';
    const extremeClass = isExtreme ? 'extreme' : '';

    // Map z-score to percentage position (0% = -3, 50% = 0, 100% = +3)
    const markerPct = ((clampedZ + 3) / 6) * 100;

    // Bar position and width
    let barLeft, barWidth;
    if (clampedZ >= 0) {
        barLeft = 50;
        barWidth = (clampedZ / 3) * 50;
    } else {
        barWidth = (Math.abs(clampedZ) / 3) * 50;
        barLeft = 50 - barWidth;
    }

    return `
        <div class="cot-zscore-container">
            <div class="cot-zscore-header">
                <span class="cot-zscore-label">Z-Score (${cotState.timeframe}wk)</span>
                <span class="cot-zscore-value ${zClass} ${extremeClass}">${zScore >= 0 ? '+' : ''}${zScore.toFixed(2)}&sigma;</span>
            </div>
            <div class="cot-zscore-track">
                <div class="cot-zscore-extreme-zone left"></div>
                <div class="cot-zscore-extreme-zone right"></div>
                <div class="cot-zscore-center"></div>
                <div class="cot-zscore-bar ${zClass} ${extremeClass}" style="left: ${barLeft}%; width: ${barWidth}%;"></div>
                <div class="cot-zscore-marker ${zClass} ${extremeClass}" style="left: ${markerPct}%;"></div>
            </div>
            <div class="cot-zscore-scale">
                <span>-3&sigma;</span>
                <span>-2&sigma;</span>
                <span>-1&sigma;</span>
                <span>0</span>
                <span>+1&sigma;</span>
                <span>+2&sigma;</span>
                <span>+3&sigma;</span>
            </div>
        </div>
    `;
}

// ============================================================
// Sparkline SVG Renderer
// ============================================================

function renderSparkline(history, symbol) {
    if (!history || history.length < 2) {
        return '<svg class="cot-sparkline" viewBox="0 0 280 48"></svg>';
    }

    const width = 280;
    const height = 48;
    const padding = 2;

    const nets = history.map(r => r.net);
    const minVal = Math.min(...nets);
    const maxVal = Math.max(...nets);
    const range = maxVal - minVal || 1;

    const scaleX = (i) => padding + (i / (nets.length - 1)) * (width - 2 * padding);
    const scaleY = (v) => height - padding - ((v - minVal) / range) * (height - 2 * padding);

    // Build line path
    let linePath = `M ${scaleX(0)} ${scaleY(nets[0])}`;
    for (let i = 1; i < nets.length; i++) {
        linePath += ` L ${scaleX(i)} ${scaleY(nets[i])}`;
    }

    // Build area path
    let areaPath = linePath + ` L ${scaleX(nets.length - 1)} ${height} L ${scaleX(0)} ${height} Z`;

    // Zero line y-position
    const zeroY = scaleY(0);
    const zeroInRange = minVal <= 0 && maxVal >= 0;

    // Color based on current net position
    const currentNet = nets[nets.length - 1];
    const color = currentNet >= 0 ? '#4caf50' : '#f44336';

    let svg = `<svg class="cot-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`;

    // Zero line
    if (zeroInRange) {
        svg += `<line class="zero-line" x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}"/>`;
    }

    // Area fill
    svg += `<path class="area" d="${areaPath}" fill="${color}"/>`;

    // Line
    svg += `<path class="line" d="${linePath}" stroke="${color}"/>`;

    // Endpoint dot
    const endX = scaleX(nets.length - 1);
    const endY = scaleY(currentNet);
    svg += `<circle cx="${endX}" cy="${endY}" r="2.5" fill="${color}" stroke="#0a0a0f" stroke-width="1"/>`;

    svg += '</svg>';
    return svg;
}

// ============================================================
// Extreme Alerts Section
// ============================================================

function renderExtremeAlerts() {
    const alertsGrid = document.getElementById('cotAlertsGrid');
    const alertsCount = document.getElementById('cotAlertsCount');
    if (!alertsGrid) return;

    const extremes = [];
    const symbols = Object.keys(COT_CONTRACTS);

    symbols.forEach(symbol => {
        const metrics = computeCOTMetrics(cotState.data[symbol], cotState.timeframe);
        if (metrics && metrics.isExtreme) {
            extremes.push({ symbol, contract: COT_CONTRACTS[symbol], metrics });
        }
    });

    if (alertsCount) {
        alertsCount.textContent = extremes.length > 0
            ? `${extremes.length} alert${extremes.length > 1 ? 's' : ''} active`
            : 'No alerts';
    }

    if (extremes.length === 0) {
        alertsGrid.innerHTML = `
            <div class="cot-all-clear" style="grid-column: 1 / -1;">
                <div class="cot-all-clear-icon">&#x2705;</div>
                <div class="cot-all-clear-title">All Clear</div>
                <div class="cot-all-clear-text">No contracts at extreme positioning (&gt;2&sigma;). All net speculative positions are within normal ranges for the ${cotState.timeframe}-week lookback window.</div>
            </div>
        `;
        return;
    }

    // Sort by absolute z-score descending
    extremes.sort((a, b) => Math.abs(b.metrics.zScore) - Math.abs(a.metrics.zScore));

    let html = '';
    extremes.forEach(({ symbol, contract, metrics }) => {
        const isLong = metrics.extremeType === 'LONG';
        const direction = isLong ? 'long' : 'short';
        const directionLabel = isLong ? 'LONG' : 'SHORT';
        const zStr = metrics.zScore.toFixed(2);

        html += `
            <div class="cot-alert-card alert-${direction}">
                <div class="cot-alert-card-header">
                    <span class="cot-alert-contract">${symbol} - ${contract.name}</span>
                    <span class="cot-alert-zscore ${isLong ? 'positive' : 'negative'}">${metrics.zScore > 0 ? '+' : ''}${zStr}&sigma;</span>
                </div>
                <div class="cot-alert-message">
                    Speculative positioning is at <strong>extreme ${directionLabel.toLowerCase()}</strong> levels.
                    Net position: <strong>${formatNumber(metrics.currentNet)}</strong> contracts
                    (${metrics.netPctOI.toFixed(2)}% of open interest).
                    Z-score of ${zStr} exceeds the &plusmn;2&sigma; threshold over the ${cotState.timeframe}-week lookback.
                </div>
                <div class="cot-alert-suggestion">
                    COT extreme in ${contract.name}: ${directionLabel} positioning at ${zStr}&sigma; &mdash; potential contrarian signal or crowded trade risk.
                </div>
            </div>
        `;
    });

    alertsGrid.innerHTML = html;
}

// ============================================================
// Utility Functions
// ============================================================

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    return num.toLocaleString('en-US');
}

function formatCompact(num) {
    if (num === null || num === undefined || isNaN(num)) return '--';
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return num.toLocaleString('en-US');
}
