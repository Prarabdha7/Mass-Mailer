document.addEventListener('DOMContentLoaded', function() {
    const tokenForm = document.getElementById('tokenForm');
    const errorDiv = document.getElementById('error');

    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
    }

    function hideError() {
        errorDiv.classList.remove('show');
    }

    if (Auth.isAuthenticated()) {
        window.location.href = '/dashboard';
        return;
    }

    tokenForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        hideError();
        const accessToken = document.getElementById('accessToken').value;
        if (!accessToken) {
            showError('Access token is required');
            return;
        }
        const result = await Auth.loginWithToken(accessToken);
        if (result.success) {
            window.location.href = '/dashboard';
        } else {
            showError(result.error);
        }
    });
});