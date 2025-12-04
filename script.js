// ==========================================
// FakeStore E-commerce Application
// ==========================================

const apiURL = 'https://dummyjson.com';

// Cache DOM elements for better performance
const DOM = {
  homeSection: document.getElementById('home-section'),
  productsContainer: document.getElementById('products'),
  categoriesNav: document.getElementById('categories'),
  modal: document.getElementById('modal'),
  modalMessage: document.getElementById('modal-message'),
  cartPanel: document.getElementById('cartPanel'),
  wishlistPanel: document.getElementById('wishlistPanel'),
  panelOverlay: document.getElementById('panelOverlay'),
  checkoutModal: document.getElementById('checkoutModal'),
  checkoutContent: document.getElementById('checkoutContent'),
  cartAnimation: document.getElementById('cartAnimation'),
  hamburgerBtn: document.getElementById('hamburgerBtn'),
  mainNav: document.getElementById('mainNav')
};

// Product cache to reduce API calls
const productCache = new Map();

// ==========================================
// Mobile Navigation Functions
// ==========================================

function initMobileNav() {
  const hamburger = DOM.hamburgerBtn;
  const nav = DOM.mainNav;
  const closeBtn = document.getElementById('mobileNavClose');
  
  if (!hamburger || !nav) return;

  // Toggle mobile menu
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMobileNav();
  });

  // Close button handler
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileNav();
    });
  }

  // Close menu when clicking outside (works for both mobile and desktop)
  document.addEventListener('click', (e) => {
    // Close mobile nav if clicking outside
    if (nav.classList.contains('active') && 
        !nav.contains(e.target) && 
        !hamburger.contains(e.target)) {
      closeMobileNav();
    }
    
    // Close desktop mega menus when clicking outside
    if (!e.target.closest('.mega-menu')) {
      document.querySelectorAll('.mega-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (nav.classList.contains('active')) {
        closeMobileNav();
      }
      // Also close any open mega menus
      document.querySelectorAll('.mega-menu.active').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  // Close menu on window resize if screen becomes large
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && nav.classList.contains('active')) {
      closeMobileNav();
    }
  });
}

function toggleMobileNav() {
  const hamburger = DOM.hamburgerBtn;
  const nav = DOM.mainNav;
  
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
  document.body.classList.toggle('nav-open');
  
  // Update aria-expanded attribute
  const isExpanded = nav.classList.contains('active');
  hamburger.setAttribute('aria-expanded', isExpanded);
}

function closeMobileNav() {
  const hamburger = DOM.hamburgerBtn;
  const nav = DOM.mainNav;
  
  hamburger.classList.remove('active');
  nav.classList.remove('active');
  document.body.classList.remove('nav-open');
  hamburger.setAttribute('aria-expanded', 'false');
  
  // Close all open submenus
  document.querySelectorAll('.mega-menu.active').forEach(menu => {
    menu.classList.remove('active');
  });
}

// ==========================================
// Utility Functions
// ==========================================

function setActiveCategory(category) {
  const links = DOM.categoriesNav.querySelectorAll('a');
  const targetCat = category.toLowerCase();
  
  links.forEach(link => {
    const linkText = link.textContent.toLowerCase();
    const isActive = linkText === targetCat || (category === '' && linkText === 'home');
    link.classList.toggle('active', isActive);
  });
}

// ==========================================
// Navigation Functions
// ==========================================

function showHome() {
  DOM.homeSection.style.display = 'block';
  DOM.productsContainer.classList.remove('show');
  DOM.productsContainer.style.display = 'none';
  setActiveCategory('');
  hidePanels();
  closeMobileNav();
}

function showProducts(category = '') {
  DOM.homeSection.style.display = 'none';
  DOM.productsContainer.style.display = 'grid';
  DOM.productsContainer.classList.add('show');
  loadProducts(category);
  setActiveCategory(category);
  hidePanels();
  closeMobileNav();
}

// ==========================================
// Category Loading
// ==========================================

