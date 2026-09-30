const adminLoginForm = document.querySelector('#adminLoginForm');
const adminLoginError = document.querySelector('#adminLoginError');
const adminPassword = document.querySelector('#adminPassword');
const adminPasswordToggle = document.querySelector('.password-toggle');

const defaultAccounts = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem('atmosAccounts') || 'null');
    if (Array.isArray(accounts) && accounts.length) return accounts;
  } catch (error) {
    localStorage.removeItem('atmosAccounts');
  }
  localStorage.setItem('atmosAccounts', JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

adminPasswordToggle.addEventListener('click', () => {
  const isPassword = adminPassword.type === 'password';
  adminPassword.type = isPassword ? 'text' : 'password';
  adminPasswordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  adminPasswordToggle.innerHTML = `<i class="fa-regular fa-eye${isPassword ? '-slash' : ''}"></i>`;
});

adminLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.querySelector('#adminUsername').value.trim();
  const password = adminPassword.value;
  adminLoginError.textContent = '';
  const account = readAccounts().find((storedAccount) => storedAccount.username.toLowerCase() === username.toLowerCase());
  if (!username || !password) { adminLoginError.textContent = 'Enter your administrator username and password.'; return; }
  if (!account || account.password !== password || account.role !== 'admin') { adminLoginError.textContent = 'Administrator credentials were not recognized.'; return; }
  sessionStorage.setItem('atmosAuthenticated', 'true');
  sessionStorage.setItem('atmosRole', 'admin');
  sessionStorage.setItem('atmosUsername', account.username);
  window.location.href = 'admin.html';
});
