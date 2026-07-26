
let cart = [];

function loadCart() {
    const saved = localStorage.getItem('foodexpress_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function saveCart() {
    localStorage.setItem('foodexpress_cart', JSON.stringify(cart));
}

function removeFromCart(id) {
    cart = cart.filter(function(item) {
        return item.id !== id;
    });
    saveCart();
    displayCart();
}

function updateQuantity(id, change) {
    const item = cart.find(function(item) {
        return item.id === id;
    });
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart();
        displayCart();
    }
}

function displayCart() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    const subtotalElement = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size: 4rem; color: #ccc;"></i>
                <p class="text-muted mt-3">Your cart is empty</p>
                <a href="/menu/" class="btn btn-primary mt-2">Browse Menu</a>
            </div>
        `;
        totalElement.textContent = '$2.00';
        subtotalElement.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }

    let subtotal = 0;
    let html = '';

    cart.forEach(function(item) {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">$${item.price.toFixed(2)} each</small>
                    </div>
                    <div class="col-md-3">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', -1)">−</button>
                            <span class="mx-2 fw-bold">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <span class="fw-bold">$${itemTotal.toFixed(2)}</span>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart('${item.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const total = subtotal + 2; 
    container.innerHTML = html;
    subtotalElement.textContent = '$' + subtotal.toFixed(2);
    totalElement.textContent = '$' + total.toFixed(2);
    checkoutBtn.disabled = false;
}


document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    displayCart();

    document.getElementById('checkout-btn').addEventListener('click', function() {
        window.location.href = '/checkout/';
    });
});

