import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';

const defaultAccounts = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' },
];

const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';
const weatherCodes = {
  0: ['Clear sky', 'fa-sun'], 1: ['Mainly clear', 'fa-sun'], 2: ['Partly cloudy', 'fa-cloud-sun'],
  3: ['Overcast', 'fa-cloud'], 45: ['Foggy', 'fa-smog'], 48: ['Rime fog', 'fa-smog'],
  51: ['Light drizzle', 'fa-cloud-rain'], 53: ['Drizzle', 'fa-cloud-rain'], 55: ['Heavy drizzle', 'fa-cloud-rain'],
  61: ['Light rain', 'fa-cloud-showers-heavy'], 63: ['Rain', 'fa-cloud-showers-heavy'], 65: ['Heavy rain', 'fa-cloud-showers-heavy'],
  71: ['Light snow', 'fa-snowflake'], 73: ['Snow', 'fa-snowflake'], 75: ['Heavy snow', 'fa-snowflake'],
  80: ['Rain showers', 'fa-cloud-showers-heavy'], 81: ['Rain showers', 'fa-cloud-showers-heavy'], 82: ['Heavy showers', 'fa-cloud-showers-heavy'],
  95: ['Thunderstorm', 'fa-cloud-bolt'], 96: ['Thunderstorm with hail', 'fa-cloud-bolt'], 99: ['Thunderstorm with hail', 'fa-cloud-bolt'],
};

function describeWeather(code) {
  return weatherCodes[code] || ['Changing conditions', 'fa-cloud-sun'];
}

async function findLocation(query) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`);
  if (!response.ok) throw new Error('Location search is unavailable right now.');
  const result = await response.json();
  if (!result.results?.length) throw new Error('We could not find that city. Try another search.');
  return result.results[0];
}

async function reverseLocation(latitude, longitude) {
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`);
  if (!response.ok) throw new Error('We could not identify your current location.');
  const result = await response.json();
  const address = result.address || {};
  return {
    name: address.city || address.town || address.village || address.county || 'Current location',
    country: address.country || '',
    country_code: (address.country_code || '').toUpperCase(),
    latitude,
    longitude,
  };
}

async function loadWeather(latitude, longitude, location) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=6`);
  if (!response.ok) throw new Error('Weather service is unavailable right now.');
  const data = await response.json();
  return { location, data };
}

async function loadAlerts(latitude, longitude, countryCode) {
  if (countryCode !== 'US') return [];
  const response = await fetch(`https://api.weather.gov/alerts/active?point=${latitude},${longitude}`, { headers: { Accept: 'application/geo+json' } });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.features || []).slice(0, 3).map((item) => ({
    title: item.properties?.event || 'Weather alert',
    description: item.properties?.headline || item.properties?.description || 'Follow local emergency guidance.',
  }));
}

function getAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem('atmosAccounts') || 'null');
    if (Array.isArray(accounts) && accounts.length) return accounts;
  } catch {
    localStorage.removeItem('atmosAccounts');
  }
  localStorage.setItem('atmosAccounts', JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

function setSession(account) {
  sessionStorage.setItem('atmosAuthenticated', 'true');
  sessionStorage.setItem('atmosRole', account.role);
  sessionStorage.setItem('atmosUsername', account.username);
}

function clearSession() {
  sessionStorage.removeItem('atmosAuthenticated');
  sessionStorage.removeItem('atmosRole');
  sessionStorage.removeItem('atmosUsername');
}

function currentSession() {
  if (sessionStorage.getItem('atmosAuthenticated') !== 'true') return null;
  return {
    username: sessionStorage.getItem('atmosUsername') || '',
    role: sessionStorage.getItem('atmosRole') || 'user',
  };
}

function getFavorites(username) {
  try {
    const favorites = JSON.parse(localStorage.getItem(`atmosFavorites_${username.toLowerCase()}`) || '[]');
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

function Brand() {
  return <div className="brand"><span className="brand-mark"><i className="fa-solid fa-cloud-sun" /></span><span>ATMOS</span></div>;
}

function Auth({ onLogin }) {
  const [adminMode, setAdminMode] = useState(false);
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = (event) => {
    event.preventDefault();
    const username = form.username.trim();
    const accounts = getAccounts();
    setError('');
    if (!username || !form.password) return setError('Please enter both your username and password.');
    if (adminMode && (!accounts.some((a) => a.username.toLowerCase() === username.toLowerCase() && a.password === form.password && a.role === 'admin'))) {
      return setError('Administrator credentials were not recognized.');
    }
    if (signup) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return setError('Use 3-20 letters, numbers, or underscores for your username.');
      if (form.password.length < 6) return setError('Your password must contain at least 6 characters.');
      if (form.password !== form.confirmPassword) return setError('The passwords do not match.');
      if (accounts.some((a) => a.username.toLowerCase() === username.toLowerCase())) return setError('That username is already registered.');
      const account = { username, password: form.password, role: 'user' };
      localStorage.setItem('atmosAccounts', JSON.stringify([...accounts, account]));
      setSession(account);
      return onLogin(account);
    }
    const account = accounts.find((a) => a.username.toLowerCase() === username.toLowerCase() && a.password === form.password);
    if (!account) return setError('That username or password is not quite right.');
    setSession(account);
    onLogin(account);
  };

  const title = adminMode ? 'Welcome to the control center.' : signup ? 'Make every forecast feel personal.' : 'See what’s happening outside.';
  return <main className="auth-page">
    <section className="auth-visual"><Brand /><div><p className="eyebrow">{adminMode ? 'Administrator access' : 'A clearer view of your day'}</p><h1>Weather,<br /><em>beautifully</em> simple.</h1><p className="visual-description">A calm, focused forecast dashboard for wherever the day takes you.</p></div><div className="auth-footer"><span><i className="fa-solid fa-location-dot" /> Global coverage</span><span><i className="fa-solid fa-shield-heart" /> Private by design</span></div></section>
    <section className="auth-panel"><div className="auth-card"><div className="mobile-brand"><Brand /></div><div className="login-heading"><p className="eyebrow">{adminMode ? 'Admin sign in' : signup ? 'Join Atmos' : 'Welcome back'}</p><h2>{title}</h2><p>{adminMode ? 'Use an administrator account to continue.' : 'Sign in to get your personal forecast.'}</p></div>
      <form onSubmit={submit}><label>Username<input name="username" value={form.username} onChange={update} placeholder={adminMode ? 'Enter admin username' : 'Enter your username'} autoComplete="username" /></label><label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="Enter your password" autoComplete={signup ? 'new-password' : 'current-password'} /></label>{signup && <label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Repeat your password" autoComplete="new-password" /></label>}<p className="form-error" role="alert">{error}</p><button className="primary-button" type="submit">{adminMode ? 'Open admin module' : signup ? 'Create account' : 'Enter Atmos'} <i className="fa-solid fa-arrow-right" /></button></form>
      {!adminMode && <p className="auth-switch">{signup ? 'Already have an account?' : 'New to Atmos?'} <button onClick={() => { setSignup(!signup); setError(''); }}> {signup ? 'Sign in' : 'Create an account'}</button></p>}<button className="text-button" onClick={() => { setAdminMode(!adminMode); setSignup(false); setError(''); }}>{adminMode ? '← Return to user sign in' : 'Administrator access'}</button>
    </div><p className="login-legal">Accounts are stored securely in this browser for this learning project.</p></section>
  </main>;
}

function Layout({ session, children, onLogout, admin }) {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('atmosTheme') === 'dark');
  useEffect(() => {
    document.body.classList.toggle('dark-theme', darkMode);
    localStorage.setItem('atmosTheme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  return <div className="app-shell"><aside className="sidebar"><Brand /><nav><a className="active" href="#overview"><i className={`fa-solid ${admin ? 'fa-chart-line' : 'fa-grid-2'}`} /> {admin ? 'Overview' : 'Weather overview'}</a><a href={admin ? '#users' : '#forecast'}><i className={`fa-solid ${admin ? 'fa-users' : 'fa-calendar-days'}`} /> {admin ? 'Users' : 'Forecast'}</a><a href={admin ? '#system' : '#favorites'}><i className={`fa-solid ${admin ? 'fa-server' : 'fa-heart'}`} /> {admin ? 'System' : 'Favorites'}</a></nav><div className="sidebar-bottom"><p className="sidebar-note"><i className="fa-solid fa-shield-heart" /> {admin ? 'Admin control center' : 'Plan your day with confidence.'}</p><button className="nav-button" onClick={onLogout}><i className="fa-solid fa-arrow-right-from-bracket" /> Log out</button></div></aside><main className="main-content"><header className="topbar"><Brand /><div className="topbar-actions"><span className="live-status"><span className="status-dot" /> {admin ? 'Admin mode' : `Signed in as ${session.username}`}</span><button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? 'Use light mode' : 'Use dark mode'}><i className="fa-regular fa-moon" /><span className="toggle-track"><span className="toggle-thumb" /></span><i className="fa-regular fa-sun" /></button></div></header>{children}</main></div>;
}

function UserDashboard({ session, onLogout }) {
  const key = `atmosFavorites_${session.username.toLowerCase()}`;
  const [query, setQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [loading, setLoading] = useState(true);
  const [weatherState, setWeatherState] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [favorites, setFavorites] = useState(() => getFavorites(session.username));
  const saveFavorites = (next) => { setFavorites(next); localStorage.setItem(key, JSON.stringify(next)); };
  const updateWeather = async (location) => {
    setLoading(true);
    setLocationError('');
    try {
      const result = await loadWeather(location.latitude, location.longitude, location);
      setWeatherState(result);
      setAlerts(await loadAlerts(location.latitude, location.longitude, location.country_code));
    } catch (error) {
      setLocationError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    findLocation('Vijayawada').then(updateWeather).catch((error) => { setLocationError(error.message); setLoading(false); });
  }, []);
  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return setLocationError('Enter a city name to search.');
    try { await updateWeather(await findLocation(query)); } catch (error) { setLocationError(error.message); }
  };
  const useCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) return setLocationError('Location access is not supported by this browser.');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const location = await reverseLocation(coords.latitude, coords.longitude);
        await updateWeather({ ...location, latitude: coords.latitude, longitude: coords.longitude });
      } catch (error) { setLocationError(error.message); }
    }, () => setLocationError('Location access was denied. You can search for a city instead.'));
  };
  const location = weatherState?.location;
  const current = weatherState?.data.current;
  const daily = weatherState?.data.daily;
  const [condition, icon] = describeWeather(current?.weather_code);
  const locationLabel = location ? `${location.name}, ${location.country_code}` : 'Loading weather...';
  const favoriteName = location?.name || '';
  const tips = current ? [
    current.temperature_2m >= 30 ? 'Stay hydrated and avoid direct sunlight at midday.' : current.temperature_2m <= 16 ? 'Wear a warm layer and keep a hot drink nearby.' : 'Comfortable conditions are ahead for outdoor plans.',
    current.wind_speed_10m >= 25 ? 'Secure loose outdoor items before heading out.' : 'A light breeze makes this a good time to get outside.',
    current.relative_humidity_2m >= 75 ? 'High humidity may make it feel warmer than the temperature suggests.' : 'Humidity is comfortable for most activities.',
  ] : [];
  return <Layout session={session} onLogout={onLogout}><section className="welcome-row" id="overview"><div><p className="eyebrow">Your weather companion</p><h1>Good morning, <span>Adventurer.</span></h1></div><p className="current-date">{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}</p></section><form className="search-section" onSubmit={search}><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any city..." aria-label="Search a city" /><button className="primary-button" disabled={loading}>Search <i className="fa-solid fa-arrow-right" /></button><button type="button" className="secondary-button" onClick={useCurrentLocation}><i className="fa-solid fa-location-crosshairs" /> Use my location</button></form>{locationError && <p className="dashboard-error" role="alert">{locationError}</p>}{loading && <p className="muted">Loading live weather...</p>}<section className="overview-grid"><article className="panel current-weather"><div className="panel-heading"><div><p className="eyebrow">Current weather</p><h2>{locationLabel}</h2></div><button className="favorite-button" disabled={!favoriteName} onClick={() => saveFavorites(favorites.includes(favoriteName) ? favorites.filter((item) => item !== favoriteName) : [...favorites, favoriteName])}><i className={favorites.includes(favoriteName) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} /></button></div>{current && <><div className="current-main"><div className="weather-visual"><i className={`fa-solid ${icon}`} /></div><div><div className="temperature">{Math.round(current.temperature_2m)}<sup>°C</sup></div><p className="condition">{condition}</p><p className="feels-like">Feels like {Math.round(current.apparent_temperature)}°</p></div></div><div className="weather-meta"><div><span>Humidity</span><strong>{current.relative_humidity_2m}%</strong></div><div><span>Wind</span><strong>{Math.round(current.wind_speed_10m)} km/h</strong></div><div><span>Visibility</span><strong>{current.visibility ? `${(current.visibility / 1000).toFixed(1)} km` : 'N/A'}</strong></div></div></>}</article><article className="panel daylight"><p className="eyebrow">Daylight</p><h2>Sun cycle</h2><div className="sun-icon"><i className="fa-solid fa-sun" /></div>{daily && <div className="weather-meta"><div><span>Sunrise</span><strong>{new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div><div><span>Sunset</span><strong>{new Date(daily.sunset[0]).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong></div></div>}</article></section><section className="panel forecast" id="forecast"><div className="section-heading"><div><p className="eyebrow">The week ahead</p><h2>5-day forecast</h2></div></div><div className="forecast-grid">{daily?.time.slice(1, 6).map((day, index) => { const [dayCondition, dayIcon] = describeWeather(daily.weather_code[index + 1]); return <div className="forecast-day" key={day}><strong>{new Date(day).toLocaleDateString([], { weekday: 'short' })}</strong><i className={`fa-solid ${dayIcon}`} title={dayCondition} /><span>{Math.round(daily.temperature_2m_max[index + 1])}° / {Math.round(daily.temperature_2m_min[index + 1])}°</span></div>; })}</div></section><section className="panel recommendations"><div className="section-heading"><div><p className="eyebrow">Personalized recommendations</p><h2>Weather tips</h2></div><i className="fa-solid fa-lightbulb panel-icon" /></div>{tips.map((tip) => <p className="system-line" key={tip}><i className="fa-solid fa-circle-check" /> {tip}</p>)}</section><section className="panel alerts" id="alerts"><div className="section-heading"><div><p className="eyebrow">Stay informed</p><h2>Severe weather alerts</h2></div><span className={alerts.length ? 'alert-badge' : 'online'}>{alerts.length ? `${alerts.length} active` : 'No active alerts'}</span></div>{alerts.length ? alerts.map((alert) => <div className="alert-item" key={alert.title}><strong>{alert.title}</strong><p>{alert.description}</p></div>) : <p className="muted">No severe weather alerts are active for this location. US alerts are provided by the National Weather Service.</p>}</section><section className="panel map-panel"><div className="section-heading"><div><p className="eyebrow">Explore conditions</p><h2>Weather map</h2></div><a className="map-link" href={location ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=10/${location.latitude}/${location.longitude}` : '#'} target="_blank" rel="noreferrer">Open full map <i className="fa-solid fa-arrow-up-right-from-square" /></a></div>{location ? <iframe title="Weather location map" className="weather-map" src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.2}%2C${location.latitude - 0.15}%2C${location.longitude + 0.2}%2C${location.latitude + 0.15}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`} /> : <p className="muted">Map loading...</p>}</section><section className="panel favorites" id="favorites"><div className="section-heading"><h2>Favorite cities</h2><span>{favorites.length} saved</span></div>{favorites.length ? favorites.map((item) => <button className="favorite-chip" key={item} onClick={async () => { setQuery(item); await updateWeather(await findLocation(item)); }}>{item}</button>) : <p className="muted">Your favorite cities will appear here.</p>}</section></Layout>;
}

