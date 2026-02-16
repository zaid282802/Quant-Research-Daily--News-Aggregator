/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * Market Regime Dashboard for QRD
 * Tracks 6 key regime indicators to determine overall market regime state
 */

// ============================================================
// Configuration
// ============================================================

const REGIME_CONFIG = {
    indicators: {
        vix: {
            name: 'VIX Regime',
            weight: 0.25,
            thresholds: [
                { max: 15, label: 'Low', color: 'green', score: -1 },
                { max: 20, label: 'Normal', color: 'yellow', score: -0.3 },
                { max: 30, label: 'Elevated', color: 'orange', score: 0.5 },
                { max: Infinity, label: 'Crisis', color: 'red', score: 1 }
            ]
        },
        yieldCurve: {
            name: 'Yield Curve',
            weight: 0.20,
            thresholds: [
                { min: 50, label: 'Steep', color: 'green', score: -1 },
                { min: 0, label: 'Flat', color: 'yellow', score: 0.2 },
                { min: -Infinity, label: 'Inverted', color: 'red', score: 1 }
            ]
        },
        stockBondCorr: {
            name: 'Stock-Bond Corr',
            weight: 0.15,
            thresholds: [
                { max: -0.2, label: 'Normal', color: 'green', score: -1 },
                { max: 0.1, label: 'Transitioning', color: 'yellow', score: 0.2 },
                { max: Infinity, label: 'Flipped', color: 'red', score: 1 }
            ]
        },
        creditStress: {
            name: 'Credit Stress',
            weight: 0.15,
            thresholds: [
                { max: 15, label: 'Low', color: 'green', score: -1 },
                { max: 20, label: 'Moderate', color: 'yellow', score: -0.2 },
                { max: 25, label: 'Elevated', color: 'orange', score: 0.5 },
                { max: Infinity, label: 'High', color: 'red', score: 1 }
            ]
        },
        dollarTrend: {
            name: 'Dollar Trend',
            weight: 0.10,
            thresholds: [
                { max: -0.3, label: 'Weakening', color: 'green', score: -0.5 },
                { max: 0.3, label: 'Stable', color: 'yellow', score: 0 },
                { max: Infinity, label: 'Strengthening', color: 'orange', score: 0.7 }
            ]
        },
        equityTrend: {
            name: 'Equity Trend',
            weight: 0.15,
            thresholds: [
                { min: 0.5, label: 'Bullish', color: 'green', score: -1 },
                { min: -0.5, label: 'Neutral', color: 'yellow', score: 0 },
                { min: -Infinity, label: 'Bearish', color: 'red', score: 1 }
            ]
        }
    },
    overallLabels: {
        riskOn: { threshold: -0.3, label: 'Risk-On', color: '#3fb950' },
        neutral: { threshold: 0.3, label: 'Neutral', color: '#d29922' },
        riskOff: { label: 'Risk-Off', color: '#f85149' }
    },
    storageKeys: {
        state: 'qrd_regime_state',
        log: 'qrd_regime_log',
        marketData: 'qrd_market_data',
        corrAlerts: 'qrd_corr_alerts'
    }
};

// ============================================================
// Initialization
// ============================================================

function initRegimeDashboard() {
    const state = calculateRegimeState();
    const isFullPage = document.getElementById('regimeGauge');
    if (isFullPage) {
        renderRegimePage(state);
    }
    const widgetEl = document.getElementById('regimeWidget');
    if (widgetEl) {
        renderRegimeWidget(state);
    }
}

// ============================================================
// State Calculation
// ============================================================