async function loadCategories() {
  try {
    const res = await fetch(`${apiURL}/products/category-list`);
    const categories = await res.json();
    
    // Keep the mobile nav header, clear other items
    const mobileHeader = DOM.categoriesNav.querySelector('.mobile-nav-header');
    DOM.categoriesNav.innerHTML = '';
    if (mobileHeader) {
      DOM.categoriesNav.appendChild(mobileHeader);
      // Re-attach event listener if needed, or just rely on initMobileNav
      const closeBtn = mobileHeader.querySelector('.mobile-nav-close');
      if (closeBtn) closeBtn.onclick = closeMobileNav;
    }
    
    // Create Home button
    createNavItem('Home', '#home', (e) => {
      e.preventDefault();
      showHome();
    });

    // Mega menu groups configuration
    const megaMenuGroups = {
      'Electronics': ['smartphones', 'laptops', 'automotive'],
      'Home & Living': ['furniture', 'home-decoration', 'lighting', 'kitchen-accessories'],
      'Fashion': ['mens-shirts', 'mens-shoes', 'mens-watches', 'womens-dresses', 'womens-shoes', 'womens-watches', 'womens-bags', 'womens-jewellery', 'tops', 'sunglasses']
    };

    // Create mega menu structure
    Object.entries(megaMenuGroups).forEach(([groupName, groupCategories]) => {
      createMegaMenu(groupName, groupCategories, categories);
    });

    // Create Cart and Wishlist buttons
    createCartButton();
    createWishlistButton();
    
    // Initialize counters
    updateCartCounter();
    updateWishlistCounter();
  } catch (error) {
    console.error('Error loading categories:', error);
    showModal('Failed to load categories. Please refresh the page.');
  }
}

// Removed createMobileNavHeader as it is now in HTML

function createNavItem(text, href, onClick) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  a.onclick = onClick;
  li.appendChild(a);
  DOM.categoriesNav.appendChild(li);
}

function createMegaMenu(groupName, groupCategories, allCategories) {
  const megaLi = document.createElement('li');
  megaLi.className = 'mega-menu';
  
  const megaA = document.createElement('a');
  megaA.href = '#';
  megaA.textContent = groupName;
  megaA.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Close all other dropdowns
    document.querySelectorAll('.mega-menu').forEach(menu => {
      if (menu !== megaLi) menu.classList.remove('active');
    });
    megaLi.classList.toggle('active');
  };
  
  const dropdown = document.createElement('div');
  dropdown.className = 'mega-dropdown';
  
  // Add matching categories to dropdown
  allCategories.forEach(category => {
    const categoryName = typeof category === 'string' ? category : category.name || category.slug;
    if (groupCategories.includes(categoryName)) {
      const categoryLink = createCategoryLink(categoryName, megaLi);
      dropdown.appendChild(categoryLink);
    }
  });
  
  megaLi.appendChild(megaA);
  megaLi.appendChild(dropdown);
  DOM.categoriesNav.appendChild(megaLi);
}

function createCategoryLink(categoryName, parentMenu) {
  const a = document.createElement('a');
  a.href = `#${categoryName}`;
  a.textContent = formatCategoryName(categoryName);
  a.onclick = (e) => {
    e.preventDefault();
    showProducts(categoryName);
    parentMenu.classList.remove('active');
  };
  return a;
}

function formatCategoryName(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
}

function createCartButton() {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.id = 'cartButton';
  btn.innerHTML = 'Cart 🛒 <span id="cartCounter" class="counter">0</span>';
  btn.onclick = () => {
    closeMobileNav();
    togglePanel('cartPanel');
    renderCart();
  };
  li.appendChild(btn);
  DOM.categoriesNav.appendChild(li);
}

function createWishlistButton() {
  const li = document.createElement('li');
  const btn = document.createElement('button');
  btn.id = 'wishlistButton';
  btn.innerHTML = 'Wishlist 💙 <span id="wishlistCounter" class="counter">0</span>';
  btn.onclick = () => {
    closeMobileNav();
    togglePanel('wishlistPanel');
    renderWishlist();
  };
  li.appendChild(btn);
  DOM.categoriesNav.appendChild(li);
}

