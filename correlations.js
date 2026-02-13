/**
 * Cross-Asset Correlation Monitor for QRD
 * Rolling correlation computation, D3.js heatmap, regime detection
 *
 * Phase 6 of QRD Upgrade - Computes rolling correlations across 8 key
 * cross-asset instruments, renders an interactive D3.js heatmap, detects
 * regime changes vs historical baselines, and displays comparison tables.
 */

const CORR_CONFIG = {
    // 8 key cross-asset instruments
    ASSETS: [
        { symbol: 'SPY', name: 'S&P 500', category: 'equity' },
        { symbol: 'TLT', name: '20Y Treasury', category: 'fixed-income' },
        { symbol: 'GLD', name: 'Gold', category: 'commodity' },
        { symbol: 'DXY', name: 'Dollar Index', category: 'fx' },
        { symbol: 'VIX', name: 'VIX', category: 'volatility' },
        { symbol: 'HYG', name: 'High Yield', category: 'credit' },
        { symbol: 'USO', name: 'Oil', category: 'commodity' },
        { symbol: 'EEM', name: 'EM Equities', category: 'equity' }
    ],

    // Historical baseline correlations (1Y averages as of 2025)
    BASELINE_1Y: {
        'SPY-TLT': -0.35, 'SPY-GLD': 0.05, 'SPY-DXY': -0.15,
        'SPY-VIX': -0.82, 'SPY-HYG': 0.65, 'SPY-USO': 0.25, 'SPY-EEM': 0.72,
        'TLT-GLD': 0.30, 'TLT-DXY': -0.20, 'TLT-VIX': 0.40, 'TLT-HYG': -0.15,
        'TLT-USO': -0.10, 'TLT-EEM': -0.25,
        'GLD-DXY': -0.45, 'GLD-VIX': 0.15, 'GLD-HYG': -0.05, 'GLD-USO': 0.20, 'GLD-EEM': 0.15,
        'DXY-VIX': 0.10, 'DXY-HYG': -0.20, 'DXY-USO': -0.30, 'DXY-EEM': -0.55,
        'VIX-HYG': -0.60, 'VIX-USO': -0.15, 'VIX-EEM': -0.65,
        'HYG-USO': 0.30, 'HYG-EEM': 0.55,
        'USO-EEM': 0.35
    },

    // 5Y averages
    BASELINE_5Y: {
        'SPY-TLT': -0.25, 'SPY-GLD': 0.10, 'SPY-DXY': -0.10,
        'SPY-VIX': -0.80, 'SPY-HYG': 0.60, 'SPY-USO': 0.30, 'SPY-EEM': 0.68,
        'TLT-GLD': 0.25, 'TLT-DXY': -0.15, 'TLT-VIX': 0.35, 'TLT-HYG': -0.10,
        'TLT-USO': -0.05, 'TLT-EEM': -0.20,
        'GLD-DXY': -0.40, 'GLD-VIX': 0.10, 'GLD-HYG': 0.00, 'GLD-USO': 0.15, 'GLD-EEM': 0.10,
        'DXY-VIX': 0.05, 'DXY-HYG': -0.15, 'DXY-USO': -0.25, 'DXY-EEM': -0.50,
        'VIX-HYG': -0.55, 'VIX-USO': -0.10, 'VIX-EEM': -0.60,
        'HYG-USO': 0.25, 'HYG-EEM': 0.50,
        'USO-EEM': 0.30
    },

    WINDOWS: [30, 60, 90],
    DEFAULT_WINDOW: 60,

    // Key pairs to highlight in comparison table
    KEY_PAIRS: [
        'SPY-TLT', 'SPY-VIX', 'SPY-GLD', 'SPY-HYG', 'SPY-EEM',
        'TLT-GLD', 'TLT-VIX', 'VIX-HYG', 'DXY-EEM', 'DXY-GLD',
        'GLD-USO', 'HYG-EEM', 'DXY-USO', 'VIX-EEM', 'USO-EEM'
    ],

    // Regime detection thresholds
    REGIME_THRESHOLDS: {
        SPY_TLT_FLIP: 0,          // Stock-bond correlation sign flip
        VIX_SPY_WEAKENING: -0.5,  // VIX-SPY weakening below this
        DXY_EEM_DECOUPLING: -0.3, // DXY-EEM decoupling threshold
        DEVIATION_MODERATE: 0.2,   // Moderate deviation from baseline
        DEVIATION_SEVERE: 0.4      // Severe deviation from baseline
    }
};

