/**
 * ============================================
 * RENDER.JS - Shopee Affiliate Hub
 * UI rendering and display logic
 * Version: 1.0.0
 * ============================================
 */

'use strict';

/**
 * Render Manager Class
 */
class RenderManager {
    constructor() {
        this.defaultProductsPerPage = CONFIG.pagination.itemsPerPage;
        this.currentPage = 1;
        this.totalPages = 1;
    }
    
    // ===== PRODUCT RENDERING =====
    
    /**
     * Render product card
     * @param {Object} product - Product data
     * @returns {HTMLElement} Product card element
     */
    renderProductCard(product) {
        const tierConfig = CONFIG.tiers[product.tier] || CONFIG.tiers.n3;
        const discount = Math.round(product.discount);
        
        const card = document.createElement('div');
        card.className = 'product-card group';
        card.innerHTML = `
            <a href="${Utils.escapeHtml(product.link)}" target="_blank" rel="noopener" class="product-link block relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-xl transition-all group-hover:scale-105">
                <!-- Product Image -->
                <div class="relative aspect-square overflow-hidden bg-gray-100">
                    <img src="${Utils.escapeHtml(product.image)}" 
                         alt="${Utils.escapeHtml(product.name)}" 
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                         onerror="this.src='${CONFIG.defaultImages.product}'">
                    
                    <!-- Tier Badge -->
                    <div class="absolute top-2 left-2 ${tierConfig.bgClass}">
                        <span class="text-xs font-bold text-white px-2 py-1 rounded-full inline-block bg-opacity-90"
                              style="background-color: ${tierConfig.hexColor}">
                            ${tierConfig.label}
                        </span>
                    </div>
                    
                    <!-- Discount Badge -->
                    ${discount > 0 ? `
                        <div class="absolute top-2 right-2">
                            <div class="bg-shopee-500 text-white px-2 py-1 rounded font-bold text-sm">
                                -${discount}%
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Hot Badge -->
                    ${product.soldCount > 1000 ? `
                        <div class="absolute bottom-2 right-2">
                            <span class="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                🔥 HOT
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Product Info -->
                <div class="p-3">
                    <h3 class="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                        ${Utils.escapeHtml(product.name)}
                    </h3>
                    
                    <!-- Rating -->
                    <div class="flex items-center mb-2">
                        <div class="flex items-center text-yellow-400 text-xs">
                            ${'⭐'.repeat(Math.floor(product.rating))}
                            <span class="text-gray-500 ml-1">${product.rating}</span>
                        </div>
                    </div>
                    
                    <!-- Price -->
                    <div class="flex items-end space-x-2 mb-2">
                        <span class="text-shopee-500 font-bold text-lg">
                            ${Utils.formatCurrency(product.salePrice)}
                        </span>
                        ${product.discount > 0 ? `
                            <span class="text-gray-400 line-through text-xs">
                                ${Utils.formatCurrency(product.originalPrice)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <!-- Sold Count -->
                    <div class="text-gray-600 text-xs">
                        Đã bán: ${Utils.formatSoldCount(product.soldCount)}
                    </div>
                </div>
            </a>
        `;
        
        return card;
    }
    
    /**
     * Render products grid
     * @param {Array} products - Products to render
     * @param {HTMLElement} container - Container element
     * @param {number} itemsPerPage - Items per page
     * @param {number} page - Current page
     */
    renderProductsGrid(products, container, itemsPerPage = this.defaultProductsPerPage, page = 1) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">📦</div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
                    <p class="text-gray-500">Hãy thử lại với bộ lọc khác</p>
                </div>
            `;
            return;
        }
        
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const pageItems = products.slice(startIdx, endIdx);
        
        pageItems.forEach(product => {
            const card = this.renderProductCard(product);
            container.appendChild(card);
        });
        
        this.currentPage = page;
        this.totalPages = Math.ceil(products.length / itemsPerPage);
    }
    
    // ===== SHOP RENDERING =====
    
    /**
     * Render shop card
     * @param {Object} shop - Shop data
     * @returns {HTMLElement} Shop card element
     */
    renderShopCard(shop) {
        const tierConfig = CONFIG.tiers[shop.tier] || CONFIG.tiers.n3;
        const ratingDisplay = Math.round(shop.rating * 10) / 10;
        
        const card = document.createElement('div');
        card.className = 'shop-card group';
        card.innerHTML = `
            <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-4">
                <div class="flex items-center mb-4">
                    <!-- Shop Logo -->
                    <div class="flex-shrink-0 mr-4">
                        <img src="${Utils.escapeHtml(shop.logo)}" 
                             alt="${Utils.escapeHtml(shop.name)}" 
                             class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                             onerror="this.src='${CONFIG.defaultImages.shop}'">
                    </div>
                    
                    <!-- Shop Info -->
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-gray-800 truncate">
                            ${Utils.escapeHtml(shop.name)}
                            ${shop.verified ? '✓' : ''}
                        </h3>
                        <p class="text-sm text-gray-600">${Utils.escapeHtml(shop.type)}</p>
                        
                        <!-- Rating -->
                        <div class="flex items-center mt-1 text-sm">
                            <span class="text-yellow-400 mr-1">⭐ ${ratingDisplay}</span>
                            <span class="text-gray-600">(${Utils.formatNumber(shop.ratingCount)})</span>
                        </div>
                    </div>
                    
                    <!-- Tier Badge -->
                    <div class="flex-shrink-0 ml-2">
                        <span class="text-xs font-bold px-2 py-1 rounded-full text-white inline-block"
                              style="background-color: ${tierConfig.hexColor}">
                            ${tierConfig.icon} ${tierConfig.name}
                        </span>
                    </div>
                </div>
                
                <!-- Shop Details -->
                <div class="text-xs text-gray-600 mb-3 space-y-1">
                    <div>📍 ${Utils.escapeHtml(shop.category || 'Đa dạng')}</div>
                    ${shop.followers > 0 ? `<div>👥 ${Utils.formatNumber(shop.followers)} người theo dõi</div>` : ''}
                </div>
                
                <!-- CTA Button -->
                <a href="${Utils.escapeHtml(shop.link)}" 
                   target="_blank" 
                   rel="noopener"
                   class="w-full py-2 bg-shopee-500 text-white font-semibold rounded-lg hover:bg-shopee-600 transition-colors text-center text-sm">
                    Ghé Shop Ngay
                </a>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Render shops grid
     * @param {Array} shops - Shops to render
     * @param {HTMLElement} container - Container element
     * @param {number} itemsPerPage - Items per page
     * @param {number} page - Current page
     */
    renderShopsGrid(shops, container, itemsPerPage = CONFIG.pagination.itemsPerPage, page = 1) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (shops.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4">🏪</div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Không tìm thấy shop</h3>
                    <p class="text-gray-500">Hãy thử lại với bộ lọc khác</p>
                </div>
            `;
            return;
        }
        
        const startIdx = (page - 1) * itemsPerPage;
        const endIdx = startIdx + itemsPerPage;
        const pageItems = shops.slice(startIdx, endIdx);
        
        pageItems.forEach(shop => {
            const card = this.renderShopCard(shop);
            container.appendChild(card);
        });
        
        this.currentPage = page;
        this.totalPages = Math.ceil(shops.length / itemsPerPage);
    }
    