// ==========================================
// Product Loading & Display
// ==========================================

async function loadProducts(category = '') {
  try {
    const url = category 
      ? `${apiURL}/products/category/${category}` 
      : `${apiURL}/products`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();
    const products = data.products || data;

    DOM.productsContainer.innerHTML = '';

    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
      // Cache product data
      productCache.set(product.id, product);
      fragment.appendChild(createProductCard(product));
    });
    
    DOM.productsContainer.appendChild(fragment);
  } catch (error) {
    console.error('Error loading products:', error);
    DOM.productsContainer.innerHTML = '<div class="error-message">Failed to load products. Please check your internet connection and try again.</div>';
    showModal('Failed to load products. Please check your internet connection and try again.');
  }
}

function createProductCard(product) {
  const div = document.createElement('div');
  div.className = 'product';
  div.innerHTML = `
    <img src="${product.thumbnail || product.image}" alt="${product.title}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='" />
    <h3>${product.title}</h3>
    <p class="price">$${product.price.toFixed(2)}</p>
    <div class="buttons">
      <button class="morphing-button" data-action="details" data-id="${product.id}">
        <span>Details</span>
        <i class="fas fa-info-circle"></i>
      </button>
      <button class="morphing-button" data-action="cart" data-id="${product.id}">
        <span>Add to Cart</span>
        <i class="fas fa-shopping-cart"></i>
      </button>
      <button class="morphing-button" data-action="wishlist" data-id="${product.id}">
        <span>Wishlist</span>
        <i class="fas fa-heart"></i>
      </button>
    </div>
  `;
  return div;
}

// Event delegation for product buttons
DOM.productsContainer.addEventListener('click', (e) => {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  
  const action = button.dataset.action;
  const productId = parseInt(button.dataset.id, 10);
  
  switch (action) {
    case 'details':
      showProductDetails(productId);
      break;
    case 'cart':
      addToCart(productId);
      break;
    case 'wishlist':
      addToWishlist(productId);
      break;
  }
});

// ==========================================
// Modal Functions
// ==========================================

function showModal(message) {
  DOM.modalMessage.textContent = message;
  DOM.modal.style.display = 'flex';
}

function closeModal(event) {
  if (!event || event.target === DOM.modal) {
    DOM.modal.style.display = 'none';
  }
}

// ==========================================
// Panel Functions
// ==========================================

function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  const otherPanelId = panelId === 'cartPanel' ? 'wishlistPanel' : 'cartPanel';
  const otherPanel = document.getElementById(otherPanelId);

  if (panel.classList.contains('show')) {
    panel.classList.remove('show');
    DOM.panelOverlay.classList.remove('show');
  } else {
    otherPanel.classList.remove('show');
    panel.classList.add('show');
    DOM.panelOverlay.classList.add('show');
  }
}

function hidePanels() {
  DOM.cartPanel.classList.remove('show');
  DOM.wishlistPanel.classList.remove('show');
  DOM.panelOverlay.classList.remove('show');
}

DOM.panelOverlay.addEventListener('click', hidePanels);

// ==========================================
// Storage Helpers
// ==========================================

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
  } catch {
    return [];
  }
}

function setWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// ==========================================
// Counter Functions
// ==========================================

function updateCartCounter() {
  const counter = document.getElementById('cartCounter');
  if (counter) {
    const cart = getCartWithQuantity();
    const count = Object.keys(cart).length;
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    counter.textContent = totalItems;
    counter.style.display = count > 0 ? 'inline' : 'none';
    counter.setAttribute('data-testid', 'cart-counter');
  }
}

function updateWishlistCounter() {
  const counter = document.getElementById('wishlistCounter');
  if (counter) {
    const count = getWishlist().length;
    counter.textContent = count;
    counter.style.display = count > 0 ? 'inline' : 'none';
    counter.setAttribute('data-testid', 'wishlist-counter');
  }
}

