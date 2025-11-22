let currentUser = null;

// Mapear botões para skins
const skinMap = {
  1: "default",
  2: "Halloween",
  3: "Pirates",
  4: "Christmas"
};

// ✅ Quando a página carregar
window.onload = () => {
    currentUser = getLoggedUser();

    if (currentUser) {
        document.getElementById('name').textContent = currentUser.name || 'N/A';
        document.getElementById('email').textContent = currentUser.email || 'N/A';
        document.getElementById('fins').textContent = currentUser.fins || '0';

        // Inicializar skins se não existirem (compatibilidade com usuários antigos)
        if (!currentUser.skins) {
          currentUser.skins = ["default"];
        }
        if (!currentUser.selectedSkin) {
          currentUser.selectedSkin = "default";
        }

        // Sempre ocultar senha inicialmente
        document.getElementById('password').textContent = "••••••••";

        // Renderizar estado das skins
        renderSkinsState();
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

function renderSkinsState() {
    // Renderizar estado de cada botão (disabled/enabled baseado em skins compradas)
    Object.keys(skinMap).forEach(btnId => {
        const skinId = skinMap[btnId];
        const button = document.getElementById(`btn${btnId}`);
        if (!button) return;

        const hasSkin = currentUser.skins.includes(skinId);
        const isSelected = currentUser.selectedSkin === skinId;

        // Habilitar/desabilitar botão
        if (hasSkin) {
            button.disabled = false;
            button.classList.remove("locked");
            
            // Destacar se selecionado
            if (isSelected) {
                button.classList.add("selected");
            } else {
                button.classList.remove("selected");
            }
        } else {
            button.disabled = true;
            button.classList.add("locked");
            button.classList.remove("selected");
        }
    });
}

function selectSkin(skinId) {
    // Verificar se o usuário possui a skin
    if (!currentUser.skins || !currentUser.skins.includes(skinId)) {
        alert(`❌ Você ainda não comprou a skin ${skinId}! Compre no Store.`);
        return;
    }

    // Atualizar skin selecionada
    currentUser.selectedSkin = skinId;
    saveUserData();
    renderSkinsState();

    // Disparar evento customizado para o home
    window.dispatchEvent(new CustomEvent('skinChanged', { detail: { skinId: skinId } }));

    alert(`✅ Você selecionou a skin ${skinId}!`);
}

function saveUserData() {
    if (!currentUser) return;

    // Salvar no localStorage (sessão)
    localStorage.setItem("loggedUser", JSON.stringify(currentUser));

    // Salvar no banco de dados (storage)
    const dbObj = loadData(); // { users: [...] }
    const db = dbObj.users;

    const idx = db.findIndex(u => u.email === currentUser.email);
    if (idx !== -1) {
        db[idx] = currentUser;
    } else {
        db.push(currentUser);
    }

    saveData(dbObj);
}