// ============================================================
// Module State
// ============================================================
let corrState = {
    currentWindow: CORR_CONFIG.DEFAULT_WINDOW,
    simulatedReturns: null,
    currentMatrix: null,
    assets: CORR_CONFIG.ASSETS
};

// ============================================================
// Initialization
// ============================================================

/**
 * Initialize the correlation monitor.
 * Generates simulated data, computes the correlation matrix,
 * renders the heatmap, detects regimes, and populates the table.
 */
function initCorrelations() {
    // Generate simulated daily returns (250 trading days)
    corrState.simulatedReturns = generateSimulatedReturns(250);

    // Compute correlation matrix for default window
    corrState.currentMatrix = calculateCorrelationMatrix(
        corrState.simulatedReturns,
        corrState.currentWindow
    );

    // Render all components
    renderHeatmap(corrState.currentMatrix, corrState.assets);
    const alerts = detectRegimeChanges(corrState.currentMatrix);
    renderRegimeAlerts(alerts);
    renderComparisonTable(corrState.currentMatrix);

    // Update window label
    updateWindowLabel(corrState.currentWindow);
}

// ============================================================
// Data Generation
// ============================================================

/**
 * Generate simulated daily returns for all 8 assets with realistic
 * cross-asset correlation structure using Cholesky decomposition.
 *
 * @param {number} days - Number of trading days to simulate
 * @returns {Object} - { SPY: [r1, r2, ...], TLT: [...], ... }
 */
function generateSimulatedReturns(days) {
    const n = CORR_CONFIG.ASSETS.length;
    const symbols = CORR_CONFIG.ASSETS.map(a => a.symbol);

    // Build target correlation matrix from BASELINE_1Y
    // Add some noise to simulate current-period deviations
    const targetCorr = [];
    for (let i = 0; i < n; i++) {
        targetCorr[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                targetCorr[i][j] = 1.0;
            } else {
                const key = getPairKey(symbols[i], symbols[j]);
                const baseline = CORR_CONFIG.BASELINE_1Y[key] || 0;
                // Add random perturbation (+/- 0.15) to simulate current regime
                const noise = (Math.random() - 0.5) * 0.30;
                targetCorr[i][j] = Math.max(-0.99, Math.min(0.99, baseline + noise));
            }
        }
    }

    // Ensure symmetry
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            targetCorr[j][i] = targetCorr[i][j];
        }
    }

    // Cholesky decomposition of the target correlation matrix
    const L = choleskyDecomposition(targetCorr);

    // Annualized volatilities for realistic return magnitudes (daily)
    const annualVols = {
        'SPY': 0.18, 'TLT': 0.15, 'GLD': 0.16, 'DXY': 0.08,
        'VIX': 0.80, 'HYG': 0.08, 'USO': 0.35, 'EEM': 0.22
    };

    // Generate correlated returns
    const returns = {};
    symbols.forEach(s => { returns[s] = []; });

    for (let d = 0; d < days; d++) {
        // Independent standard normal draws
        const z = [];
        for (let i = 0; i < n; i++) {
            z.push(boxMullerRandom());
        }

        // Correlate via Cholesky: x = L * z
        const x = [];
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j <= i; j++) {
                sum += L[i][j] * z[j];
            }
            x.push(sum);
        }

        // Scale by daily vol
        for (let i = 0; i < n; i++) {
            const dailyVol = annualVols[symbols[i]] / Math.sqrt(252);
            returns[symbols[i]].push(x[i] * dailyVol);
        }
    }

    return returns;
}

/**
 * Cholesky decomposition of a positive-definite matrix.
 * Returns lower triangular matrix L such that A = L * L^T.
 * Falls back to a nearest positive-definite fix if needed.
 *
 * @param {number[][]} A - Symmetric positive-definite matrix
 * @returns {number[][]} L - Lower triangular Cholesky factor
 */