// ==========================================
// Product Fetching with Cache
// ==========================================

async function fetchProduct(productId) {
  if (productCache.has(productId)) {
    return productCache.get(productId);
  }
  
  const res = await fetch(`${apiURL}/products/${productId}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
  const product = await res.json();
  productCache.set(productId, product);
  return product;
}

async function fetchProducts(productIds) {
  const products = await Promise.all(
    productIds.map(id => fetchProduct(id))
  );
  return products;
}

// ==========================================
// Cart Functions with Quantity Support
// ==========================================

function getCartWithQuantity() {
  try {
    const cart = JSON.parse(localStorage.getItem('cartWithQty')) || {};
    return cart;
  } catch {
    return {};
  }
}

function setCartWithQuantity(cart) {
  localStorage.setItem('cartWithQty', JSON.stringify(cart));
  // Also maintain simple cart array for backward compatibility
  const cartArray = Object.keys(cart).map(id => parseInt(id, 10));
  setCart(cartArray);
}

function addToCart(productId) {
  const cart = getCartWithQuantity();
  
  if (cart[productId]) {
    cart[productId]++;
    showModal('Quantity updated in cart!');
  } else {
    cart[productId] = 1;
    showCartAnimation();
  }
  
  setCartWithQuantity(cart);
  renderCart();
  updateCartCounter();
}

function removeFromCart(productId) {
  const cart = getCartWithQuantity();
  delete cart[productId];
  setCartWithQuantity(cart);
  renderCart();
  updateCartCounter();
}

function updateCartQuantity(productId, change) {
  const cart = getCartWithQuantity();
  if (!cart[productId]) return;
  
  cart[productId] += change;
  
  if (cart[productId] <= 0) {
    delete cart[productId];
  }
  
  setCartWithQuantity(cart);
  renderCart();
  updateCartCounter();
}

function showCartAnimation() {
  DOM.cartAnimation.classList.add('show');
  setTimeout(() => DOM.cartAnimation.classList.remove('show'), 2000);
}

async function renderCart() {
  const cart = getCartWithQuantity();
  const cartContent = document.getElementById('cartContent');
  const cartFooter = document.getElementById('cartFooter');
  const productIds = Object.keys(cart).map(id => parseInt(id, 10));
  
  // Update header badge
  const headerTitle = DOM.cartPanel.querySelector('.panel-title h2');
  if (headerTitle) {
    const count = productIds.length;
    headerTitle.innerHTML = `Shopping Cart${count > 0 ? ` <span class="panel-badge">${count}</span>` : ''}`;
  }
  
  if (productIds.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-state" data-testid="cart-empty">
        <div class="empty-icon">🛒</div>
        <p class="empty-message">Your cart is empty</p>
        <p class="empty-subtext">Add some products to get started!</p>
      </div>
    `;
    cartFooter.innerHTML = '';
    return;
  }
  
  try {
    const products = await fetchProducts(productIds);
    let subtotal = 0;
    
    cartContent.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
      const qty = cart[product.id] || 1;
      const itemTotal = product.price * qty;
      subtotal += itemTotal;
      
      const div = document.createElement('div');
      div.className = 'panel-item';
      div.setAttribute('data-testid', `cart-item-${product.id}`);
      div.innerHTML = `
        <img src="${product.thumbnail || product.image}" alt="${product.title}" class="item-image" />
        <div class="item-info">
          <div class="item-name">${product.title}</div>
          <div class="item-price">$${itemTotal.toFixed(2)}</div>
          <div class="quantity-controls">
            <button onclick="updateCartQuantity(${product.id}, -1)" data-testid="qty-decrease-${product.id}">−</button>
            <span class="quantity-value" data-testid="qty-value-${product.id}">${qty}</span>
            <button onclick="updateCartQuantity(${product.id}, 1)" data-testid="qty-increase-${product.id}">+</button>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-remove" onclick="removeFromCart(${product.id})" data-testid="remove-cart-${product.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      `;
      fragment.appendChild(div);
    });
    
    cartContent.appendChild(fragment);

    // Calculate totals
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + shipping;
    
    cartFooter.innerHTML = `
      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span class="total-price" data-testid="cart-total">$${total.toFixed(2)}</span>
        </div>
      </div>
      <button class="btn-checkout" onclick="openCheckout()" data-testid="checkout-btn">
        <i class="fas fa-lock"></i>
        Secure Checkout
      </button>
    `;
  } catch (error) {
    console.error('Error rendering cart:', error);
    cartContent.innerHTML = '<p class="empty-message">Error loading cart items.</p>';
  }
}

