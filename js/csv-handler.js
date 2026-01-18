/**
 * ============================================
 * CSV-HANDLER.JS - Shopee Affiliate Hub
 * CSV file parsing and data processing
 * Version: 1.0.0
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
            dynamicTyping: true,
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
            byCategory: {}
        };
        
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
                    break;
                case 'n2':
                    processed.budget.push(normalizedShop);
                    break;
                case 'n3':
                    processed.mixed.push(normalizedShop);
                    break;