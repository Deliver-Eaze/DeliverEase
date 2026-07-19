// ==================== Checkout JavaScript ====================

let cart = [];

function loadCart() {
    const saved = localStorage.getItem('foodexpress_cart');
    if (saved) {
        cart = JSON.parse(saved);
    }
}

function displayOrderSummary() {
    const container = document.getElementById('orderSummary');
    
    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Your cart is empty</p>';
        return;
    }
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(function(item) {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} ×${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    html += '<hr>';
    html += '<div class="d-flex justify-content-between"><span>Subtotal</span><span>$' + subtotal.toFixed(2) + '</span></div>';
    html += '<div class="d-flex justify-content-between"><span>Delivery Fee</span><span>$2.00</span></div>';
    html += '<hr>';
    html += '<div class="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>$' + (subtotal + 2).toFixed(2) + '</span></div>';
    
    container.innerHTML = html;
}

function placeOrder() {
    const address = document.getElementById('address').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const method = document.getElementById('paymentMethod').value;
    const messageDiv = document.getElementById('message');
    
    messageDiv.classList.add('d-none');
    
    if (!address || !phone) {
        showMessage('Please fill in all fields', 'danger');
        return;
    }
    if (cart.length === 0) {
        showMessage('Your cart is empty', 'danger');
        return;
    }
    
    // إرسال الطلب
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/place-order/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    // مسح العربة
                    localStorage.removeItem('foodexpress_cart');
                    cart = [];
                    showMessage('Order #' + data.order_id + ' placed successfully! Redirecting...', 'success');
                    setTimeout(function() {
                        window.location.href = '/menu/';
                    }, 2000);
                } else {
                    showMessage(data.error || 'Order failed', 'danger');
                }
            } else {
                showMessage('Server error. Please try again.', 'danger');
            }
        }
    };
    
    xhr.send(JSON.stringify({
        address: address,
        phone: phone,
        method: method,
        cart: cart
    }));
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = 'alert alert-' + type;
    messageDiv.classList.remove('d-none');
}

function getCSRFToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('csrftoken=')) {
            return cookie.substring('csrftoken='.length);
        }
    }
    return '';
}

// ==================== تهيئة الصفحة ====================
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    displayOrderSummary();
    
    // إظهار/إخفاء رفع الإيصال
    document.getElementById('paymentMethod').addEventListener('change', function() {
        document.getElementById('receiptGroup').style.display = this.value === 'online' ? 'block' : 'none';
    });
    
    // زر تقديم الطلب
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
});