function choleskyDecomposition(A) {
    const n = A.length;
    const L = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
            let sum = 0;
            for (let k = 0; k < j; k++) {
                sum += L[i][k] * L[j][k];
            }

            if (i === j) {
                const val = A[i][i] - sum;
                // Ensure positive definiteness with a small floor
                L[i][j] = Math.sqrt(Math.max(val, 1e-10));
            } else {
                L[i][j] = (A[i][j] - sum) / L[j][j];
            }
        }
    }

    return L;
}

/**
 * Box-Muller transform for generating standard normal random variates.
 * @returns {number} A standard normal random number
 */
function boxMullerRandom() {
    let u1, u2;
    do {
        u1 = Math.random();
    } while (u1 === 0);
    u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

/**
 * Get canonical pair key (alphabetical order by symbol index in ASSETS).
 * @param {string} s1 - First symbol
 * @param {string} s2 - Second symbol
 * @returns {string} Canonical pair key, e.g., "SPY-TLT"
 */
function getPairKey(s1, s2) {
    const idx1 = CORR_CONFIG.ASSETS.findIndex(a => a.symbol === s1);
    const idx2 = CORR_CONFIG.ASSETS.findIndex(a => a.symbol === s2);
    if (idx1 <= idx2) return `${s1}-${s2}`;
    return `${s2}-${s1}`;
}

// ============================================================
// Correlation Computation
// ============================================================

/**
 * Compute the rolling correlation matrix using the last `window` days
 * of returns data.
 *
 * @param {Object} returns - { symbol: [daily returns array] }
 * @param {number} window - Rolling window in trading days
 * @returns {number[][]} NxN correlation matrix
 */
function calculateCorrelationMatrix(returns, window) {
    const symbols = CORR_CONFIG.ASSETS.map(a => a.symbol);
    const n = symbols.length;

    // Extract the last `window` days for each asset
    const windowReturns = {};
    symbols.forEach(s => {
        const r = returns[s];
        const start = Math.max(0, r.length - window);
        windowReturns[s] = r.slice(start);
    });

    // Compute NxN Pearson correlation matrix
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                matrix[i][j] = 1.0;
            } else if (j < i) {
                matrix[i][j] = matrix[j][i]; // Symmetric
            } else {
                matrix[i][j] = pearsonCorrelation(
                    windowReturns[symbols[i]],
                    windowReturns[symbols[j]]
                );
            }
        }
    }

    return matrix;
}

/**
 * Compute Pearson correlation coefficient between two arrays.
 *
 * @param {number[]} x - First series
 * @param {number[]} y - Second series
 * @returns {number} Correlation in [-1, 1]
 */
function pearsonCorrelation(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumX2 += x[i] * x[i];
        sumY2 += y[i] * y[i];
    }

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
        (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    if (denominator === 0) return 0;
    return Math.max(-1, Math.min(1, numerator / denominator));
}

/**
 * Helper to retrieve a correlation value from the matrix by asset symbols.
 *
 * @param {number[][]} matrix - NxN correlation matrix
 * @param {string} asset1 - Symbol of first asset
 * @param {string} asset2 - Symbol of second asset
 * @returns {number} Correlation value
 */
function getCorrelation(matrix, asset1, asset2) {
    const symbols = CORR_CONFIG.ASSETS.map(a => a.symbol);
    const i = symbols.indexOf(asset1);
    const j = symbols.indexOf(asset2);
    if (i === -1 || j === -1) return 0;
    return matrix[i][j];
}

// ============================================================
// D3.js Heatmap Rendering
// ============================================================

/**
 * Render the correlation heatmap using D3.js.
 * Creates an 8x8 grid with color-coded cells, axis labels,
 * and interactive hover tooltips.
 *
 * @param {number[][]} matrix - NxN correlation matrix
 * @param {Object[]} assets - Array of asset objects
 */
