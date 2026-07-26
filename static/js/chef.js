
let orders = [];

function loadOrders() {
    
    const orderCards = document.querySelectorAll('.order-card');
    orderCards.forEach(function(card) {
        const orderId = card.getAttribute('data-id');
        const status = card.getAttribute('data-status');
        addOrderButtons(card, orderId, status);
    });
}

function addOrderButtons(card, orderId, status) {
    const actionDiv = card.querySelector('.order-actions');
    if (!actionDiv) return;
    
    if (status === 'pending') {
        actionDiv.innerHTML = `
            <button class="btn btn-warning btn-sm" onclick="updateStatus(${orderId}, 'preparing')">
                Start Preparing
            </button>
        `;
    } else if (status === 'preparing') {
        actionDiv.innerHTML = `
            <button class="btn btn-success btn-sm" onclick="updateStatus(${orderId}, 'ready')">
                Mark as Ready
            </button>
        `;
    }
}

function updateStatus(orderId, newStatus) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/order/' + orderId + '/status/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
                location.reload();
            }
        }
    };
    
    xhr.send(JSON.stringify({ status: newStatus }));
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

document.addEventListener('DOMContentLoaded', loadOrders);

