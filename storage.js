/**
 * Quant Research Daily (QRD)
 * Copyright (c) 2025-2026 Zaid Annigeri
 * Licensed under the MIT License
 * https://github.com/zaid282802/Quant-Research-Daily--News-Aggregator
 */

/**
 * IndexedDB Storage Module
 * Provides larger storage capacity for news archive and factor data
 */

// =====================================================
// IndexedDB Configuration
// =====================================================

const DB_CONFIG = {
    name: 'QuantResearchDaily',
    version: 1,
    stores: {
        news: {
            name: 'news',
            keyPath: 'id',
            indexes: [
                { name: 'pubDate', keyPath: 'pubDate' },
                { name: 'category', keyPath: 'category' },
                { name: 'source', keyPath: 'source' },
                { name: 'fetchedAt', keyPath: 'fetchedAt' }
            ]
        },
        archive: {
            name: 'archive',
            keyPath: 'id',
            indexes: [
                { name: 'pubDate', keyPath: 'pubDate' },
                { name: 'archivedAt', keyPath: 'archivedAt' },
                { name: 'category', keyPath: 'category' }
            ]
        },
        factors: {
            name: 'factors',
            keyPath: 'date',
            indexes: [
                { name: 'factor', keyPath: 'factor' }
            ]
        },
        volatility: {
            name: 'volatility',
            keyPath: 'timestamp'
        },
        researchIdeas: {
            name: 'researchIdeas',
            keyPath: 'id',
            indexes: [
                { name: 'status', keyPath: 'status' },
                { name: 'savedAt', keyPath: 'savedAt' }
            ]
        },
        settings: {
            name: 'settings',
            keyPath: 'key'
        }
    }
};

let db = null;

/**
 * Initialize IndexedDB
 */
function initDB() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
            return;
        }

        const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB initialized successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create object stores
            for (const [key, config] of Object.entries(DB_CONFIG.stores)) {
                if (!database.objectStoreNames.contains(config.name)) {
                    const store = database.createObjectStore(config.name, {
                        keyPath: config.keyPath,
                        autoIncrement: config.autoIncrement || false
                    });

                    // Create indexes
                    if (config.indexes) {
                        config.indexes.forEach(index => {
                            store.createIndex(index.name, index.keyPath, {
                                unique: index.unique || false
                            });
                        });
                    }

                    console.log(`Created object store: ${config.name}`);
                }
            }
        };
    });
}

/**
 * Get a transaction for a store
 */
function getTransaction(storeName, mode = 'readonly') {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db.transaction(storeName, mode);
}

/**
 * Get an object store
 */
function getStore(storeName, mode = 'readonly') {
    const transaction = getTransaction(storeName, mode);
    return transaction.objectStore(storeName);
}

/**
 * Add or update an item
 */
async function putItem(storeName, item) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.put(item);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Add multiple items
 */
async function putItems(storeName, items) {
    await initDB();

    return new Promise((resolve, reject) => {
        const transaction = getTransaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);

        let completed = 0;
        const errors = [];

        items.forEach(item => {
            const request = store.put(item);
            request.onsuccess = () => {
                completed++;
                if (completed === items.length) {
                    resolve({ success: items.length - errors.length, errors });
                }
            };
            request.onerror = () => {
                errors.push(request.error);
                completed++;
                if (completed === items.length) {
                    resolve({ success: items.length - errors.length, errors });
                }
            };
        });

        if (items.length === 0) {
            resolve({ success: 0, errors: [] });
        }
    });
}

/**
 * Get an item by key
 */
async function getItem(storeName, key) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get all items from a store
 */
async function getAllItems(storeName) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get items by index
 */
async function getByIndex(storeName, indexName, value) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(value);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get items within a range
 */
async function getByRange(storeName, indexName, lower, upper) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const index = store.index(indexName);
        const range = IDBKeyRange.bound(lower, upper);
        const request = index.getAll(range);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete an item
 */
async function deleteItem(storeName, key) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Clear a store
 */
async function clearStore(storeName) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName, 'readwrite');
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

/**
 * Get store count
 */
