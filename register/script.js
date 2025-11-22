document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("emailAdress");
  const passwordInput = document.getElementById("password");
  const verifyPasswordInput = document.getElementById("verifyPassword");

  registerBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const verifyPassword = verifyPasswordInput.value;

    if (!email || !password || !verifyPassword) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (password !== verifyPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    // ⚡ CORREÇÃO: loadData retorna objeto, não array
    let dbObj = loadData();      // { users: [...] }
    let db = dbObj.users;

    const userExists = db.some(user => user.email === email);
    if (userExists) {
      alert("Este email já está cadastrado!");
      return;
    }

    const newUser = {
      name,
      email,
      password,
      tasks: [],
      dailyTasks: [],
      fins: 0,
      workouts: [],
      diet: [],
      skins: ["default"],
      selectedSkin: "default",
      createdAt: new Date().toISOString()
    };

    db.push(newUser);
    dbObj.users = db;
    saveData(dbObj);

    window.location.href = "/login/index.html";
  });
});