function calculateRegimeState() {
    const marketCache = loadMarketData();
    const corrAlerts = loadCorrAlerts();
    const data = marketCache ? marketCache.data : null;

    const indicators = {};

    // 1. VIX Regime
    const vixItem = data ? data.find(d => d.label === 'VIX') : null;
    const vixVal = vixItem ? parseFloat(String(vixItem.value).replace(/[^0-9.\-]/g, '')) : null;
    indicators.vix = classifyIndicator('vix', vixVal, vixVal);

    // 2. Yield Curve (2s10s spread proxy from 10Y and 5Y)
    const y10 = data ? data.find(d => d.label === '10Y Yield') : null;
    const y5 = data ? data.find(d => d.label === '5Y Yield') : null;
    const twos10s = data ? data.find(d => d.label === '2s10s') : null;
    let spreadBps = null;
    if (twos10s) {
        const raw = String(twos10s.value).replace(/[^0-9.\-]/g, '');
        spreadBps = parseFloat(raw);
        if (twos10s.inverted) spreadBps = -Math.abs(spreadBps);
    } else if (y10 && y5) {
        const v10 = parseFloat(String(y10.value).replace(/[^0-9.\-]/g, ''));
        const v5 = parseFloat(String(y5.value).replace(/[^0-9.\-]/g, ''));
        if (!isNaN(v10) && !isNaN(v5)) spreadBps = (v10 - v5) * 100;
    }
    indicators.yieldCurve = classifyYieldCurve(spreadBps);

    // 3. Stock-Bond Correlation (from correlation alerts)
    let spyTltCorr = null;
    if (corrAlerts && Array.isArray(corrAlerts)) {
        const flip = corrAlerts.find(a => a.pair === 'SPY-TLT');
        if (flip) {
            spyTltCorr = 0.15; // correlation flip detected
        } else {
            spyTltCorr = -0.35; // default normal
        }
    }
    indicators.stockBondCorr = classifyStockBondCorr(spyTltCorr);

    // 4. Credit Stress (use VIX as proxy if no HYG data)
    let creditVal = vixVal; // VIX as proxy for credit stress
    indicators.creditStress = classifyIndicator('creditStress', creditVal, creditVal);

    // 5. Dollar Trend (DXY change)
    const dxyItem = data ? data.find(d => d.label === 'DXY') : null;
    let dxyChange = null;
    if (dxyItem && dxyItem.changeNum !== undefined) {
        dxyChange = dxyItem.changeNum;
    }
    indicators.dollarTrend = classifyIndicator('dollarTrend', dxyChange, dxyItem ? dxyItem.value : null);

    // 6. Equity Trend (S&P 500 change as proxy for 50d vs 200d)
    const spItem = data ? data.find(d => d.label === 'S&P 500') : null;
    let eqChange = null;
    if (spItem && spItem.changeNum !== undefined) {
        eqChange = spItem.changeNum;
    }
    indicators.equityTrend = classifyEquityTrend(eqChange, spItem ? spItem.value : null);

    const overall = getOverallRegime(indicators);

    const state = {
        indicators,
        overall,
        timestamp: Date.now()
    };

    // Check for regime changes and log them
    logRegimeChanges(state);

    // Persist current state
    try {
        localStorage.setItem(REGIME_CONFIG.storageKeys.state, JSON.stringify(state));
    } catch (e) { /* quota exceeded */ }

    return state;
}

function classifyIndicator(key, rawValue, displayValue) {
    const cfg = REGIME_CONFIG.indicators[key];
    if (rawValue === null || rawValue === undefined || isNaN(rawValue)) {
        return { name: cfg.name, value: '--', label: 'No Data', color: 'yellow', score: 0, rawValue: null };
    }
    for (const t of cfg.thresholds) {
        if (t.max !== undefined && rawValue < t.max) {
            return { name: cfg.name, value: displayValue, label: t.label, color: t.color, score: t.score, rawValue };
        }
    }
    const last = cfg.thresholds[cfg.thresholds.length - 1];
    return { name: cfg.name, value: displayValue, label: last.label, color: last.color, score: last.score, rawValue };
}

function classifyYieldCurve(spreadBps) {
    const cfg = REGIME_CONFIG.indicators.yieldCurve;
    if (spreadBps === null || isNaN(spreadBps)) {
        return { name: cfg.name, value: '--', label: 'No Data', color: 'yellow', score: 0, rawValue: null };
    }
    const display = `${spreadBps.toFixed(0)}bp`;
    for (const t of cfg.thresholds) {
        if (spreadBps >= t.min) {
            return { name: cfg.name, value: display, label: t.label, color: t.color, score: t.score, rawValue: spreadBps };
        }
    }
    const last = cfg.thresholds[cfg.thresholds.length - 1];
    return { name: cfg.name, value: display, label: last.label, color: last.color, score: last.score, rawValue: spreadBps };
}

function classifyStockBondCorr(corrVal) {
    const cfg = REGIME_CONFIG.indicators.stockBondCorr;
    if (corrVal === null || isNaN(corrVal)) {
        return { name: cfg.name, value: '--', label: 'No Data', color: 'yellow', score: 0, rawValue: null };
    }
    const display = corrVal.toFixed(2);
    for (const t of cfg.thresholds) {
        if (corrVal < t.max) {
            return { name: cfg.name, value: display, label: t.label, color: t.color, score: t.score, rawValue: corrVal };
        }
    }
    const last = cfg.thresholds[cfg.thresholds.length - 1];
    return { name: cfg.name, value: display, label: last.label, color: last.color, score: last.score, rawValue: corrVal };
}

