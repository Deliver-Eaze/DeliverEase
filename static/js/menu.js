
let cart = [];


function loadCart() {
    const saved = localStorage.getItem('foodexpress_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
    updateCartBadge();
}


function saveCart() {
    localStorage.setItem('foodexpress_cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const totalItems = cart.reduce(function(sum, item) {
        return sum + item.quantity;
    }, 0);
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}


function addToCart(id, name, price) {
    const existing = cart.find(function(item) {
        return item.id === id;
    });
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            quantity: 1
        });
    }
    
    saveCart();
    showToast(name + ' added to cart! 🛒');
}


function showToast(message) {
    const toastEl = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    toastMessage.textContent = message;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}


document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = this.getAttribute('data-price');
            addToCart(id, name, price);
            
            
            this.textContent = '✓ Added!';
            this.classList.add('btn-success');
            this.classList.remove('btn-primary');
            const that = this;
            setTimeout(function() {
                that.innerHTML = '<i class="bi bi-cart-plus"></i> Add to Cart';
                that.classList.add('btn-primary');
                that.classList.remove('btn-success');
            }, 1000);
        });
    });
});

