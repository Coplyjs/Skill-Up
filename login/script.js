document.querySelector('.btn.btn-primary').addEventListener('click', login);

function login() {
  const email = document.getElementById('emailAdress').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const users = loadData('users') || [];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    alert('Login successful!');
    console.log('Logged in user:', user);

    saveData('currentUser', user);

  } else {
    alert('Invalid email or password.');
  }

  window.location.href = '/home/'
}