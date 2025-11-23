let currentUser = null;

// Mapear nome da skin para estrutura de dados
const skinConfig = {
  "Christmas": {
    name: "Christmas",
    price: 50,
    id: "Christmas"
  },
  "Pirates": {
    name: "Pirates",
    price: 50,
    id: "Pirates"
  },
  "Halloween": {
    name: "Halloween",
    price: 50,
    id: "Halloween"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  currentUser = getLoggedUser();

  if (!currentUser) {
    alert("Você precisa estar logado!");
    window.location.href = "/login/index.html";
    return;
  }

  // Inicializar campos de skins se não existirem (compatibilidade com usuários antigos)
  if (!currentUser.skins) {
    currentUser.skins = ["default"];
  }
  if (!currentUser.selectedSkin) {
    currentUser.selectedSkin = "default";
  }

  updateFinDisplay();
  updateProductButtons();
});

function buyProduct(productName) {
  const skin = skinConfig[productName];
  
  if (!skin) {
    alert("Skin não encontrada!");
    return;
  }

  // Verificar se já possui a skin
  if (currentUser.skins && currentUser.skins.includes(skin.id)) {
    alert(`Você já possui a skin ${productName}!`);
    return;
  }

  // Verificar fins suficientes
  if (currentUser.fins < skin.price) {
    alert(`Insufficient fins! You need ${skin.price} fins, but you only have ${currentUser.fins}.`);
    return;
  }

  // Processar compra
  currentUser.fins -= skin.price;
  
  if (!currentUser.skins) {
    currentUser.skins = ["default"];
  }
  
  currentUser.skins.push(skin.id);

  saveUserData();
  updateFinDisplay();

alert(`✅ Congratulations! You bought the ${productName} skin! You now have ${currentUser.fins} fins.\n\nYou can select this skin in your Profile!`);  updateProductButtons(); // Atualizar botões após compra
}

function updateFinDisplay() {
  const finElements = document.querySelectorAll("[data-fins]");
  finElements.forEach(el => {
    el.textContent = currentUser.fins || 0;
  });
}

function updateProductButtons() {
  // Atualizar status de cada botão de compra
  Object.keys(skinConfig).forEach(productName => {
    const skin = skinConfig[productName];
    const buttons = document.querySelectorAll(`button[onclick*="buyProduct('${productName}')"]`);
    
    buttons.forEach(btn => {
      if (currentUser.skins && currentUser.skins.includes(skin.id)) {
        // Já foi comprado
        btn.textContent = "✅ Item bought";
        btn.disabled = true;
        btn.classList.add("bought");
      } else {
        // Ainda não foi comprado
        btn.textContent = "Purchase";
        btn.disabled = false;
        btn.classList.remove("bought");
      }
    });
  });
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
