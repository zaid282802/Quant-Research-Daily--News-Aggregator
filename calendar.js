/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * Economic Calendar Module for QRD
 * Fed Speaker Schedule, FOMC Countdown, OpEx Calendar
 */

// =====================================================
// Fed Speakers Data (Current FOMC Members 2026)
// =====================================================

const FED_SPEAKERS = [
    { name: 'Jerome Powell', role: 'Chair', stance: 'neutral', weight: 10, votes: true },
    { name: 'John Williams', role: 'Vice Chair (NY Fed)', stance: 'neutral', weight: 9, votes: true },
    { name: 'Michael Barr', role: 'Vice Chair Supervision', stance: 'dove', weight: 8, votes: true },
    { name: 'Michelle Bowman', role: 'Governor', stance: 'hawk', weight: 7, votes: true },
    { name: 'Lisa Cook', role: 'Governor', stance: 'dove', weight: 7, votes: true },
    { name: 'Philip Jefferson', role: 'Governor', stance: 'neutral', weight: 7, votes: true },
    { name: 'Adriana Kugler', role: 'Governor', stance: 'dove', weight: 7, votes: true },
    { name: 'Christopher Waller', role: 'Governor', stance: 'hawk', weight: 8, votes: true },
    { name: 'Raphael Bostic', role: 'Atlanta Fed', stance: 'neutral', weight: 5, votes: false },
    { name: 'Mary Daly', role: 'San Francisco Fed', stance: 'dove', weight: 5, votes: false },
    { name: 'Austan Goolsbee', role: 'Chicago Fed', stance: 'dove', weight: 5, votes: false },
    { name: 'Patrick Harker', role: 'Philadelphia Fed', stance: 'neutral', weight: 5, votes: false },
    { name: 'Neel Kashkari', role: 'Minneapolis Fed', stance: 'hawk', weight: 5, votes: false },
    { name: 'Alberto Musalem', role: 'St. Louis Fed', stance: 'hawk', weight: 5, votes: false },
    { name: 'Jeffrey Schmid', role: 'Kansas City Fed', stance: 'hawk', weight: 5, votes: false },
];

// =====================================================
// FOMC Meeting Dates 2026
// =====================================================

const FOMC_DATES = [
    new Date(2026, 0, 28),  // Jan 28
    new Date(2026, 2, 18),  // Mar 18
    new Date(2026, 4, 6),   // May 6
    new Date(2026, 5, 17),  // Jun 17
    new Date(2026, 6, 29),  // Jul 29
    new Date(2026, 8, 16),  // Sep 16
    new Date(2026, 10, 4),  // Nov 4
    new Date(2026, 11, 16)  // Dec 16
];

// =====================================================
// Key Economic Event Definitions
// =====================================================

const KEY_EVENTS = {
    NFP: { name: 'Non-Farm Payrolls', dayOfMonth: 'firstFriday', impact: 'high' },
    CPI: { name: 'CPI Release', dayOfMonth: 12, impact: 'high' },
    FOMC: { name: 'FOMC Decision', dates: FOMC_DATES, impact: 'critical' },
};

// =====================================================
// OpEx Dates 2026 (3rd Friday of each month)
// =====================================================

const OPEX_DATES_2026 = [
    new Date(2026, 0, 16),  // Jan
    new Date(2026, 1, 20),  // Feb
    new Date(2026, 2, 20),  // Mar - Quad Witching
    new Date(2026, 3, 17),  // Apr
    new Date(2026, 4, 15),  // May
    new Date(2026, 5, 19),  // Jun - Quad Witching
    new Date(2026, 6, 17),  // Jul
    new Date(2026, 7, 21),  // Aug
    new Date(2026, 8, 18),  // Sep - Quad Witching
    new Date(2026, 9, 16),  // Oct
    new Date(2026, 10, 20), // Nov
    new Date(2026, 11, 18)  // Dec - Quad Witching
];

