// Script principal para CubeCrema - Tienda Minecraft
document.addEventListener('DOMContentLoaded', function() {
    // Clase para gestionar el carrito de compras
    class ShoppingCart {
        constructor() {
            this.items = [];
            this.cartOverlay = document.getElementById('cartOverlay');
            this.cartItemsContainer = document.getElementById('cartItems');
            this.cartTotalElement = document.getElementById('cartTotal');
            this.checkoutButton = document.getElementById('checkoutButton');
            this.closeCartButton = document.getElementById('closeCart');
            this.minecraftUsernameInput = document.getElementById('minecraftUsername');
            this.emailInput = document.getElementById('email');
            
            this.initCartEvents();
        }
        
        initCartEvents() {
            this.closeCartButton.addEventListener('click', () => this.hideCart());
            this.checkoutButton.addEventListener('click', () => this.checkout());
            this.cartOverlay.addEventListener('click', (e) => {
                if (e.target === this.cartOverlay) this.hideCart();
            });
        }
        
        addItem(id, type, name, price) {
            const existingItemIndex = this.items.findIndex(item => item.id === id && item.type === type);
            if (existingItemIndex !== -1) {
                this.items[existingItemIndex].quantity++;
            } else {
                this.items.push({ id, type, name, price, quantity: 1 });
            }
            this.updateCartDisplay();
            this.showAddedToCartMessage(name);
        }
        
        showAddedToCartMessage(productName) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'added-to-cart-message';
            messageContainer.textContent = `¡${productName} añadido al carrito!`;
            document.body.appendChild(messageContainer);
            setTimeout(() => messageContainer.classList.add('show'), 10);
            setTimeout(() => {
                messageContainer.classList.remove('show');
                setTimeout(() => document.body.removeChild(messageContainer), 300);
            }, 2000);
        }
        
        removeItem(index) {
            this.items.splice(index, 1);
            this.updateCartDisplay();
        }
        
        updateQuantity(index, newQuantity) {
            if (newQuantity <= 0) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQuantity;
                this.updateCartDisplay();
            }
        }
        
        calculateTotal() {
            return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        }
        
        updateCartDisplay() {
            this.cartItemsContainer.innerHTML = '';
            if (this.items.length === 0) {
                this.cartItemsContainer.innerHTML = `
                    <div class="empty-cart-message text-center py-4">
                        <div class="empty-cart-icon mb-3"></div>
                        <p>Tu carrito está vacío</p>
                    </div>`;
            } else {
                this.items.forEach((item, index) => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';
                    cartItemElement.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <div class="quantity-btn decrease" data-index="${index}">-</div>
                            <div class="quantity-value">${item.quantity}</div>
                            <div class="quantity-btn increase" data-index="${index}">+</div>
                            <button class="remove-item" data-index="${index}">&times;</button>
                        </div>`;
                    this.cartItemsContainer.appendChild(cartItemElement);
                });
                this.addCartItemEventListeners();
            }
            this.cartTotalElement.textContent = `$${this.calculateTotal().toFixed(2)}`;
            this.updateCartCounter();
        }

        addCartItemEventListeners() {
            this.cartItemsContainer.querySelectorAll('.decrease').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.updateQuantity(index, this.items[index].quantity - 1);
                });
            });
            this.cartItemsContainer.querySelectorAll('.increase').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.updateQuantity(index, this.items[index].quantity + 1);
                });
            });
            this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    this.removeItem(index);
                });
            });
        }
        
        updateCartCounter() {
            const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
            let counterElement = document.querySelector('.cart-counter');
            if (!counterElement && itemCount > 0) {
                counterElement = document.createElement('div');
                counterElement.className = 'cart-counter';
                document.body.appendChild(counterElement);
            }
            if (counterElement) {
                counterElement.textContent = itemCount;
                counterElement.style.display = itemCount > 0 ? 'flex' : 'none';
            }
        }
        
        showCart() {
            this.updateCartDisplay();
            this.cartOverlay.style.display = 'flex';
            setTimeout(() => this.cartOverlay.classList.add('active'), 10);
        }
        
        hideCart() {
            this.cartOverlay.classList.remove('active');
            setTimeout(() => this.cartOverlay.style.display = 'none', 300);
        }
        
        checkout() {
            if (this.items.length === 0) {
                alert('Tu carrito está vacío. Añade algunos productos antes de finalizar la compra.');
                return;
            }

            const minecraftUsername = this.minecraftUsernameInput.value.trim();
            const email = this.emailInput.value.trim();

            if (!minecraftUsername || !email) {
                alert('Por favor, ingresa tu nombre de usuario de Minecraft y tu email.');
                return;
            }
            // Basic email validation
            if (!/^\S+@\S+\.\S+$/.test(email)) {
                alert('Por favor, ingresa un email válido.');
                return;
            }
            
            const orderData = {
                items: this.items.map(item => ({
                    id: item.id, // This is productId
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: this.calculateTotal(),
                minecraftUsername: minecraftUsername,
                email: email
            };
            
            this.sendOrderToServer(orderData);
        }
        
        sendOrderToServer(orderData) {
            const loadingOverlay = this.showLoadingOverlay();
            
            fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text || `Error del servidor: ${response.status}`) });
                }
                return response.json();
            })
            .then(data => {
                document.body.removeChild(loadingOverlay);
                this.showOrderConfirmation(orderData, data.transactionId || this.generateTransactionId()); // Use server transactionId if available
                this.items = [];
                this.updateCartDisplay();
                this.hideCart();
                this.minecraftUsernameInput.value = ''; // Clear fields
                this.emailInput.value = '';
            })
            .catch(error => {
                document.body.removeChild(loadingOverlay);
                console.error('Error al enviar pedido:', error);
                alert(`Error al procesar el pedido: ${error.message}`);
            });
        }

        showLoadingOverlay() {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-container">
                    <div class="minecraft-loading-animation"></div>
                    <p>Procesando tu compra...</p>
                </div>`;
            document.body.appendChild(loadingOverlay);
            return loadingOverlay;
        }
        
        showOrderConfirmation(orderData, transactionId) {
            const confirmationOverlay = document.createElement('div');
            confirmationOverlay.className = 'confirmation-overlay';
            const itemsList = orderData.items.map(item => 
                `<li>${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>`
            ).join('');
            
            confirmationOverlay.innerHTML = `
                <div class="confirmation-container minecraft-block">
                    <h3 class="minecraft-title">¡Compra Realizada!</h3>
                    <p>Gracias por tu compra en CubeCrema</p>
                    <div class="order-details">
                        <h4>Detalles del pedido:</h4>
                        <ul>${itemsList}</ul>
                        <div class="order-total">Total: $${orderData.total.toFixed(2)}</div>
                    </div>
                    <div class="confirmation-message">
                        <p>Los objetos serán añadidos a tu cuenta cuando inicies sesión en el servidor.</p>
                        <p>ID de Transacción: ${transactionId}</p>
                    </div>
                    <button class="minecraft-button primary close-confirmation">Continuar</button>
                </div>`;
            document.body.appendChild(confirmationOverlay);
            confirmationOverlay.querySelector('.close-confirmation').addEventListener('click', () => {
                document.body.removeChild(confirmationOverlay);
            });
        }
        
        generateTransactionId() { // Fallback if server doesn't provide it
            return 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
    }
        
    // Clase principal de la aplicación
    class CubeCremaApp {
        constructor() {
            this.cart = new ShoppingCart();
            this.initAppEvents();
            this.initProducts(); 
            this.initAnimations();
        }

        async fetchProductsByType(categoryName) {
            try {
                const response = await fetch(`/api/products/category/${categoryName}`);
                if (!response.ok) {
                    throw new Error(`Error fetching ${categoryName}: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Failed to fetch ${categoryName}:`, error);
                return []; // Return empty array on error
            }
        }

        displayProducts(products, containerSelector, categoryType) {
            const container = document.querySelector(containerSelector);
            if (!container) {
                console.error(`Container ${containerSelector} not found.`);
                return;
            }
            container.innerHTML = ''; // Clear existing static content or placeholders

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4'; // Standard bootstrap column

                // Helper to generate image class from imagePath
                // e.g., "images/pack_diamond.png" -> "pack-diamond"
                // e.g., "images/rank_normal.png" -> "rank-normal"
                // e.g., "images/xp_small.png" -> "xp-small"
                let imageClass = '';
                if (product.imagePath) {
                    imageClass = product.imagePath.replace('images/', '').replace('.png', '').replace(/_/g, '-');
                }
                
                let productHtml = '';
                if (categoryType === 'packs') {
                    productHtml = `
                        <div class="product-card">
                            <div class="product-img ${imageClass || 'default-pack-img'}"></div>
                            <div class="product-info">
                                <h3>${product.name}</h3>
                                <p>${product.description}</p>
                                <div class="price">
                                    <span class="currency">$</span>
                                    <span class="amount">${product.price.toFixed(2)}</span>
                                </div>
                                <button class="minecraft-button buy-button" 
                                        data-id="${product.id}" 
                                        data-type="${categoryType}" 
                                        data-name="${product.name}" 
                                        data-price="${product.price}">
                                    Comprar
                                </button>
                            </div>
                        </div>`;
                } else if (categoryType === 'ranks') {
                    // Rank cards have a slightly different structure (rank-header, rank-body, rank-features)
                    // For simplicity, we'll use a similar structure to product-card for now,
                    // or assume description contains feature list.
                    // TODO: Adapt to specific rank card HTML structure if needed.
                    productHtml = `
                        <div class="rank-card"> 
                            <div class="rank-header ${imageClass || 'default-rank-header'}">
                                <h3>${product.name}</h3>
                            </div>
                            <div class="rank-body">
                                <ul class="rank-features">
                                    ${product.description.split(';').map(feature => `<li><i class="fa fa-check"></i> ${feature.trim()}</li>`).join('')}
                                </ul>
                                <div class="price">
                                    <span class="currency">$</span>
                                    <span class="amount">${product.price.toFixed(2)}</span>
                                </div>
                                <button class="minecraft-button buy-button" 
                                        data-id="${product.id}" 
                                        data-type="${categoryType}" 
                                        data-name="${product.name}" 
                                        data-price="${product.price}">
                                    Comprar
                                </button>
                            </div>
                        </div>`;
                } else if (categoryType === 'xp') {
                    productHtml = `
                        <div class="xp-card">
                            <div class="xp-icon ${imageClass || 'default-xp-icon'}"></div>
                            <h3>${product.name}</h3> 
                            <p>${product.description}</p>
                            <div class="price">
                                <span class="currency">$</span>
                                <span class="amount">${product.price.toFixed(2)}</span>
                            </div>
                            <button class="minecraft-button buy-button" 
                                    data-id="${product.id}" 
                                    data-type="${categoryType}" 
                                    data-name="${product.name}" 
                                    data-price="${product.price}">
                                Comprar
                            </button>
                        </div>`;
                }
                card.innerHTML = productHtml;
                container.appendChild(card);
            });
        }

        async initProducts() {
            const packs = await this.fetchProductsByType('packs');
            this.displayProducts(packs, '#tienda .row', 'packs');

            const ranks = await this.fetchProductsByType('ranks');
            this.displayProducts(ranks, '#rangos .row', 'ranks');
            
            const xp = await this.fetchProductsByType('xp');
            this.displayProducts(xp, '#experiencia .row', 'xp');
        }
        
        initAppEvents() {
            // Event delegation for buy buttons
            document.body.addEventListener('click', (e) => {
                if (e.target.classList.contains('buy-button')) {
                    const id = parseInt(e.target.dataset.id);
                    const type = e.target.dataset.type;
                    const name = e.target.dataset.name;
                    const price = parseFloat(e.target.dataset.price);
                    
                    this.cart.addItem(id, type, name, price);
                    this.animateButton(e.target);
                }
            });
            
            const cartBtn = document.createElement('div');
            cartBtn.className = 'floating-cart-btn';
            cartBtn.innerHTML = '<i class="fa fa-shopping-cart"></i>';
            document.body.appendChild(cartBtn);
            cartBtn.addEventListener('click', () => this.cart.showCart());
            
            // Contact form simulation (remains unchanged for now)
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                const submitButton = contactForm.querySelector('button');
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    const nameInput = contactForm.querySelector('input[type="text"]');
                    const emailInput = contactForm.querySelector('input[type="email"]');
                    const messageInput = contactForm.querySelector('textarea');
                    
                    if (nameInput.value && emailInput.value && messageInput.value) {
                        const successMessage = document.createElement('div');
                        successMessage.className = 'alert alert-success mt-3';
                        successMessage.innerHTML = '¡Mensaje enviado correctamente! Te responderemos pronto.';
                        contactForm.appendChild(successMessage);
                        nameInput.value = ''; emailInput.value = ''; messageInput.value = '';
                        setTimeout(() => contactForm.removeChild(successMessage), 3000);
                    } else {
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'alert alert-danger mt-3';
                        errorMessage.innerHTML = 'Por favor, completa todos los campos.';
                        contactForm.appendChild(errorMessage);
                        setTimeout(() => contactForm.removeChild(errorMessage), 3000);
                    }
                });
            }
            
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => new bootstrap.Tooltip(tooltip));
            }
        }
        
        animateButton(button) {
            button.classList.add('clicked');
            setTimeout(() => button.classList.remove('clicked'), 300);
        }
        
        initAnimations() {
            const titles = document.querySelectorAll('.minecraft-title');
            titles.forEach(title => this.animateOnScroll(title, 'animate__fadeIn'));
            
            // Re-run for dynamically added cards after products are loaded.
            // This could be improved by calling animateOnScroll after displayProducts.
            // For now, this might only catch static elements.
            // A better approach would be to call animateOnScroll for each card inside displayProducts.
            // Or run this after initProducts completes.
            // Let's adjust initProducts to re-trigger animations for the cards
            // Or better, call animateOnScroll within displayProducts for each new card.

            this.addAnimationStyles();
        }
        
        addAnimationStyles() {
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                /* Estilos para animaciones (fadeIn, fadeInUp) */
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 30px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
                .animate__fadeIn { animation: fadeIn 1s ease-out; }
                .animate__fadeInUp { animation: fadeInUp 0.8s ease-out; }
                
                /* Botón flotante de carrito */
                .floating-cart-btn { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background-color: var(--primary-color); border: 3px solid #000; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: var(--text-light); font-size: 24px; cursor: pointer; z-index: 999; box-shadow: 0 4px 0 #000, 0 6px 10px rgba(0,0,0,0.2); transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .floating-cart-btn:hover { transform: translateY(-3px); box-shadow: 0 7px 0 #000, 0 8px 15px rgba(0,0,0,0.3); }
                .floating-cart-btn:active { transform: translateY(1px); box-shadow: 0 3px 0 #000, 0 4px 5px rgba(0,0,0,0.2); }
                
                /* Contador de carrito */
                .cart-counter { position: fixed; bottom: 25px; right: 25px; width: 24px; height: 24px; background-color: var(--minecraft-brown); border: 2px solid #000; border-radius: 50%; color: var(--text-light); font-size: 12px; font-weight: bold; display: none; justify-content: center; align-items: center; z-index: 1000; }
                
                /* Mensaje "añadido al carrito" */
                .added-to-cart-message { position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px); background-color: var(--primary-color); color: var(--text-light); padding: 10px 20px; border: 3px solid #000; border-radius: 0; font-weight: bold; z-index: 1001; box-shadow: 0 4px 0 #000; transition: transform 0.3s ease; }
                .added-to-cart-message.show { transform: translateX(-50%) translateY(0); }
                
                /* Overlay de carga */
                .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000; }
                .loading-container { background-color: var(--light-bg); border: 4px solid #000; padding: 30px; text-align: center; }
                .minecraft-loading-animation { width: 64px; height: 64px; margin: 0 auto 20px; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23B78DE0" d="M12 2l10 10-10 10L2 12z"/></svg>'); background-size: contain; background-position: center; animation: rotate 2s infinite linear; }
                @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                
                /* Confirmación de pedido */
                .confirmation-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8); display: flex; justify-content: center; align-items: center; z-index: 2000; }
                .confirmation-container { background-color: var(--light-bg); max-width: 600px; width: 90%; padding: 30px; border: 4px solid #000; color: var(--text-dark); }
                .order-details { margin: 20px 0; padding: 15px; background-color: rgba(0,0,0,0.05); border: 2px solid #000; }
                .order-details ul { list-style: none; padding-left: 10px; }
                .order-details li { padding: 5px 0; border-bottom: 1px dotted #ccc; }
                .order-total { margin-top: 15px; font-weight: bold; font-size: 18px; }
                .confirmation-message { margin-bottom: 20px; }
                
                /* Animación botón de compra */
                .buy-button.clicked { transform: scale(0.95); opacity: 0.8; }
                
                /* Efectos encabezados de sección */
                section:target { animation: highlightSection 1s ease-out; }
                @keyframes highlightSection { 0% { background-color: rgba(183,141,224,0.3); } 100% { background-color: transparent; } }
                
                /* Carrito activo */
                .cart-overlay.active { opacity: 1; }
                .cart-overlay { opacity: 0; transition: opacity 0.3s ease; }
                
                /* Mensaje carrito vacío */
                .empty-cart-message { color: #666; }
                .empty-cart-icon { width: 64px; height: 64px; margin: 0 auto; background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23999999" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5v12h14V7zm-9-1a2 2 0 0 1 4 0v1h-4V6z"/></svg>'); background-size: contain; background-position: center; opacity: 0.5; }
            `;
            document.head.appendChild(styleSheet);
        }
        
        animateOnScroll(element, animationClass) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(animationClass);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 }); // Adjusted threshold slightly
            observer.observe(element);
        }
    }
    
    const app = new CubeCremaApp();
});