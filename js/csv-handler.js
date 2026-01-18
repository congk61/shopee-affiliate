/**
 * ============================================
 * CSV-HANDLER.JS - Shopee Affiliate Hub
 * CSV file parsing and data processing
 * Version: 1.0.0 - COMPLETE VERSION
 * ============================================
 */

'use strict';

/**
 * CSV Handler Class
 * Handles CSV file loading, parsing, and data processing
 */
class CSVHandler {
    
    constructor() {
        this.cache = new Map();
        this.isLoading = false;
    }
    
    /**
     * Load and parse CSV file
     * @param {string} filePath - Path to CSV file
     * @param {Object} options - PapaParse options
     * @returns {Promise<Array>} Parsed data array
     */
    async loadCSV(filePath, options = {}) {
        // Check cache first
        if (this.cache.has(filePath)) {
            console.log(`[CSVHandler] Using cached data for: ${filePath}`);
            return this.cache.get(filePath);
        }
        
        this.isLoading = true;
        
        const defaultOptions = {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
            transform: (value) => {
                if (typeof value === 'string') {
                    return value.trim();
                }
                return value;
            }
        };
        
        const parseOptions = { ...defaultOptions, ...options };
        
        return new Promise((resolve, reject) => {
            Papa.parse(filePath, {
                download: true,
                ...parseOptions,
                complete: (results) => {
                    this.isLoading = false;
                    
                    if (results.errors.length > 0) {
                        console.warn('[CSVHandler] Parse warnings:', results.errors);
                    }
                    
                    // Clean and validate data
                    const cleanedData = this.cleanData(results.data);
                    
                    // Cache the results
                    this.cache.set(filePath, cleanedData);
                    
                    console.log(`[CSVHandler] Loaded ${cleanedData.length} records from: ${filePath}`);
                    resolve(cleanedData);
                },
                error: (error) => {
                    this.isLoading = false;
                    console.error('[CSVHandler] Error loading CSV:', error);
                    reject(error);
                }
            });
        });
    }
    
    /**
     * Clean and validate parsed data
     * @param {Array} data - Raw parsed data
     * @returns {Array} Cleaned data
     */
    cleanData(data) {
        return data
            .filter(row => {
                // Remove empty rows
                if (!row || typeof row !== 'object') return false;
                
                // Check if row has any non-empty values
                const values = Object.values(row);
                return values.some(v => v !== null && v !== undefined && v !== '');
            })
            .map((row, index) => {
                // Add unique ID if not present
                if (!row.id) {
                    row.id = `item_${index + 1}`;
                }
                return row;
            });
    }
    
    /**
     * Process shop data
     * @param {Array} data - Raw shop data
     * @returns {Object} Processed shop data with categories
     */
    processShopData(data) {
        const processed = {
            all: [],
            highEnd: [],    // n1
            budget: [],     // n2
            mixed: [],      // n3
            byCategory: {},
            byTier: {}
        };
        
        // Initialize category and tier maps
        Object.keys(CONFIG.categories).forEach(key => {
            processed.byCategory[key] = [];
        });
        
        Object.keys(CONFIG.tiers).forEach(key => {
            processed.byTier[key] = [];
        });
        
        data.forEach(shop => {
            // Normalize shop data
            const normalizedShop = this.normalizeShopData(shop);
            
            // Add to all
            processed.all.push(normalizedShop);
            
            // Categorize by tier
            const tier = (normalizedShop.tier || '').toLowerCase().trim();
            switch (tier) {
                case 'n1':
                    processed.highEnd.push(normalizedShop);
                    processed.byTier.n1 = processed.byTier.n1 || [];
                    processed.byTier.n1.push(normalizedShop);
                    break;
                case 'n2':
                    processed.budget.push(normalizedShop);
                    processed.byTier.n2 = processed.byTier.n2 || [];
                    processed.byTier.n2.push(normalizedShop);
                    break;
                case 'n3':
                    processed.mixed.push(normalizedShop);
                    processed.byTier.n3 = processed.byTier.n3 || [];
                    processed.byTier.n3.push(normalizedShop);
                    break;
                default:
                    // Default to mixed
                    processed.mixed.push(normalizedShop);
            }
            
            // Categorize by category
            const category = (normalizedShop.category || '').toLowerCase().trim();
            if (processed.byCategory[category]) {
                processed.byCategory[category].push(normalizedShop);
            }
        });
        
        return processed;
    }
    
    /**
     * Normalize shop data
     * @param {Object} shop - Raw shop data
     * @returns {Object} Normalized shop data
     */
    normalizeShopData(shop) {
        const rating = this.parseRating(shop.rating);
        
        return {
            id: shop.id || Utils.generateId(),
            name: shop.shop_name || 'Unknown Shop',
            category: (shop.category || '').toLowerCase().trim(),
            type: shop.shop_type || 'Cửa hàng chính thức',
            rating: rating,
            logo: shop.logo_url || CONFIG.defaultImages.shop,
            link: shop.affiliate_link || '#',
            tier: (shop.tier || 'n3').toLowerCase(),
            ratingCount: this.parseRatingCount(shop.rating_count),
            followers: this.parseFollowerCount(shop.followers),
            description: shop.description || '',
            verified: shop.verified === 'true' || shop.verified === true
        };
    }
    