async function getCount(storeName) {
    await initDB();

    return new Promise((resolve, reject) => {
        const store = getStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Delete old items (cleanup)
 */
async function deleteOldItems(storeName, indexName, maxAge) {
    await initDB();

    const cutoff = new Date(Date.now() - maxAge).toISOString();

    return new Promise((resolve, reject) => {
        const transaction = getTransaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const range = IDBKeyRange.upperBound(cutoff);

        const request = index.openCursor(range);
        let deleted = 0;

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                cursor.delete();
                deleted++;
                cursor.continue();
            } else {
                resolve(deleted);
            }
        };

        request.onerror = () => reject(request.error);
    });
}

// =====================================================
// High-Level Storage Functions
// =====================================================

/**
 * Save news to IndexedDB
 */
async function saveNewsToIDB(news) {
    return putItems('news', news);
}

/**
 * Get recent news from IndexedDB
 */
async function getRecentNewsFromIDB(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    return getByRange('news', 'pubDate', cutoff, new Date().toISOString());
}

/**
 * Archive news to IndexedDB
 */
async function archiveNewsToIDB(news) {
    const archiveItems = news.map(item => ({
        ...item,
        archivedAt: new Date().toISOString()
    }));
    return putItems('archive', archiveItems);
}

/**
 * Get archived news
 */
async function getArchivedNewsFromIDB(days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    return getByRange('archive', 'archivedAt', cutoff, new Date().toISOString());
}

/**
 * Save factor data
 */
async function saveFactorDataToIDB(factorData) {
    const items = [];
    for (const [factor, data] of Object.entries(factorData)) {
        items.push({
            date: new Date().toISOString().split('T')[0],
            factor,
            data,
            timestamp: Date.now()
        });
    }
    return putItems('factors', items);
}

/**
 * Save research idea
 */
async function saveResearchIdeaToIDB(idea) {
    const id = idea.id || `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return putItem('researchIdeas', { ...idea, id });
}

/**
 * Get all research ideas
 */
async function getResearchIdeasFromIDB() {
    return getAllItems('researchIdeas');
}

/**
 * Save setting
 */
async function saveSettingToIDB(key, value) {
    return putItem('settings', { key, value, updatedAt: Date.now() });
}

/**
 * Get setting
 */
async function getSettingFromIDB(key) {
    const item = await getItem('settings', key);
    return item ? item.value : null;
}

/**
 * Cleanup old data
 */
async function cleanupOldData() {
    const results = {};

    // Clean news older than 24 hours
    results.news = await deleteOldItems('news', 'fetchedAt', 24 * 60 * 60 * 1000);

    // Clean archive older than 30 days
    results.archive = await deleteOldItems('archive', 'archivedAt', 30 * 24 * 60 * 60 * 1000);

    console.log('Cleanup results:', results);
    return results;
}

/**
 * Get storage statistics
 */
async function getStorageStats() {
    const stats = {};

    for (const storeName of Object.keys(DB_CONFIG.stores)) {
        try {
            stats[storeName] = await getCount(storeName);
        } catch (e) {
            stats[storeName] = 0;
        }
    }

    // Get IndexedDB size estimate
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        stats.totalSize = estimate.usage;
        stats.quota = estimate.quota;
        stats.usagePercent = ((estimate.usage / estimate.quota) * 100).toFixed(2);
    }

    return stats;
}

// =====================================================
// Fallback to localStorage
// =====================================================

/**
 * Hybrid storage - tries IndexedDB first, falls back to localStorage
 */
const hybridStorage = {
    async get(key) {
        try {
            const value = await getSettingFromIDB(key);
            if (value !== null) return value;
        } catch (e) {
            console.warn('IndexedDB get failed, using localStorage:', e);
        }

        // Fallback to localStorage
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    },

    async set(key, value) {
        // Try IndexedDB
        try {
            await saveSettingToIDB(key, value);
        } catch (e) {
            console.warn('IndexedDB set failed, using localStorage:', e);
        }

        // Also save to localStorage as backup
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('localStorage set failed:', e);
        }
    },

    async remove(key) {
        try {
            await deleteItem('settings', key);
        } catch (e) {
            console.warn('IndexedDB delete failed:', e);
        }
        localStorage.removeItem(key);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    initDB().then(() => {
        console.log('IndexedDB ready');
        // Run cleanup
        cleanupOldData();
    }).catch(err => {
        console.warn('IndexedDB initialization failed, using localStorage fallback:', err);
    });
});

// Export functions
window.initDB = initDB;
window.hybridStorage = hybridStorage;
window.saveNewsToIDB = saveNewsToIDB;
window.getRecentNewsFromIDB = getRecentNewsFromIDB;
window.archiveNewsToIDB = archiveNewsToIDB;
window.getArchivedNewsFromIDB = getArchivedNewsFromIDB;
window.saveFactorDataToIDB = saveFactorDataToIDB;
window.saveResearchIdeaToIDB = saveResearchIdeaToIDB;
window.getResearchIdeasFromIDB = getResearchIdeasFromIDB;
window.getStorageStats = getStorageStats;
window.cleanupOldData = cleanupOldData;