// ==========================================
// Wishlist Functions
// ==========================================

function addToWishlist(productId) {
  const wishlist = getWishlist();
  if (wishlist.includes(productId)) {
    showModal('Product already in wishlist.');
    return;
  }
  
  wishlist.push(productId);
  setWishlist(wishlist);
  renderWishlist();
  updateWishlistCounter();
  showModal('Product added to wishlist!');
}

function removeFromWishlist(productId) {
  const wishlist = getWishlist().filter(id => id !== productId);
  setWishlist(wishlist);
  renderWishlist();
  updateWishlistCounter();
}

function moveToCart(productId) {
  // Remove from wishlist
  const wishlist = getWishlist().filter(id => id !== productId);
  setWishlist(wishlist);
  
  // Add to cart
  addToCart(productId);
  
  renderWishlist();
  updateWishlistCounter();
  showModal('Product moved to cart!');
}

async function renderWishlist() {
  const wishlist = getWishlist();
  const wishlistContent = document.getElementById('wishlistContent');
  
  // Update header badge
  const headerTitle = DOM.wishlistPanel.querySelector('.panel-title h2');
  if (headerTitle) {
    const count = wishlist.length;
    headerTitle.innerHTML = `My Wishlist${count > 0 ? ` <span class="panel-badge">${count}</span>` : ''}`;
  }
  
  if (wishlist.length === 0) {
    wishlistContent.innerHTML = `
      <div class="empty-state" data-testid="wishlist-empty">
        <div class="empty-icon">💙</div>
        <p class="empty-message">Your wishlist is empty</p>
        <p class="empty-subtext">Save items you love for later!</p>
      </div>
    `;
    return;
  }
  
  try {
    const products = await fetchProducts(wishlist);
    wishlistContent.innerHTML = '';
    const fragment = document.createDocumentFragment();
    
    products.forEach(product => {
      const div = document.createElement('div');
      div.className = 'panel-item';
      div.setAttribute('data-testid', `wishlist-item-${product.id}`);
      div.innerHTML = `
        <img src="${product.thumbnail || product.image}" alt="${product.title}" class="item-image" />
        <div class="item-info">
          <div class="item-name">${product.title}</div>
          <div class="item-price">$${product.price.toFixed(2)}</div>
        </div>
        <div class="item-actions">
          <button class="btn-move-to-cart" onclick="moveToCart(${product.id})" data-testid="move-to-cart-${product.id}">
            <i class="fas fa-cart-plus"></i> Add to Cart
          </button>
          <button class="btn-remove" onclick="removeFromWishlist(${product.id})" data-testid="remove-wishlist-${product.id}">
            <i class="fas fa-trash"></i> Remove
          </button>
        </div>
      `;
      fragment.appendChild(div);
    });
    
    wishlistContent.appendChild(fragment);
  } catch (error) {
    console.error('Error rendering wishlist:', error);
    wishlistContent.innerHTML = '<p class="empty-message">Error loading wishlist items.</p>';
  }
}

// ==========================================
// Product Details
// ==========================================

