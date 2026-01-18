/**
 * ============================================
 * UTILS.JS - Shopee Affiliate Hub
 * Utility functions and helpers
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Utility Functions Object
 */
const Utils = {
    
    // ===== NUMBER FORMATTING =====
    
    /**
     * Format number to Vietnamese currency
     * @param {number} number - The number to format
     * @returns {string} Formatted currency string
     */
    formatCurrency(number) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0đ';
        }
        return new Intl.NumberFormat('vi-VN').format(number) + 'đ';
    },
    
    /**
     * Format number with thousand separators
     * @param {number} number - The number to format
     * @returns {string} Formatted number string
     */
    formatNumber(number) {
        if (number === null || number === undefined || isNaN(number)) {
            return '0';
        }
        return new Intl.NumberFormat('vi-VN').format(number);
    },
    
    /**
     * Format sold count with abbreviations
     * @param {number} sold - Number of items sold
     * @returns {string} Formatted sold count
     */
    formatSoldCount(sold) {
        if (!sold || isNaN(sold)) return '0';
        
        if (sold >= 10000) {
            return (sold / 1000).toFixed(1).replace('.0', '') + 'k';
        } else if (sold >= 1000) {
            return (sold / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        return sold.toString();
    },
    
    /**
     * Parse currency string to number
     * @param {string} currencyString - Currency string to parse
     * @returns {number} Parsed number
     */
    parseCurrency(currencyString) {
        if (!currencyString) return 0;
        
        // Remove all non-digit characters except decimal point
        const cleaned = currencyString.toString().replace(/[^\d]/g, '');
        return parseInt(cleaned, 10) || 0;
    },
    
    /**
     * Calculate discount percentage
     * @param {number} originalPrice - Original price
     * @param {number} salePrice - Sale price
     * @returns {number} Discount percentage
     */
    calculateDiscount(originalPrice, salePrice) {
        if (!originalPrice || !salePrice || originalPrice <= 0) return 0;
        const discount = ((originalPrice - salePrice) / originalPrice) * 100;
        return Math.round(discount);
    },
    
    // ===== STRING UTILITIES =====
    
    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    },
    
    /**
     * Convert string to URL-friendly slug
     * @param {string} text - Text to convert
     * @returns {string} URL slug
     */
    slugify(text) {
        if (!text) return '';
        
        // Vietnamese character mapping
        const vietnameseMap = {
            'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
            'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
            'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
            'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
            'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
            'đ': 'd',
            'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A',
            'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A',
            'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
            'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E',
            'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
            'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O',
            'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O',
            'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
            'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U',
            'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
            'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
            'Đ': 'D'
        };
        
        let slug = text.toString().toLowerCase();
        
        // Replace Vietnamese characters
        for (const [key, value] of Object.entries(vietnameseMap)) {
            slug = slug.replace(new RegExp(key, 'g'), value.toLowerCase());
        }
        
        return slug
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .replace(/-+/g, '-')           // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, '');      // Trim hyphens from start and end
    },
    
    /**
     * Escape HTML special characters
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Normalize Vietnamese text for search
     * @param {string} text - Text to normalize
     * @returns {string} Normalized text
     */
    normalizeVietnamese(text) {
        if (!text) return '';
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    },
    
    // ===== DATE & TIME =====
    
    /**
     * Format date to Vietnamese format
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },
    
    /**
     * Get time remaining until a date
     * @param {Date} endDate - End date
     * @returns {Object} Object with hours, minutes, seconds
     */
    getTimeRemaining(endDate) {
        const now = new Date();
        const diff = endDate - now;
        
        if (diff <= 0) {
            return { hours: 0, minutes: 0, seconds: 0, expired: true };
        }
        
        return {
            hours: Math.floor(diff / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
            expired: false
        };
    },
    
    /**
     * Pad number with leading zeros
     * @param {number} num - Number to pad
     * @param {number} size - Desired string length
     * @returns {string} Padded number string
     */
    padNumber(num, size = 2) {
        return String(num).padStart(size, '0');
    },
    
    // ===== DOM UTILITIES =====
    
    /**
     * Create HTML element from string
     * @param {string} html - HTML string
     * @returns {HTMLElement} Created element
     */
    createElementFromHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    },
    
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in ms
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit time in ms
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Smooth scroll to element
     * @param {string|HTMLElement} target - Target element or selector
     * @param {number} offset - Offset from top
     */
    scrollToElement(target, offset = 0) {
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },
    
    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @param {number} threshold - Visibility threshold (0-1)
     * @returns {boolean} Whether element is visible
     */
    isInViewport(element, threshold = 0) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
        const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
        
        return vertInView && horInView;
    },
    
    // ===== VALIDATION =====
    
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Whether email is valid
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} Whether value is empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },
    
    // ===== STORAGE UTILITIES =====
    
    /**
     * Get item from localStorage with prefix
     * @param {string} key - Storage key
     * @returns {*} Stored value
     */
    getStorage(key) {
        if (!ENV.supportsLocalStorage) return null;
        
        try {
            const item = localStorage.getItem(CONFIG.storage.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    
    /**
     * Set item in localStorage with prefix
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    setStorage(key, value) {
        if (!ENV.supportsLocalStorage) return;
        
        try {
            localStorage.setItem(CONFIG.storage.prefix + key, JSON.stringify(value));
        } catch (e) {
            console.error('Error writing to localStorage:', e);
        }
    },
    
    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     */
    removeStorage(key) {
        if (!ENV.supportsLocalStorage) return;
        
        try {
            localStorage.removeItem(CONFIG.storage.prefix + key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    },
    
    // ===== URL UTILITIES =====
    
    /**
     * Get URL query parameters
     * @returns {Object} Query parameters object
     */
    getQueryParams() {
        const params = {};
        const searchParams = new URLSearchParams(window.location.search);
        
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        
        return params;
    },
    
    /**
     * Update URL query parameters
     * @param {Object} params - Parameters to update
     * @param {boolean} replace - Whether to replace history state
     */
    updateQueryParams(params, replace = false) {
        const url = new URL(window.location.href);
        
        for (const [key, value] of Object.entries(params)) {
            if (value === null || value === undefined || value === '' || value === 'all') {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, value);
            }
        }
        
        if (replace) {
            window.history.replaceState({}, '', url.toString());
        } else {
            window.history.pushState({}, '', url.toString());
        }
    },
    
    // ===== RANDOM UTILITIES =====
    
    /**
     * Generate random ID
     * @param {number} length - ID length
     * @returns {string} Random ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },
    
    /**
     * Get random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random number
     */
    randomBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Generate random star rating (for demo)
     * @returns {number} Rating between 4.0 and 5.0
     */
    generateRandomRating() {
        return (4 + Math.random()).toFixed(1);
    },
    
    // ===== ARRAY UTILITIES =====
    
    /**
     * Shuffle array
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    /**
     * Remove duplicates from array
     * @param {Array} array - Array with duplicates
     * @param {string} key - Key to check for duplicates (for objects)
     * @returns {Array} Array without duplicates
     */
    uniqueArray(array, key = null) {
        if (!key) {
            return [...new Set(array)];
        }
        
        const seen = new Set();
        return array.filter(item => {
            const value = item[key];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    },
    
    /**
     * Chunk array into smaller arrays
     * @param {Array} array - Array to chunk
     * @param {number} size - Chunk size
     * @returns {Array} Array of chunks
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// Freeze Utils object to prevent modifications
Object.freeze(Utils);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}