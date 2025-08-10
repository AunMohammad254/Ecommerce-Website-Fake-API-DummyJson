const apiURL = 'https://dummyjson.com';

    const homeSection = document.getElementById('home-section');
    const productsContainer = document.getElementById('products');
    const categoriesNav = document.getElementById('categories');
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    const cartPanel = document.getElementById('cartPanel');
    const wishlistPanel = document.getElementById('wishlistPanel');
    const panelOverlay = document.getElementById('panelOverlay');

    function setActiveCategory(cat) {
      [...categoriesNav.querySelectorAll('a')].forEach(a => {
        if (a.textContent.toLowerCase() === cat.toLowerCase()) {
          a.classList.add('active');
        } else if (cat === '' && a.textContent.toLowerCase() === 'home') {
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      });
    }

    function showHome() {
      homeSection.style.display = 'block';
      productsContainer.classList.remove('show');
      productsContainer.style.display = 'none';
      setActiveCategory('');
      hidePanels();
    }

    function showProducts(category = '') {
      homeSection.style.display = 'none';
      productsContainer.style.display = 'grid';
      productsContainer.classList.add('show');
      loadProducts(category);
      setActiveCategory(category);
      hidePanels();
    }

    async function loadCategories() {
      const res = await fetch(`${apiURL}/products/category-list`);
      const categories = await res.json();

      categoriesNav.innerHTML = '';

      // Home button
      const homeLi = document.createElement('li');
      const homeA = document.createElement('a');
      homeA.href = '#home';
      homeA.textContent = 'Home';
      homeA.onclick = e => {
        e.preventDefault();
        showHome();
      };
      homeLi.appendChild(homeA);
      categoriesNav.appendChild(homeLi);

      // Organize categories into mega menu groups
      const megaMenuGroups = {
        'Electronics Products': ['smartphones', 'laptops', 'automotive'],
        'Home Products': ['furniture', 'home-decoration', 'lighting', 'kitchen-accessories'],
        'Clothes & Accessories': ['mens-shirts', 'mens-shoes', 'mens-watches', 'womens-dresses', 'womens-shoes', 'womens-watches', 'womens-bags', 'womens-jewellery', 'tops', 'sunglasses']
      };

      // Create mega menu structure
      Object.entries(megaMenuGroups).forEach(([groupName, groupCategories]) => {
        const megaLi = document.createElement('li');
        megaLi.className = 'mega-menu';
        
        const megaA = document.createElement('a');
        megaA.href = '#';
        megaA.textContent = groupName;
        megaA.onclick = e => e.preventDefault();
        
        const dropdown = document.createElement('div');
        dropdown.className = 'mega-dropdown';
        
        // Add categories that exist in the API response
        categories.forEach(category => {
          const categoryName = typeof category === 'string' ? category : category.name || category.slug;
          if (groupCategories.includes(categoryName)) {
            const categoryA = document.createElement('a');
            categoryA.href = `#${categoryName}`;
            categoryA.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');
            categoryA.onclick = e => {
              e.preventDefault();
              showProducts(categoryName);
              // Auto-hide dropdown menu when an item is clicked
              dropdown.style.opacity = '0';
              dropdown.style.visibility = 'hidden';
              dropdown.style.transform = 'translateY(-10px)';
              setTimeout(() => {
                dropdown.style.opacity = '';
                dropdown.style.visibility = '';
                dropdown.style.transform = '';
              }, 300);
            };
            dropdown.appendChild(categoryA);
          }
        });
        
        // Add remaining categories to appropriate groups
        categories.forEach(category => {
          const categoryName = typeof category === 'string' ? category : category.name || category.slug;
          if (!Object.values(megaMenuGroups).flat().includes(categoryName)) {
            // Add to Electronics Products by default
            if (groupName === 'Electronics Products') {
              const categoryA = document.createElement('a');
              categoryA.href = `#${categoryName}`;
              categoryA.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');
              categoryA.onclick = e => {
                e.preventDefault();
                showProducts(categoryName);
                // Auto-hide dropdown menu when an item is clicked
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                  dropdown.style.opacity = '';
                  dropdown.style.visibility = '';
                  dropdown.style.transform = '';
                }, 300);
              };
              dropdown.appendChild(categoryA);
            }
            if (groupName === 'Home Products') {
              const categoryA = document.createElement('a');
              categoryA.href = `#${categoryName}`;
              categoryA.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');
              categoryA.onclick = e => {
                e.preventDefault();
                showProducts(categoryName);
                // Auto-hide dropdown menu when an item is clicked
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                  dropdown.style.opacity = '';
                  dropdown.style.visibility = '';
                  dropdown.style.transform = '';
                }, 300);
              };
              dropdown.appendChild(categoryA);
            }
            if (groupName === 'Clothes & Accessories') {
              const categoryA = document.createElement('a');
              categoryA.href = `#${categoryName}`;
              categoryA.textContent = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).replace('-', ' ');
              categoryA.onclick = e => {
                e.preventDefault();
                showProducts(categoryName);
                // Auto-hide dropdown menu when an item is clicked
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
                dropdown.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                  dropdown.style.opacity = '';
                  dropdown.style.visibility = '';
                  dropdown.style.transform = '';
                }, 300);
              };
              dropdown.appendChild(categoryA);
            }

          }
        });
        
        megaLi.appendChild(megaA);
        megaLi.appendChild(dropdown);
        categoriesNav.appendChild(megaLi);
      });

      // Cart button
      const cartLi = document.createElement('li');
      const cartBtn = document.createElement('button');
      cartBtn.textContent = 'Cart 🛒';
      cartBtn.onclick = () => {
        togglePanel('cartPanel');
        renderCart();
      };
      cartLi.appendChild(cartBtn);
      categoriesNav.appendChild(cartLi);

      // Wishlist button
      const wishLi = document.createElement('li');
      const wishBtn = document.createElement('button');
      wishBtn.textContent = 'Wishlist 💙';
      wishBtn.onclick = () => {
        togglePanel('wishlistPanel');
        renderWishlist();
      };
      wishLi.appendChild(wishBtn);
      categoriesNav.appendChild(wishLi);
    }

    async function loadProducts(category = '') {
      let url = `${apiURL}/products`;
      if (category) url = `${apiURL}/products/category/${category}`;

      const res = await fetch(url);
      const data = await res.json();
      
      // DummyJSON returns products in a 'products' array
      const products = data.products || data;

      productsContainer.innerHTML = '';

      products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <img src="${product.thumbnail || product.image}" alt="${product.title}" />
          <h3>${product.title}</h3>
          <p class="price">$${product.price.toFixed(2)}</p>
          <div class="buttons">
            <button onclick="showProductDetails(${product.id})">Details</button>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
            <button onclick="addToWishlist(${product.id})">Add to Wishlist</button>
          </div>
        `;
        productsContainer.appendChild(div);
      });
    }

    // Modal
    function showModal(message) {
      modalMessage.textContent = message;
      modal.style.display = 'flex';
    }
    function closeModal(event) {
      if (!event || event.target === modal) {
        modal.style.display = 'none';
      }
    }

    // Panels
    function togglePanel(panelId) {
      const otherPanelId = panelId === 'cartPanel' ? 'wishlistPanel' : 'cartPanel';
      const panel = document.getElementById(panelId);
      const otherPanel = document.getElementById(otherPanelId);

      if (panel.classList.contains('show')) {
        panel.classList.remove('show');
        panelOverlay.classList.remove('show');
      } else {
        otherPanel.classList.remove('show');
        panel.classList.add('show');
        panelOverlay.classList.add('show');
      }
    }
    function hidePanels() {
      cartPanel.classList.remove('show');
      wishlistPanel.classList.remove('show');
      panelOverlay.classList.remove('show');
    }

    panelOverlay.addEventListener('click', hidePanels);

    // Storage helpers
    function getCart() {
      return JSON.parse(localStorage.getItem('cart')) || [];
    }
    function setCart(cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    function getWishlist() {
      return JSON.parse(localStorage.getItem('wishlist')) || [];
    }
    function setWishlist(wishlist) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    
    // Calculate total price of items in cart
    async function calculateTotal() {
      const cart = getCart();
      if (cart.length === 0) return 0;
      
      try {
        const products = await Promise.all(cart.map(id => fetch(`${apiURL}/products/${id}`).then(r => r.json())));
        return products.reduce((sum, product) => sum + product.price, 0).toFixed(2);
      } catch (error) {
        console.error('Error calculating total:', error);
        return 0;
      }
    }

    // Add to cart with animation
    function addToCart(productId) {
      const cart = getCart();
      if (cart.includes(productId)) {
        showModal('Product already in cart.');
        return;
      }
      cart.push(productId);
      setCart(cart);
      
      // Show cart animation
      showCartAnimation();
    }

    // Cart animation function
    function showCartAnimation() {
      const animation = document.getElementById('cartAnimation');
      animation.classList.add('show');
      
      setTimeout(() => {
        animation.classList.remove('show');
      }, 2000);
    }

    // Add to wishlist
    function addToWishlist(productId) {
      const wishlist = getWishlist();
      if (wishlist.includes(productId)) {
        showModal('Product already in wishlist.');
        return;
      }
      wishlist.push(productId);
      setWishlist(wishlist);
      showModal('Product added to wishlist.');
    }

    // Render cart panel
    async function renderCart() {
      const cart = getCart();
      cartPanel.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center;"><h2>Your Cart</h2><button style="background: none; border: none; font-size: 1.5rem; cursor: pointer;" class="close-panel-btn" onclick="hidePanels()"><i class="fa-solid fa-circle-xmark"></i></button></div>';
      if (cart.length === 0) {
        cartPanel.innerHTML += '<p class="empty">Your cart is empty.</p>';
        return;
      }
      const products = await Promise.all(cart.map(id => fetch(`${apiURL}/products/${id}`).then(r => r.json())));
      let total = 0;
      
      products.forEach(product => {
        total += product.price;
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <img src="${product.thumbnail || product.image}" alt="${product.title}" />
          <div class="info">
            <h4>${product.title}</h4>
            <p>$${product.price.toFixed(2)}</p>
          </div>
          <button onclick="removeFromCart(${product.id})">Remove</button>
        `;
        cartPanel.appendChild(div);
      });

      // Add total and checkout button
      const totalDiv = document.createElement('div');
      totalDiv.style.marginTop = '1rem';
      totalDiv.style.paddingTop = '1rem';
      totalDiv.style.borderTop = '1px solid #00ffff';
      totalDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <strong>Total: $${total.toFixed(2)}</strong>
        </div>
        <button onclick="openCheckout()" style="width: 100%; background: #00ffff; color: #000; font-weight: bold; padding: 1rem;">
          Proceed to Checkout
        </button>
      `;
      cartPanel.appendChild(totalDiv);
    }
    // Remove from cart
    function removeFromCart(productId) {
      let cart = getCart();
      cart = cart.filter(id => id !== productId);
      setCart(cart);
      renderCart();
    }

    // Render wishlist panel
    async function renderWishlist() {
      const wishlist = getWishlist();
      wishlistPanel.innerHTML = '<div style="display: flex; justify-content: space-between; align-items: center;"><h2>Your Wishlist</h2><button style="background: none; border: none; font-size: 1.5rem; cursor: pointer;" class="close-panel-btn" onclick="hidePanels()"><i class="fa-solid fa-circle-xmark"></i></button></div>';
      if (wishlist.length === 0) {
        wishlistPanel.innerHTML += '<p class="empty">Your wishlist is empty.</p>';
        return;
      }
      const products = await Promise.all(wishlist.map(id => fetch(`${apiURL}/products/${id}`).then(r => r.json())));
      products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <img src="${product.thumbnail || product.image}" alt="${product.title}" />
          <div class="info">
            <h4>${product.title}</h4>
            <p>$${product.price.toFixed(2)}</p>
          </div>
          <button onclick="removeFromWishlist(${product.id})">Remove</button>
        `;
        wishlistPanel.appendChild(div);
      });
    }
    // Remove from wishlist
    function removeFromWishlist(productId) {
      let wishlist = getWishlist();
      wishlist = wishlist.filter(id => id !== productId);
      setWishlist(wishlist);
      renderWishlist();
    }

    // Show product details modal
    async function showProductDetails(productId) {
      try {
        const res = await fetch(`${apiURL}/products/${productId}`);
        const product = await res.json();
        modalMessage.innerHTML = `
          <h2>${product.title}</h2>
          <img src="${product.thumbnail || product.image}" alt="${product.title}" style="max-width:150px; margin: 1rem 0;" />
          <p>${product.description}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Price:</strong> $${product.price.toFixed(2)}</p>
        `;
        modal.style.display = 'flex';
      } catch (error) {
        showModal('Failed to load product details.');
      }
    }

    // Checkout functionality
    async function openCheckout() {
      const cart = getCart();
      if (cart.length === 0) {
        showModal('Your cart is empty.');
        return;
      }

      const products = await Promise.all(cart.map(id => fetch(`${apiURL}/products/${id}`).then(r => r.json())));
      const total = products.reduce((sum, product) => sum + product.price, 0);

      const checkoutModal = document.getElementById('checkoutModal');
      const checkoutContent = document.getElementById('checkoutContent');

      checkoutContent.innerHTML = `
        <div class="order-summary">
          <h3>Order Summary</h3>
          ${products.map(product => `
            <div class="order-item">
              <span>${product.title}</span>
              <span>$${product.price.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="order-item">
            <span><strong>Total</strong></span>
            <span><strong>$${total.toFixed(2)}</strong></span>
          </div>
        </div>

        <form class="checkout-form" onsubmit="processCheckout(event)">
          <div class="form-group">
            <label for="customerName">Full Name *</label>
            <input type="text" id="customerName" required>
          </div>
          
          <div class="form-group">
            <label for="customerEmail">Email *</label>
            <input type="email" id="customerEmail" required>
          </div>
          
          <div class="form-group">
            <label for="customerPhone">Phone Number *</label>
            <input type="tel" id="customerPhone" required>
          </div>
          
          <div class="form-group">
            <label for="customerAddress">Delivery Address *</label>
            <input type="text" id="customerAddress" required>
          </div>

          <h3>Payment Method</h3>
          <div class="payment-methods">
            <div class="payment-method" onclick="selectPaymentMethod('easypaisa')" data-method="easypaisa">
              <div style="font-size: 2rem; color: #00ff00;">📱</div>
              <div><strong>Easypaisa</strong></div>
              <div>Mobile Wallet</div>
            </div>
            
            <div class="payment-method" onclick="selectPaymentMethod('jazzcash')" data-method="jazzcash">
              <div style="font-size: 2rem; color: #ff6600;">📱</div>
              <div><strong>JazzCash</strong></div>
              <div>Mobile Wallet</div>
            </div>
            
            <div class="payment-method" onclick="selectPaymentMethod('bank')" data-method="bank">
              <div style="font-size: 2rem; color: #0066ff;">🏦</div>
              <div><strong>Bank Transfer</strong></div>
              <div>Direct Transfer</div>
            </div>
            
            <div class="payment-method" onclick="selectPaymentMethod('cod')" data-method="cod">
              <div style="font-size: 2rem; color: #ffaa00;">💵</div>
              <div><strong>Cash on Delivery</strong></div>
              <div>Pay on Delivery</div>
            </div>
          </div>

          <div id="paymentDetails" style="display: none;">
            <!-- Payment specific details will be shown here -->
          </div>

          <div class="checkout-buttons">
            <button type="button" class="btn-secondary" onclick="closeCheckoutModal()">Cancel</button>
            <button type="submit" class="btn-primary">Place Order</button>
          </div>
        </form>
      `;

      checkoutModal.style.display = 'flex';
      hidePanels();
    }

    function selectPaymentMethod(method) {
      // Remove previous selections
      document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
      
      // Select current method
      document.querySelector(`[data-method="${method}"]`).classList.add('selected');
      
      const paymentDetails = document.getElementById('paymentDetails');
      paymentDetails.style.display = 'block';
      
      switch(method) {
        case 'easypaisa':
          paymentDetails.innerHTML = `
            <div class="form-group">
              <label for="easypaisaNumber">Easypaisa Account Number *</label>
              <input type="tel" id="easypaisaNumber" placeholder="03XXXXXXXXX" required>
            </div>
            <p style="color: #00ffff; font-size: 0.9rem;">
              📱 You will receive a payment request on your Easypaisa account
            </p>
          `;
          
          try {
            const customerEmail = document.getElementById('customerEmail').value;
            if (customerEmail) {
              // Send email notification to customer
              sendEmail(customerEmail, 
                'Easypaisa Payment Request', 
                'Your payment request has been received. Please complete the payment through your Easypaisa account.'
              );
            }
          } catch (error) {
            console.error('Failed to send email notification:', error);
          }
          
          break;
          
        case 'jazzcash':
          paymentDetails.innerHTML = `
            <div class="form-group">
              <label for="jazzcashNumber">JazzCash Account Number *</label>
              <input type="tel" id="jazzcashNumber" placeholder="03XXXXXXXXX" required>
            </div>
            <p style="color: #00ffff; font-size: 0.9rem;">
              📱 You will receive a payment request on your JazzCash account
            </p>
          `;
          
          try {
            const customerEmail = document.getElementById('customerEmail').value;
            if (customerEmail) {
              // Send email notification to customer
              sendEmail(customerEmail, 
                'JazzCash Payment Request', 
                'Your payment request has been received. Please complete the payment through your JazzCash account.'
              );
            }
          } catch (error) {
            console.error('Failed to send email notification:', error);
          }
          
          break;
          
        case 'bank':
          paymentDetails.innerHTML = `
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
            <p style="color: #00ffff; font-size: 0.9rem;">
              🏦 Transfer details will be sent to your email
            </p>
          `;
          
          try {
            const customerEmail = document.getElementById('customerEmail').value;
            if (customerEmail) {
              // Calculate total and send email with payment details
              calculateTotal().then(total => {
                sendEmail(customerEmail, 
                  'Bank Transfer Details', 
                  `Your order has been placed. Please transfer the payment of $${total} to our bank account. Details: Bank: FakeBank, Account: 1234-5678-9012, Reference: ORDER-${Date.now().toString().slice(-6)}`
                );
              });
            }
          } catch (error) {
            console.error('Failed to send email notification:', error);
          }
          
          break;
          
        case 'cod':
          paymentDetails.innerHTML = `
            <p style="color: #00ffff; font-size: 0.9rem;">
              💵 You will pay cash when your order is delivered to your address
            </p>
          `;
          
          try {
            const customerEmail = document.getElementById('customerEmail').value;
            if (customerEmail) {
              // Send email notification to customer
              sendEmail(customerEmail, 
                'Cash on Delivery Order Confirmation', 
                'Your order has been placed successfully. You will pay cash when your order is delivered to your address.'
              );
            }
          } catch (error) {
            console.error('Failed to send email notification:', error);
          }
          
          break;
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
      
      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);
      
      // Send final confirmation email
      calculateTotal().then(total => {
        const emailBody = `
          Dear ${customerName},

          Thank you for your order!

          Order Number: ${orderNumber}
          Total Amount: $${total}
          Payment Method: ${paymentMethod.toUpperCase()}
          Shipping Address: ${customerAddress}

          Your order will be processed shortly. You will receive updates on your order status.

          Thank you for shopping with FakeStore!
        `;
        
        sendEmail(customerEmail, 'Order Confirmation - ' + orderNumber, emailBody);
      });

      // Simulate order processing
      closeCheckoutModal();
      showModal(`Order placed successfully! 🎉\n\nOrder Details:\nName: ${customerName}\nOrder #: ${orderNumber}\nPayment: ${paymentMethod.toUpperCase()}\n\nA confirmation email has been sent to ${customerEmail}.`);
      
      // Clear cart after successful order
      setCart([]);
      renderCart();
    }

    function closeCheckoutModal(event) {
      const checkoutModal = document.getElementById('checkoutModal');
      if (!event || event.target === checkoutModal) {
        checkoutModal.style.display = 'none';
      }
    }

    // Email functionality using EmailJS
    // Initialize EmailJS
    (function() {
      try {
        // Replace with your EmailJS public key
        emailjs.init("Vvg73yzWgobsWNWMq");
        console.log("EmailJS initialized successfully");
      } catch (error) {
        console.error("Failed to initialize EmailJS:", error);
      }
    })();
    
    function sendEmail(to, subject, body) {
      try {
        // Prepare template parameters
        const templateParams = {
          to_email: to,
          subject: subject,
          message: body
        };
        
        // Check if EmailJS is properly initialized
        if (typeof emailjs === 'undefined') {
          console.error("EmailJS is not defined. Make sure the EmailJS SDK is properly loaded.");
          showNotification("Failed to send email: EmailJS not loaded", true);
          return false;
        }
        
        // Send email using EmailJS
        // Replace with your service ID and template ID
        emailjs.send("service_6gomw7p", "template_cyh3e2k", templateParams)
          .then(function(response) {
            console.log("Email sent successfully!", response.status, response.text);
            showNotification(`Email sent to ${to}`, false);
          })
          .catch(function(error) {
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
    
    // Helper function to show notifications
    function showNotification(message, isError) {
      try {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-animation';
        
        if (isError) {
          notification.style.backgroundColor = '#ff6666';
          notification.innerHTML = `<span>❌</span> ${message}`;
        } else {
          notification.innerHTML = `<span>📧</span> ${message}`;
        }
        
        document.body.appendChild(notification);
        
        // Show and then hide the notification
        setTimeout(() => {
          notification.classList.add('show');
          setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 500);
          }, 3000);
        }, 100);
      } catch (err) {
          console.error("Error showing notification:", err);
        }
      }
    
    // Close dropdown menus when clicking outside
    document.addEventListener('click', function(event) {
      const dropdowns = document.querySelectorAll('.mega-dropdown');
      const menus = document.querySelectorAll('.mega-menu');
      
      // Check if the click is outside any mega-menu
      let clickedOutside = true;
      menus.forEach(menu => {
        if (menu.contains(event.target)) {
          clickedOutside = false;
        }
      });
      
      // If clicked outside, hide all dropdowns
      if (clickedOutside) {
        dropdowns.forEach(dropdown => {
          dropdown.style.opacity = '0';
          dropdown.style.visibility = 'hidden';
          dropdown.style.transform = 'translateY(-10px)';
          setTimeout(() => {
            dropdown.style.opacity = '';
            dropdown.style.visibility = '';
            dropdown.style.transform = '';
          }, 300);
        });
      }
    });

    window.onload = () => {
      loadCategories();
      showHome();
    };