async function showProductDetails(productId) {
  try {
    const product = await fetchProduct(productId);
    const categoryFormatted = product.category.charAt(0).toUpperCase() + product.category.slice(1).replace(/-/g, ' ');
    
    DOM.modalMessage.innerHTML = `
      <div class="product-details-content">
        <div class="product-details-header">
          <div class="product-details-image-container">
            <img src="${product.thumbnail || product.image}" alt="${product.title}" class="product-details-image" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='" />
          </div>
          <h2 class="product-details-title">${product.title}</h2>
          <div class="product-details-category">
            <i class="fas fa-tag"></i>
            ${categoryFormatted}
          </div>
        </div>
        
        <div class="product-details-description">
          <p>${product.description}</p>
        </div>
        
        <div class="product-details-price-section">
          <span class="product-details-price">$${product.price.toFixed(2)}</span>
          ${product.discountPercentage ? `<span style="color: #ff6b6b; font-size: 0.9rem; text-decoration: line-through;">$${(product.price / (1 - product.discountPercentage/100)).toFixed(2)}</span>` : ''}
        </div>
        
        <div class="product-details-actions">
          <button class="btn-add-cart" onclick="addToCart(${product.id}); closeModal();">
            <i class="fas fa-shopping-cart"></i>
            Add to Cart
          </button>
          <button class="btn-add-wishlist" onclick="addToWishlist(${product.id}); closeModal();">
            <i class="fas fa-heart"></i>
            Wishlist
          </button>
        </div>
      </div>
    `;
    DOM.modal.style.display = 'flex';
  } catch (error) {
    console.error('Error loading product details:', error);
    showModal('Failed to load product details. Please try again.');
  }
}

// ==========================================
// Checkout Functions
// ==========================================

async function openCheckout() {
  const cartWithQty = getCartWithQuantity();
  const productIds = Object.keys(cartWithQty).map(id => parseInt(id, 10));
  
  if (productIds.length === 0) {
    showModal('Your cart is empty.');
    return;
  }

  try {
    const products = await fetchProducts(productIds);
    let subtotal = 0;
    
    const orderItems = products.map(product => {
      const qty = cartWithQty[product.id] || 1;
      const itemTotal = product.price * qty;
      subtotal += itemTotal;
      return `
        <div class="order-item">
          <span>${product.title} ${qty > 1 ? `(×${qty})` : ''}</span>
          <span>$${itemTotal.toFixed(2)}</span>
        </div>
      `;
    }).join('');
    
    const shipping = subtotal > 50 ? 0 : 9.99;
    const total = subtotal + shipping;

    DOM.checkoutContent.innerHTML = `
      <div class="order-summary">
        <h3>Order Summary</h3>
        ${orderItems}
        <div class="order-item" style="border-bottom: 1px dashed rgba(0,255,255,0.2); padding-bottom: 0.5rem;">
          <span>Subtotal</span>
          <span>$${subtotal.toFixed(2)}</span>
        </div>
        <div class="order-item" style="border-bottom: 1px dashed rgba(0,255,255,0.2); padding-bottom: 0.5rem;">
          <span>Shipping</span>
          <span>${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}</span>
        </div>
        <div class="order-item">
          <span><strong>Total</strong></span>
          <span><strong>$${total.toFixed(2)}</strong></span>
        </div>
      </div>

      <form class="checkout-form" onsubmit="processCheckout(event)">
        <div class="form-row">
          <div class="form-group">
            <label for="customerName"><i class="fas fa-user"></i> Full Name *</label>
            <input type="text" id="customerName" placeholder="John Doe" required>
          </div>
          
          <div class="form-group">
            <label for="customerEmail"><i class="fas fa-envelope"></i> Email *</label>
            <input type="email" id="customerEmail" placeholder="john@example.com" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="customerPhone"><i class="fas fa-phone"></i> Phone *</label>
            <input type="tel" id="customerPhone" placeholder="+1 234 567 8900" required>
          </div>
          
          <div class="form-group">
            <label for="customerCity"><i class="fas fa-city"></i> City *</label>
            <input type="text" id="customerCity" placeholder="New York" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="customerAddress"><i class="fas fa-map-marker-alt"></i> Delivery Address *</label>
          <input type="text" id="customerAddress" placeholder="123 Main Street, Apt 4B" required>
        </div>

        <div class="payment-section-title">
          <i class="fas fa-credit-card"></i>
          <span>Select Payment Method</span>
        </div>
        
        <div class="payment-methods">
          <div class="payment-method" onclick="selectPaymentMethod('easypaisa')" data-method="easypaisa">
            <div class="payment-icon">📱</div>
            <div class="payment-name">Easypaisa</div>
            <div class="payment-desc">Mobile Wallet</div>
          </div>
          
          <div class="payment-method" onclick="selectPaymentMethod('jazzcash')" data-method="jazzcash">
            <div class="payment-icon">📱</div>
            <div class="payment-name">JazzCash</div>
            <div class="payment-desc">Mobile Wallet</div>
          </div>
          
          <div class="payment-method" onclick="selectPaymentMethod('bank')" data-method="bank">
            <div class="payment-icon">🏦</div>
            <div class="payment-name">Bank Transfer</div>
            <div class="payment-desc">Direct Transfer</div>
          </div>
          
          <div class="payment-method" onclick="selectPaymentMethod('cod')" data-method="cod">
            <div class="payment-icon">💵</div>
            <div class="payment-name">Cash on Delivery</div>
            <div class="payment-desc">Pay on Delivery</div>
          </div>
        </div>

        <div id="paymentDetails" style="display: none;"></div>

        <div class="checkout-buttons">
          <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button type="submit" class="btn-primary">
            <i class="fas fa-lock"></i> Place Order
          </button>
        </div>
      </form>
    `;

    DOM.checkoutModal.style.display = 'flex';
    hidePanels();
  } catch (error) {
    console.error('Error opening checkout:', error);
    showModal('Failed to load checkout. Please try again.');
  }
}