function renderHeatmap(matrix, assets) {
    const container = document.getElementById('correlationHeatmap');
    container.innerHTML = '';

    const n = assets.length;
    const symbols = assets.map(a => a.symbol);
    const names = assets.map(a => a.name);

    // Responsive sizing
    const containerWidth = container.parentElement.clientWidth;
    const maxSize = Math.min(containerWidth - 40, 720);
    const margin = { top: 90, right: 30, bottom: 30, left: 90 };
    const size = maxSize;
    const innerSize = size - margin.left - margin.right;
    const cellSize = innerSize / n;

    // Create SVG
    const svg = d3.select('#correlationHeatmap')
        .append('svg')
        .attr('width', size)
        .attr('height', size)
        .attr('viewBox', `0 0 ${size} ${size}`)
        .style('max-width', '100%')
        .style('height', 'auto');

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Color scale: Red (negative) -> White (zero) -> Blue (positive)
    const colorScale = d3.scaleSequential()
        .domain([-1, 1])
        .interpolator(d3.interpolateRdBu);

    // Flatten matrix data for D3
    const data = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            data.push({
                row: i,
                col: j,
                value: matrix[i][j],
                rowSymbol: symbols[i],
                colSymbol: symbols[j],
                rowName: names[i],
                colName: names[j],
                isDiagonal: i === j
            });
        }
    }

    // Category color mapping for axis labels
    const categoryColors = {
        'equity': '#58a6ff',
        'fixed-income': '#d29922',
        'commodity': '#db6d28',
        'fx': '#3fb950',
        'volatility': '#f85149',
        'credit': '#a371f7'
    };

    // Draw cells
    g.selectAll('.corr-cell')
        .data(data)
        .join('rect')
        .attr('class', 'corr-cell')
        .attr('x', d => d.col * cellSize)
        .attr('y', d => d.row * cellSize)
        .attr('width', cellSize - 2)
        .attr('height', cellSize - 2)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('fill', d => {
            if (d.isDiagonal) return '#30363d';
            return colorScale(d.value);
        })
        .attr('stroke', 'none')
        .style('cursor', d => d.isDiagonal ? 'default' : 'pointer')
        .style('opacity', d => d.isDiagonal ? 0.6 : 1)
        .on('mouseenter', function(event, d) {
            if (d.isDiagonal) return;
            d3.select(this)
                .transition()
                .duration(100)
                .attr('stroke', '#e6edf3')
                .attr('stroke-width', 2);
            showHeatmapTooltip(event, d);
        })
        .on('mousemove', function(event, d) {
            if (d.isDiagonal) return;
            moveHeatmapTooltip(event);
        })
        .on('mouseleave', function(event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('stroke', 'none');
            hideHeatmapTooltip();
        });

    // Cell text values (correlation numbers)
    g.selectAll('.corr-text')
        .data(data)
        .join('text')
        .attr('class', 'corr-text')
        .attr('x', d => d.col * cellSize + cellSize / 2 - 1)
        .attr('y', d => d.row * cellSize + cellSize / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => {
            if (d.isDiagonal) return '#6e7681';
            // Use dark text on light backgrounds, light text on dark
            const absVal = Math.abs(d.value);
            if (absVal < 0.35) return '#e6edf3';
            return '#0d1117';
        })
        .attr('font-size', cellSize > 70 ? '12px' : '10px')
        .attr('font-weight', d => d.isDiagonal ? '400' : '600')
        .style('pointer-events', 'none')
        .text(d => d.value.toFixed(2));

    // Column labels (top)
    g.selectAll('.col-label')
        .data(assets)
        .join('text')
        .attr('class', 'col-label')
        .attr('x', (d, i) => i * cellSize + cellSize / 2 - 1)
        .attr('y', -12)
        .attr('text-anchor', 'middle')
        .attr('fill', d => categoryColors[d.category] || '#8b949e')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(d => d.symbol);

    // Column sub-labels (category)
    g.selectAll('.col-sublabel')
        .data(assets)
        .join('text')
        .attr('class', 'col-sublabel')
        .attr('x', (d, i) => i * cellSize + cellSize / 2 - 1)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('fill', '#6e7681')
        .attr('font-size', '9px')
        .text(d => d.name);

    // Row labels (left)
    g.selectAll('.row-label')
        .data(assets)
        .join('text')
        .attr('class', 'row-label')
        .attr('x', -12)
        .attr('y', (d, i) => i * cellSize + cellSize / 2 + 1)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', d => categoryColors[d.category] || '#8b949e')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text(d => d.symbol);
}