    // ===== PAGINATION RENDERING =====
    
    /**
     * Render pagination controls
     * @param {HTMLElement} container - Container element
     * @param {number} currentPage - Current page
     * @param {number} totalPages - Total pages
     * @param {Function} onPageChange - Callback when page changes
     */
    renderPagination(container, currentPage, totalPages, onPageChange) {
        if (!container || totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        const pagination = document.createElement('div');
        pagination.className = 'flex items-center justify-center space-x-2 my-8';
        
        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
        prevBtn.textContent = '← Trước';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                onPageChange(currentPage - 1);
            }
        });
        pagination.appendChild(prevBtn);
        
        // Page numbers
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'flex items-center space-x-1';
        
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);
        
        if (startPage > 1) {
            const firstPage = document.createElement('button');
            firstPage.className = 'px-3 py-2 rounded-lg hover:bg-gray-100';
            firstPage.textContent = '1';
            firstPage.addEventListener('click', () => onPageChange(1));
            pagesContainer.appendChild(firstPage);
            
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.className = 'px-2';
                dots.textContent = '...';
                pagesContainer.appendChild(dots);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = currentPage === i 
                ? 'px-3 py-2 rounded-lg bg-shopee-500 text-white font-semibold'
                : 'px-3 py-2 rounded-lg hover:bg-gray-100';
            pageBtn.textContent = i;
            
            if (currentPage !== i) {
                pageBtn.addEventListener('click', () => onPageChange(i));
            }
            
            pagesContainer.appendChild(pageBtn);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'px-2';
                dots.textContent = '...';
                pagesContainer.appendChild(dots);
            }
            
            const lastPage = document.createElement('button');
            lastPage.className = 'px-3 py-2 rounded-lg hover:bg-gray-100';
            lastPage.textContent = totalPages;
            lastPage.addEventListener('click', () => onPageChange(totalPages));
            pagesContainer.appendChild(lastPage);
        }
        
        pagination.appendChild(pagesContainer);
        
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';
        nextBtn.textContent = 'Sau →';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                onPageChange(currentPage + 1);
            }
        });
        pagination.appendChild(nextBtn);
        
        container.innerHTML = '';
        container.appendChild(pagination);
    }
    
    /**
     * Show toast notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, error, info, warning)
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        
        toast.className = `fixed top-4 right-4 ${colors[type] || colors.info} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.toast.duration);
    }
}

// Create global instance
const renderManager = new RenderManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RenderManager;
}