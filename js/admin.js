if (sessionStorage.getItem('atmosAuthenticated') !== 'true' || sessionStorage.getItem('atmosRole') !== 'admin') window.location.href = 'login.html';

const themeToggle = document.querySelector('#themeToggle');
const logoutButton = document.querySelector('#logoutButton');

function readAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem('atmosAccounts') || '[]');
    return Array.isArray(accounts) ? accounts : [];
  } catch (error) {
    return [];
  }
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character])); }

const accounts = readAccounts();
document.querySelectorAll('.admin-stat small').forEach((label) => { if (label.textContent.includes('Demo activity')) label.textContent = 'Tracked activity'; });
document.querySelector('#registeredUsers').textContent = accounts.length;
document.querySelector('#savedLocations').textContent = accounts.reduce((total, account) => {
  try { return total + JSON.parse(localStorage.getItem(`atmosFavorites_${account.username.toLowerCase()}`) || '[]').length; } catch (error) { return total; }
}, 0);
document.querySelector('#userTableBody').innerHTML = accounts.map((account, index) => `<tr><td><span class="table-user"><span class="mini-avatar ${account.role === 'user' ? 'user-color' : ''}">${escapeHtml(account.username.charAt(0).toUpperCase())}</span><span><strong>${escapeHtml(account.username)}</strong><small>${account.role === 'admin' ? 'Administrator' : 'Weather viewer'}</small></span></span></td><td>${account.role === 'admin' ? 'Admin' : 'User'}</td><td>${index === 0 ? 'Just now' : 'Registered locally'}</td><td><span class="status-label online">Active</span></td></tr>`).join('');

document.querySelector('#currentDate').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
if (localStorage.getItem('atmosTheme') === 'dark') document.body.classList.add('dark-theme');

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  localStorage.setItem('atmosTheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
});

logoutButton.addEventListener('click', () => { sessionStorage.clear(); window.location.href = 'login.html'; });

document.querySelector('#menuButton').addEventListener('click', () => {
  const toast = document.querySelector('#toast');
  toast.textContent = 'Navigation is available on the desktop sidebar.';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
});