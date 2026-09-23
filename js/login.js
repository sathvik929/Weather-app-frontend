const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('.password-toggle');

passwordToggle.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  passwordToggle.innerHTML = `<i class="fa-regular fa-eye${isPassword ? '-slash' : ''}"></i>`;
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const password = passwordInput.value;
  loginError.textContent = '';

  if (!username || !password) {
    loginError.textContent = 'Please enter both your username and password.';
    return;
  }

  if (username !== 'admin' || password !== 'admin123') {
    loginError.textContent = 'That username or password is not quite right.';
    loginForm.classList.remove('shake');
    void loginForm.offsetWidth;
    loginForm.classList.add('shake');
    return;
  }

  sessionStorage.setItem('atmosAuthenticated', 'true');
  window.location.href = 'dashboard.html';
});