function classifyEquityTrend(changeNum, displayValue) {
    const cfg = REGIME_CONFIG.indicators.equityTrend;
    if (changeNum === null || isNaN(changeNum)) {
        return { name: cfg.name, value: '--', label: 'No Data', color: 'yellow', score: 0, rawValue: null };
    }
    for (const t of cfg.thresholds) {
        if (changeNum >= t.min) {
            return { name: cfg.name, value: displayValue, label: t.label, color: t.color, score: t.score, rawValue: changeNum };
        }
    }
    const last = cfg.thresholds[cfg.thresholds.length - 1];
    return { name: cfg.name, value: displayValue, label: last.label, color: last.color, score: last.score, rawValue: changeNum };
}

// ============================================================
// Overall Regime
// ============================================================

function getOverallRegime(indicators) {
    const cfg = REGIME_CONFIG.indicators;
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, ind] of Object.entries(indicators)) {
        const weight = cfg[key] ? cfg[key].weight : 0;
        weightedSum += ind.score * weight;
        totalWeight += weight;
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const labels = REGIME_CONFIG.overallLabels;

    let label, color;
    if (score < labels.riskOn.threshold) {
        label = labels.riskOn.label;
        color = labels.riskOn.color;
    } else if (score < labels.neutral.threshold) {
        label = labels.neutral.label;
        color = labels.neutral.color;
    } else {
        label = labels.riskOff.label;
        color = labels.riskOff.color;
    }

    return { score, label, color };
}

// ============================================================
// Data Loading
// ============================================================

