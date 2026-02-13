/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * D3.js Charts Module
 * Provides interactive visualizations for factor performance and volatility
 */

// =====================================================
// Chart Configuration
// =====================================================

const CHART_CONFIG = {
    colors: {
        primary: '#58a6ff',
        secondary: '#8b949e',
        positive: '#3fb950',
        negative: '#f85149',
        background: '#0d1117',
        grid: '#21262d',
        text: '#e6edf3'
    },
    factors: {
        'MKT-RF': '#58a6ff',
        'SMB': '#3fb950',
        'HML': '#d29922',
        'MOM': '#f85149',
        'RMW': '#a371f7',
        'CMA': '#79c0ff'
    }
};

/**
 * Create a line chart for factor cumulative returns
 */
function createFactorLineChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous chart
    container.innerHTML = '';

    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = (options.height || 300) - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const factors = Object.keys(data);
    if (factors.length === 0) return;

    // Get all dates and values
    const allDates = [];
    const allValues = [];

    factors.forEach(factor => {
        data[factor].forEach(d => {
            allDates.push(d.date);
            allValues.push(d.value);
        });
    });

    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(allDates))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(allValues) * 1.1, d3.max(allValues) * 1.1])
        .range([height, 0]);

    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .ticks(5)
            .tickSize(-height)
            .tickFormat(''))
        .style('stroke', CHART_CONFIG.colors.grid)
        .style('stroke-opacity', 0.3);

    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
            .ticks(5)
            .tickSize(-width)
            .tickFormat(''))
        .style('stroke', CHART_CONFIG.colors.grid)
        .style('stroke-opacity', 0.3);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .style('color', CHART_CONFIG.colors.secondary);

    svg.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`))
        .style('color', CHART_CONFIG.colors.secondary);

    // Create line generator
    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

    // Add lines for each factor
    factors.forEach((factor, i) => {
        const factorData = data[factor];
        const color = CHART_CONFIG.factors[factor] || CHART_CONFIG.colors.primary;

        // Add line
        svg.append('path')
            .datum(factorData)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('d', line)
            .attr('class', `line-${factor}`);

        // Add label at end
        const lastPoint = factorData[factorData.length - 1];
        svg.append('text')
            .attr('x', width + 5)
            .attr('y', yScale(lastPoint.value))
            .attr('fill', color)
            .attr('font-size', '11px')
            .attr('alignment-baseline', 'middle')
            .text(factor);
    });

    // Add zero line
    svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', CHART_CONFIG.colors.secondary)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.5);

    // Add tooltip
    const tooltip = d3.select(`#${containerId}`)
        .append('div')
        .attr('class', 'chart-tooltip')
        .style('opacity', 0);

    // Add hover line
    const hoverLine = svg.append('line')
        .attr('class', 'hover-line')
        .attr('y1', 0)
        .attr('y2', height)
        .style('stroke', CHART_CONFIG.colors.secondary)
        .style('stroke-width', 1)
        .style('opacity', 0);

    // Add hover area
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')
        .on('mousemove', function(event) {
            const [mx] = d3.pointer(event);
            const date = xScale.invert(mx);

            hoverLine
                .attr('x1', mx)
                .attr('x2', mx)
                .style('opacity', 1);

            // Find nearest values
            let tooltipContent = `<div class="tooltip-date">${d3.timeFormat('%b %d, %Y')(date)}</div>`;
            factors.forEach(factor => {
                const factorData = data[factor];
                const bisect = d3.bisector(d => d.date).left;
                const idx = bisect(factorData, date);
                if (idx < factorData.length) {
                    const val = factorData[idx].value;
                    const color = CHART_CONFIG.factors[factor] || CHART_CONFIG.colors.primary;
                    tooltipContent += `<div class="tooltip-row" style="color: ${color}">${factor}: ${val.toFixed(2)}%</div>`;
                }
            });

            tooltip
                .html(tooltipContent)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 10}px`)
                .style('opacity', 1);
        })
        .on('mouseleave', function() {
            hoverLine.style('opacity', 0);
            tooltip.style('opacity', 0);
        });
}

/**
 * Create a bar chart for factor returns comparison
 */
function createFactorBarChart(containerId, data, period = '1M') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare data
    const barData = Object.entries(data).map(([factor, returns]) => ({
        factor,
        value: returns[period] || 0,
        color: CHART_CONFIG.factors[factor] || CHART_CONFIG.colors.primary
    })).sort((a, b) => b.value - a.value);

    // Scales
    const xScale = d3.scaleBand()
        .domain(barData.map(d => d.factor))
        .range([0, width])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([
            Math.min(0, d3.min(barData, d => d.value) * 1.2),
            Math.max(0, d3.max(barData, d => d.value) * 1.2)
        ])
        .range([height, 0]);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .style('fill', CHART_CONFIG.colors.secondary);

    svg.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`))
        .style('color', CHART_CONFIG.colors.secondary);

    // Add bars
    svg.selectAll('.bar')
        .data(barData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.factor))
        .attr('width', xScale.bandwidth())
        .attr('y', d => d.value >= 0 ? yScale(d.value) : yScale(0))
        .attr('height', d => Math.abs(yScale(d.value) - yScale(0)))
        .attr('fill', d => d.value >= 0 ? CHART_CONFIG.colors.positive : CHART_CONFIG.colors.negative)
        .attr('rx', 3);

    // Add value labels
    svg.selectAll('.label')
        .data(barData)
        .enter()
        .append('text')
        .attr('class', 'bar-label')
        .attr('x', d => xScale(d.factor) + xScale.bandwidth() / 2)
        .attr('y', d => d.value >= 0 ? yScale(d.value) - 5 : yScale(d.value) + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_CONFIG.colors.text)
        .attr('font-size', '10px')
        .text(d => `${d.value >= 0 ? '+' : ''}${d.value.toFixed(1)}%`);
}

