/**
 * ============================================
 * SHOPS.JS - Shopee Affiliate Hub
 * Shops page logic and functionality
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Shops Page App
 */
class ShopsApp {
    constructor() {
        this.shopsData = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize shops page
     */
    async init() {
        console.log('[ShopsApp] Initializing...');
        
        try {
            // Load data
            await this.loadData();
            
            // Setup filter manager
            filterManager.initFromURL();
            filterManager.setData(this.shopsData.all);
            
            // Setup search manager
            searchManager.initSearch(this.shopsData.all, 'shops');
            
            // Setup UI
            this.setupFilters();
            this.setupSearch();
            this.setupSorting();
            this.renderInitialData();
            
            // Subscribe to changes
            filterManager.subscribe(() => this.onFilterChange());
            searchManager.subscribe(() => this.onSearchChange());
            
            this.isInitialized = true;
            console.log('[ShopsApp] Initialized successfully');
        } catch (error) {
            console.error('[ShopsApp] Initialization error:', error);
            this.showErrorMessage();
        }
    }
    
    /**
     * Load CSV data
     */
    async loadData() {
        console.log('[ShopsApp] Loading shops data...');
        
        try {
            const shopsRaw = await csvHandler.loadCSV(CONFIG.api.endpoints.shops);
            this.shopsData = csvHandler.processShopData(shopsRaw);
            
            console.log('[ShopsApp] Shops data loaded:', this.shopsData.all.length);
        } catch (error) {
            console.error('[ShopsApp] Error loading data:', error);
            throw error;
        }
    }
    
    /**
     * Setup filter controls
     */
    setupFilters() {
        // Category filters
        const categoryButtons = document.querySelectorAll('[data-category-filter]');
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const category = btn.dataset.categoryFilter;
                filterManager.setCategory(category);
            });
        });
        
        // Tier filters
        const tierButtons = document.querySelectorAll('[data-tier-filter]');
        tierButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                tierButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const tier = btn.dataset.tierFilter;
                filterManager.setTier(tier);
            });
        });
        
        // Reset filters button
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filterManager.resetFilters();
                categoryButtons.forEach(b => b.classList.remove('active'));
                tierButtons.forEach(b => b.classList.remove('active'));
                document.querySelector('[data-category-filter="all"]')?.classList.add('active');
                document.querySelector('[data-tier-filter="all"]')?.classList.add('active');
            });
        }
    }
    
    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('shopsSearchInput');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                
                if (query.length >= CONFIG.search.minQueryLength) {
                    searchManager.search(query);
                } else if (query.length === 0) {
                    searchManager.clearResults();
                    this.renderInitialData();
                }
            });
        }
    }
    
    /**
     * Setup sorting
     */
    setupSorting() {
        const sortSelect = document.getElementById('shopsSortSelect');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                this.renderShopsWithSort(sortBy);
            });
        }
    }
    
    /**
     * Render initial data
     */
    renderInitialData() {
        const container = document.getElementById('shopsContainer');
        const stats = document.getElementById('shopsStats');
        
        if (!container) return;
        
        const filteredShops = filterManager.getFilteredData();
        const statistics = filterManager.getStatistics();
        
        // Update statistics
        if (stats) {
            stats.innerHTML = `
                <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                    <div>
                        <p class="text-gray-600">
                            <span class="font-semibold text-shopee-500">${statistics.filteredItems}</span> 
                            / 
                            <span class="text-gray-800">${statistics.totalItems}</span> 
                            shop
                        </p>
                    </div>
                    ${statistics.appliedFilters > 0 ? `
                        <div class="flex items-center space-x-2">
                            <span class="text-sm text-gray-600">Đã áp dụng ${statistics.appliedFilters} bộ lọc</span>
                            <button id="resetFilters" class="text-sm text-shopee-500 hover:text-shopee-600 font-semibold">
                                Xóa tất cả
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;
            
            // Re-attach reset button listener
            const resetBtn = document.getElementById('resetFilters');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    filterManager.resetFilters();
                    this.renderInitialData();
                });
            }
        }
        
        // Render shops
        renderManager.renderShopsGrid(filteredShops, container, 100);
    }
    
    /**
     * Render shops with sorting
     */
    renderShopsWithSort(sortBy) {
        const container = document.getElementById('shopsContainer');
        
        if (!container) return;
        
        let filteredShops = filterManager.getFilteredData();
        const sorted = csvHandler.sortShops(filteredShops, sortBy);
        
        renderManager.renderShopsGrid(sorted, container, 100);
    }
    
    /**
     * On filter change
     */
    onFilterChange() {
        const currentSort = document.getElementById('shopsSortSelect')?.value || 'rating-desc';
        this.renderShopsWithSort(currentSort);
        
        // Scroll to results
        Utils.scrollToElement('#shopsContainer', 100);
    }
    
    /**
     * On search change
     */
    onSearchChange() {
        const container = document.getElementById('shopsContainer');
        const results = searchManager.getResults();
        
        if (results.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="text-6xl mb-4">🔍</div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy shop</h3>
                        <p class="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                `;
            }
        } else {
            const shops = results.map(r => r.originalData);
            renderManager.renderShopsGrid(shops, container, 100);
        }
    }
    
    /**
     * Show error message
     */
    showErrorMessage() {
        const container = document.getElementById('shopsContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Có lỗi xảy ra</h3>
                    <p class="text-gray-500">Không thể tải dữ liệu shop. Vui lòng tải lại trang.</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ShopsApp();
    await app.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShopsApp;
}