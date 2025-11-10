function register() {
  const email = document.getElementById('emailAdress').value.trim();
  const password = document.getElementById('password').value.trim();
  const verifyPassword = document.getElementById('verifyPassword').value.trim();

  if (!email || !password || !verifyPassword) {
    alert('Please fill in all fields.');
    return;
  }

  if (password !== verifyPassword) {
    alert('Passwords do not match.');
    return;
  }

  let users = loadData('users') || [];

  const emailExists = users.some(user => user.email === email);
  if (emailExists) {
    alert('This email is already registered.');
    return;
  }

  const newUser = {
    email: email,
    password: password,
  };
  users.push(newUser);

  saveData('users', users);

  alert('Registration successful!');
  console.log('All users:', users);

  document.getElementById('emailAdress').value = '';
  document.getElementById('password').value = '';
  document.getElementById('verifyPassword').value = '';

  window.location.href = '/login'
}