/**
 * Create a VIX term structure chart
 */
function createVIXTermStructureChart(containerId, futures) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const validFutures = futures.filter(f => f.price);
    if (validFutures.length < 2) {
        container.innerHTML = '<p class="no-data">Insufficient data</p>';
        return;
    }

    // Scales
    const xScale = d3.scaleBand()
        .domain(validFutures.map(d => d.label))
        .range([0, width])
        .padding(0.4);

    const yExtent = d3.extent(validFutures, d => d.price);
    const yPadding = (yExtent[1] - yExtent[0]) * 0.2;

    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
        .range([height, 0]);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .style('color', CHART_CONFIG.colors.secondary);

    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
        .style('color', CHART_CONFIG.colors.secondary);

    // Add line connecting points
    const line = d3.line()
        .x(d => xScale(d.label) + xScale.bandwidth() / 2)
        .y(d => yScale(d.price))
        .curve(d3.curveMonotoneX);

    svg.append('path')
        .datum(validFutures)
        .attr('fill', 'none')
        .attr('stroke', CHART_CONFIG.colors.primary)
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add points
    svg.selectAll('.point')
        .data(validFutures)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.price))
        .attr('r', 6)
        .attr('fill', (d, i) => i === 0 ? CHART_CONFIG.colors.positive : CHART_CONFIG.colors.primary)
        .attr('stroke', CHART_CONFIG.colors.background)
        .attr('stroke-width', 2);

    // Add value labels
    svg.selectAll('.price-label')
        .data(validFutures)
        .enter()
        .append('text')
        .attr('x', d => xScale(d.label) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.price) - 12)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_CONFIG.colors.text)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(d => d.price.toFixed(2));

    // Determine and display term structure
    const isContango = validFutures[1].price > validFutures[0].price;
    const structureLabel = isContango ? 'CONTANGO' : 'BACKWARDATION';
    const structureColor = isContango ? CHART_CONFIG.colors.positive : CHART_CONFIG.colors.negative;

    svg.append('text')
        .attr('x', width - 10)
        .attr('y', 15)
        .attr('text-anchor', 'end')
        .attr('fill', structureColor)
        .attr('font-size', '12px')
        .attr('font-weight', '700')
        .text(structureLabel);
}

/**
 * Create a heatmap for factor correlations
 */
