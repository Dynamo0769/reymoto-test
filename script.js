document.addEventListener('DOMContentLoaded', () => {

    /**
     * Loads a component from a file into an element.
     */
    async function loadComponent(componentId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to fetch component: ${filePath}`);
            const text = await response.text();
            const element = document.getElementById(componentId);
            if (element) {
                element.innerHTML = text;
            }
        } catch (error) {
            console.error(`Error loading component ${componentId}:`, error);
        }
    }

    /**
     * Fetches JSON data from a URL.
     */
    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return await response.json();
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    /**
     * Builds the product grid for the main page or recommendations.
     */
    function buildProductGrid(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !products) return;
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <a href="product-details.html?id=${p.id}" class="product-card-link">
                    <img src="${p.imageUrl}" alt="${p.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${p.name}</h3>
                        <p class="price">₱${p.price.toLocaleString()}</p>
                    </div>
                </a>
            </div>`).join('');
    }

    /**
     * Builds the main product details section with interactive elements.
     */
    async function buildProductDetailsPage(allProducts) {
        const container = document.getElementById('product-details-container');
        if (!container) return;

        const productId = new URLSearchParams(window.location.search).get('id');
        const product = allProducts.find(p => p.id == productId);

        if (!product) {
            container.innerHTML = '<p>Product not found.</p>';
            return;
        }

        // Build main details
        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-gallery"><img src="${product.imageUrl}" alt="${product.name}"></div>
                <div class="product-details-content">
                    <h1>${product.name}</h1>
                    <div class="product-rating">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} <span>${product.rating}/5</span></div>
                    <div class="product-price-details">
                        <span class="product-current-price">₱${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="product-original-price">₱${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button id="decrease-qty">-</button>
                            <span id="quantity">1</span>
                            <button id="increase-qty">+</button>
                        </div>
                        <button id="reserve-button" class="btn-reserve">Reserve</button>
                    </div>
                </div>
            </div>`;

        // Build reviews and recommendations
        buildReviewGrid(product.reviews, 'review-grid');
        const recommendations = allProducts.filter(p => product.recommendation_ids.includes(p.id) && p.id != product.id);
        buildProductGrid(recommendations, 'recommendations-grid');

        // Add event listeners for quantity and reserve buttons
        const qtyEl = document.getElementById('quantity');
        document.getElementById('increase-qty').addEventListener('click', () => {
            qtyEl.textContent = parseInt(qtyEl.textContent) + 1;
        });
        document.getElementById('decrease-qty').addEventListener('click', () => {
            let qty = parseInt(qtyEl.textContent);
            if (qty > 1) {
                qtyEl.textContent = qty - 1;
            }
        });
        document.getElementById('reserve-button').addEventListener('click', () => {
            alert(`${qtyEl.textContent} x "${product.name}" has been reserved!`);
        });
    }
    
    /**
    * Builds the customer review grid.
    */
    function buildReviewGrid(reviews, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !reviews) return;
        container.innerHTML = reviews.map(r => `
            <div class="review-card">
                <div class="product-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
                <p>"${r.comment}"</p>
                <span class="review-author">- ${r.customer}</span>
            </div>`).join('');
    }

    /**
     * Main initialization logic for all pages.
     */
    async function initializePage() {
        // Load header and footer
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const headerPath = isLoggedIn ? 'components/header-logged-in.html' : 'components/header-logged-out.html';
        await loadComponent('header-placeholder', headerPath);
        await loadComponent('footer-placeholder', 'components/footer.html');
        
        // Attach logout listener if logged in
        if (isLoggedIn) {
            const logoutLink = document.getElementById('logout-link');
            if (logoutLink) {
                logoutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('loggedIn');
                    window.location.href = 'index.html';
                });
            }
        }

        // Page-specific routing
        const page = window.location.pathname.split('/').pop() || 'index.html';

        if (page === 'index.html' || page === '') {
            const products = await fetchData('data/products.json');
            if (products) buildProductGrid(products, 'product-grid-container');
        } else if (page.includes('product-details')) {
            const allProducts = await fetchData('data/products.json');
            if (allProducts) await buildProductDetailsPage(allProducts);
        } else if (page.includes('login')) {
            document.getElementById('login-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'index.html';
            });
        } else if (page.includes('register')) {
            document.getElementById('register-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'index.html';
            });
        }
    }

    initializePage();
});