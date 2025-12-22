document.addEventListener('DOMContentLoaded', async function() {
    if (!Auth.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }
    const isValid = await Auth.validateSession();
    if (!isValid) {
        window.location.href = '/login';
        return;
    }
});