/**
 * Show the heatmap tooltip at the cursor position.
 */
function showHeatmapTooltip(event, d) {
    const tooltip = document.getElementById('heatmapTooltip');
    const pairEl = document.getElementById('tooltipPair');
    const valueEl = document.getElementById('tooltipValue');
    const labelEl = document.getElementById('tooltipLabel');

    pairEl.textContent = `${d.rowSymbol} / ${d.colSymbol}`;
    valueEl.textContent = d.value.toFixed(4);
    valueEl.style.color = d.value > 0 ? '#58a6ff' : d.value < 0 ? '#f85149' : '#e6edf3';

    // Contextual label
    const absVal = Math.abs(d.value);
    let strength;
    if (absVal > 0.7) strength = 'Strong';
    else if (absVal > 0.4) strength = 'Moderate';
    else if (absVal > 0.15) strength = 'Weak';
    else strength = 'Negligible';
    const direction = d.value > 0 ? 'Positive' : d.value < 0 ? 'Negative' : 'Zero';
    labelEl.textContent = `${strength} ${direction} Correlation`;

    // Get baseline comparison
    const key = getPairKey(d.rowSymbol, d.colSymbol);
    const baseline1Y = CORR_CONFIG.BASELINE_1Y[key];
    if (baseline1Y !== undefined) {
        const delta = d.value - baseline1Y;
        const deltaSign = delta >= 0 ? '+' : '';
        labelEl.textContent += ` | vs 1Y: ${deltaSign}${delta.toFixed(2)}`;
    }

    tooltip.classList.add('visible');
    moveHeatmapTooltip(event);
}

/**
 * Reposition the tooltip to follow the cursor.
 */
function moveHeatmapTooltip(event) {
    const tooltip = document.getElementById('heatmapTooltip');
    const x = event.clientX + 16;
    const y = event.clientY + 16;

    // Prevent overflow off right edge
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxX = window.innerWidth - tooltipRect.width - 20;
    const maxY = window.innerHeight - tooltipRect.height - 20;

    tooltip.style.left = Math.min(x, maxX) + 'px';
    tooltip.style.top = Math.min(y, maxY) + 'px';
}

/**
 * Hide the heatmap tooltip.
 */
function hideHeatmapTooltip() {
    document.getElementById('heatmapTooltip').classList.remove('visible');
}

// ============================================================
// Regime Detection
// ============================================================

/**
 * Detect regime changes by comparing the current correlation matrix
 * against historical baselines. Checks for:
 * - SPY-TLT sign flip (stock-bond correlation turning positive)
 * - VIX-SPY weakening (less negative than historical)
 * - DXY-EEM decoupling (less negative than historical)
 * - Any pair deviating > 0.3 from 1Y baseline
 *
 * @param {number[][]} currentMatrix - Current NxN correlation matrix
 * @returns {Object[]} Array of alert objects
 */
