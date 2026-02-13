/**
 * Academic Paper Tracker for QRD
 * Fetches arXiv q-fin papers via RSS
 */

// =====================================================
// Configuration
// =====================================================

const PAPER_CONFIG = {
    RSS_API: 'https://api.rss2json.com/v1/api.json?rss_url=',

    // arXiv q-fin subcategory feeds
    FEEDS: {
        'q-fin': { url: 'https://rss.arxiv.org/rss/q-fin', name: 'Quantitative Finance (All)' },
        'q-fin.ST': { url: 'https://rss.arxiv.org/rss/q-fin.ST', name: 'Statistical Finance' },
        'q-fin.CP': { url: 'https://rss.arxiv.org/rss/q-fin.CP', name: 'Computational Finance' },
        'q-fin.RM': { url: 'https://rss.arxiv.org/rss/q-fin.RM', name: 'Risk Management' },
        'q-fin.TR': { url: 'https://rss.arxiv.org/rss/q-fin.TR', name: 'Trading & Microstructure' },
        'q-fin.PM': { url: 'https://rss.arxiv.org/rss/q-fin.PM', name: 'Portfolio Management' },
        'q-fin.MF': { url: 'https://rss.arxiv.org/rss/q-fin.MF', name: 'Mathematical Finance' },
        'stat.ML': { url: 'https://rss.arxiv.org/rss/stat.ML', name: 'Machine Learning' }
    },

    // Subcategory metadata for rendering
    SUBCATEGORIES: {
        'q-fin.ST': { name: 'Statistical Finance', cssClass: 'subcat-sf', template: 'factor' },
        'q-fin.CP': { name: 'Computational Finance', cssClass: 'subcat-cp', template: 'factor' },
        'q-fin.RM': { name: 'Risk Management', cssClass: 'subcat-rm', template: 'risk' },
        'q-fin.TR': { name: 'Trading & Microstructure', cssClass: 'subcat-tr', template: 'commodity' },
        'q-fin.PM': { name: 'Portfolio Management', cssClass: 'subcat-pm', template: 'factor' },
        'q-fin.MF': { name: 'Mathematical Finance', cssClass: 'subcat-mf', template: 'risk' },
        'q-fin.GN': { name: 'General Finance', cssClass: 'subcat-gn', template: 'macro' },
        'stat.ML': { name: 'Machine Learning', cssClass: 'subcat-ml', template: 'factor' }
    },

    // Watched authors (key researchers in quant finance)
    WATCHED_AUTHORS: [
        'Cartea', 'Avellaneda', 'Lopez de Prado', 'López de Prado',
        'Bryan Kelly', 'Cont', 'Bouchaud', 'Gatheral',
        'Novy-Marx', 'Asness', 'Frazzini', 'Pedersen'
    ],

    // Subcategory to backtest template mapping
    TEMPLATE_MAP: {
        'q-fin.ST': 'factor',      // Statistical Finance -> Factor Strategy
        'q-fin.TR': 'commodity',    // Trading -> Walk-forward
        'q-fin.RM': 'risk',        // Risk Management -> VaR
        'q-fin.PM': 'factor',      // Portfolio Mgmt -> Factor Strategy
        'q-fin.CP': 'macro',       // Computational -> Macro Signal
        'q-fin.MF': 'risk',        // Math Finance -> Risk
        'q-fin.GN': 'macro',       // General -> Macro Signal
        'stat.ML': 'factor'        // ML -> Factor Strategy
    },

    STORAGE_KEY: 'qrd_papers_cache',
    IDEAS_STORAGE_KEY: 'qrd_research_ideas',
    CACHE_DURATION: 60 * 60 * 1000, // 1 hour
};

// =====================================================
// State Management
// =====================================================

let paperState = {
    papers: [],
    filteredPapers: [],
    currentSubcategory: 'all',
    searchTerm: '',
    watchedOnly: false,
    dateFilter: '',
    isLoading: false,
    backtestPaper: null  // paper currently in backtest modal
};

// =====================================================
// Initialization
// =====================================================

/**
 * Initialize the papers page on DOMContentLoaded.
 * Tries cache first, then fetches from arXiv if stale or missing.
 */
