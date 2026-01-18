/**
 * ============================================
 * PRODUCTS.JS - Shopee Affiliate Hub
 * Products page logic and functionality
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Products Page App
 */
class ProductsApp {
    constructor() {
        this.productsData = null;
        this.isInitialized = false;
    }
    
    /**
     * Initialize products page
     */
    async init() {
        console.log('[ProductsApp] Initializing...');
        
        try {
            // Load data
            await this.loadData();
            
            // Setup filter manager
            filterManager.initFromURL();
            filterManager.setData(this.productsData.all);
            
            // Setup search manager
            searchManager.initSearch(this.productsData.all, 'products');
            
            // Setup UI
            this.setupFilters();
            this.setupSearch();
            this.setupSorting();
            this.setupPriceFilter();
            this.setupDiscountFilter();
            this.renderInitialData();
            
            // Subscribe to changes
            filterManager.subscribe(() => this.onFilterChange());
            searchManager.subscribe(() => this.onSearchChange());
            
            this.isInitialized = true;
            console.log('[ProductsApp] Initialized successfully');
        } catch (error) {
            console.error('[ProductsApp] Initialization error:', error);
            this.showErrorMessage();
        }
    }
    
    /**
     * Load CSV data
     */
    async loadData() {
        console.log('[ProductsApp] Loading products data...');
        
        try {
            const productsRaw = await csvHandler.loadCSV(CONFIG.api.endpoints.products);
            this.productsData = csvHandler.processProductData(productsRaw);
            
            console.log('[ProductsApp] Products data loaded:', this.productsData.all.length);
        } catch (error) {
            console.error('[ProductsApp] Error loading data:', error);
            throw error;
        }
    }
    
    /**
     * Setup category filters
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
     * Setup price range filter
     */
    setupPriceFilter() {
        const minPriceInput = document.getElementById('minPriceInput');
        const maxPriceInput = document.getElementById('maxPriceInput');
        const priceApplyBtn = document.getElementById('priceApplyBtn');
        
        if (priceApplyBtn) {
            priceApplyBtn.addEventListener('click', () => {
                const min = parseInt(minPriceInput?.value) || 0;
                const max = parseInt(maxPriceInput?.value) || Infinity;
                
                if (min >= 0 && max > min) {
                    filterManager.setPriceRange(min, max);
                } else {
                    renderManager.showToast('Vui lòng nhập khoảng giá hợp lệ', 'warning');
                }
            });
        }
    }
    
    /**
     * Setup discount filter
     */
    setupDiscountFilter() {
        const discountButtons = document.querySelectorAll('[data-discount-filter]');
        
        discountButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                discountButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const minDiscount = parseInt(btn.dataset.discountFilter) || 0;
                filterManager.setMinDiscount(minDiscount);
            });
        });
    }
    
    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('productsSearchInput');
        
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
        const sortSelect = document.getElementById('productsSortSelect');
        
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                const sortBy = e.target.value;
                this.renderProductsWithSort(sortBy);
            });
        }
    }
    
    /**
     * Render initial data
     */
    renderInitialData() {
        const container = document.getElementById('productsContainer');
        const paginationContainer = document.getElementById('productsPagination');
        const stats = document.getElementById('productsStats');
        
        if (!container) return;
        
        const filteredProducts = filterManager.getFilteredData();
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
                            sản phẩm
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
        
        // Render products
        renderManager.renderProductsGrid(filteredProducts, container);
        
        // Render pagination
        if (paginationContainer) {
            renderManager.renderPagination(
                paginationContainer,
                renderManager.currentPage,
                renderManager.totalPages,
                (page) => this.onPageChange(page, filteredProducts)
            );
        }
    }
    
    /**
     * Render products with sorting
     */
    renderProductsWithSort(sortBy) {
        const container = document.getElementById('productsContainer');
        const paginationContainer = document.getElementById('productsPagination');
        
        if (!container) return;
        
        let filteredProducts = filterManager.getFilteredData();
        const sorted = csvHandler.sortProducts(filteredProducts, sortBy);
        
        renderManager.renderProductsGrid(sorted, container);
        
        if (paginationContainer) {
            renderManager.renderPagination(
                paginationContainer,
                renderManager.currentPage,
                renderManager.totalPages,
                (page) => this.onPageChange(page, sorted)
            );
        }
    }
    
    /**
     * On page change
     */
    onPageChange(page, products) {
        renderManager.renderProductsGrid(products, document.getElementById('productsContainer'), CONFIG.pagination.itemsPerPage, page);
        
        const paginationContainer = document.getElementById('productsPagination');
        if (paginationContainer) {
            renderManager.renderPagination(
                paginationContainer,
                page,
                renderManager.totalPages,
                (newPage) => this.onPageChange(newPage, products)
            );
        }
        
        Utils.scrollToElement('#productsContainer', 100);
    }
    
    /**
     * On filter change
     */
    onFilterChange() {
        const currentSort = document.getElementById('productsSortSelect')?.value || 'sold-desc';
        this.renderProductsWithSort(currentSort);
        
        // Scroll to results
        Utils.scrollToElement('#productsContainer', 100);
    }
    
    /**
     * On search change
     */
    onSearchChange() {
        const container = document.getElementById('productsContainer');
        const paginationContainer = document.getElementById('productsPagination');
        const results = searchManager.getResults();
        
        if (results.length === 0) {
            if (container) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <div class="text-6xl mb-4">🔍</div>
                        <h3 class="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                        <p class="text-gray-500">Thử tìm kiếm với từ khóa khác</p>
                    </div>
                `;
            }
            if (paginationContainer) {
                paginationContainer.innerHTML = '';
            }
        } else {
            const products = results.map(r => r.originalData);
            renderManager.renderProductsGrid(products, container);
            
            if (paginationContainer) {
                renderManager.renderPagination(
                    paginationContainer,
                    renderManager.currentPage,
                    renderManager.totalPages,
                    (page) => this.onPageChange(page, products)
                );
            }
        }
    }
    
    /**
     * Show error message
     */
    showErrorMessage() {
        const container = document.getElementById('productsContainer');
        if (container) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Có lỗi xảy ra</h3>
                    <p class="text-gray-500">Không thể tải dữ liệu sản phẩm. Vui lòng tải lại trang.</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new ProductsApp();
    await app.init();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductsApp;
}