
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    
    messageDiv.classList.add('d-none');
    
    
    if (!username || !password) {
        showMessage('Please fill in all fields', 'danger');
        return;
    }
    
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/login/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    showMessage('Login successful! Redirecting...', 'success');
                    
                    setTimeout(function() {
                        window.location.href = data.redirect;
                    }, 1000);
                } else {
                    showMessage(data.error || 'Invalid username or password', 'danger');
                }
            } else {
                showMessage('Server error. Please try again.', 'danger');
            }
        }
    };
    
    const requestData = JSON.stringify({
        username: username,
        password: password
    });
    
    xhr.send(requestData);
});

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

