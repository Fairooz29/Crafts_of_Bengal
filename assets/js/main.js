console.log('main.js loaded');
// Main JavaScript file for Crafts of Bengal

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initAuthentication();
    initCart();
    initProfileTabs();
    initFAQ();
    initFormValidation();
    initPaymentMethods();
    initSearch();
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully!', 'success');
            contactForm.reset();
        });
    }
    if (window.location.pathname.includes('handicrafts.html')) {
        loadProducts();
    }
});

// API Base URL
const API_BASE_URL = 'http://localhost/handicrafts_marketplace/backend/api';

// Authentication Functions
function initAuthentication() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');

    // Basic validation
    if (!email || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    showNotification('Logging in...', 'info');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();
        
        if (data.message === 'Login successful') {
            // Store user session
            const sessionData = {
                user_id: data.user.id,
                email: data.user.email,
                name: data.user.first_name + ' ' + data.user.last_name,
                loggedIn: true,
                timestamp: Date.now()
            };
            
            if (remember) {
                localStorage.setItem('userSession', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('userSession', JSON.stringify(sessionData));
            }
            
            showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const terms = formData.get('terms');

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (!terms) {
        showNotification('Please accept the terms and conditions', 'error');
        return;
    }

    showNotification('Creating your account...', 'info');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phone,
                password: password,
                date_of_birth: '1990-01-01' // Default value, can be updated later
            })
        });

        const data = await response.json();
        
        if (data.message === 'Registration successful') {
            showNotification('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Cart Management
function initCart() {
    // Load cart from localStorage
    loadCart();
    
    // Add event listeners for cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn, .hero-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId || 'default';
            const productName = this.dataset.productName || 'Product';
            const productPrice = this.dataset.productPrice || '1000';
            const productImage = this.dataset.productImage || 'assets/images/handicraft1.jpg';
            
            addToCart(productId, productName, productPrice, productImage);
        });
    });

    // Cart icon click handler
    const cartIcon = document.querySelector('.icon-cart');
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
}

function addToCart(productId, name, price, image) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: parseFloat(price),
            image: image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification(`${name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
        }
    }
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay();
    
    // Update cart page if we're on it
    const cartContainer = document.querySelector('.cart-items');
    if (cartContainer) {
        renderCartItems(cartContainer, cart);
    }
}

function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update cart icon badge if it exists
    const cartIcon = document.querySelector('.icon-cart');
    if (cartIcon) {
        // Remove existing badge
        const existingBadge = cartIcon.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge if there are items
        if (totalItems > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = totalItems;
            badge.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ed7b2a;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            cartIcon.style.position = 'relative';
            cartIcon.appendChild(badge);
        }
    }
}

function renderCartItems(container, cart) {
    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">৳${item.price}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn minus" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
    `).join('');
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.querySelector('.cart-total');
    if (totalElement) {
        totalElement.textContent = `৳${total.toFixed(2)}`;
    }
}

// Profile Tab Management
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('.nav-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faq => faq.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#d32f2f';
                } else {
                    field.style.borderColor = '#e0e0e0';
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill in all required fields', 'error');
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        field.style.borderColor = '#d32f2f';
        return false;
    }
    
    if (field.type === 'email' && value && !isValidEmail(value)) {
        field.style.borderColor = '#d32f2f';
        return false;
    }
    
    if (field.type === 'password' && value && value.length < 6) {
        field.style.borderColor = '#d32f2f';
        return false;
    }
    
    field.style.borderColor = '#e0e0e0';
    return true;
}

// Payment Methods
function initPaymentMethods() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardForm = document.getElementById('cardForm');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card') {
                cardForm.style.display = 'block';
            } else {
                cardForm.style.display = 'none';
            }
        });
    });
}

