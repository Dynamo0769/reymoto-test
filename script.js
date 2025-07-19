document.addEventListener('DOMContentLoaded', () => {

    /**
     * Shows a popup notification for a few seconds.
     * @param {string} popupId - The ID of the popup element to show.
     */
    function showPopup(popupId) {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.classList.add('show');
            setTimeout(() => {
                popup.classList.remove('show');
            }, 4000); // The popup will disappear after 4 seconds
        }
    }

    /**
     * Loads an HTML component from a file into an element.
     * @param {string} componentId - The ID of the element to load the component into.
     * @param {string} filePath - The path to the HTML component file.
     */
    async function loadComponent(componentId, filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`Failed to fetch component: ${filePath}`);
            const text = await response.text();
            const element = document.getElementById(componentId);
            if (element) {
                element.innerHTML = text;
                // After loading header, attach event listeners that depend on it
                if (componentId === 'header-placeholder') {
                    setupHeaderListeners();
                }
            }
        } catch (error) {
            console.error(`Error loading component ${componentId}:`, error);
        }
    }

    /**
     * Fetches JSON data from a given URL.
     * @param {string} url - The URL to fetch data from.
     * @returns {Promise<any>} A promise that resolves to the JSON data.
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
     * Builds and displays the product grid.
     * @param {Array<Object>} products - An array of product objects.
     * @param {string} containerId - The ID of the container element for the grid.
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
                        <p class="price">₱${parseInt(p.price).toLocaleString()}</p>
                    </div>
                </a>
            </div>`).join('');
    }
    
    /**
     * Sets up event listeners that depend on the header being loaded.
     */
    function setupHeaderListeners() {
        // Highlight active nav item
        const path = window.location.pathname;
        const currentPageName = path.split('/').pop() || 'index.html';

        document.querySelectorAll('.main-nav a').forEach(link => {
            const linkHref = link.getAttribute('href').split('#')[0];
            if (linkHref === currentPageName) {
                link.classList.add('active');
            }
        });

        // Logout functionality
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
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
     * Main initialization function that runs on page load.
     */
    async function initializePage() {
        // Load common components across all pages
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        const headerPath = isLoggedIn ? 'components/header-logged-in.html' : 'components/header-logged-out.html';
        await loadComponent('header-placeholder', headerPath);
        await loadComponent('footer-placeholder', 'components/footer.html');

        // Page-specific logic
        const pageName = window.location.pathname.split('/').pop() || 'index.html';

        if (pageName === 'index.html') {
            const products = await fetchData('data/products.json');
            if (products) buildProductGrid(products, 'product-grid-container');
        } 
        
        else if (pageName === 'login.html') {
            // Check for the 'registered' URL parameter to show the success pop-up
            const params = new URLSearchParams(window.location.search);
            if (params.get('registered') === 'true') {
                showPopup('success-popup');
            }

            document.getElementById('login-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                // In a real app, you would validate credentials here
                localStorage.setItem('loggedIn', 'true');
                window.location.href = 'index.html';
            });
        } 
        
        else if (pageName === 'register.html') {
            document.getElementById('register-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                // In a real app, you would handle registration here
                // Redirect to login page with a parameter to show the success message
                window.location.href = 'login.html?registered=true';
            });
        }
    }

    // Run the app
    initializePage();
});