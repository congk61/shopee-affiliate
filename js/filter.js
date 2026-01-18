/**
 * ============================================
 * FILTER.JS - Shopee Affiliate Hub
 * Product and shop filtering logic
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Filter Manager Class
 */
class FilterManager {
    constructor() {
        this.activeFilters = {
            category: 'all',
            tier: 'all',
            minPrice: 0,
            maxPrice: Infinity,
            minDiscount: 0,
            minRating: 0,
            searchQuery: ''
        };
        this.listeners = [];
        this.filteredData = [];
        this.originalData = [];
    }
    
    /**
     * Initialize filters from URL params
     */
    initFromURL() {
        const params = Utils.getQueryParams();
        
        if (params.category) {
            this.activeFilters.category = params.category;
        }
        
        if (params.tier) {
            this.activeFilters.tier = params.tier;
        }
        
        if (params.minPrice) {
            this.activeFilters.minPrice = parseInt(params.minPrice, 10);
        }
        
        if (params.maxPrice) {
            this.activeFilters.maxPrice = parseInt(params.maxPrice, 10);
        }
        
        if (params.minDiscount) {
            this.activeFilters.minDiscount = parseInt(params.minDiscount, 10);
        }
        
        if (params.search) {
            this.activeFilters.searchQuery = decodeURIComponent(params.search);
        }
    }
    
    /**
     * Set category filter
     * @param {string} category - Category to filter by
     */
    setCategory(category) {
        this.activeFilters.category = category;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set tier filter
     * @param {string} tier - Tier to filter by
     */
    setTier(tier) {
        this.activeFilters.tier = tier;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set price range filter
     * @param {number} min - Minimum price
     * @param {number} max - Maximum price
     */
    setPriceRange(min, max) {
        this.activeFilters.minPrice = min;
        this.activeFilters.maxPrice = max;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set discount filter
     * @param {number} minDiscount - Minimum discount percentage
     */
    setMinDiscount(minDiscount) {
        this.activeFilters.minDiscount = minDiscount;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set search query
     * @param {string} query - Search query
     */
    setSearchQuery(query) {
        this.activeFilters.searchQuery = query;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set minimum rating filter
     * @param {number} rating - Minimum rating
     */
    setMinRating(rating) {
        this.activeFilters.minRating = rating;
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Apply all active filters
     */
    applyFilters() {
        if (this.originalData.length === 0) return;
        
        this.filteredData = this.originalData.filter(item => {
            // Category filter
            if (this.activeFilters.category !== 'all') {
                if (item.category !== this.activeFilters.category) {
                    return false;
                }
            }
            
            // Tier filter
            if (this.activeFilters.tier !== 'all') {
                if (item.tier !== this.activeFilters.tier) {
                    return false;
                }
            }
            
            // Price filter
            if (item.salePrice !== undefined) {
                if (item.salePrice < this.activeFilters.minPrice || 
                    item.salePrice > this.activeFilters.maxPrice) {
                    return false;
                }
            }
            
            // Discount filter
            if (item.discount !== undefined) {
                if (item.discount < this.activeFilters.minDiscount) {
                    return false;
                }
            }
            
            // Rating filter
            if (item.rating !== undefined) {
                if (parseFloat(item.rating) < this.activeFilters.minRating) {
                    return false;
                }
            }
            
            // Search filter
            if (this.activeFilters.searchQuery) {
                const searchFields = item.name ? ['name'] : 
                                   item.shopName ? ['shopName'] : [];
                if (searchFields.length > 0) {
                    const results = csvHandler.search([item], this.activeFilters.searchQuery, searchFields);
                    if (results.length === 0) {
                        return false;
                    }
                }
            }
            
            return true;
        });
    }
    
    /**
     * Reset all filters
     */
    resetFilters() {
        this.activeFilters = {
            category: 'all',
            tier: 'all',
            minPrice: 0,
            maxPrice: Infinity,
            minDiscount: 0,
            minRating: 0,
            searchQuery: ''
        };
        this.applyFilters();
        this.updateURL();
        this.notifyListeners();
    }
    
    /**
     * Set original data
     * @param {Array} data - Original data array
     */
    setData(data) {
        this.originalData = data;
        this.applyFilters();
    }
    
    /**
     * Get filtered data
     * @returns {Array} Filtered data
     */
    getFilteredData() {
        return this.filteredData;
    }
    
    /**
     * Get filter statistics
     * @returns {Object} Statistics about filters
     */
    getStatistics() {
        return {
            totalItems: this.originalData.length,
            filteredItems: this.filteredData.length,
            appliedFilters: this.getAppliedFiltersCount(),
            activeFilters: this.getActiveFilters()
        };
    }
    
    /**
     * Get number of applied filters
     * @returns {number} Count of applied filters
     */
    getAppliedFiltersCount() {
        let count = 0;
        
        if (this.activeFilters.category !== 'all') count++;
        if (this.activeFilters.tier !== 'all') count++;
        if (this.activeFilters.minPrice > 0) count++;
        if (this.activeFilters.maxPrice < Infinity) count++;
        if (this.activeFilters.minDiscount > 0) count++;
        if (this.activeFilters.minRating > 0) count++;
        if (this.activeFilters.searchQuery) count++;
        
        return count;
    }
    
    /**
     * Get active filters info
     * @returns {Object} Active filters
     */
    getActiveFilters() {
        const active = {};
        
        if (this.activeFilters.category !== 'all') {
            active.category = this.activeFilters.category;
        }
        if (this.activeFilters.tier !== 'all') {
            active.tier = this.activeFilters.tier;
        }
        if (this.activeFilters.minPrice > 0) {
            active.minPrice = this.activeFilters.minPrice;
        }
        if (this.activeFilters.maxPrice < Infinity) {
            active.maxPrice = this.activeFilters.maxPrice;
        }
        if (this.activeFilters.minDiscount > 0) {
            active.minDiscount = this.activeFilters.minDiscount;
        }
        if (this.activeFilters.searchQuery) {
            active.searchQuery = this.activeFilters.searchQuery;
        }
        
        return active;
    }
    
    /**
     * Update URL with current filters
     */
    updateURL() {
        const params = {};
        
        if (this.activeFilters.category !== 'all') {
            params.category = this.activeFilters.category;
        }
        
        if (this.activeFilters.tier !== 'all') {
            params.tier = this.activeFilters.tier;
        }
        
        if (this.activeFilters.minPrice > 0) {
            params.minPrice = this.activeFilters.minPrice;
        }
        
        if (this.activeFilters.maxPrice < Infinity) {
            params.maxPrice = this.activeFilters.maxPrice;
        }
        
        if (this.activeFilters.minDiscount > 0) {
            params.minDiscount = this.activeFilters.minDiscount;
        }
        
        if (this.activeFilters.searchQuery) {
            params.search = encodeURIComponent(this.activeFilters.searchQuery);
        }
        
        Utils.updateQueryParams(params);
    }
    
    /**
     * Subscribe to filter changes
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
                listener(this.filteredData, this.getStatistics());
            } catch (error) {
                console.error('Error in filter listener:', error);
            }
        });
    }
}

// Create global instance
const filterManager = new FilterManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FilterManager;
}