// Search Functionality
function initSearch() {
    const searchForm = document.querySelector('.search-bar');
    const searchInput = document.querySelector('.search-bar input[type="text"]');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim();
            
            if (query) {
                // In a real app, you would redirect to search results page
                showNotification(`Searching for: ${query}`, 'info');
                // window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

// Utility Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#d32f2f' : type === 'success' ? '#2e7d32' : '#1976d2'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Check if user is logged in
function isLoggedIn() {
    const session = JSON.parse(localStorage.getItem('userSession') || sessionStorage.getItem('userSession') || '{}');
    return session.loggedIn === true;
}

// Load user profile from backend
async function loadUserProfile() {
    if (!isLoggedIn()) {
        return null;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth.php?action=profile`, {
            method: 'GET',
            credentials: 'include' // Include cookies for session
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.user;
        } else {
            console.error('Failed to load profile');
            return null;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        return null;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    showNotification('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Update header based on login status
function updateHeader() {
    const profileAvatar = document.querySelector('.profile-avatar');
    const headerActions = document.querySelector('.header-actions');
    
    if (isLoggedIn()) {
        // Show profile avatar and logout option
        if (profileAvatar) {
            profileAvatar.style.display = 'block';
            profileAvatar.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
    } else {
        // Show login/register buttons
        if (headerActions && !document.querySelector('.auth-buttons')) {
            const authButtons = document.createElement('div');
            authButtons.className = 'auth-buttons';
            authButtons.innerHTML = `
                <a href="login.html" class="auth-link">Login</a>
                <a href="register.html" class="auth-link register">Register</a>
            `;
            headerActions.appendChild(authButtons);
        }
    }
}

// Initialize header on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHeader();
});

// Payment handling
function handlePaymentSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('paymentForm');
    const formData = new FormData(form);
    
    // Get payment method
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'];
    let isValid = true;
    
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#d32f2f';
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });
    
    if (!isValid) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate card details if card payment is selected
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiryDate = document.getElementById('expiryDate').value;
        const cvv = document.getElementById('cvv').value;
        const cardName = document.getElementById('cardName').value;
        
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
            showNotification('Please fill in all card details', 'error');
            return;
        }
    }
    
    // Show processing message
    showNotification('Processing your payment...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
        showNotification('Payment successful! Your order has been placed.', 'success');
        
        // Clear cart
        localStorage.removeItem('cart');
        updateCartDisplay();
        
        // Redirect to order confirmation
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
    }, 3000);
}

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.logout = logout;
window.handlePaymentSubmit = handlePaymentSubmit;

function loadProducts(categoryId = null, artisanId = null) {
    let url = 'backend/api/get_products.php';
    const params = [];
    if (categoryId) params.push(`category_id=${categoryId}`);
    if (artisanId) params.push(`artisan_id=${artisanId}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url)
        .then(response => response.json())
        .then(products => {
            const grid = document.querySelector('.collection-grid');
            if (!grid) return;
            grid.innerHTML = '';
            products.forEach(product => {
                grid.innerHTML += `
                    <a href="product.html?id=${product.id}" class="collection-card">
                        <img src="${product.image}" alt="${product.name}" />
                        <div class="collection-title">${product.name}</div>
                        <div class="artisan-bio">${product.description}</div>
                        <div class="product-price">৳${product.price}</div>
                    </a>
                `;
            });
        })
        .catch(error => {
            console.error('Error loading products:', error);
        });
}

function loadCategories() {
    const select = document.getElementById('category-select');
    if (!select) {
        console.log('No #category-select found');
        return;
    }
    console.log('Loading categories...');
    fetch('backend/api/get_categories.php')
        .then(response => response.json())
        .then(categories => {
            select.innerHTML = '<option value="">Categories</option>';
            categories.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
}

function loadArtisans() {
    const select = document.getElementById('artisan-select');
    if (!select) return;
    fetch('backend/api/get_artisans.php')
        .then(response => response.json())
        .then(artisans => {
            select.innerHTML = '<option value="">Artisans</option>';
            artisans.forEach(artisan => {
                select.innerHTML += `<option value="${artisan.id}">${artisan.name}</option>`;
            });
        })
        .catch(error => {
            console.error('Error loading artisans:', error);
        });
}

function setupHandicraftsFilters() {
    const categorySelect = document.getElementById('category-select');
    const artisanSelect = document.getElementById('artisan-select');
    if (!categorySelect || !artisanSelect) return;
    function handleFilterChange() {
        const categoryId = categorySelect.value || null;
        const artisanId = artisanSelect.value || null;
        loadProducts(categoryId, artisanId);
    }
    categorySelect.addEventListener('change', handleFilterChange);
    artisanSelect.addEventListener('change', handleFilterChange);
}

if (window.location.pathname.includes('handicrafts.html')) {
    loadCategories();
    loadArtisans();
    setTimeout(setupHandicraftsFilters, 500); // Wait for dropdowns to populate
} 