function createCorrelationHeatmap(containerId, correlationMatrix) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const factors = Object.keys(correlationMatrix);
    const margin = { top: 50, right: 20, bottom: 20, left: 80 };
    const size = Math.min(container.clientWidth, 400);
    const width = size - margin.left - margin.right;
    const height = size - margin.top - margin.bottom;
    const cellSize = width / factors.length;

    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', size)
        .attr('height', size)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color scale
    const colorScale = d3.scaleLinear()
        .domain([-1, 0, 1])
        .range([CHART_CONFIG.colors.negative, '#21262d', CHART_CONFIG.colors.positive]);

    // Create cells
    factors.forEach((rowFactor, i) => {
        factors.forEach((colFactor, j) => {
            const value = correlationMatrix[rowFactor][colFactor];

            svg.append('rect')
                .attr('x', j * cellSize)
                .attr('y', i * cellSize)
                .attr('width', cellSize - 2)
                .attr('height', cellSize - 2)
                .attr('fill', colorScale(value))
                .attr('rx', 3);

            svg.append('text')
                .attr('x', j * cellSize + cellSize / 2)
                .attr('y', i * cellSize + cellSize / 2)
                .attr('text-anchor', 'middle')
                .attr('alignment-baseline', 'middle')
                .attr('fill', Math.abs(value) > 0.5 ? 'white' : CHART_CONFIG.colors.secondary)
                .attr('font-size', '10px')
                .text(value.toFixed(2));
        });
    });

    // Add labels
    svg.selectAll('.row-label')
        .data(factors)
        .enter()
        .append('text')
        .attr('x', -5)
        .attr('y', (d, i) => i * cellSize + cellSize / 2)
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('fill', CHART_CONFIG.colors.secondary)
        .attr('font-size', '11px')
        .text(d => d);

    svg.selectAll('.col-label')
        .data(factors)
        .enter()
        .append('text')
        .attr('x', (d, i) => i * cellSize + cellSize / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .attr('fill', CHART_CONFIG.colors.secondary)
        .attr('font-size', '11px')
        .text(d => d);
}

/**
 * Generate sample data for charts (when API unavailable)
 */
function generateSampleFactorData(days = 252) {
    const factors = ['MKT-RF', 'SMB', 'HML', 'MOM', 'RMW'];
    const data = {};

    const now = new Date();

    factors.forEach(factor => {
        data[factor] = [];
        let cumReturn = 0;

        // Factor-specific parameters
        const params = {
            'MKT-RF': { drift: 0.0003, vol: 0.01 },
            'SMB': { drift: 0.0001, vol: 0.008 },
            'HML': { drift: 0.0001, vol: 0.007 },
            'MOM': { drift: 0.0002, vol: 0.012 },
            'RMW': { drift: 0.0001, vol: 0.005 }
        };

        const p = params[factor] || { drift: 0.0001, vol: 0.01 };

        for (let i = days; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const dailyReturn = p.drift + p.vol * (Math.random() - 0.5) * 2;
            cumReturn += dailyReturn;

            data[factor].push({
                date: date,
                value: cumReturn * 100
            });
        }
    });

    return data;
}

/**
 * Generate sample correlation matrix
 */
function generateSampleCorrelations() {
    return {
        'MKT-RF': { 'MKT-RF': 1.00, 'SMB': 0.28, 'HML': -0.24, 'MOM': -0.13, 'RMW': -0.22 },
        'SMB': { 'MKT-RF': 0.28, 'SMB': 1.00, 'HML': -0.06, 'MOM': 0.02, 'RMW': -0.38 },
        'HML': { 'MKT-RF': -0.24, 'SMB': -0.06, 'HML': 1.00, 'MOM': -0.16, 'RMW': 0.08 },
        'MOM': { 'MKT-RF': -0.13, 'SMB': 0.02, 'HML': -0.16, 'MOM': 1.00, 'RMW': 0.11 },
        'RMW': { 'MKT-RF': -0.22, 'SMB': -0.38, 'HML': 0.08, 'MOM': 0.11, 'RMW': 1.00 }
    };
}

// Export functions
window.createFactorLineChart = createFactorLineChart;
window.createFactorBarChart = createFactorBarChart;
window.createVIXTermStructureChart = createVIXTermStructureChart;
window.createCorrelationHeatmap = createCorrelationHeatmap;
window.generateSampleFactorData = generateSampleFactorData;
window.generateSampleCorrelations = generateSampleCorrelations;
