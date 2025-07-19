document.addEventListener('DOMContentLoaded', () => {

    /**
     * Loads a component from a file into an element.
     * @param {string} componentId - The ID of the element to load the component into.
     * @param {string} filePath - The path to the component's HTML file.
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
     * @param {string} url - The URL to fetch data from.
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
     * Builds the product grid on the main page.
     * @param {Array} products - The array of product objects.
     * @param {string} containerId - The ID of the container to build the grid in.
     */
    function buildProductGrid(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <a href="product-details.html?id=${p.id}" class="product-card-link">
                    <img src="${p.imageUrl}" alt="${p.name}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${p.name}</h3>
                        <p class="product-price">₱${p.price.toLocaleString()}</p>
                    </div>
                </a>
            </div>`).join('');
    }

    /**
     * Builds the product details page.
     * @param {Array} allProducts - The array of all product objects.
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

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-gallery"><img src="${product.imageUrl}" alt="${product.name}"></div>
                <div class="product-details-content">
                    <h1>${product.name}</h1>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price-details">
                        <span class="product-current-price">₱${product.price.toLocaleString()}</span>
                    </div>
                    <div class="product-actions">
                        <button id="reserve-button" class="btn-primary">Reserve Now</button>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Checks login status, loads the correct header, and attaches logout listener.
     */
    async function handleAuthAndHeader() {
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const headerPath = isLoggedIn ? 'components/header-logged-in.html' : 'components/header-logged-out.html';

        // Correctly target the placeholder div
        await loadComponent('header-placeholder', headerPath);

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
    }

    /**
     * Initializes the correct logic based on the current page.
     */
    async function initializePage() {
        await handleAuthAndHeader();
        // Correctly target the placeholder div
        await loadComponent('footer-placeholder', 'components/footer.html');

        const page = window.location.pathname.split('/').pop() || 'index.html';

        if (page === 'index.html' || page === '') {
            const products = await fetchData('data/products.json');
            // Correctly target the product grid container
            if (products) buildProductGrid(products, 'product-grid-container');
        } else if (page.includes('product-details')) {
            const allProducts = await fetchData('data/products.json');
            if (allProducts) await buildProductDetailsPage(allProducts);
        } else if (page.includes('login')) {
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    localStorage.setItem('loggedIn', 'true');
                    window.location.href = 'profile.html';
                });
            }
        } else if (page.includes('register')) {
            const registerForm = document.getElementById('register-form');
            if (registerForm) {
                registerForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    localStorage.setItem('loggedIn', 'true');
                    window.location.href = 'profile.html';
                });
            }
        }
    }

    initializePage();
});