const QUAD_WITCHING_MONTHS = [2, 5, 8, 11]; // Mar, Jun, Sep, Dec (0-indexed)

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// =====================================================
// Utility Functions
// =====================================================

/**
 * Get the next FOMC meeting date after today
 * @returns {{ date: Date, index: number } | null}
 */
function getNextFOMC() {
    const now = new Date();
    for (let i = 0; i < FOMC_DATES.length; i++) {
        if (FOMC_DATES[i] > now) {
            return { date: FOMC_DATES[i], index: i };
        }
    }
    return null;
}

/**
 * Get the first Friday of a given month/year
 * @param {number} year
 * @param {number} month - 0-indexed
 * @returns {Date}
 */
function getFirstFriday(year, month) {
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay();
    // Friday is day 5. Calculate days until first Friday.
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    return new Date(year, month, 1 + daysUntilFriday);
}

/**
 * Get the next OpEx date after today
 * @returns {{ date: Date, month: number, isQuadWitching: boolean } | null}
 */
function getNextOpEx() {
    const now = new Date();
    for (let i = 0; i < OPEX_DATES_2026.length; i++) {
        if (OPEX_DATES_2026[i] > now) {
            return {
                date: OPEX_DATES_2026[i],
                month: i,
                isQuadWitching: QUAD_WITCHING_MONTHS.includes(i)
            };
        }
    }
    return null;
}

/**
 * Get the next NFP (Non-Farm Payrolls) date - first Friday of next relevant month
 * @returns {{ date: Date, name: string } | null}
 */
function getNextNFP() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    // Check current month and up to 3 months ahead
    for (let i = 0; i < 4; i++) {
        const firstFriday = getFirstFriday(year, month);
        if (firstFriday > now) {
            return { date: firstFriday, name: 'Non-Farm Payrolls' };
        }
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
    }
    return null;
}

/**
 * Get the next CPI release date (approximated as the 12th of each month)
 * @returns {{ date: Date, name: string } | null}
 */
function getNextCPI() {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth();

    for (let i = 0; i < 4; i++) {
        const cpiDate = new Date(year, month, 12);
        if (cpiDate > now) {
            return { date: cpiDate, name: 'CPI Release' };
        }
        month++;
        if (month > 11) {
            month = 0;
            year++;
        }
    }
    return null;
}

/**
 * Format a date as a human-readable string
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format a date as a short string
 * @param {Date} date
 * @returns {string}
 */
