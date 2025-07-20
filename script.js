document.addEventListener('DOMContentLoaded', () => {

    // --- Component & Data Loading ---
    async function loadComponent(url, placeholderId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            const placeholder = document.getElementById(placeholderId);
            if (placeholder) placeholder.innerHTML = await response.text();
        } catch (error) { console.error(`Error loading component: ${error}`); }
    }

    async function fetchData(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return await response.json();
        } catch (error) { console.error(error); return null; }
    }

    // --- Dynamic Page Builders ---
    function buildProductGrid(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !products) return;
        container.innerHTML = products.map(p => `
            <div class="product-card">
                <img src="${p.imageUrl}" alt="${p.name}">
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="price">₱${p.price.toLocaleString()}</p>
                    <div class="product-buttons">
                        <a href="product-details.html?id=${p.id}" class="btn-details">More Details</a>
                    </div>
                </div>
            </div>`).join('');
    }

    async function buildProductDetailsPage(allProducts) {
        const container = document.getElementById('product-details-container');
        if (!container) return;

        const productId = new URLSearchParams(window.location.search).get('id');
        const product = allProducts.find(p => p.id == productId);

        if (!product) {
            container.innerHTML = '<p>Product not found.</p>';
            return;
        }

        const recommendations = allProducts.filter(p => product.recommendation_ids.includes(p.id) && p.id != product.id);

        container.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-gallery"><img src="${product.imageUrl}" alt="${product.name}"></div>
                <div class="product-details-content">
                    <div class="product-main-info">
                        <h1>${product.name}</h1>
                        <div class="product-rating">${'★'.repeat(Math.round(product.rating))}${'☆'.repeat(5 - Math.round(product.rating))} <span>${product.rating}/5</span></div>
                        <div class="product-price-details">
                            <span class="product-current-price">₱${product.price.toLocaleString()}</span>
                            ${product.originalPrice ? `<span class="product-original-price">₱${product.originalPrice.toLocaleString()}</span>` : ''}
                            ${product.discount ? `<span class="product-discount">-${product.discount}%</span>` : ''}
                        </div>
                        <p class="product-description">${product.description}</p>
                        <div class="product-features"><ul>${product.features.map(f => `<li>${f}</li>`).join('')}</ul></div>
                        <div class="product-actions">
                            <div class="quantity-selector"><button id="decrease-qty">-</button><span id="quantity">1</span><button id="increase-qty">+</button></div>
                            <button id="reserve-button" class="btn-reserve">Reserve</button>
                        </div>
                    </div>
                </div>
            </div>
            <section class="reviews-section"><div class="section-header"><h2>Ratings & Reviews</h2></div><div class="review-grid">${product.reviews.map(r => `<div class="review-card"><div class="product-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div><p>"${r.comment}"</p><span class="review-author">- ${r.customer}</span></div>`).join('')}</div></section>
            <section class="recommendations-section"><div class="section-header"><h2>Recommendations</h2></div><div class="product-grid" id="recommendations-grid"></div></section>
        `;

        buildProductGrid(recommendations, 'recommendations-grid');

        const qtyEl = document.getElementById('quantity');
        const increaseBtn = document.getElementById('increase-qty');
        const decreaseBtn = document.getElementById('decrease-qty');
        const reserveBtn = document.getElementById('reserve-button');

        if(increaseBtn) { increaseBtn.addEventListener('click', () => { qtyEl.textContent = parseInt(qtyEl.textContent) + 1; }); }
        if(decreaseBtn) { decreaseBtn.addEventListener('click', () => { let qty = parseInt(qtyEl.textContent); if (qty > 1) { qtyEl.textContent = qty - 1; } }); }
        if(reserveBtn) {
            reserveBtn.addEventListener('click', () => {
                const cartCountEl = document.querySelector('.cart-icon #cart-count');
                const quantity = parseInt(qtyEl.textContent);
                if (cartCountEl) { cartCountEl.textContent = parseInt(cartCountEl.textContent || 0) + quantity; }
                alert(`${quantity} x "${product.name}" has been reserved!`);
            });
        }
    }

    // --- Script Initializers & Page Routing ---
    const page = window.location.pathname.split('/').pop() || 'index.html';

    async function initializePage() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const headerFile = isLoggedIn ? 'header-logged-in.html' : 'header-logged-out.html';

        // Correctly load components from the 'components' folder
        await Promise.all([
            loadComponent(`components/${headerFile}`, 'header-placeholder'),
            loadComponent('components/footer.html', 'footer-placeholder')
        ]);
        
        // Correctly load data from the 'data' folder
        const products = await fetchData('data/products.json');

        if (page === 'index.html' || page === '') {
            if (products) buildProductGrid(products, 'product-grid-container');
        } else if (page.includes('product-details')) {
            if (products) await buildProductDetailsPage(products);
        } else if (page.includes('login')) {
            if (new URLSearchParams(window.location.search).get('registered') === 'true') {
                showPopup('Registration successful! Please login.');
            }
            document.getElementById('login-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                localStorage.setItem('isLoggedIn', 'true');
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = 'index.html'; }, 500);
            });
        } else if (page.includes('register')) {
            document.getElementById('register-form')?.addEventListener('submit', (e) => {
                e.preventDefault();
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = 'login.html?registered=true'; }, 500);
            });
        }
        
        // This makes the logout button work after the header is loaded
        document.body.addEventListener('click', (event) => {
            if (event.target && event.target.id === 'logout-button') {
                localStorage.removeItem('isLoggedIn');
                document.body.classList.add('fade-out');
                setTimeout(() => { window.location.href = 'index.html'; }, 500);
            }
        });
    }

    function showPopup(message, isError = false) {
        const popup = document.createElement('div');
        popup.className = 'popup show';
        if(isError) popup.style.backgroundColor = '#D32F2F'; // Use accent red for errors
        else popup.style.backgroundColor = '#4CAF50'; // Green for success
        
        popup.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(popup);

        setTimeout(() => { 
            popup.classList.remove('show');
            setTimeout(() => { document.body.removeChild(popup); }, 500);
        }, 3000);
    }

    initializePage();
});