function detectRegimeChanges(currentMatrix) {
    const alerts = [];
    const symbols = CORR_CONFIG.ASSETS.map(a => a.symbol);
    const thresholds = CORR_CONFIG.REGIME_THRESHOLDS;

    // 1. SPY-TLT sign flip: historically negative, positive = regime break
    const spyTlt = getCorrelation(currentMatrix, 'SPY', 'TLT');
    const spyTltBaseline = CORR_CONFIG.BASELINE_1Y['SPY-TLT'];
    if (spyTlt > thresholds.SPY_TLT_FLIP) {
        alerts.push({
            pair: 'SPY-TLT',
            pairName: 'S&P 500 / 20Y Treasury',
            current: spyTlt,
            baseline: spyTltBaseline,
            type: 'Stock-Bond Correlation Flip',
            description: 'Stock-bond correlation has turned positive. Historically negative, this suggests both risk assets and safe havens are moving together - a potential sign of inflation-driven regime or liquidity crisis.',
            severity: Math.abs(spyTlt - spyTltBaseline) > thresholds.DEVIATION_SEVERE ? 'high' : 'moderate',
            direction: 'up'
        });
    }

    // 2. VIX-SPY weakening: less negative than threshold
    const vixSpy = getCorrelation(currentMatrix, 'SPY', 'VIX');
    const vixSpyBaseline = CORR_CONFIG.BASELINE_1Y['SPY-VIX'];
    if (vixSpy > thresholds.VIX_SPY_WEAKENING) {
        alerts.push({
            pair: 'SPY-VIX',
            pairName: 'S&P 500 / VIX',
            current: vixSpy,
            baseline: vixSpyBaseline,
            type: 'VIX-Equity Decoupling',
            description: 'VIX is less negatively correlated with equities than usual. This can indicate hedging demand is abnormally low or the vol surface is distorted. Tail risk may be underpriced.',
            severity: Math.abs(vixSpy - vixSpyBaseline) > thresholds.DEVIATION_SEVERE ? 'high' : 'moderate',
            direction: 'up'
        });
    }

    // 3. DXY-EEM decoupling: less negative than threshold
    const dxyEem = getCorrelation(currentMatrix, 'DXY', 'EEM');
    const dxyEemBaseline = CORR_CONFIG.BASELINE_1Y['DXY-EEM'];
    if (dxyEem > thresholds.DXY_EEM_DECOUPLING) {
        alerts.push({
            pair: 'DXY-EEM',
            pairName: 'Dollar Index / EM Equities',
            current: dxyEem,
            baseline: dxyEemBaseline,
            type: 'Dollar-EM Decoupling',
            description: 'EM equities are less sensitive to dollar strength than historical norms. May indicate capital flow shifts, local central bank intervention, or commodity-driven EM resilience.',
            severity: Math.abs(dxyEem - dxyEemBaseline) > thresholds.DEVIATION_SEVERE ? 'high' : 'moderate',
            direction: 'up'
        });
    }

    // 4. Scan all pairs for large deviations (> 0.3) from 1Y baseline
    for (let i = 0; i < symbols.length; i++) {
        for (let j = i + 1; j < symbols.length; j++) {
            const key = getPairKey(symbols[i], symbols[j]);
            const current = currentMatrix[i][j];
            const baseline = CORR_CONFIG.BASELINE_1Y[key];

            if (baseline === undefined) continue;

            const deviation = Math.abs(current - baseline);

            // Skip pairs already flagged above
            if (key === 'SPY-TLT' || key === 'SPY-VIX' || key === 'DXY-EEM') continue;

            if (deviation > 0.30) {
                const asset1 = CORR_CONFIG.ASSETS.find(a => a.symbol === symbols[i]);
                const asset2 = CORR_CONFIG.ASSETS.find(a => a.symbol === symbols[j]);
                const directionText = current > baseline ? 'more positive' : 'more negative';

                alerts.push({
                    pair: key,
                    pairName: `${asset1.name} / ${asset2.name}`,
                    current: current,
                    baseline: baseline,
                    type: 'Significant Deviation',
                    description: `Correlation is ${directionText} than 1Y average by ${deviation.toFixed(2)}. This pair has moved outside normal bounds and warrants monitoring.`,
                    severity: deviation > thresholds.DEVIATION_SEVERE ? 'high' : 'moderate',
                    direction: current > baseline ? 'up' : 'down'
                });
            }
        }
    }

    // Sort: high severity first, then by deviation magnitude
    alerts.sort((a, b) => {
        if (a.severity === 'high' && b.severity !== 'high') return -1;
        if (b.severity === 'high' && a.severity !== 'high') return 1;
        return Math.abs(b.current - b.baseline) - Math.abs(a.current - a.baseline);
    });

    // Cache alerts for index.html widget
    try {
        localStorage.setItem('qrd_corr_alerts', JSON.stringify(
            alerts.map(a => ({ pair: a.pair, type: a.type, severity: a.severity, message: `${a.type}: ${a.pairName}` }))
        ));
    } catch(e) { /* quota exceeded - non-critical */ }

    return alerts;
}