function formatDateShort(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Calculate days between now and a future date
 * @param {Date} futureDate
 * @returns {number}
 */
function daysUntil(futureDate) {
    const now = new Date();
    const diff = futureDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// =====================================================
// FOMC Countdown Renderer
// =====================================================

/**
 * Render the FOMC countdown timer with live seconds
 */
function renderFOMCCountdown() {
    const nextFomc = getNextFOMC();

    if (!nextFomc) {
        document.getElementById('fomcDate').textContent = 'No upcoming meetings scheduled';
        document.getElementById('countDays').textContent = '--';
        document.getElementById('countHours').textContent = '--';
        document.getElementById('countMinutes').textContent = '--';
        document.getElementById('countSeconds').textContent = '--';
        return;
    }

    const now = new Date();
    const diff = nextFomc.date - now;

    if (diff <= 0) {
        document.getElementById('fomcDate').textContent = 'FOMC meeting in progress!';
        document.getElementById('countDays').textContent = '0';
        document.getElementById('countHours').textContent = '00';
        document.getElementById('countMinutes').textContent = '00';
        document.getElementById('countSeconds').textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('fomcDate').textContent = nextFomc.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('countDays').textContent = days;
    document.getElementById('countHours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('countMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('countSeconds').textContent = seconds.toString().padStart(2, '0');
}

// =====================================================
// Fed Speakers Renderer
// =====================================================

/**
 * Render the grid of FOMC member cards
 */
function renderFedSpeakers() {
    const grid = document.getElementById('speakerGrid');
    if (!grid) return;

    // Sort: voting members first, then by weight descending
    const sorted = [...FED_SPEAKERS].sort((a, b) => {
        if (a.votes !== b.votes) return b.votes - a.votes;
        return b.weight - a.weight;
    });

    grid.innerHTML = sorted.map(speaker => {
        const stanceEmoji = speaker.stance === 'hawk' ? '\u{1F985}' :
                           speaker.stance === 'dove' ? '\u{1F54A}\uFE0F' :
                           '\u{2696}\uFE0F';

        const weightPercent = (speaker.weight / 10) * 100;

        return `
            <div class="speaker-card ${speaker.stance}">
                <div class="speaker-header">
                    <div class="speaker-name">${speaker.name}</div>
                    <span class="speaker-emoji" title="${speaker.stance}">${stanceEmoji}</span>
                </div>
                <div class="speaker-role">${speaker.role}</div>
                <div class="speaker-meta">
                    <span class="speaker-stance ${speaker.stance}">${speaker.stance.toUpperCase()}</span>
                    ${speaker.votes ? '<span class="speaker-voter-badge">VOTER</span>' : ''}
                </div>
                <div class="speaker-weight-bar">
                    <div class="speaker-weight-fill ${speaker.stance}" style="width: ${weightPercent}%"></div>
                </div>
                <div class="speaker-weight-label">Influence: ${speaker.weight}/10</div>
            </div>
        `;
    }).join('');
}

// =====================================================
// OpEx Calendar Renderer
// =====================================================

/**
 * Render the 12-month options expiration grid
 */
function renderOpExCalendar() {
    const grid = document.getElementById('opexGrid');
    if (!grid) return;

    const now = new Date();
    const nextOpEx = getNextOpEx();

    grid.innerHTML = OPEX_DATES_2026.map((date, index) => {
        const isPast = date < now;
        const isQuadWitching = QUAD_WITCHING_MONTHS.includes(index);
        const isNextUpcoming = nextOpEx && nextOpEx.month === index;
        const days = daysUntil(date);

        let classes = 'opex-item';
        if (isPast) classes += ' past';
        if (isQuadWitching) classes += ' quad-witching';
        if (isNextUpcoming && !isPast) classes += ' next-upcoming';

        let labelHtml = '';
        if (isQuadWitching) {
            labelHtml += '<div class="opex-label quad">QUAD WITCHING</div>';
        }
        if (isNextUpcoming && !isPast) {
            labelHtml += '<div class="opex-label next">NEXT UP</div>';
        }

        let daysHtml = '';
        if (!isPast) {
            daysHtml = `<div class="opex-days-until">${days}d away</div>`;
        }

        return `
            <div class="${classes}">
                <div class="opex-month">${MONTH_NAMES[index]}</div>
                <div class="opex-date">${formatDateShort(date)}</div>
                ${labelHtml}
                ${daysHtml}
            </div>
        `;
    }).join('');
}

// =====================================================
// Next Events Strip Renderer
// =====================================================

/**
 * Render countdown cards for next: FOMC, NFP, CPI, OpEx
 */
function renderNextEvents() {
    const strip = document.getElementById('nextEventsStrip');
    if (!strip) return;

    const events = [];

    // Next FOMC
    const nextFomc = getNextFOMC();
    if (nextFomc) {
        events.push({
            name: 'FOMC',
            icon: '\u{1F3DB}\uFE0F',
            iconClass: 'fomc',
            date: nextFomc.date,
            days: daysUntil(nextFomc.date)
        });
    }

    // Next NFP
    const nextNfp = getNextNFP();
    if (nextNfp) {
        events.push({
            name: 'NFP',
            icon: '\u{1F4CA}',
            iconClass: 'nfp',
            date: nextNfp.date,
            days: daysUntil(nextNfp.date)
        });
    }

    // Next CPI
    const nextCpi = getNextCPI();
    if (nextCpi) {
        events.push({
            name: 'CPI',
            icon: '\u{1F4B0}',
            iconClass: 'cpi',
            date: nextCpi.date,
            days: daysUntil(nextCpi.date)
        });
    }

    // Next OpEx
    const nextOpExDate = getNextOpEx();
    if (nextOpExDate) {
        const label = nextOpExDate.isQuadWitching ? 'OPEX (QUAD)' : 'OPEX';
        events.push({
            name: label,
            icon: '\u{1F4C6}',
            iconClass: 'opex',
            date: nextOpExDate.date,
            days: daysUntil(nextOpExDate.date)
        });
    }

    // Sort by soonest first
    events.sort((a, b) => a.days - b.days);

    strip.innerHTML = events.map(event => {
        const daysText = event.days === 0 ? 'TODAY' :
                        event.days === 1 ? 'Tomorrow' :
                        `${event.days} days away`;

        return `
            <div class="next-event-card">
                <div class="next-event-icon ${event.iconClass}">${event.icon}</div>
                <div class="next-event-details">
                    <div class="next-event-name">${event.name}</div>
                    <div class="next-event-date">${formatDateShort(event.date)}</div>
                    <div class="next-event-countdown">${daysText}</div>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================================
// TradingView Calendar Widget
// =====================================================

/**
 * Initialize the TradingView Economic Calendar embed
 */
function initTradingViewCalendar() {
    const container = document.getElementById('tvCalendarWidget');
    if (!container) return;

    container.innerHTML = `
        <iframe src="https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importanceFilter%22%3A%22012%22%2C%22countryFilter%22%3A%22us%2Ceu%2Cgb%2Cjp%2Ccn%22%7D"
            style="width: 100%; height: 500px; border: none;">
        </iframe>
    `;
}

// =====================================================
// Initialization
// =====================================================

/**
 * Initialize all calendar sections on page load
 */
function initCalendar() {
    console.log('[Calendar] Initializing Economic Calendar module...');

    // Render all sections
    renderFOMCCountdown();
    renderFedSpeakers();
    renderOpExCalendar();
    renderNextEvents();
    initTradingViewCalendar();

    // Live countdown update every second for FOMC timer
    setInterval(renderFOMCCountdown, 1000);

    // Refresh next events strip every minute
    setInterval(renderNextEvents, 60000);

    console.log('[Calendar] Initialization complete.');
}

// Old standalone init removed — merged into extended init below

// =====================================================
// Global Central Bank Calendar
// =====================================================

const GLOBAL_CB_DATA = [
    { name: 'Federal Reserve', code: 'FED', flag: '🇺🇸', rate: '4.50%', trend: 'hold',
      meetings: [new Date(2026,0,28), new Date(2026,2,18), new Date(2026,4,6), new Date(2026,5,17), new Date(2026,6,29), new Date(2026,8,16), new Date(2026,10,4), new Date(2026,11,16)] },
    { name: 'ECB', code: 'ECB', flag: '🇪🇺', rate: '2.75%', trend: 'cut',
      meetings: [new Date(2026,0,30), new Date(2026,2,12), new Date(2026,3,16), new Date(2026,5,4), new Date(2026,6,16), new Date(2026,8,10), new Date(2026,9,22), new Date(2026,11,10)] },
    { name: 'Bank of Japan', code: 'BOJ', flag: '🇯🇵', rate: '0.50%', trend: 'hike',
      meetings: [new Date(2026,0,24), new Date(2026,2,14), new Date(2026,4,1), new Date(2026,5,16), new Date(2026,6,15), new Date(2026,8,17), new Date(2026,9,29), new Date(2026,11,18)] },
    { name: 'Bank of England', code: 'BOE', flag: '🇬🇧', rate: '4.50%', trend: 'cut',
      meetings: [new Date(2026,1,6), new Date(2026,2,20), new Date(2026,4,8), new Date(2026,5,19), new Date(2026,7,6), new Date(2026,8,18), new Date(2026,10,5), new Date(2026,11,17)] },
    { name: 'RBA', code: 'RBA', flag: '🇦🇺', rate: '4.10%', trend: 'cut',
      meetings: [new Date(2026,1,17), new Date(2026,3,7), new Date(2026,4,19), new Date(2026,6,7), new Date(2026,7,11), new Date(2026,9,6), new Date(2026,10,3), new Date(2026,11,1)] },
    { name: 'Bank of Canada', code: 'BOC', flag: '🇨🇦', rate: '3.00%', trend: 'hold',
      meetings: [new Date(2026,0,29), new Date(2026,2,12), new Date(2026,3,16), new Date(2026,5,4), new Date(2026,6,16), new Date(2026,8,3), new Date(2026,9,22), new Date(2026,11,10)] },
    { name: 'RBNZ', code: 'RBNZ', flag: '🇳🇿', rate: '4.25%', trend: 'cut',
      meetings: [new Date(2026,1,19), new Date(2026,3,9), new Date(2026,4,28), new Date(2026,6,9), new Date(2026,7,13), new Date(2026,9,8), new Date(2026,10,26)] },
    { name: 'Riksbank', code: 'RIKS', flag: '🇸🇪', rate: '2.50%', trend: 'hold',
      meetings: [new Date(2026,0,29), new Date(2026,2,26), new Date(2026,4,7), new Date(2026,5,24), new Date(2026,8,3), new Date(2026,10,5), new Date(2026,11,17)] },
    { name: 'SNB', code: 'SNB', flag: '🇨🇭', rate: '0.50%', trend: 'hold',
      meetings: [new Date(2026,2,20), new Date(2026,5,19), new Date(2026,8,25), new Date(2026,11,11)] },
    { name: 'PBoC', code: 'PBOC', flag: '🇨🇳', rate: '3.10%', trend: 'cut',
      meetings: [new Date(2026,0,20), new Date(2026,1,20), new Date(2026,2,20), new Date(2026,3,20), new Date(2026,4,20), new Date(2026,5,20), new Date(2026,6,20), new Date(2026,7,20), new Date(2026,8,20), new Date(2026,9,20), new Date(2026,10,20), new Date(2026,11,20)] }
];

function renderGlobalCBCalendar() {
    const container = document.getElementById('globalCBCalendar');
    if (!container) return;

    const now = new Date();

    const rows = GLOBAL_CB_DATA.map(cb => {
        const nextMeeting = cb.meetings.find(d => d > now);
        const nextStr = nextMeeting ? nextMeeting.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD';
        const daysUntil = nextMeeting ? Math.ceil((nextMeeting - now) / 86400000) : '—';

        const trendColor = cb.trend === 'hike' ? 'var(--accent-red)' :
                          cb.trend === 'cut' ? 'var(--accent-green)' : 'var(--text-muted)';
        const trendIcon = cb.trend === 'hike' ? '&#9650;' : cb.trend === 'cut' ? '&#9660;' : '&#8594;';
        const urgencyClass = daysUntil <= 7 ? 'cb-urgent' : daysUntil <= 14 ? 'cb-soon' : '';

        return `<tr class="${urgencyClass}">
            <td>${cb.flag} ${cb.code}</td>
            <td>${cb.rate} <span style="color:${trendColor};font-size:0.75rem;">${trendIcon}</span></td>
            <td>${nextStr}</td>
            <td style="font-family:var(--font-mono);font-size:0.8125rem;">${daysUntil}d</td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <table class="cb-calendar-table">
            <thead><tr><th>Bank</th><th>Rate</th><th>Next</th><th>In</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

function initCalendarExtended() {
    renderGlobalCBCalendar();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    initCalendarExtended();
});
