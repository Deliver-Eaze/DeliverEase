document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageDiv = document.getElementById('message');
    
    messageDiv.classList.add('d-none');
    
    
    if (!username || !email || !password || !confirmPassword) {
        showMessage('All fields are required', 'danger');
        return;
    }
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'danger');
        return;
    }
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'danger');
        return;
    }
    
    
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/register/', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRFToken', getCSRFToken());
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                if (data.success) {
                    showMessage('Account created! Redirecting...', 'success');
                    setTimeout(function() {
                        window.location.href = data.redirect;
                    }, 1000);
                } else {
                    showMessage(data.error || 'Registration failed', 'danger');
                }
            } else {
                showMessage('Server error. Please try again.', 'danger');
            }
        }
    };
    
    xhr.send(JSON.stringify({
        username: username,
        email: email,
        password: password
    }));
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

