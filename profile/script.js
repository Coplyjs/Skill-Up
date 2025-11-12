    // ✅ When page loads, display user info
window.onload = () => {
    const user = getLoggedUser();

    if (user) {
    document.getElementById('email').textContent = user.email || 'N/A';
    document.getElementById('password').textContent = user.password || 'N/A';
    document.getElementById('fins').textContent = user.fins || '0';
    } else {
    document.getElementById('email').textContent = 'No user logged in';
    document.getElementById('password').textContent = '-';
    document.getElementById('fins').textContent = '-';
    }
};