// ============================================================
// Regime Alerts Rendering
// ============================================================

/**
 * Render regime change alert cards into the alerts container.
 * Shows red-bordered cards for severe alerts, yellow for moderate,
 * and a green "All Normal" card if no alerts are detected.
 *
 * @param {Object[]} alerts - Array of alert objects from detectRegimeChanges
 */
function renderRegimeAlerts(alerts) {
    const container = document.getElementById('regimeAlerts');
    const countEl = document.getElementById('alertCount');

    if (!alerts || alerts.length === 0) {
        countEl.textContent = 'No alerts';
        container.innerHTML = `
            <div class="all-clear">
                <svg class="all-clear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <div class="all-clear-title">All Correlations Normal</div>
                <div class="all-clear-text">
                    No significant regime changes detected. All cross-asset correlations
                    are within historical norms for the current rolling window.
                </div>
            </div>
        `;
        return;
    }

    const highCount = alerts.filter(a => a.severity === 'high').length;
    const modCount = alerts.filter(a => a.severity === 'moderate').length;
    countEl.textContent = `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} (${highCount} severe, ${modCount} moderate)`;

    container.innerHTML = alerts.map(alert => {
        const severityClass = alert.severity === 'high' ? 'severity-high' : 'severity-moderate';
        const badgeClass = alert.severity === 'high' ? 'badge-high' : 'badge-moderate';
        const badgeText = alert.severity === 'high' ? 'SEVERE' : 'MODERATE';
        const directionClass = alert.direction === 'up' ? 'direction-up' : 'direction-down';
        const directionArrow = alert.direction === 'up' ? '&#9650;' : '&#9660;';
        const delta = alert.current - alert.baseline;
        const deltaSign = delta >= 0 ? '+' : '';

        return `
            <div class="alert-card ${severityClass}">
                <div class="alert-card-header">
                    <span class="alert-pair">${alert.pair}</span>
                    <span class="alert-severity-badge ${badgeClass}">${badgeText}</span>
                </div>
                <div class="alert-type">${alert.type}</div>
                <div class="alert-values">
                    <div class="alert-value-item">
                        <span class="alert-value-label">Current</span>
                        <span class="alert-value-num current">${alert.current.toFixed(3)}</span>
                    </div>
                    <div class="alert-value-item">
                        <span class="alert-value-label">1Y Baseline</span>
                        <span class="alert-value-num baseline">${alert.baseline.toFixed(3)}</span>
                    </div>
                    <div class="alert-value-item">
                        <span class="alert-value-label">Delta</span>
                        <span class="alert-value-num ${directionClass}">${deltaSign}${delta.toFixed(3)} ${directionArrow}</span>
                    </div>
                </div>
                <div class="alert-direction" style="margin-top: 8px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
                    ${alert.description}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// Comparison Table Rendering
// ============================================================

/**
 * Render the historical comparison table showing current correlation
 * values versus 1Y and 5Y averages, with color-coded deltas.
 *
 * @param {number[][]} currentMatrix - Current NxN correlation matrix
 */
function renderComparisonTable(currentMatrix) {
    const tbody = document.getElementById('comparisonBody');
    const symbols = CORR_CONFIG.ASSETS.map(a => a.symbol);

    const rows = CORR_CONFIG.KEY_PAIRS.map(pair => {
        const [s1, s2] = pair.split('-');
        const current = getCorrelation(currentMatrix, s1, s2);
        const baseline1Y = CORR_CONFIG.BASELINE_1Y[pair];
        const baseline5Y = CORR_CONFIG.BASELINE_5Y[pair];

        if (baseline1Y === undefined) return null;

        const delta1Y = current - baseline1Y;
        const delta5Y = current - (baseline5Y !== undefined ? baseline5Y : baseline1Y);
        const absDelta1Y = Math.abs(delta1Y);
        const absDelta5Y = Math.abs(delta5Y);

        return { pair, s1, s2, current, baseline1Y, baseline5Y, delta1Y, delta5Y, absDelta1Y, absDelta5Y };
    }).filter(Boolean);

    // Sort by absolute delta from 1Y (largest deviation first)
    rows.sort((a, b) => b.absDelta1Y - a.absDelta1Y);

    tbody.innerHTML = rows.map(row => {
        const delta1YClass = getDeltaClass(row.absDelta1Y);
        const delta5YClass = getDeltaClass(row.absDelta5Y);
        const delta1YSign = row.delta1Y >= 0 ? '+' : '';
        const delta5YSign = row.delta5Y >= 0 ? '+' : '';

        const asset1 = CORR_CONFIG.ASSETS.find(a => a.symbol === row.s1);
        const asset2 = CORR_CONFIG.ASSETS.find(a => a.symbol === row.s2);
        const pairLabel = `${row.s1}/${row.s2}`;

        return `
            <tr>
                <td class="pair-col" title="${asset1.name} vs ${asset2.name}">${pairLabel}</td>
                <td class="current-col">${row.current.toFixed(3)}</td>
                <td>${row.baseline1Y.toFixed(3)}</td>
                <td>${row.baseline5Y !== undefined ? row.baseline5Y.toFixed(3) : 'N/A'}</td>
                <td class="${delta1YClass}">${delta1YSign}${row.delta1Y.toFixed(3)}</td>
                <td class="${delta5YClass}">${delta5YSign}${row.delta5Y.toFixed(3)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Get the CSS class for a delta value based on magnitude thresholds.
 * Green if within 0.15, yellow if 0.15-0.30, red if >0.30.
 *
 * @param {number} absDelta - Absolute value of the delta
 * @returns {string} CSS class name
 */
function getDeltaClass(absDelta) {
    if (absDelta > 0.30) return 'delta-red';
    if (absDelta > 0.15) return 'delta-yellow';
    return 'delta-green';
}

// ============================================================
// Timeframe and Refresh Controls
// ============================================================

/**
 * Change the rolling window, recompute the matrix, and re-render
 * all components.
 *
 * @param {number} window - New rolling window (30, 60, or 90 days)
 */
function changeTimeframe(window) {
    corrState.currentWindow = window;

    // Update active button
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.window) === window);
    });

    // Recompute and re-render
    corrState.currentMatrix = calculateCorrelationMatrix(
        corrState.simulatedReturns,
        corrState.currentWindow
    );

    renderHeatmap(corrState.currentMatrix, corrState.assets);
    const alerts = detectRegimeChanges(corrState.currentMatrix);
    renderRegimeAlerts(alerts);
    renderComparisonTable(corrState.currentMatrix);
    updateWindowLabel(window);
}

