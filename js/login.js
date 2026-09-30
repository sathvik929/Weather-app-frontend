const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const passwordInput = document.querySelector('#password');
const signupForm = document.querySelector('#signupForm');
const signupError = document.querySelector('#signupError');
const authSwitch = document.querySelector('#authSwitch');
const authSwitchText = document.querySelector('#authSwitchText');
const loginHeading = document.querySelector('#loginHeading');

const defaultAccounts = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

function readAccounts() {
  try {
    const storedAccounts = JSON.parse(localStorage.getItem('atmosAccounts') || 'null');
    if (Array.isArray(storedAccounts) && storedAccounts.length) return storedAccounts;
  } catch (error) {
    localStorage.removeItem('atmosAccounts');
  }
  localStorage.setItem('atmosAccounts', JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

function saveAccounts(accounts) { localStorage.setItem('atmosAccounts', JSON.stringify(accounts)); }

document.querySelectorAll('.password-toggle').forEach((passwordToggle) => {
  passwordToggle.addEventListener('click', () => {
    const target = document.querySelector(`#${passwordToggle.dataset.target || 'password'}`);
    const isPassword = target.type === 'password';
    target.type = isPassword ? 'text' : 'password';
    passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    passwordToggle.innerHTML = `<i class="fa-regular fa-eye${isPassword ? '-slash' : ''}"></i>`;
  });
});

function setAuthMode(isSignup) {
  loginForm.hidden = isSignup;
  signupForm.hidden = !isSignup;
  loginHeading.innerHTML = isSignup ? '<p class="eyebrow">Join Atmos</p><h2>Make every forecast<br>feel personal.</h2><p>Create an account to save your favorite places.</p>' : '<p class="eyebrow">Welcome back</p><h2>See what’s<br>happening outside.</h2><p>Sign in to get your personal forecast.</p>';
  authSwitchText.textContent = isSignup ? 'Already have an account?' : 'New to Atmos?';
  authSwitch.textContent = isSignup ? 'Sign in' : 'Create an account';
  (isSignup ? document.querySelector('#signupUsername') : document.querySelector('#username')).focus();
}

authSwitch.addEventListener('click', () => setAuthMode(signupForm.hidden));

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#username').value.trim();
  const password = passwordInput.value;
  loginError.textContent = '';

  if (!username || !password) {
    loginError.textContent = 'Please enter both your username and password.';
    return;
  }

  const account = readAccounts().find((storedAccount) => storedAccount.username.toLowerCase() === username.toLowerCase());

  if (!account || account.password !== password) {
    loginError.textContent = 'That username or password is not quite right.';
    loginForm.classList.remove('shake');
    void loginForm.offsetWidth;
    loginForm.classList.add('shake');
    return;
  }

  sessionStorage.setItem('atmosAuthenticated', 'true');
  sessionStorage.setItem('atmosRole', account.role);
  sessionStorage.setItem('atmosUsername', account.username);
  window.location.href = account.role === 'admin' ? 'admin.html' : 'dashboard.html';
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#signupUsername').value.trim();
  const password = document.querySelector('#signupPassword').value;
  const confirmPassword = document.querySelector('#signupConfirmPassword').value;
  signupError.textContent = '';
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { signupError.textContent = 'Use 3-20 letters, numbers, or underscores for your username.'; return; }
  if (password.length < 6) { signupError.textContent = 'Your password must contain at least 6 characters.'; return; }
  if (password !== confirmPassword) { signupError.textContent = 'The passwords do not match.'; return; }
  const accounts = readAccounts();
  if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) { signupError.textContent = 'That username is already registered.'; return; }
  accounts.push({ username, password, role: 'user' });
  saveAccounts(accounts);
  sessionStorage.setItem('atmosAuthenticated', 'true');
  sessionStorage.setItem('atmosRole', 'user');
  sessionStorage.setItem('atmosUsername', username);
  window.location.href = 'dashboard.html';
});