function initPapers() {
    setupEventListeners();

    // Try loading from cache
    try {
        const cached = localStorage.getItem(PAPER_CONFIG.STORAGE_KEY);
        if (cached) {
            const cacheData = JSON.parse(cached);
            if (cacheData && cacheData.papers && cacheData.timestamp) {
                const age = Date.now() - cacheData.timestamp;
                if (age < PAPER_CONFIG.CACHE_DURATION) {
                    paperState.papers = cacheData.papers;
                    paperState.filteredPapers = [...cacheData.papers];
                    renderPapers(paperState.papers);
                    updateStats();
                    // Background refresh after 5 seconds
                    setTimeout(() => fetchAllPapers(), 5000);
                    return;
                }
            }
        }
    } catch (e) {
        console.warn('Papers cache read failed:', e);
    }

    // No valid cache, fetch fresh
    fetchAllPapers();
}

// =====================================================
// Event Listeners
// =====================================================

function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('paperSearch');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                paperState.searchTerm = searchInput.value.trim().toLowerCase();
                filterPapers();
            }, 250);
        });
    }

    // Subcategory dropdown filter
    const subcatSelect = document.getElementById('subcategoryFilter');
    if (subcatSelect) {
        subcatSelect.addEventListener('change', () => {
            paperState.currentSubcategory = subcatSelect.value;
            syncFilterChips(subcatSelect.value);
            filterPapers();
        });
    }

    // Date filter
    const dateInput = document.getElementById('dateFilter');
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            paperState.dateFilter = dateInput.value;
            filterPapers();
        });
    }

    // Watched-only toggle
    const watchedToggle = document.getElementById('watchedToggle');
    if (watchedToggle) {
        watchedToggle.addEventListener('click', () => {
            paperState.watchedOnly = !paperState.watchedOnly;
            watchedToggle.classList.toggle('active', paperState.watchedOnly);
            filterPapers();
        });
    }

    // Filter chips (subcategory pills)
    const filterChipsContainer = document.getElementById('filterChips');
    if (filterChipsContainer) {
        filterChipsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.filter-chip');
            if (!chip) return;

            const filterValue = chip.dataset.filter;
            paperState.currentSubcategory = filterValue;

            // Update active state
            filterChipsContainer.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Sync dropdown
            const subcatSelect = document.getElementById('subcategoryFilter');
            if (subcatSelect) subcatSelect.value = filterValue;

            filterPapers();
        });
    }

    // Close backtest modal on overlay click
    const modal = document.getElementById('backtestModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeBacktestModal();
        });
    }

    // Keyboard shortcut: Escape closes modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeBacktestModal();
    });
}

/**
 * Sync filter chips with dropdown selection.
 */
function syncFilterChips(value) {
    const container = document.getElementById('filterChips');
    if (!container) return;
    container.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === value);
    });
}

// =====================================================
// Data Fetching
// =====================================================

/**
 * Fetch a single arXiv feed via RSS API.
 * @param {string} feedKey - Key from PAPER_CONFIG.FEEDS
 * @returns {Promise<Array>} Parsed paper objects
 */
