let currentUser = null;

// ✅ Quando a página carregar
window.onload = () => {
    currentUser = getLoggedUser();

    if (currentUser) {
        document.getElementById('name').textContent = currentUser.name || 'N/A';
        document.getElementById('email').textContent = currentUser.email || 'N/A';
        document.getElementById('fins').textContent = currentUser.fins || '0';

        // Sempre ocultar senha inicialmente
        document.getElementById('password').textContent = "••••••••";
    } else {
        document.getElementById('name').textContent = 'No user logged in';
        document.getElementById('password').textContent = '-';
        document.getElementById('fins').textContent = '-';
    }
};

function togglePassword() {
    const passwordElement = document.getElementById("password");
    const icon = document.getElementById("passwordIcon");

    // Se a senha está oculta (••••••••)
    if (passwordElement.dataset.visible !== "true") {
        passwordElement.textContent = currentUser.password || "********";
        passwordElement.dataset.visible = "true";

        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
    // Se está visível
    else {
        passwordElement.textContent = "••••••••";
        passwordElement.dataset.visible = "false";

        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}

function enable(id) {
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById("btn" + i);
        btn.disabled = true;      // enable all
    }

    document.getElementById("btn" + id).disabled = false;  // disable only clicked one
}