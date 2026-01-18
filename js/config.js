/**
 * ============================================
 * CONFIG.JS - Shopee Affiliate Hub
 * Configuration settings and constants
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Application Configuration Object
 */
const CONFIG = {
    // ===== APP INFO =====
    app: {
        name: 'Shopee Affiliate Hub',
        version: '1.0.0',
        author: 'Your Name',
        description: 'Tổng hợp Shop uy tín và sản phẩm hot trên Shopee'
    },
    
    // ===== API ENDPOINTS =====
    api: {
        baseUrl: '',
        endpoints: {
            shops: 'data/shops.csv',
            products: 'data/products.csv'
        }
    },
    
    // ===== PAGINATION =====
    pagination: {
        itemsPerPage: 12,
        itemsPerPageMobile: 8,
        maxVisiblePages: 5
    },
    
    // ===== TIER CONFIGURATION =====
    tiers: {
        n1: {
            name: 'CAO CẤP',
            icon: '👑',
            label: '👑 CAO CẤP',
            color: 'gold',
            bgClass: 'tier-badge-n1',
            hexColor: '#f59e0b',
            description: 'Sản phẩm cao cấp, chất lượng premium'
        },
        n2: {
            name: 'BÌNH DÂN',
            icon: '💰',
            label: '💰 BÌNH DÂN',
            color: 'green',
            bgClass: 'tier-badge-n2',
            hexColor: '#10b981',
            description: 'Giá cả phải chăng, chất lượng tốt'
        },
        n3: {
            name: 'ĐA DẠNG',
            icon: '✨',
            label: '✨ ĐA DẠNG',
            color: 'blue',
            bgClass: 'tier-badge-n3',
            hexColor: '#3b82f6',
            description: 'Đa dạng mẫu mã, nhiều lựa chọn'
        }
    },
    
    // ===== CATEGORIES =====
    categories: {
        'thoi-trang': {
            name: 'Thời Trang',
            icon: '👗',
            slug: 'thoi-trang'
        },
        'dien-tu': {
            name: 'Điện Tử',
            icon: '📱',
            slug: 'dien-tu'
        },
        'my-pham': {
            name: 'Mỹ Phẩm',
            icon: '💄',
            slug: 'my-pham'
        },
        'nha-cua': {
            name: 'Nhà Cửa & Đời Sống',
            icon: '🏠',
            slug: 'nha-cua'
        },
        'suc-khoe': {
            name: 'Sức Khỏe',
            icon: '💊',
            slug: 'suc-khoe'
        },
        'the-thao': {
            name: 'Thể Thao',
            icon: '⚽',
            slug: 'the-thao'
        },
        'me-be': {
            name: 'Mẹ & Bé',
            icon: '👶',
            slug: 'me-be'
        },
        'do-an': {
            name: 'Thực Phẩm',
            icon: '🍜',
            slug: 'do-an'
        },
        'sach-vo': {
            name: 'Sách & Văn Phòng',
            icon: '📚',
            slug: 'sach-vo'
        }
    },
    
    // ===== SORT OPTIONS =====
    sortOptions: {
        shops: [
            { value: 'rating-desc', label: 'Đánh giá cao nhất' },
            { value: 'rating-asc', label: 'Đánh giá thấp nhất' },
            { value: 'name-asc', label: 'Tên A-Z' },
            { value: 'name-desc', label: 'Tên Z-A' }
        ],
        products: [
            { value: 'discount-desc', label: 'Giảm nhiều nhất' },
            { value: 'price-asc', label: 'Giá thấp đến cao' },
            { value: 'price-desc', label: 'Giá cao đến thấp' },
            { value: 'sold-desc', label: 'Bán chạy nhất' },
            { value: 'name-asc', label: 'Tên A-Z' }
        ]
    },
    
    // ===== PRICE RANGES =====
    priceRanges: [
        { value: 'all', label: 'Tất cả giá', min: 0, max: Infinity },
        { value: '0-100000', label: 'Dưới 100K', min: 0, max: 100000 },
        { value: '100000-500000', label: '100K - 500K', min: 100000, max: 500000 },
        { value: '500000-1000000', label: '500K - 1 Triệu', min: 500000, max: 1000000 },
        { value: '1000000-5000000', label: '1 - 5 Triệu', min: 1000000, max: 5000000 },
        { value: '5000000-999999999', label: 'Trên 5 Triệu', min: 5000000, max: 999999999 }
    ],
    
    // ===== DISCOUNT THRESHOLDS =====
    discountThresholds: [
        { value: 'all', label: 'Tất cả', min: 0 },
        { value: '10', label: 'Trên 10%', min: 10 },
        { value: '20', label: 'Trên 20%', min: 20 },
        { value: '30', label: 'Trên 30%', min: 30 },
        { value: '50', label: 'Trên 50%', min: 50 }
    ],
    
    // ===== ANIMATION SETTINGS =====
    animation: {
        duration: {
            fast: 150,
            normal: 300,
            slow: 500
        },
        easing: {
            default: 'ease-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    },
    
    // ===== SEARCH SETTINGS =====
    search: {
        debounceDelay: 300,
        minQueryLength: 2,
        maxResults: 50
    },
    
    // ===== FLASH SALE SETTINGS =====
    flashSale: {
        endTime: null, // Will be set dynamically
        refreshInterval: 1000
    },
    
    // ===== BANNER SLIDER =====
    banner: {
        autoPlayInterval: 5000,
        transitionDuration: 500
    },
    
    // ===== TOAST NOTIFICATIONS =====
    toast: {
        duration: 3000,
        position: 'top-right',
        maxVisible: 3
    },
    
    // ===== LOCAL STORAGE KEYS =====
    storage: {
        prefix: 'shopee_hub_',
        keys: {
            favorites: 'favorites',
            recentSearches: 'recent_searches',
            viewedProducts: 'viewed_products',
            settings: 'settings'
        }
    },
    
    // ===== BREAKPOINTS =====
    breakpoints: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
    },
    
    // ===== DEFAULT IMAGES =====
    defaultImages: {
        shop: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"%3E%3C/path%3E%3C/svg%3E',
        product: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"%3E%3C/path%3E%3C/svg%3E'
    }
};

/**
 * Environment Detection
 */
const ENV = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: !['localhost', '127.0.0.1'].includes(window.location.hostname),
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    supportsLocalStorage: (() => {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    })()
};

/**
 * Initialize Flash Sale End Time
 * Sets the end time to midnight of the current day
 */
(function initFlashSaleTime() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    CONFIG.flashSale.endTime = endOfDay;
})();

/**
 * Freeze configuration to prevent modifications
 */
Object.freeze(CONFIG);
Object.freeze(ENV);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ENV };
}