async function fetchPapers(feedKey) {
    const feed = PAPER_CONFIG.FEEDS[feedKey];
    if (!feed) return [];

    try {
        const apiUrl = `${PAPER_CONFIG.RSS_API}${encodeURIComponent(feed.url)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            console.warn(`Feed ${feedKey} returned status ${response.status}`);
            return [];
        }

        const data = await response.json();
        if (data.status !== 'ok' || !data.items || !Array.isArray(data.items)) {
            console.warn(`Feed ${feedKey} returned invalid data`);
            return [];
        }

        return data.items.map(item => parsePaper(item, feedKey));
    } catch (error) {
        console.warn(`Failed to fetch ${feedKey}:`, error.message);
        return [];
    }
}

/**
 * Fetch the main q-fin feed, parse results, and deduplicate.
 * Uses the main q-fin feed (which includes all subcategories).
 */
async function fetchAllPapers() {
    if (paperState.isLoading) return;
    paperState.isLoading = true;

    // Update UI to loading state
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.classList.add('loading');

    const grid = document.getElementById('papersGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-papers">
                <div class="loading-spinner-papers"></div>
                <p>Fetching papers from arXiv...</p>
            </div>
        `;
    }

    const allPapers = [];

    // Fetch main q-fin feed (contains all subcategories)
    const mainPapers = await fetchPapers('q-fin');
    allPapers.push(...mainPapers);

    // Also fetch stat.ML separately since it is a different category
    const mlPapers = await fetchPapers('stat.ML');
    allPapers.push(...mlPapers);

    // Deduplicate by paper ID (arXiv URL)
    const seen = new Set();
    const deduplicated = [];
    for (const paper of allPapers) {
        if (!seen.has(paper.id)) {
            seen.add(paper.id);
            deduplicated.push(paper);
        }
    }

    // Sort: watched authors first, then by date (newest first)
    deduplicated.sort((a, b) => {
        if (a.isWatchedAuthor && !b.isWatchedAuthor) return -1;
        if (!a.isWatchedAuthor && b.isWatchedAuthor) return 1;
        return new Date(b.pubDate) - new Date(a.pubDate);
    });

    // Update state
    paperState.papers = deduplicated;
    paperState.filteredPapers = [...deduplicated];
    paperState.isLoading = false;

    // Remove loading class
    if (refreshBtn) refreshBtn.classList.remove('loading');

    // Cache results
    try {
        localStorage.setItem(PAPER_CONFIG.STORAGE_KEY, JSON.stringify({
            papers: deduplicated,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Papers cache write failed:', e);
    }

    // Render
    filterPapers();
    updateStats();

    showToast(`Loaded ${deduplicated.length} papers from arXiv`, 'success');
}

// =====================================================
// Parsing
// =====================================================

/**
 * Parse an RSS item into a structured paper object.
 * @param {Object} item - RSS item from rss2json
 * @param {string} feedKey - Feed key for subcategory detection
 * @returns {Object} Parsed paper object
 */
function parsePaper(item, feedKey) {
    const title = stripHtml(item.title || 'Untitled');
    const authors = item.author || item.creator || '';
    const authorsArray = parseAuthors(authors);
    const abstract = stripHtml(item.description || item.content || '').substring(0, 600);
    const link = item.link || '';
    const pubDate = item.pubDate || new Date().toISOString();
    const subcategory = detectSubcategory(item, feedKey);
    const watchedAuthor = isWatchedAuthor(authors);
    const matchedAuthors = getMatchedAuthors(authors);

    // Create a stable ID from the arXiv URL
    const id = link.replace(/https?:\/\/arxiv\.org\/abs\//, '').replace(/[^a-zA-Z0-9.]/g, '');

    return {
        id: id || `paper-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title,
        authors,
        authorsArray,
        abstract,
        link,
        pubDate,
        subcategory,
        isWatchedAuthor: watchedAuthor,
        matchedAuthors,
        savedToIdeas: isPaperSaved(link)
    };
}

/**
 * Parse author string into array.
 */
function parseAuthors(authorsString) {
    if (!authorsString || authorsString.trim() === '') return ['Unknown'];
    return authorsString
        .split(/,(?![^()]*\))|\band\b/i)
        .map(a => a.trim())
        .filter(a => a.length > 0 && a !== 'and');
}

/**
 * Detect subcategory from item content and feed key.
 */
function detectSubcategory(item, feedKey) {
    // If fetched from a specific subcategory feed, use that
    if (feedKey !== 'q-fin' && PAPER_CONFIG.SUBCATEGORIES[feedKey]) {
        return feedKey;
    }
    if (feedKey === 'stat.ML') return 'stat.ML';

    // Try to detect from arXiv category tags in content
    const content = item.content || item.description || '';
    for (const subcat of Object.keys(PAPER_CONFIG.SUBCATEGORIES)) {
        if (content.includes(subcat)) return subcat;
    }

    // Keyword-based detection from title and description
    const text = `${item.title} ${item.description || ''}`.toLowerCase();

    if (/trading|microstructure|order book|execution|market making|bid.?ask|limit order/i.test(text)) return 'q-fin.TR';
    if (/risk|var\b|cvar|expected shortfall|stress test|tail risk|drawdown/i.test(text)) return 'q-fin.RM';
    if (/portfolio|allocation|mean.?variance|optimization|rebalanc/i.test(text)) return 'q-fin.PM';
    if (/numerical|monte carlo|finite|pde|computation|simulation|calibrat/i.test(text)) return 'q-fin.CP';
    if (/stochastic|martingale|ito|sde|measure|brownian|diffusion/i.test(text)) return 'q-fin.MF';
    if (/factor|momentum|anomaly|cross.?section|regression|alpha|signal/i.test(text)) return 'q-fin.ST';
    if (/machine learning|neural|deep learning|reinforcement|lstm|transformer/i.test(text)) return 'stat.ML';

    return 'q-fin.GN';
}

// =====================================================
// Author Matching
// =====================================================

/**
 * Check if any author matches the WATCHED_AUTHORS list.
 * @param {string} authorsString - Comma-separated author string
 * @returns {boolean}
 */
function isWatchedAuthor(authorsString) {
    if (!authorsString) return false;
    const lower = authorsString.toLowerCase();
    return PAPER_CONFIG.WATCHED_AUTHORS.some(watched =>
        lower.includes(watched.toLowerCase())
    );
}

/**
 * Return which watched authors appear in the author string.
 * @param {string} authorsString - Comma-separated author string
 * @returns {Array<string>} Matched watched author names
 */
function getMatchedAuthors(authorsString) {
    if (!authorsString) return [];
    const lower = authorsString.toLowerCase();
    return PAPER_CONFIG.WATCHED_AUTHORS.filter(watched =>
        lower.includes(watched.toLowerCase())
    );
}

// =====================================================
// Rendering
// =====================================================

/**
 * Render paper cards into the grid.
 * @param {Array} papers - Array of paper objects to render
 */
function renderPapers(papers) {
    const grid = document.getElementById('papersGrid');
    if (!grid) return;

    if (!papers || papers.length === 0) {
        grid.innerHTML = `
            <div class="empty-papers">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    <path d="M8 7h6M8 11h8"/>
                </svg>
                <h3>No papers found</h3>
                <p>Try adjusting your filters, changing the subcategory, or refreshing to fetch the latest papers from arXiv.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = papers.map((paper, idx) => createPaperCard(paper, idx)).join('');
}

/**
 * Create HTML for a single paper card.
 * @param {Object} paper - Paper object
 * @param {number} idx - Index in the current filtered list
 * @returns {string} HTML string
 */
function createPaperCard(paper, idx) {
    const subcatInfo = PAPER_CONFIG.SUBCATEGORIES[paper.subcategory] || {
        name: 'General Finance',
        cssClass: 'subcat-gn',
        template: 'macro'
    };

    const templateKey = PAPER_CONFIG.TEMPLATE_MAP[paper.subcategory] || 'macro';

    // Build author HTML with watched author highlighting
    const authorsHtml = paper.authorsArray.map(author => {
        const isMatched = PAPER_CONFIG.WATCHED_AUTHORS.some(w =>
            author.toLowerCase().includes(w.toLowerCase())
        );
        if (isMatched) {
            return `<span class="author-watched">${escapeHtml(author)}</span>`;
        }
        return escapeHtml(author);
    }).join(', ');

    // Check if already saved
    const isSaved = isPaperSaved(paper.link);
    const saveClass = isSaved ? 'save-btn saved' : 'save-btn';
    const saveLabel = isSaved ? 'Saved' : 'Save to Ideas';
    const saveIcon = isSaved
        ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

    // Watched badge
    const watchedBadgeHtml = paper.isWatchedAuthor
        ? `<span class="watched-badge">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                   <circle cx="12" cy="12" r="3"/>
               </svg>
               Watched
           </span>`
        : '';

    return `
        <div class="paper-card ${paper.isWatchedAuthor ? 'watched-author' : ''}">
            <div class="paper-card-header">
                <span class="paper-subcategory ${subcatInfo.cssClass}">${subcatInfo.name}</span>
                ${watchedBadgeHtml}
            </div>
            <div class="paper-title">
                <a href="${escapeHtml(paper.link)}" target="_blank" rel="noopener">${escapeHtml(paper.title)}</a>
            </div>
            <div class="paper-authors">${authorsHtml}</div>
            <div class="paper-abstract">${escapeHtml(paper.abstract)}</div>
            <div class="paper-footer">
                <span class="paper-date">${formatDate(paper.pubDate)}</span>
                <div class="paper-actions">
                    <button class="paper-btn ${saveClass}" onclick="savePaperToIdeas(${idx})" ${isSaved ? 'disabled' : ''}>
                        ${saveIcon}
                        ${saveLabel}
                    </button>
                    <button class="paper-btn backtest-btn" onclick="generateBacktest(${idx})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                        </svg>
                        Generate Backtest
                    </button>
                </div>
            </div>
        </div>
    `;
}

// =====================================================
// Filtering
// =====================================================

/**
 * Apply all active filters (search, subcategory, date, watched-only)
 * and re-render the papers grid.
 */
function filterPapers() {
    let filtered = [...paperState.papers];

    // Subcategory filter
    if (paperState.currentSubcategory && paperState.currentSubcategory !== 'all') {
        filtered = filtered.filter(p => p.subcategory === paperState.currentSubcategory);
    }

    // Search filter
    if (paperState.searchTerm) {
        const term = paperState.searchTerm;
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.authors.toLowerCase().includes(term) ||
            p.abstract.toLowerCase().includes(term)
        );
    }

    // Date filter
    if (paperState.dateFilter) {
        const filterDate = new Date(paperState.dateFilter);
        filterDate.setHours(0, 0, 0, 0);
        filtered = filtered.filter(p => {
            const paperDate = new Date(p.pubDate);
            paperDate.setHours(0, 0, 0, 0);
            return paperDate >= filterDate;
        });
    }

    // Watched-only filter
    if (paperState.watchedOnly) {
        filtered = filtered.filter(p => p.isWatchedAuthor);
    }

    paperState.filteredPapers = filtered;
    renderPapers(filtered);
    updateStats();
}

// =====================================================
// Stats
// =====================================================

/**
 * Update the stats bar with current counts.
 */
function updateStats() {
    const totalEl = document.getElementById('totalPapersCount');
    const watchedEl = document.getElementById('watchedPapersCount');
    const savedEl = document.getElementById('savedIdeasCount');

    if (totalEl) {
        totalEl.textContent = paperState.filteredPapers.length;
    }

    if (watchedEl) {
        const watchedCount = paperState.papers.filter(p => p.isWatchedAuthor).length;
        watchedEl.textContent = watchedCount;
    }

    if (savedEl) {
        try {
            const ideas = JSON.parse(localStorage.getItem(PAPER_CONFIG.IDEAS_STORAGE_KEY) || '[]');
            const arxivCount = ideas.filter(i => i.link && i.link.includes('arxiv')).length;
            savedEl.textContent = arxivCount;
        } catch (e) {
            savedEl.textContent = '0';
        }
    }
}

// =====================================================
// Actions: Save to Ideas
// =====================================================

/**
 * Save a paper to the qrd_research_ideas localStorage.
 * @param {number} idx - Index of the paper in the filteredPapers array
 */
function savePaperToIdeas(idx) {
    const paper = paperState.filteredPapers[idx];
    if (!paper) {
        showToast('Paper not found', 'warning');
        return;
    }

    let ideas;
    try {
        ideas = JSON.parse(localStorage.getItem(PAPER_CONFIG.IDEAS_STORAGE_KEY) || '[]');
    } catch (e) {
        ideas = [];
    }

    // Check for duplicates
    if (ideas.some(i => i.link === paper.link)) {
        showToast('This paper is already saved to research ideas', 'warning');
        return;
    }

    // Build the research idea entry
    const idea = {
        id: `paper-${Date.now()}`,
        title: paper.title,
        link: paper.link,
        savedAt: new Date().toISOString(),
        source: 'arXiv',
        category: 'academic',
        notes: [
            `Authors: ${paper.authors}`,
            `Subcategory: ${paper.subcategory}`,
            `Watched Authors: ${paper.matchedAuthors.length > 0 ? paper.matchedAuthors.join(', ') : 'None'}`,
            '',
            `Abstract: ${paper.abstract.substring(0, 400)}${paper.abstract.length > 400 ? '...' : ''}`
        ].join('\n'),
        hypothesis: '',
        status: 'new',
        backtestTemplate: PAPER_CONFIG.TEMPLATE_MAP[paper.subcategory] || 'macro'
    };

    ideas.unshift(idea);
    localStorage.setItem(PAPER_CONFIG.IDEAS_STORAGE_KEY, JSON.stringify(ideas));

    // Update paper state
    paper.savedToIdeas = true;

    // Re-render to show saved state
    filterPapers();

    showToast('Saved to research ideas!', 'success');
}

/**
 * Check if a paper is already saved to ideas.
 * @param {string} link - arXiv link
 * @returns {boolean}
 */
function isPaperSaved(link) {
    if (!link) return false;
    try {
        const ideas = JSON.parse(localStorage.getItem(PAPER_CONFIG.IDEAS_STORAGE_KEY) || '[]');
        return ideas.some(i => i.link === link);
    } catch (e) {
        return false;
    }
}

// =====================================================
// Actions: Generate Backtest
// =====================================================

/**
 * Open the backtest modal for a paper, showing template suggestion.
 * @param {number} idx - Index of the paper in the filteredPapers array
 */
function generateBacktest(idx) {
    const paper = paperState.filteredPapers[idx];
    if (!paper) return;

    paperState.backtestPaper = paper;

    const subcatInfo = PAPER_CONFIG.SUBCATEGORIES[paper.subcategory] || {
        name: 'General Finance',
        template: 'macro'
    };
    const templateKey = PAPER_CONFIG.TEMPLATE_MAP[paper.subcategory] || 'macro';

    // Get template info from backtest-templates.js if available
    let templateName = templateKey.charAt(0).toUpperCase() + templateKey.slice(1) + ' Strategy';
    let templateDesc = 'Generate a backtest skeleton based on this paper.';

    if (typeof BACKTEST_TEMPLATES !== 'undefined' && BACKTEST_TEMPLATES[templateKey]) {
        const tpl = BACKTEST_TEMPLATES[templateKey];
        templateName = tpl.name || templateName;
        templateDesc = tpl.description || templateDesc;
    }

    const body = document.getElementById('backtestModalBody');
    if (body) {
        body.innerHTML = `
            <div class="backtest-info">
                <div class="backtest-info-row">
                    <span class="label">Paper</span>
                    <span class="value" style="max-width: 300px; text-align: right;">${escapeHtml(paper.title.substring(0, 60))}${paper.title.length > 60 ? '...' : ''}</span>
                </div>
                <div class="backtest-info-row">
                    <span class="label">Subcategory</span>
                    <span class="value">${subcatInfo.name}</span>
                </div>
                <div class="backtest-info-row">
                    <span class="label">Suggested Template</span>
                    <span class="value" style="color: var(--accent-purple);">${escapeHtml(templateName)}</span>
                </div>
                <div class="backtest-info-row">
                    <span class="label">Template Key</span>
                    <span class="value" style="font-family: var(--font-mono); font-size: 0.75rem;">${templateKey}</span>
                </div>
            </div>
            <p style="font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5;">
                ${escapeHtml(templateDesc)}
            </p>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: var(--spacing-sm);">
                This will save the paper to your Research Ideas with the suggested template pre-selected. You can then generate the Python backtest code from the Research Ideas page.
            </p>
        `;
    }

    // Show modal
    const modal = document.getElementById('backtestModal');
    if (modal) modal.classList.add('visible');
}

/**
 * Close the backtest modal.
 */
function closeBacktestModal() {
    const modal = document.getElementById('backtestModal');
    if (modal) modal.classList.remove('visible');
    paperState.backtestPaper = null;
}

/**
 * Save the paper from the backtest modal to ideas, then close.
 */
function saveBacktestToIdeas() {
    const paper = paperState.backtestPaper;
    if (!paper) return;

    // Find the paper index in filteredPapers
    const idx = paperState.filteredPapers.findIndex(p => p.id === paper.id);
    if (idx !== -1) {
        savePaperToIdeas(idx);
    } else {
        // Save directly if not in filtered list
        let ideas;
        try {
            ideas = JSON.parse(localStorage.getItem(PAPER_CONFIG.IDEAS_STORAGE_KEY) || '[]');
        } catch (e) {
            ideas = [];
        }

        if (!ideas.some(i => i.link === paper.link)) {
            const templateKey = PAPER_CONFIG.TEMPLATE_MAP[paper.subcategory] || 'macro';
            ideas.unshift({
                id: `paper-${Date.now()}`,
                title: paper.title,
                link: paper.link,
                savedAt: new Date().toISOString(),
                source: 'arXiv',
                category: 'academic',
                notes: `Authors: ${paper.authors}\nSubcategory: ${paper.subcategory}\n\nAbstract: ${paper.abstract.substring(0, 400)}...`,
                hypothesis: '',
                status: 'new',
                backtestTemplate: templateKey
            });
            localStorage.setItem(PAPER_CONFIG.IDEAS_STORAGE_KEY, JSON.stringify(ideas));
            showToast('Saved to research ideas with backtest template!', 'success');
            filterPapers();
        } else {
            showToast('Already saved to research ideas', 'warning');
        }
    }

    closeBacktestModal();
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Strip HTML tags from a string.
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Escape HTML special characters for safe rendering.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format a date string for display.
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Unknown date';
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return 'Unknown date';
    }
}

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {string} type - 'success', 'info', or 'warning'
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('papersToast');
    if (!toast) return;

    // Clear any existing timeout
    if (toast._hideTimeout) clearTimeout(toast._hideTimeout);

    toast.textContent = message;
    toast.className = 'papers-toast visible ' + type;

    toast._hideTimeout = setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

// =====================================================
// DOMContentLoaded
// =====================================================

document.addEventListener('DOMContentLoaded', initPapers);