const paymentMethodTemplates = {
  easypaisa: `
    <div class="form-group">
      <label for="easypaisaNumber"><i class="fas fa-mobile-alt"></i> Easypaisa Account Number *</label>
      <input type="tel" id="easypaisaNumber" placeholder="03XXXXXXXXX" required>
    </div>
    <p style="color: #00ff88; font-size: 0.85rem; margin-top: 0.5rem;"><i class="fas fa-info-circle"></i> You will receive a payment request on your Easypaisa account</p>
  `,
  jazzcash: `
    <div class="form-group">
      <label for="jazzcashNumber"><i class="fas fa-mobile-alt"></i> JazzCash Account Number *</label>
      <input type="tel" id="jazzcashNumber" placeholder="03XXXXXXXXX" required>
    </div>
    <p style="color: #ff9944; font-size: 0.85rem; margin-top: 0.5rem;"><i class="fas fa-info-circle"></i> You will receive a payment request on your JazzCash account</p>
  `,
  bank: `
    <div class="form-group">
      <label for="bankName">Bank Name *</label>
      <select id="bankName" required>
        <option value="">Select Bank</option>
        <option value="hbl">HBL - Habib Bank Limited</option>
        <option value="ubl">UBL - United Bank Limited</option>
        <option value="mcb">MCB - Muslim Commercial Bank</option>
        <option value="abl">ABL - Allied Bank Limited</option>
        <option value="nbl">NBL - National Bank of Pakistan</option>
        <option value="js">JS Bank</option>
        <option value="meezan">Meezan Bank</option>
      </select>
    </div>
    <div class="form-group">
      <label for="accountNumber">Account Number *</label>
      <input type="text" id="accountNumber" required>
    </div>
    <p style="color: #00ffff; font-size: 0.9rem;">🏦 Transfer details will be sent to your email</p>
  `,
  cod: `<p style="color: #00ffff; font-size: 0.9rem;">💵 You will pay cash when your order is delivered to your address</p>`
};

function selectPaymentMethod(method) {
  // Update selection UI
  document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
  document.querySelector(`[data-method="${method}"]`)?.classList.add('selected');
  
  // Show payment details
  const paymentDetails = document.getElementById('paymentDetails');
  paymentDetails.style.display = 'block';
  paymentDetails.innerHTML = paymentMethodTemplates[method] || '';
}