    /**
     * Parse rating from various formats
     * @param {string|number} rating - Rating value
     * @returns {number} Parsed rating
     */
    parseRating(rating) {
        if (!rating) return 5;
        
        const parsed = parseFloat(rating);
        return isNaN(parsed) ? 5 : Math.min(Math.max(parsed, 0), 5);
    }
    
    /**
     * Parse rating count
     * @param {string|number} count - Count value
     * @returns {number} Parsed count
     */
    parseRatingCount(count) {
        if (!count) return 0;
        
        const str = count.toString().toLowerCase();
        
        if (str.includes('k')) {
            return parseFloat(str) * 1000;
        } else if (str.includes('m')) {
            return parseFloat(str) * 1000000;
        }
        
        const parsed = parseInt(str.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    /**
     * Parse follower count
     * @param {string|number} count - Count value
     * @returns {number} Parsed count
     */
    parseFollowerCount(count) {
        return this.parseRatingCount(count);
    }
    
    /**
     * Process product data
     * @param {Array} data - Raw product data
     * @returns {Object} Processed product data with categories
     */
    processProductData(data) {
        const processed = {
            all: [],
            highEnd: [],    // n1
            budget: [],     // n2
            mixed: [],      // n3
            byCategory: {},
            byTier: {},
            bestSellers: []
        };
        
        // Initialize category and tier maps
        Object.keys(CONFIG.categories).forEach(key => {
            processed.byCategory[key] = [];
        });
        
        Object.keys(CONFIG.tiers).forEach(key => {
            processed.byTier[key] = [];
        });
        
        data.forEach(product => {
            // Normalize product data
            const normalizedProduct = this.normalizeProductData(product);
            
            // Add to all
            processed.all.push(normalizedProduct);
            
            // Categorize by tier
            const tier = (normalizedProduct.tier || 'n3').toLowerCase().trim();
            switch (tier) {
                case 'n1':
                    processed.highEnd.push(normalizedProduct);
                    processed.byTier.n1 = processed.byTier.n1 || [];
                    processed.byTier.n1.push(normalizedProduct);
                    break;
                case 'n2':
                    processed.budget.push(normalizedProduct);
                    processed.byTier.n2 = processed.byTier.n2 || [];
                    processed.byTier.n2.push(normalizedProduct);
                    break;
                case 'n3':
                    processed.mixed.push(normalizedProduct);
                    processed.byTier.n3 = processed.byTier.n3 || [];
                    processed.byTier.n3.push(normalizedProduct);
                    break;
            }
            
            // Categorize by category
            const category = (normalizedProduct.category || '').toLowerCase().trim();
            if (processed.byCategory[category]) {
                processed.byCategory[category].push(normalizedProduct);
            }
            
            // Track best sellers
            if (normalizedProduct.soldCount > 100) {
                processed.bestSellers.push(normalizedProduct);
            }
        });
        
        // Sort best sellers by sold count
        processed.bestSellers.sort((a, b) => b.soldCount - a.soldCount);
        
        return processed;
    }
    
    /**
     * Normalize product data
     * @param {Object} product - Raw product data
     * @returns {Object} Normalized product data
     */
    normalizeProductData(product) {
        const originalPrice = this.parsePrice(product.original_price);
        const salePrice = this.parsePrice(product.sale_price);
        const discount = Utils.calculateDiscount(originalPrice, salePrice);
        const soldCount = this.parseSoldCount(product.sold_count);
        
        return {
            id: product.id || Utils.generateId(),
            name: product.product_name || 'Unknown Product',
            category: (product.category || '').toLowerCase().trim(),
            originalPrice: originalPrice,
            salePrice: salePrice,
            discount: discount,
            image: product.image_url || CONFIG.defaultImages.product,
            link: product.affiliate_link || '#',
            soldCount: soldCount,
            tier: (product.tier || 'n3').toLowerCase().trim(),
            rating: Utils.generateRandomRating(),
            description: product.description || '',
            shopName: product.shop_name || 'Shopee'
        };
    }
    
    /**
     * Parse price from various formats
     * @param {string|number} price - Price value
     * @returns {number} Parsed price
     */
    parsePrice(price) {
        if (!price) return 0;
        
        // Convert to string and remove non-numeric characters except decimal point
        const str = price.toString().replace(/[^\d.]/g, '');
        const parsed = parseFloat(str);
        
        return isNaN(parsed) ? 0 : parsed;
    }
    
    /**
     * Parse sold count from various formats
     * @param {string|number} count - Count value
     * @returns {number} Parsed count
     */
    parseSoldCount(count) {
        if (!count) return 0;
        
        const str = count.toString().toLowerCase();
        
        // Handle 'k' suffix (thousands)
        if (str.includes('k')) {
            const num = parseFloat(str);
            return isNaN(num) ? 0 : Math.round(num * 1000);
        }
        
        // Handle 'm' suffix (millions)
        if (str.includes('m')) {
            const num = parseFloat(str);
            return isNaN(num) ? 0 : Math.round(num * 1000000);
        }
        
        // Handle regular numbers
        const parsed = parseInt(str.replace(/[^0-9]/g, ''), 10);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    /**
     * Filter products by price range
     * @param {Array} products - Products to filter
     * @param {number} min - Minimum price
     * @param {number} max - Maximum price
     * @returns {Array} Filtered products
     */
    filterByPriceRange(products, min = 0, max = Infinity) {
        return products.filter(product => {
            return product.salePrice >= min && product.salePrice <= max;
        });
    }
    
    /**
     * Filter products by discount
     * @param {Array} products - Products to filter
     * @param {number} minDiscount - Minimum discount percentage
     * @returns {Array} Filtered products
     */
    filterByDiscount(products, minDiscount = 0) {
        return products.filter(product => {
            return product.discount >= minDiscount;
        });
    }
    
    /**
     * Filter products by rating
     * @param {Array} products - Products to filter
     * @param {number} minRating - Minimum rating
     * @returns {Array} Filtered products
     */
    filterByRating(products, minRating = 0) {
        return products.filter(product => {
            return parseFloat(product.rating) >= minRating;
        });
    }
    
    /**
     * Sort products by various criteria
     * @param {Array} products - Products to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted products
     */
    sortProducts(products, sortBy = 'sold-desc') {
        const sorted = [...products];
        
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.salePrice - b.salePrice);
            
            case 'price-desc':
                return sorted.sort((a, b) => b.salePrice - a.salePrice);
            
            case 'discount-desc':
                return sorted.sort((a, b) => b.discount - a.discount);
            
            case 'sold-desc':
                return sorted.sort((a, b) => b.soldCount - a.soldCount);
            
            case 'rating-desc':
                return sorted.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
            
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
            
            default:
                return sorted;
        }
    }
    
    /**
     * Sort shops by various criteria
     * @param {Array} shops - Shops to sort
     * @param {string} sortBy - Sort criteria
     * @returns {Array} Sorted shops
     */
    sortShops(shops, sortBy = 'rating-desc') {
        const sorted = [...shops];
        
        switch (sortBy) {
            case 'rating-desc':
                return sorted.sort((a, b) => b.rating - a.rating);
            
            case 'rating-asc':
                return sorted.sort((a, b) => a.rating - b.rating);
            
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
            
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
            
            default:
                return sorted;
        }
    }
    
    /**
     * Search in data
     * @param {Array} data - Data to search
     * @param {string} query - Search query
     * @param {Array} fields - Fields to search in
     * @returns {Array} Matching items
     */
    search(data, query, fields = ['name']) {
        if (!query || query.length < CONFIG.search.minQueryLength) {
            return [];
        }
        
        const normalizedQuery = Utils.normalizeVietnamese(query);
        
        return data.filter(item => {
            return fields.some(field => {
                const value = item[field] || '';
                const normalizedValue = Utils.normalizeVietnamese(value.toString());
                return normalizedValue.includes(normalizedQuery);
            });
        });
    }
    
    /**
     * Get statistics from data
     * @param {Array} data - Data to analyze
     * @returns {Object} Statistics object
     */
    getStatistics(data) {
        if (data.length === 0) {
            return {
                total: 0,
                avgPrice: 0,
                minPrice: 0,
                maxPrice: 0,
                avgDiscount: 0,
                totalSold: 0
            };
        }
        
        let totalPrice = 0;
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        let totalDiscount = 0;
        let totalSold = 0;
        
        data.forEach(item => {
            if (item.salePrice) {
                totalPrice += item.salePrice;
                minPrice = Math.min(minPrice, item.salePrice);
                maxPrice = Math.max(maxPrice, item.salePrice);
            }
            
            if (item.discount) {
                totalDiscount += item.discount;
            }
            
            if (item.soldCount) {
                totalSold += item.soldCount;
            }
        });
        
        return {
            total: data.length,
            avgPrice: Math.round(totalPrice / data.length),
            minPrice: minPrice === Infinity ? 0 : minPrice,
            maxPrice: maxPrice === -Infinity ? 0 : maxPrice,
            avgDiscount: Math.round(totalDiscount / data.length),
            totalSold: totalSold
        };
    }
    
    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
        console.log('[CSVHandler] Cache cleared');
    }
    
    /**
     * Get cached data
     * @param {string} filePath - File path to get cache for
     * @returns {Array|null} Cached data or null
     */
    getCachedData(filePath) {
        return this.cache.get(filePath) || null;
    }
};

// Create global instance
const csvHandler = new CSVHandler();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVHandler;
}