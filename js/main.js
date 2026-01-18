/**
 * ============================================
 * MAIN.JS - Shopee Affiliate Hub
 * Main page logic and initialization
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Main App Class
 */
class MainApp {
    constructor() {
        this.shopsData = null;
        this.productsData = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize the main app
     */
    async init() {
        console.log('[MainApp] Initializing...');
        
        try {
            // Load data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize components
            this.initializeBannerSlider();
            this.initializeFlashSale();
            this.initializeTopShops();
            this.initializeHotProducts();
            this.initializeBackToTop();
            this.initializeSearch();
            
            this.isInitialized = true;
            console.log('[MainApp] Initialized successfully');
        } catch (error) {
            console.error('[MainApp] Initialization error:', error);
            this.showErrorMessage();
        }
    }
    
    /**
     * Load CSV data
     */
    async loadData() {
        console.log('[MainApp] Loading data...');
        
        try {
            const shopsPromise = csvHandler.loadCSV(CONFIG.api.endpoints.shops);
            const productsPromise = csvHandler.loadCSV(CONFIG.api.endpoints.products);
            
            const [shopsRaw, productsRaw] = await Promise.all([shopsPromise, productsPromise]);
            
            this.shopsData = csvHandler.processShopData(shopsRaw);
            this.productsData = csvHandler.processProductData(productsRaw);
            
            console.log('[MainApp] Data loaded successfully');
            console.log('Shops:', this.shopsData.all.length);
            console.log('Products:', this.productsData.all.length);
        } catch (error) {
            console.error('[MainApp] Error loading data:', error);
            throw error;
        }
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            
            // Close menu when link clicked
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                });
            });
        }
        
        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.getElementById('header');
            if (header) {
                if (window.scrollY > 50) {
                    header.classList.add('shadow-lg');
                } else {
                    header.classList.remove('shadow-lg');
                }
            }
        });
    }
    
    /**
     * Initialize banner slider
     */
    initializeBannerSlider() {
        const slider = document.getElementById('bannerSlider');
        const dots = document.querySelectorAll('.banner-dot');
        const prevBtn = document.getElementById('prevBanner');
        const nextBtn = document.getElementById('nextBanner');
        
        if (!slider) return;
        
        let currentSlide = 0;
        const slides = slider.querySelectorAll('.banner-slide');
        const totalSlides = slides.length;
        
        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
                slide.style.opacity = i === index ? '1' : '0';
            });
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            currentSlide = index;
        };
        
        const nextSlide = () => {
            showSlide((currentSlide + 1) % totalSlides);
        };
        
        const prevSlide = () => {
            showSlide((currentSlide - 1 + totalSlides) % totalSlides);
        };
        
        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });
        
        // Auto-play
        setInterval(nextSlide, CONFIG.banner.autoPlayInterval);
        
        // Initial slide
        showSlide(0);
    }
    
    /**
     * Initialize flash sale section
     */
    initializeFlashSale() {
        const container = document.getElementById('flashSaleProducts');
        if (!container || !this.productsData) return;
        
        // Get best sellers
        const flashSaleProducts = this.productsData.bestSellers.slice(0, 10);
        
        // Render products
        flashSaleProducts.forEach(product => {
            const card = renderManager.renderProductCard(product);
            card.classList.add('flex-shrink-0', 'w-36', 'md:w-44');
            container.appendChild(card);
        });
        
        // Countdown timer
        this.updateFlashSaleTimer();
        setInterval(() => this.updateFlashSaleTimer(), 1000);
    }
    
    /**
     * Update flash sale countdown timer
     */
    updateFlashSaleTimer() {
        const timeRemaining = Utils.getTimeRemaining(CONFIG.flashSale.endTime);
        
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (hoursEl) hoursEl.textContent = Utils.padNumber(timeRemaining.hours);
        if (minutesEl) minutesEl.textContent = Utils.padNumber(timeRemaining.minutes);
        if (secondsEl) secondsEl.textContent = Utils.padNumber(timeRemaining.seconds);
    }
    
    /**
     * Initialize top shops section
     */
    initializeTopShops() {
        const container = document.getElementById('topShopsGrid');
        if (!container || !this.shopsData) return;
        
        const tabs = document.querySelectorAll('.tier-tab');
        let currentTier = 'all';
        
        const renderShops = (tier) => {
            let shops = [];
            
            if (tier === 'all') {
                shops = this.shopsData.all.slice(0, 8);
            } else {
                shops = (this.shopsData.byTier[tier] || []).slice(0, 8);
            }
            
            renderManager.renderShopsGrid(shops, container, 100);
        };
        
        // Tab event listeners
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                currentTier = tab.dataset.tier;
                renderShops(currentTier);
            });
        });
        
        // Initial render
        renderShops('all');
    }
    
    /**
     * Initialize hot products section
     */
    initializeHotProducts() {
        const container = document.getElementById('hotProductsGrid');
        const loadMoreBtn = document.getElementById('loadMoreProducts');
        
        if (!container || !this.productsData) return;
        
        let page = 1;
        const itemsPerPage = 12;
        
        const renderProducts = () => {
            const sorted = csvHandler.sortProducts(this.productsData.all, 'sold-desc');
            renderManager.renderProductsGrid(sorted, container, itemsPerPage, page);
        };
        
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                page++;
                const sorted = csvHandler.sortProducts(this.productsData.all, 'sold-desc');
                if (page > renderManager.totalPages) {
                    renderManager.showToast('Đã xem hết tất cả sản phẩm', 'info');
                    page = renderManager.totalPages;
                } else {
                    renderProducts();
                }
            });
        }
        
        renderProducts();
    }
    
    /**
     * Initialize back to top button
     */
    initializeBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        if (!backToTopBtn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.remove('opacity-0', 'invisible');
                backToTopBtn.classList.add('opacity-100', 'visible');
            } else {
                backToTopBtn.classList.add('opacity-0', 'invisible');
                backToTopBtn.classList.remove('opacity-100', 'visible');
            }
        });
        
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    /**
     * Initialize global search
     */
    initializeSearch() {
        const globalSearch = document.getElementById('globalSearch');
        const mobileSearch = document.getElementById('mobileSearch');
        
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= CONFIG.search.minQueryLength) {
                    // Navigate to products page with search
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }
        
        if (mobileSearch) {
            mobileSearch.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                if (query.length >= CONFIG.search.minQueryLength) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            });
        }
    }
    
    /**
     * Show error message
     */
    showErrorMessage() {
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = `
                <div class="container mx-auto px-4 py-12 text-center">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-2">Có lỗi xảy ra</h1>
                    <p class="text-gray-600 mb-6">Không thể tải dữ liệu. Vui lòng tải lại trang.</p>
                    <button onclick="location.reload()" class="px-6 py-3 bg-shopee-500 text-white rounded-lg hover:bg-shopee-600">
                        Tải lại trang
                    </button>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new MainApp();
    await app.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MainApp;
}