async function calculateTotal() {
  const cart = getCart();
  if (cart.length === 0) return 0;
  
  try {
    const products = await fetchProducts(cart);
    return products.reduce((sum, product) => sum + product.price, 0).toFixed(2);
  } catch (error) {
    console.error('Error calculating total:', error);
    return 0;
  }
}

function processCheckout(event) {
  event.preventDefault();
  
  const selectedPayment = document.querySelector('.payment-method.selected');
  if (!selectedPayment) {
    showModal('Please select a payment method.');
    return;
  }

  const customerName = document.getElementById('customerName').value;
  const customerEmail = document.getElementById('customerEmail').value;
  const customerPhone = document.getElementById('customerPhone').value;
  const customerAddress = document.getElementById('customerAddress').value;
  const paymentMethod = selectedPayment.dataset.method;
  
  const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
  
  // Send confirmation email
  calculateTotal().then(total => {
    const emailBody = `
Dear ${customerName},

Thank you for your order!

Order Number: ${orderNumber}
Total Amount: $${total}
Payment Method: ${paymentMethod.toUpperCase()}
Shipping Address: ${customerAddress}

Your order will be processed shortly.

Thank you for shopping with FakeStore!
    `;
    sendEmail(customerEmail, 'Order Confirmation - ' + orderNumber, emailBody);
  });

  closeCheckoutModal();
  showModal(`Order placed successfully! 🎉\n\nOrder #: ${orderNumber}\nPayment: ${paymentMethod.toUpperCase()}\n\nConfirmation email sent to ${customerEmail}.`);
  
  // Clear cart
  setCart([]);
  renderCart();
  updateCartCounter();
}

function closeCheckoutModal(event) {
  if (!event || event.target === DOM.checkoutModal) {
    DOM.checkoutModal.style.display = 'none';
  }
}

    // ==========================================
// Email Functions
// ==========================================

// Initialize EmailJS
(function initEmailJS() {
  try {
    if (typeof emailjs !== 'undefined') {
      emailjs.init("Vvg73yzWgobsWNWMq");
      console.log("EmailJS initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize EmailJS:", error);
  }
})();

function sendEmail(to, subject, body) {
  try {
    if (typeof emailjs === 'undefined') {
      console.error("EmailJS is not defined");
      showNotification("Failed to send email: EmailJS not loaded", true);
      return false;
    }
    
    const templateParams = {
      to_email: to,
      subject: subject,
      message: body
    };
    
    emailjs.send("service_6gomw7p", "template_cyh3e2k", templateParams)
      .then(response => {
        console.log("Email sent successfully!", response.status);
        showNotification(`Email sent to ${to}`, false);
      })
      .catch(error => {
        console.error("Failed to send email:", error);
        showNotification("Failed to send email", true);
      });
    
    return true;
  } catch (error) {
    console.error("Error in sendEmail function:", error);
    showNotification("Error sending email", true);
    return false;
  }
}

function showNotification(message, isError) {
  const notification = document.createElement('div');
  notification.className = 'cart-animation';
  notification.style.backgroundColor = isError ? '#ff6666' : '#00ffff';
  notification.style.color = isError ? '#fff' : '#000';
  notification.innerHTML = `<span>${isError ? '❌' : '📧'}</span> ${message}`;
  
  document.body.appendChild(notification);
  
  requestAnimationFrame(() => {
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  });
}

// ==========================================
// Event Listeners
// ==========================================

// Close dropdown menus when clicking outside
document.addEventListener('click', (event) => {
  if (!event.target.closest('.mega-menu')) {
    document.querySelectorAll('.mega-menu.active').forEach(menu => {
      menu.classList.remove('active');
    });
  }
});

// ==========================================
// Initialization
// ==========================================

window.onload = () => {
  loadCategories();
  showHome();
  initMobileNav();
};