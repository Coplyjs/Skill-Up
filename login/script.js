document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const emailInput = document.getElementById("emailAdress");
  const passwordInput = document.getElementById("password");

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    const dbObj = loadData();    // { users: [...] }
    const db = dbObj.users;      // array de usuários

    const user = db.find(u => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("loggedUser", JSON.stringify(user));
      window.location.href = "/home/index.html";
    } else {
      alert("Email ou senha incorretos!");
    }
  });
});