function loadMarketData() {
    try {
        const raw = localStorage.getItem(REGIME_CONFIG.storageKeys.marketData);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function loadCorrAlerts() {
    try {
        const raw = localStorage.getItem(REGIME_CONFIG.storageKeys.corrAlerts);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

// ============================================================
// Regime Change Logging
// ============================================================

function logRegimeChanges(newState) {
    try {
        const prevRaw = localStorage.getItem(REGIME_CONFIG.storageKeys.state);
        if (!prevRaw) return;
        const prevState = JSON.parse(prevRaw);
        const logRaw = localStorage.getItem(REGIME_CONFIG.storageKeys.log);
        const log = logRaw ? JSON.parse(logRaw) : [];
        const now = new Date().toISOString();

        // Check overall regime change
        if (prevState.overall && prevState.overall.label !== newState.overall.label) {
            log.unshift({
                date: now,
                indicator: 'Overall Regime',
                from: prevState.overall.label,
                to: newState.overall.label
            });
        }

        // Check each indicator
        for (const key of Object.keys(newState.indicators)) {
            const prev = prevState.indicators ? prevState.indicators[key] : null;
            const curr = newState.indicators[key];
            if (prev && prev.label !== curr.label) {
                log.unshift({
                    date: now,
                    indicator: curr.name,
                    from: prev.label,
                    to: curr.label
                });
            }
        }

        // Keep last 50 entries
        const trimmed = log.slice(0, 50);
        localStorage.setItem(REGIME_CONFIG.storageKeys.log, JSON.stringify(trimmed));
    } catch (e) { /* non-critical */ }
}

// ============================================================
// Sidebar Widget Rendering
// ============================================================

function renderRegimeWidget(state) {
    const el = document.getElementById('regimeWidget');
    if (!el) return;

    const colorMap = { green: '#3fb950', yellow: '#d29922', orange: '#db6d28', red: '#f85149' };
    const indicators = state.indicators;
    const overall = state.overall;

    let dots = '';
    for (const [key, ind] of Object.entries(indicators)) {
        const c = colorMap[ind.color] || '#8b949e';
        dots += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">` +
            `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};flex-shrink:0;"></span>` +
            `<span style="font-size:0.8125rem;color:var(--text-secondary);flex:1;">${ind.name}</span>` +
            `<span style="font-size:0.75rem;font-family:var(--font-mono);color:${c};font-weight:600;">${ind.label}</span>` +
            `</div>`;
    }

    const badgeBg = overall.color === '#3fb950' ? 'rgba(63,185,80,0.15)'
        : overall.color === '#d29922' ? 'rgba(210,153,34,0.15)'
        : 'rgba(248,81,73,0.15)';

    el.innerHTML = `
        <div style="margin-bottom:12px;text-align:center;">
            <span style="display:inline-block;padding:4px 16px;border-radius:12px;font-size:0.8125rem;font-weight:700;background:${badgeBg};color:${overall.color};text-transform:uppercase;letter-spacing:0.5px;">
                ${overall.label}
            </span>
        </div>
        ${dots}
        <a href="regime.html" style="display:block;text-align:right;font-size:0.75rem;color:var(--accent-primary);text-decoration:none;margin-top:8px;">Full Dashboard &rarr;</a>
    `;
}

// ============================================================
// Full Page Rendering
// ============================================================

function renderRegimePage(state) {
    // Render gauge
    renderRegimeGauge('regimeGauge', state.overall.score);

    // Render overall label
    const overallLabel = document.getElementById('overallLabel');
    if (overallLabel) {
        overallLabel.textContent = state.overall.label;
        overallLabel.style.color = state.overall.color;
    }
    const overallSubtitle = document.getElementById('overallSubtitle');
    if (overallSubtitle) {
        const scoreText = state.overall.score.toFixed(2);
        overallSubtitle.textContent = `Composite Score: ${scoreText} (${state.overall.label})`;
    }

    // Render indicator grid
    const grid = document.getElementById('indicatorGrid');
    if (grid) {
        grid.innerHTML = '';
        for (const [key, ind] of Object.entries(state.indicators)) {
            grid.innerHTML += renderIndicatorCard(ind);
        }
    }

    // Render change log
    renderChangeLog();
}

function renderIndicatorCard(indicator) {
    const colorMap = { green: '#3fb950', yellow: '#d29922', orange: '#db6d28', red: '#f85149' };
    const c = colorMap[indicator.color] || '#8b949e';
    const badgeBg = indicator.color === 'green' ? 'rgba(63,185,80,0.2)'
        : indicator.color === 'yellow' ? 'rgba(210,153,34,0.2)'
        : indicator.color === 'orange' ? 'rgba(219,109,40,0.2)'
        : 'rgba(248,81,73,0.2)';

    // Compute bar width: map score from [-1, 1] to [0%, 100%]
    const barPct = Math.round(((indicator.score + 1) / 2) * 100);

    return `
        <div class="regime-card">
            <div class="regime-card-header">
                <span class="regime-card-title">${indicator.name}</span>
                <span class="regime-badge" style="background:${badgeBg};color:${c};">${indicator.label}</span>
            </div>
            <div class="regime-value" style="color:${c};">${indicator.value}</div>
            <div class="regime-indicator-bar">
                <div class="regime-indicator-fill" style="width:${barPct}%;background:${c};"></div>
            </div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:0.6875rem;color:var(--text-muted);font-family:var(--font-mono);">
                <span>Risk-On</span>
                <span>Risk-Off</span>
            </div>
        </div>
    `;
}

// ============================================================
// D3 Semicircle Gauge
// ============================================================

function renderRegimeGauge(containerId, score) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const width = 320;
    const height = 200;
    const outerRadius = 140;
    const innerRadius = 100;
    const margin = { top: 10, bottom: 10 };

    const svg = d3.select('#' + containerId)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('max-width', '100%')
        .style('height', 'auto');

    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height - margin.bottom})`);

    // Background arc segments: green (risk-on) -> yellow (neutral) -> red (risk-off)
    const arcGen = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

    // Three segments: Risk-On (-PI to -PI/3), Neutral (-PI/3 to PI/3), Risk-Off (PI/3 to 0)
    const segments = [
        { startAngle: -Math.PI, endAngle: -Math.PI / 3, color: 'rgba(63, 185, 80, 0.25)' },
        { startAngle: -Math.PI / 3, endAngle: Math.PI / 3, color: 'rgba(210, 153, 34, 0.25)' },
        { startAngle: Math.PI / 3, endAngle: Math.PI, color: 'rgba(248, 81, 73, 0.25)' }
    ];

    // Rotate to make it a semicircle at top
    // We draw arcs from -PI to 0 (semicircle on top)
    // Map: left = risk-on (green), center = neutral (yellow), right = risk-off (red)
    const bgSegments = [
        { startAngle: -Math.PI, endAngle: -Math.PI * 2 / 3, color: 'rgba(63, 185, 80, 0.2)' },
        { startAngle: -Math.PI * 2 / 3, endAngle: -Math.PI / 3, color: 'rgba(210, 153, 34, 0.2)' },
        { startAngle: -Math.PI / 3, endAngle: 0, color: 'rgba(248, 81, 73, 0.2)' }
    ];

    bgSegments.forEach(seg => {
        g.append('path')
            .attr('d', arcGen(seg))
            .attr('fill', seg.color);
    });

    // Needle: score ranges from -1 (left, risk-on) to +1 (right, risk-off)
    // Map to angle: -1 -> -PI, 0 -> -PI/2, +1 -> 0
    const clampedScore = Math.max(-1, Math.min(1, score));
    const needleAngle = -Math.PI + ((clampedScore + 1) / 2) * Math.PI;

    const needleLength = innerRadius - 10;
    const nx = Math.cos(needleAngle) * needleLength;
    const ny = Math.sin(needleAngle) * needleLength;

    // Needle color based on regime
    let needleColor;
    if (clampedScore < -0.3) needleColor = '#3fb950';
    else if (clampedScore < 0.3) needleColor = '#d29922';
    else needleColor = '#f85149';

    // Needle line
    g.append('line')
        .attr('x1', 0).attr('y1', 0)
        .attr('x2', nx).attr('y2', ny)
        .attr('stroke', needleColor)
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');

    // Needle center dot
    g.append('circle')
        .attr('cx', 0).attr('cy', 0)
        .attr('r', 6)
        .attr('fill', needleColor);

    // Needle tip dot
    g.append('circle')
        .attr('cx', nx).attr('cy', ny)
        .attr('r', 4)
        .attr('fill', needleColor);

    // Labels under the arc
    const labelRadius = outerRadius + 16;
    const labels = [
        { angle: -Math.PI, text: 'Risk-On', color: '#3fb950' },
        { angle: -Math.PI / 2, text: 'Neutral', color: '#d29922' },
        { angle: 0, text: 'Risk-Off', color: '#f85149' }
    ];

    labels.forEach(l => {
        const lx = Math.cos(l.angle) * labelRadius;
        const ly = Math.sin(l.angle) * labelRadius;
        g.append('text')
            .attr('x', lx)
            .attr('y', ly)
            .attr('text-anchor', 'middle')
            .attr('fill', l.color)
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('font-family', 'var(--font-mono)')
            .text(l.text);
    });
}

// ============================================================
// Change Log Rendering
// ============================================================

function renderChangeLog() {
    const container = document.getElementById('regimeChangeLog');
    if (!container) return;

    let log = [];
    try {
        const raw = localStorage.getItem(REGIME_CONFIG.storageKeys.log);
        log = raw ? JSON.parse(raw) : [];
    } catch (e) { /* ignore */ }

    if (log.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:24px;color:var(--text-muted);font-size:0.875rem;">
                No regime transitions recorded yet. Changes will appear here as market conditions evolve.
            </div>
        `;
        return;
    }

    const colorForLabel = (label) => {
        const l = label.toLowerCase();
        if (l.includes('risk-on') || l === 'low' || l === 'steep' || l === 'normal' || l === 'bullish' || l === 'weakening') return '#3fb950';
        if (l.includes('neutral') || l === 'flat' || l === 'moderate' || l === 'stable' || l === 'transitioning') return '#d29922';
        if (l.includes('elevated') || l === 'strengthening') return '#db6d28';
        return '#f85149';
    };

    const rows = log.slice(0, 20).map(entry => {
        const d = new Date(entry.date);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const fromColor = colorForLabel(entry.from);
        const toColor = colorForLabel(entry.to);
        return `<tr>
            <td>${dateStr} ${timeStr}</td>
            <td>${entry.indicator}</td>
            <td><span style="color:${fromColor};font-weight:600;">${entry.from}</span></td>
            <td><span style="color:${toColor};font-weight:600;">${entry.to}</span></td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <table class="change-log-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Indicator</th>
                    <th>From</th>
                    <th>To</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

// ============================================================
// Export Globals
// ============================================================

window.initRegimeDashboard = initRegimeDashboard;
window.renderRegimeWidget = renderRegimeWidget;
window.calculateRegimeState = calculateRegimeState;

// ============================================================
// Boot
// ============================================================

document.addEventListener('DOMContentLoaded', initRegimeDashboard);