/**
 * Refresh with entirely new simulated data.
 */
function refreshCorrelations() {
    // Flash the refresh button
    const btn = document.querySelector('.btn-refresh-corr');
    btn.style.borderColor = 'var(--accent-primary)';
    btn.style.color = 'var(--accent-primary)';
    setTimeout(() => {
        btn.style.borderColor = '';
        btn.style.color = '';
    }, 500);

    // Regenerate everything
    corrState.simulatedReturns = generateSimulatedReturns(250);
    corrState.currentMatrix = calculateCorrelationMatrix(
        corrState.simulatedReturns,
        corrState.currentWindow
    );

    renderHeatmap(corrState.currentMatrix, corrState.assets);
    const alerts = detectRegimeChanges(corrState.currentMatrix);
    renderRegimeAlerts(alerts);
    renderComparisonTable(corrState.currentMatrix);
}

/**
 * Update the window label in the heatmap section header.
 *
 * @param {number} window - Current window size
 */
function updateWindowLabel(window) {
    const label = document.getElementById('heatmapWindowLabel');
    if (label) {
        label.textContent = `${window}-Day Window`;
    }
}

// ============================================================
// Responsive Resize Handling
// ============================================================

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (corrState.currentMatrix) {
            renderHeatmap(corrState.currentMatrix, corrState.assets);
        }
    }, 250);
});

// ============================================================
// Boot
// ============================================================

document.addEventListener('DOMContentLoaded', initCorrelations);
