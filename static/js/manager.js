

document.addEventListener('DOMContentLoaded', function() {
    
    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const status = this.getAttribute('data-status');
            filterOrders(status);
            
            
            filterButtons.forEach(function(btn) {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    
    const statusButtons = document.querySelectorAll('.change-status-btn');
    statusButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            const newStatus = this.getAttribute('data-new-status');
            updateOrderStatus(orderId, newStatus);
        });
    });
    
    
    setInterval(loadStats, 30000);
});

function filterOrders(status) {
    const rows = document.querySelectorAll('.order-row');
    
    rows.forEach(function(row) {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const rowStatus = row.getAttribute('data-status');
            if (rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}


function updateOrderStatus(orderId, newStatus) {
    
    if (!confirm('Change order #' + orderId + ' status to "' + newStatus + '"?')) {
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/order/' + orderId + '/status/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    
                    updateOrderRow(orderId, newStatus);
                    showToast('Order #' + orderId + ' updated to ' + newStatus);
                    
                    loadStats();
                } else {
                    alert('Error: ' + data.error);
                }
            } else {
                alert('Server error. Please try again.');
            }
        }
    };
    
    xhr.send(JSON.stringify({ status: newStatus }));
}


function updateOrderRow(orderId, newStatus) {
    const row = document.querySelector('.order-row[data-order-id="' + orderId + '"]');
    if (!row) return;
    
    
    const statusBadge = row.querySelector('.status-badge');
    if (statusBadge) {
        statusBadge.textContent = newStatus;
        statusBadge.className = 'badge status-badge bg-' + getStatusColor(newStatus);
    }
    
    
    row.setAttribute('data-status', newStatus);
    
    
    const actionsCell = row.querySelector('.actions-cell');
    if (actionsCell) {
        actionsCell.innerHTML = getActionButtons(orderId, newStatus);
        
        const newButtons = actionsCell.querySelectorAll('.change-status-btn');
        newButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const oid = this.getAttribute('data-order-id');
                const ns = this.getAttribute('data-new-status');
                updateOrderStatus(oid, ns);
            });
        });
    }
}


function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'preparing': 'info',
        'ready': 'primary',
        'out_for_delivery': 'secondary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}


function getActionButtons(orderId, status) {
    const allStatuses = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
    const currentIndex = allStatuses.indexOf(status);
    
    let buttons = '';
    for (let i = currentIndex + 1; i < allStatuses.length; i++) {
        const nextStatus = allStatuses[i];
        buttons += `
            <button class="btn btn-sm btn-outline-${getStatusColor(nextStatus)} change-status-btn me-1"
                    data-order-id="${orderId}"
                    data-new-status="${nextStatus}">
                ${nextStatus.replace(/_/g, ' ')}
            </button>
        `;
    }
    
    if (buttons === '') {
        buttons = '<small class="text-muted">No actions</small>';
    }
    
    return buttons;
}

// ==================== دالة تحميل الإحصائيات ====================
function loadStats() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/manager/stats/', true);
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
                updateStatsDisplay(data);
            }
        }
    };
    
    xhr.send();
}

// ==================== دالة تحديث عرض الإحصائيات ====================
function updateStatsDisplay(data) {
    const todayEl = document.getElementById('stat-today');
    const revenueEl = document.getElementById('stat-revenue');
    const delayedEl = document.getElementById('stat-delayed');
    const monthlyEl = document.getElementById('stat-monthly');
    
    if (todayEl) todayEl.textContent = data.today_orders;
    if (revenueEl) revenueEl.textContent = '$' + data.revenue;
    if (delayedEl) delayedEl.textContent = data.delayed_orders;
    if (monthlyEl) monthlyEl.textContent = data.monthly_orders;
}


function showToast(message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toastId = 'toast-' + Date.now();
    const html = `
        <div id="${toastId}" class="toast align-items-center text-white bg-success border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', html);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
    
    
    toastEl.addEventListener('hidden.bs.toast', function() {
        toastEl.remove();
    });
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

