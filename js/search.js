/**
 * ============================================
 * SEARCH.JS - Shopee Affiliate Hub
 * Search functionality and handlers
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Search Manager Class
 */
class SearchManager {
    constructor() {
        this.searchIndex = [];
        this.recentSearches = [];
        this.searchResults = [];
        this.isSearching = false;
        this.listeners = [];
        this.debouncedSearch = Utils.debounce(
            this.performSearch.bind(this),
            CONFIG.search.debounceDelay
        );
        this.loadRecentSearches();
    }
    
    /**
     * Initialize search functionality
     * @param {Array} data - Data to index
     * @param {string} type - Type of data ('products' or 'shops')
     */
    initSearch(data, type = 'products') {
        this.buildSearchIndex(data, type);
        console.log(`[SearchManager] Index built with ${this.searchIndex.length} items`);
    }
    
    /**
     * Build search index
     * @param {Array} data - Data to index
     * @param {string} type - Type of data
     */
    buildSearchIndex(data, type = 'products') {
        this.searchIndex = data.map(item => {
            const searchFields = type === 'products' 
                ? [item.name, item.category, item.shopName]
                : [item.name, item.category, item.type];
            
            return {
                id: item.id,
                type: type,
                name: item.name,
                category: item.category,
                normalizedName: Utils.normalizeVietnamese(item.name),
                normalizedCategory: Utils.normalizeVietnamese(item.category || ''),
                originalData: item,
                searchText: searchFields
                    .filter(Boolean)
                    .map(field => Utils.normalizeVietnamese(field))
                    .join(' ')
            };
        });
    }
    
    /**
     * Perform search
     * @param {string} query - Search query
     * @returns {Array} Search results
     */
    performSearch(query) {
        if (!query || query.length < CONFIG.search.minQueryLength) {
            this.searchResults = [];
            this.notifyListeners();
            return [];
        }
        
        this.isSearching = true;
        const normalizedQuery = Utils.normalizeVietnamese(query);
        
        // Score-based search
        const scoredResults = this.searchIndex
            .map(item => ({
                ...item,
                score: this.calculateSearchScore(normalizedQuery, item)
            }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, CONFIG.search.maxResults)
            .map(({ score, ...rest }) => rest);
        
        this.searchResults = scoredResults;
        this.isSearching = false;
        
        this.notifyListeners();
        this.addToRecentSearches(query);
        
        return scoredResults;
    }
    
    /**
     * Debounced search
     * @param {string} query - Search query
     */
    search(query) {
        this.debouncedSearch(query);
    }
    
    /**
     * Calculate search score
     * @param {string} query - Normalized query
     * @param {Object} item - Search index item
     * @returns {number} Search score
     */
    calculateSearchScore(query, item) {
        let score = 0;
        
        // Exact match in name
        if (item.normalizedName === query) {
            score += 100;
        }
        
        // Name starts with query
        if (item.normalizedName.startsWith(query)) {
            score += 50;
        }
        
        // Name contains query
        if (item.normalizedName.includes(query)) {
            score += 30;
        }
        
        // Search text contains query
        if (item.searchText.includes(query)) {
            score += 15;
        }
        
        // Word match in search text
        const words = item.searchText.split(' ');
        const matchedWords = words.filter(word => word.startsWith(query)).length;
        score += matchedWords * 10;
        
        return score;
    }
    
    /**
     * Add search to recent searches
     * @param {string} query - Search query
     */
    addToRecentSearches(query) {
        if (!query || query.length < CONFIG.search.minQueryLength) return;
        
        // Remove duplicate
        this.recentSearches = this.recentSearches.filter(s => s.query !== query);
        
        // Add to beginning
        this.recentSearches.unshift({
            query: query,
            timestamp: Date.now()
        });
        
        // Keep only last 10
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        // Save to storage
        this.saveRecentSearches();
    }
    
    /**
     * Get recent searches
     * @returns {Array} Recent searches
     */
    getRecentSearches() {
        return this.recentSearches;
    }
    
    /**
     * Load recent searches from storage
     */
    loadRecentSearches() {
        const stored = Utils.getStorage(CONFIG.storage.keys.recentSearches);
        if (Array.isArray(stored)) {
            this.recentSearches = stored;
        }
    }
    
    /**
     * Save recent searches to storage
     */
    saveRecentSearches() {
        Utils.setStorage(CONFIG.storage.keys.recentSearches, this.recentSearches);
    }
    
    /**
     * Clear recent searches
     */
    clearRecentSearches() {
        this.recentSearches = [];
        Utils.removeStorage(CONFIG.storage.keys.recentSearches);
        this.notifyListeners();
    }
    
    /**
     * Remove specific search from recent
     * @param {string} query - Search query to remove
     */
    removeRecentSearch(query) {
        this.recentSearches = this.recentSearches.filter(s => s.query !== query);
        this.saveRecentSearches();
        this.notifyListeners();
    }
    
    /**
     * Get search results
     * @returns {Array} Search results
     */
    getResults() {
        return this.searchResults;
    }
    
    /**
     * Get search results count
     * @returns {number} Results count
     */
    getResultsCount() {
        return this.searchResults.length;
    }
    
    /**
     * Clear search results
     */
    clearResults() {
        this.searchResults = [];
        this.notifyListeners();
    }
    
    /**
     * Subscribe to search changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }
    
    /**
     * Notify all listeners
     */
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener({
                    results: this.searchResults,
                    count: this.searchResults.length,
                    recentSearches: this.recentSearches,
                    isSearching: this.isSearching
                });
            } catch (error) {
                console.error('Error in search listener:', error);
            }
        });
    }
}

// Create global instance
const searchManager = new SearchManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchManager;
}