function AdminDashboard({ session, onLogout }) {
  const accounts = getAccounts();
  const savedLocations = accounts.reduce((count, account) => count + getFavorites(account.username).length, 0);
  return <Layout session={session} onLogout={onLogout} admin><section className="welcome-row" id="overview"><div><p className="eyebrow">Administration</p><h1>Good morning, <span>Admin.</span></h1></div><p className="current-date">{new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(new Date())}</p></section><section className="admin-stat-grid"><article className="panel"><span>Registered users</span><strong>{accounts.length}</strong><small>Stored in this browser</small></article><article className="panel"><span>Weather searches</span><strong>1,284</strong><small>Tracked activity</small></article><article className="panel"><span>Saved locations</span><strong>{savedLocations}</strong><small>Across registered users</small></article><article className="panel"><span>API status</span><strong>Operational</strong><small>Weather module ready</small></article></section><section className="admin-content-grid" id="users"><article className="panel"><div className="section-heading"><h2>Registered users</h2><span>Local accounts</span></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Status</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.username}><td>{account.username}</td><td>{account.role === 'admin' ? 'Administrator' : 'User'}</td><td><span className="online">Active</span></td></tr>)}</tbody></table></div></article><article className="panel" id="system"><p className="eyebrow">Service health</p><h2>System status</h2><p className="system-line">✓ Authentication ready</p><p className="system-line">✓ Local storage available</p><p className="system-line">✓ Weather module connected</p></article></section></Layout>;
}

function App() {
  const [session, setSessionState] = useState(currentSession);
  useEffect(() => { getAccounts(); }, []);
  const logout = () => { clearSession(); setSessionState(null); };
  if (!session) return <Auth onLogin={setSessionState} />;
  return session.role === 'admin' ? <AdminDashboard session={session} onLogout={logout} /> : <UserDashboard session={session} onLogout={logout} />;
}

createRoot(document.getElementById('root')).render(<App />);
