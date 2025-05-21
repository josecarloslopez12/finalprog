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
            
            // Inicializar eventos del carrito
            this.initCartEvents();
        }
        
        // Inicializar eventos relacionados con el carrito
        initCartEvents() {
            // Botón cerrar carrito
            this.closeCartButton.addEventListener('click', () => {
                this.hideCart();
            });
            
            // Botón finalizar compra
            this.checkoutButton.addEventListener('click', () => {
                this.checkout();
            });
            
            // Cerrar carrito al hacer clic fuera
            this.cartOverlay.addEventListener('click', (e) => {
                if (e.target === this.cartOverlay) {
                    this.hideCart();
                }
            });
        }
        
        // Añadir un artículo al carrito
        addItem(id, type, name, price) {
            // Comprobar si el artículo ya está en el carrito
            const existingItemIndex = this.items.findIndex(item => 
                item.id === id && item.type === type);
            
            if (existingItemIndex !== -1) {
                // Si ya existe, incrementar cantidad
                this.items[existingItemIndex].quantity++;
            } else {
                // Si no existe, añadir nuevo artículo
                this.items.push({
                    id: id,
                    type: type,
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            
            // Actualizar la visualización del carrito
            this.updateCartDisplay();
            
            // Mostrar mensaje de confirmación con animación
            this.showAddedToCartMessage(name);
        }
        
        // Mostrar mensaje de confirmación animado
        showAddedToCartMessage(productName) {
            const messageContainer = document.createElement('div');
            messageContainer.className = 'added-to-cart-message';
            messageContainer.textContent = `¡${productName} añadido al carrito!`;
            
            document.body.appendChild(messageContainer);
            
            // Animar entrada
            setTimeout(() => {
                messageContainer.classList.add('show');
            }, 10);
            
            // Eliminar después de 2 segundos
            setTimeout(() => {
                messageContainer.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(messageContainer);
                }, 300);
            }, 2000);
        }
        
        // Eliminar un artículo del carrito
        removeItem(index) {
            this.items.splice(index, 1);
            this.updateCartDisplay();
        }
        
        // Cambiar la cantidad de un artículo
        updateQuantity(index, newQuantity) {
            if (newQuantity <= 0) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQuantity;
                this.updateCartDisplay();
            }
        }
        
        // Calcular el total del carrito
        calculateTotal() {
            return this.items.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0);
        }
        
        // Actualizar la visualización del carrito
        updateCartDisplay() {
            // Limpiar el contenedor de artículos
            this.cartItemsContainer.innerHTML = '';
            
            // Si no hay artículos, mostrar mensaje
            if (this.items.length === 0) {
                const emptyCartMessage = document.createElement('div');
                emptyCartMessage.className = 'empty-cart-message';
                emptyCartMessage.innerHTML = `
                    <div class="text-center py-4">
                        <div class="empty-cart-icon mb-3"></div>
                        <p>Tu carrito está vacío</p>
                    </div>
                `;
                this.cartItemsContainer.appendChild(emptyCartMessage);
            } else {
                // Añadir cada artículo al carrito
                this.items.forEach((item, index) => {
                    const cartItemElement = document.createElement('div');
                    cartItemElement.className = 'cart-item';
                    cartItemElement.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">$${item.price}</div>
                        </div>
                        <div class="cart-item-quantity">
                            <div class="quantity-btn decrease" data-index="${index}">-</div>
                            <div class="quantity-value">${item.quantity}</div>
                            <div class="quantity-btn increase" data-index="${index}">+</div>
                            <button class="remove-item" data-index="${index}">&times;</button>
                        </div>
                    `;
                    this.cartItemsContainer.appendChild(cartItemElement);
                });
                
                // Añadir eventos a los botones de cantidad y eliminar
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
            
            // Actualizar el total
            this.cartTotalElement.textContent = `$${this.calculateTotal()}`;
            
            // Actualizar contador de carrito en el icono (si existe)
            this.updateCartCounter();
        }
        
        // Actualizar contador de artículos en el icono del carrito
        updateCartCounter() {
            // Calcular número total de artículos
            const itemCount = this.items.reduce((count, item) => count + item.quantity, 0);
            
            // Crear o actualizar el contador
            let counterElement = document.querySelector('.cart-counter');
            
            if (!counterElement && itemCount > 0) {
                // Si no existe y hay artículos, crear el contador
                counterElement = document.createElement('div');
                counterElement.className = 'cart-counter';
                document.body.appendChild(counterElement);
            }
            
            if (counterElement) {
                if (itemCount > 0) {
                    counterElement.textContent = itemCount;
                    counterElement.style.display = 'flex';
                } else {
                    counterElement.style.display = 'none';
                }
            }
        }
        
        // Mostrar el carrito
        showCart() {
            this.updateCartDisplay();
            this.cartOverlay.style.display = 'flex';
            setTimeout(() => {
                this.cartOverlay.classList.add('active');
            }, 10);
        }
        
        // Ocultar el carrito
        hideCart() {
            this.cartOverlay.classList.remove('active');
            setTimeout(() => {
                this.cartOverlay.style.display = 'none';
            }, 300);
        }
        
        // Finalizar compra
        checkout() {
            if (this.items.length === 0) {
                alert('Tu carrito está vacío. Añade algunos productos antes de finalizar la compra.');
                return;
            }
            
            // Preparar datos para enviar al servidor
            const orderData = {
                items: this.items,
                total: this.calculateTotal(),
                timestamp: new Date().toISOString()
            };
            
            // Simulación de envío a la API de Spring Boot
            this.sendOrderToServer(orderData);
        }
        
        // Simulación de envío de pedido al servidor
        sendOrderToServer(orderData) {
            // Mostrar animación de carga
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'loading-overlay';
            loadingOverlay.innerHTML = `
                <div class="loading-container">
                    <div class="minecraft-loading-animation"></div>
                    <p>Procesando tu compra...</p>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            
            // Simular tiempo de procesamiento
            setTimeout(() => {
                // Eliminar animación de carga
                document.body.removeChild(loadingOverlay);
                
                // Mostrar confirmación
                this.showOrderConfirmation(orderData);
                
                // Limpiar carrito
                this.items = [];
                this.updateCartDisplay();
                this.hideCart();
            }, 2000);
            
            // Aquí es donde conectarías con tu backend Spring
            console.log('Datos del pedido que se enviarían al servidor:', orderData);
            /*
            fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Respuesta del servidor:', data);
                // Procesar respuesta...
            })
            .catch(error => {
                console.error('Error al enviar pedido:', error);
                // Manejar error...
            });
            */
        }
        
        // Mostrar confirmación de pedido
        showOrderConfirmation(orderData) {
            const confirmationOverlay = document.createElement('div');
            confirmationOverlay.className = 'confirmation-overlay';
            
            // Generar lista de items comprados
            const itemsList = orderData.items.map(item => 
                `<li>${item.name} x${item.quantity} - $${item.price * item.quantity}</li>`
            ).join('');
            
            confirmationOverlay.innerHTML = `
                <div class="confirmation-container minecraft-block">
                    <h3 class="minecraft-title">¡Compra Realizada!</h3>
                    <p>Gracias por tu compra en CubeCrema</p>
                    <div class="order-details">
                        <h4>Detalles del pedido:</h4>
                        <ul>
                            ${itemsList}
                        </ul>
                        <div class="order-total">Total: $${orderData.total}</div>
                    </div>
                    <div class="confirmation-message">
                        <p>Los objetos serán añadidos a tu cuenta cuando inicies sesión en el servidor.</p>
                        <p>ID de Transacción: ${this.generateTransactionId()}</p>
                    </div>
                    <button class="minecraft-button primary close-confirmation">Continuar</button>
                </div>
            `;
            
            document.body.appendChild(confirmationOverlay);
            
            // Añadir evento para cerrar confirmación
            confirmationOverlay.querySelector('.close-confirmation').addEventListener('click', () => {
                document.body.removeChild(confirmationOverlay);
            });
        }
        
        // Generar ID de transacción aleatorio
        generateTransactionId() {
            return 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
    }
    
    // Clase para gestionar la comunicación con la base de datos
    class DatabaseManager {
        constructor() {
            // URL base para las API
            this.apiBaseUrl = '/api';
            
            // Estructura de datos simulada
            this.products = {
                packs: [
                    { id: 1, name: 'Pack Crema', price: 15, description: 'Set inicial: Todo diamante y encantado' },
                    { id: 2, name: 'Pack Netherite', price: 25, description: 'Set completo de equipo de Netherite' },
                    { id: 3, name: 'Pack Crema Premium', price: 40, description: 'Pack Netherite completamente encantado' }
                ],
                ranks: [
                    { id: 1, name: 'Rango Crema', price: 10, description: 'Acceso a características básicas premium' },
                    { id: 2, name: 'Rango Crema Gustosa', price: 20, description: 'Acceso a características intermedias premium' },
                    { id: 3, name: 'Rango Crema Supremo', price: 35, description: 'Acceso total a características premium' }
                ],
                xp: [
                    { id: 1, name: '50 Niveles de XP', price: 5, description: '50 niveles de experiencia' },
                    { id: 2, name: '150 Niveles de XP', price: 12, description: '150 niveles de experiencia' },
                    { id: 3, name: '300 Niveles de XP', price: 20, description: '300 niveles de experiencia' }
                ]
            };
        }
        
        // Obtener todos los productos de un tipo específico
        getProducts(type) {
            return new Promise((resolve) => {
                // Simular retardo de red
                setTimeout(() => {
                    resolve(this.products[type]);
                }, 200);
            });
        }
        
        // Obtener un producto específico por ID y tipo
        getProduct(type, id) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const product = this.products[type].find(item => item.id === id);
                    resolve(product);
                }, 100);
            });
        }
        
        // Este método simulará el envío de una orden a tu backend de Spring
        sendOrder(orderData) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Simular respuesta exitosa
                    resolve({
                        success: true,
                        orderId: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                        message: 'Orden procesada correctamente'
                    });
                }, 1500);
            });
        }
    }
    
    // Clase principal de la aplicación
    class CubeCremaApp {
        constructor() {
            // Inicializar componentes principales
            this.cart = new ShoppingCart();
            this.dbManager = new DatabaseManager();
            
            // Inicializar eventos de la aplicación
            this.initAppEvents();
            
            // Inicializar animaciones
            this.initAnimations();
        }
        
        // Inicializar eventos de la aplicación
        initAppEvents() {
            // Evento para los botones de compra
            document.querySelectorAll('.buy-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = parseInt(e.target.dataset.id);
                    const type = e.target.dataset.type;
                    const name = e.target.dataset.name;
                    const price = parseFloat(e.target.dataset.price);
                    
                    // Añadir al carrito
                    this.cart.addItem(id, type, name, price);
                    
                    // Animar botón
                    this.animateButton(e.target);
                });
            });
            
            // Evento para mostrar el carrito (podría ser un botón en el header)
            const cartBtn = document.createElement('div');
            cartBtn.className = 'floating-cart-btn';
            cartBtn.innerHTML = '<i class="fa fa-shopping-cart"></i>';
            document.body.appendChild(cartBtn);
            
            cartBtn.addEventListener('click', () => {
                this.cart.showCart();
            });
            
            // Evento para contacto - simular envío
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                const submitButton = contactForm.querySelector('button');
                
                submitButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Simular envío de formulario
                    const nameInput = contactForm.querySelector('input[type="text"]');
                    const emailInput = contactForm.querySelector('input[type="email"]');
                    const messageInput = contactForm.querySelector('textarea');
                    
                    if (nameInput.value && emailInput.value && messageInput.value) {
                        // Mostrar mensaje de éxito
                        const successMessage = document.createElement('div');
                        successMessage.className = 'alert alert-success mt-3';
                        successMessage.innerHTML = '¡Mensaje enviado correctamente! Te responderemos pronto.';
                        
                        contactForm.appendChild(successMessage);
                        
                        // Limpiar formulario
                        nameInput.value = '';
                        emailInput.value = '';
                        messageInput.value = '';
                        
                        // Eliminar mensaje después de 3 segundos
                        setTimeout(() => {
                            contactForm.removeChild(successMessage);
                        }, 3000);
                    } else {
                        // Mostrar mensaje de error
                        const errorMessage = document.createElement('div');
                        errorMessage.className = 'alert alert-danger mt-3';
                        errorMessage.innerHTML = 'Por favor, completa todos los campos.';
                        
                        contactForm.appendChild(errorMessage);
                        
                        // Eliminar mensaje después de 3 segundos
                        setTimeout(() => {
                            contactForm.removeChild(errorMessage);
                        }, 3000);
                    }
                });
            }
            
            // Inicializar tooltips de Bootstrap si existen
            if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
                const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
                tooltips.forEach(tooltip => {
                    new bootstrap.Tooltip(tooltip);
                });
            }
        }
        
        // Animar botón de compra
        animateButton(button) {
            button.classList.add('clicked');
            setTimeout(() => {
                button.classList.remove('clicked');
            }, 300);
        }
        
        // Inicializar animaciones generales
        initAnimations() {
            // Animación para títulos
            const titles = document.querySelectorAll('.minecraft-title');
            titles.forEach(title => {
                this.animateOnScroll(title, 'animate__fadeIn');
            });
            
            // Animación para tarjetas de producto
            const productCards = document.querySelectorAll('.product-card, .rank-card, .xp-card');
            productCards.forEach(card => {
                this.animateOnScroll(card, 'animate__fadeInUp');
            });
            
            // Añadir estilos para las animaciones
            this.addAnimationStyles();
        }
        
        // Añadir estilos CSS para animaciones
        addAnimationStyles() {
            const styleSheet = document.createElement('style');
            styleSheet.textContent = `
                /* Estilos para animaciones */
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from { 
                        opacity: 0;
                        transform: translate3d(0, 30px, 0);
                    }
                    to { 
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }
                
                .animate__fadeIn {
                    animation: fadeIn 1s ease-out;
                }
                
                .animate__fadeInUp {
                    animation: fadeInUp 0.8s ease-out;
                }
                
                /* Estilos para botón flotante de carrito */
                .floating-cart-btn {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    width: 60px;
                    height: 60px;
                    background-color: var(--primary-color);
                    border: 3px solid #000;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    color: var(--text-light);
                    font-size: 24px;
                    cursor: pointer;
                    z-index: 999;
                    box-shadow: 0 4px 0 #000, 0 6px 10px rgba(0, 0, 0, 0.2);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .floating-cart-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 7px 0 #000, 0 8px 15px rgba(0, 0, 0, 0.3);
                }
                
                .floating-cart-btn:active {
                    transform: translateY(1px);
                    box-shadow: 0 3px 0 #000, 0 4px 5px rgba(0, 0, 0, 0.2);
                }
                
                /* Estilos para contador de carrito */
                .cart-counter {
                    position: fixed;
                    bottom: 25px;
                    right: 25px;
                    width: 24px;
                    height: 24px;
                    background-color: var(--minecraft-brown);
                    border: 2px solid #000;
                    border-radius: 50%;
                    color: var(--text-light);
                    font-size: 12px;
                    font-weight: bold;
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                /* Estilos para mensaje de "añadido al carrito" */
                .added-to-cart-message {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-100px);
                    background-color: var(--primary-color);
                    color: var(--text-light);
                    padding: 10px 20px;
                    border: 3px solid #000;
                    border-radius: 0;
                    font-weight: bold;
                    z-index: 1001;
                    box-shadow: 0 4px 0 #000;
                    transition: transform 0.3s ease;
                }
                
                .added-to-cart-message.show {
                    transform: translateX(-50%) translateY(0);
                }
                
                /* Estilos para overlay de carga */
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                
                .loading-container {
                    background-color: var(--light-bg);
                    border: 4px solid #000;
                    padding: 30px;
                    text-align: center;
                }
                
                .minecraft-loading-animation {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto 20px;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23B78DE0" d="M12 2l10 10-10 10L2 12z"/></svg>');
                    background-size: contain;
                    background-position: center;
                    animation: rotate 2s infinite linear;
                }
                
                @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Estilos para confirmación de pedido */
                .confirmation-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 2000;
                }
                
                .confirmation-container {
                    background-color: var(--light-bg);
                    max-width: 600px;
                    width: 90%;
                    padding: 30px;
                    border: 4px solid #000;
                    color: var(--text-dark);
                }
                
                .order-details {
                    margin: 20px 0;
                    padding: 15px;
                    background-color: rgba(0, 0, 0, 0.05);
                    border: 2px solid #000;
                }
                
                .order-details ul {
                    list-style: none;
                    padding-left: 10px;
                }
                
                .order-details li {
                    padding: 5px 0;
                    border-bottom: 1px dotted #ccc;
                }
                
                .order-total {
                    margin-top: 15px;
                    font-weight: bold;
                    font-size: 18px;
                }
                
                .confirmation-message {
                    margin-bottom: 20px;
                }
                
                /* Estilos para animación de botón de compra */
                .buy-button.clicked {
                    transform: scale(0.95);
                    opacity: 0.8;
                }
                
                /* Efectos para encabezados de sección */
                section:target {
                    animation: highlightSection 1s ease-out;
                }
                
                @keyframes highlightSection {
                    0% { background-color: rgba(183, 141, 224, 0.3); }
                    100% { background-color: transparent; }
                }
                
                /* Estilo para carrito activo */
                .cart-overlay.active {
                    opacity: 1;
                }
                
                .cart-overlay {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                /* Estilo para mensaje de carrito vacío */
                .empty-cart-message {
                    color: #666;
                }
                
                .empty-cart-icon {
                    width: 64px;
                    height: 64px;
                    margin: 0 auto;
                    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%23999999" d="M19 7h-3V6a4 4 0 0 0-8 0v1H5v12h14V7zm-9-1a2 2 0 0 1 4 0v1h-4V6z"/></svg>');
                    background-size: contain;
                    background-position: center;
                    opacity: 0.5;
                }
            `;
            
            document.head.appendChild(styleSheet);
        }
        
        // Animar elementos al hacer scroll
        animateOnScroll(element, animationClass) {
            // Crear un observer para detectar cuando el elemento es visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(animationClass);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            // Observar el elemento
            observer.observe(element);
        }
    }
    
    // Inicializar la aplicación
    const app = new CubeCremaApp();
});