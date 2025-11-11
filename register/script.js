// Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const registerBtn = document.getElementById("registerBtn");
  const emailInput = document.getElementById("emailAdress");
  const passwordInput = document.getElementById("password");
  const verifyPasswordInput = document.getElementById("verifyPassword");

  registerBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const verifyPassword = verifyPasswordInput.value;

    let db = loadData() || [];

    if (!email || !password || !verifyPassword) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    if (password !== verifyPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    const userExists = db.some(user => user.email === email);
    if (userExists) {
      alert("Este email já está cadastrado!");
      return;
    }

    const newUser = {
      email: email,
      password: password,
      tasks: [],
      dailyTasks: [],
      fins: 0,
      createdAt: new Date().toISOString()
    };

    db.push(newUser);
    saveData(db);

    window.location.href = "/login/index.html";
  });
});
