const API_KEY = 'a22afed2f45c09ee8599810b439bccd6'; // Replace with your free OpenWeatherMap API key.
const DEFAULT_CITY = 'Vijayawada';
const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5';

const state = { weather: null, favorites: JSON.parse(localStorage.getItem('atmosFavorites') || '[]') };
const $ = (selector) => document.querySelector(selector);

if (sessionStorage.getItem('atmosAuthenticated') !== 'true') window.location.href = 'login.html';

const iconMap = { '01d': 'fa-sun', '01n': 'fa-moon', '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon', '03d': 'fa-cloud', '03n': 'fa-cloud', '04d': 'fa-cloud', '04n': 'fa-cloud', '09d': 'fa-cloud-showers-heavy', '09n': 'fa-cloud-showers-heavy', '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain', '11d': 'fa-cloud-bolt', '11n': 'fa-cloud-bolt', '13d': 'fa-snowflake', '13n': 'fa-snowflake', '50d': 'fa-smog', '50n': 'fa-smog' };
const weatherIcon = (iconCode) => iconMap[iconCode] || 'fa-cloud-sun';
const formatTime = (timestamp, timezone = 0) => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(new Date((timestamp + timezone) * 1000));
const formatDay = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
const capitalize = (value) => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

function showError(message) { $('#dashboardError').textContent = message; }
function clearError() { $('#dashboardError').textContent = ''; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2800); }
function setLoading(isLoading) { $('#searchButton').disabled = isLoading; $('#searchButton span').textContent = isLoading ? 'Loading...' : 'Search'; }

async function requestWeather(city) {
  if (API_KEY === 'YOUR_API_KEY') {
    throw new Error('Add your OpenWeatherMap API key in js/weather.js to load live weather data.');
  }
  const currentResponse = await fetch(`${OPEN_WEATHER_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`);
  if (!currentResponse.ok) throw new Error(currentResponse.status === 404 ? 'We could not find that city. Try another search.' : 'Weather service is unavailable right now.');
  const current = await currentResponse.json();
  const forecastResponse = await fetch(`${OPEN_WEATHER_URL}/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}&units=metric`);
  if (!forecastResponse.ok) throw new Error('The forecast could not be loaded right now.');
  const forecast = await forecastResponse.json();
  return { current, forecast };
}

function renderCurrent(data) {
  const { current } = data;
  state.weather = data;
  $('#locationName').textContent = `${current.name}, ${current.sys.country}`;
  $('#currentTemp').innerHTML = `${Math.round(current.main.temp)}<sup>°C</sup>`;
  $('#weatherCondition').textContent = capitalize(current.weather[0].description);
  $('#feelsLike').textContent = `Feels like ${Math.round(current.main.feels_like)}°`;
  $('#currentIcon').innerHTML = `<i class="fa-solid ${weatherIcon(current.weather[0].icon)}"></i>`;
  $('#humidity').textContent = `${current.main.humidity}%`;
  $('#windSpeed').textContent = `${Math.round(current.wind.speed * 3.6)} km/h`;
  $('#pressure').textContent = `${current.main.pressure} hPa`;
  $('#detailFeels').textContent = `${Math.round(current.main.feels_like)}°C`;
  $('#visibility').textContent = `${(current.visibility / 1000).toFixed(1)} km`;
  $('#detailHumidity').textContent = `${current.main.humidity}%`;
  $('#windDirection').textContent = `${getWindDirection(current.wind.deg)} (${current.wind.deg}°)`;
  $('#sunrise').textContent = formatTime(current.sys.sunrise, current.timezone);
  $('#sunset').textContent = formatTime(current.sys.sunset, current.timezone);
  $('#updatedLabel').textContent = `Updated ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
  $('#favoriteButton').classList.toggle('is-favorite', state.favorites.includes(current.name));
  $('#favoriteButton').innerHTML = `<i class="fa-${state.favorites.includes(current.name) ? 'solid' : 'regular'} fa-heart"></i>`;
  const daylight = Math.max(0, Math.min(100, ((Date.now() / 1000 - current.sys.sunrise) / (current.sys.sunset - current.sys.sunrise)) * 100));
  $('.daylight-progress span').style.width = `${daylight}%`;
  $('#daylightCopy').textContent = daylight > 100 ? 'The sun has set for today.' : `${Math.round(daylight)}% of today's daylight has passed.`;
  renderTips(current);
}

function renderForecast(data) {
  const byDay = new Map();
  data.forecast.list.forEach((item) => {
    const day = new Date(item.dt * 1000).toDateString();
    const existing = byDay.get(day);
    if (!existing || Math.abs(new Date(item.dt * 1000).getHours() - 12) < Math.abs(new Date(existing.dt * 1000).getHours() - 12)) byDay.set(day, item);
  });
  const forecastDays = [...byDay.values()].slice(0, 5);
  $('#forecastGrid').innerHTML = forecastDays.map((item, index) => `<article class="forecast-card fade-in" style="animation-delay:${index * 70}ms"><div class="forecast-day">${index === 0 ? 'Today' : formatDay(new Date(item.dt * 1000))}</div><div class="forecast-icon"><i class="fa-solid ${weatherIcon(item.weather[0].icon)}"></i></div><p class="forecast-condition">${capitalize(item.weather[0].description)}</p><div class="forecast-temperatures"><strong>${Math.round(item.main.temp_max)}°</strong><span>${Math.round(item.main.temp_min)}°</span></div></article>`).join('');
}

function renderTips(current) {
  const tips = [];
  const condition = current.weather[0].main.toLowerCase();
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) tips.push('Carry an umbrella and choose water-resistant layers.');
  if (current.main.temp >= 30) tips.push('Stay hydrated and avoid direct sunlight at midday.');
  if (current.main.temp <= 16) tips.push('Wear a warm layer and keep a hot drink nearby.');
  if (current.wind.speed * 3.6 >= 25) tips.push('Secure loose outdoor items before heading out.');
  if (!tips.length) tips.push('A comfortable day is ahead. Enjoy time outdoors.');
  $('#tipsList').innerHTML = tips.map((tip) => `<div class="tip-item"><i class="fa-solid fa-circle-check"></i><span>${tip}</span></div>`).join('');
}

function getWindDirection(degrees) { return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(degrees / 45) % 8]; }
function renderFavorites() { const list = $('#favoritesList'); $('#favoriteCount').textContent = `${state.favorites.length} saved`; if (!state.favorites.length) { list.innerHTML = '<div class="empty-favorites"><i class="fa-regular fa-heart"></i><span>Your favorite cities will appear here.</span></div>'; return; } list.innerHTML = state.favorites.map((city) => `<div class="favorite-city" data-city="${city}"><i class="fa-solid fa-location-dot"></i><span>${city}</span><button class="remove-favorite" data-remove="${city}" aria-label="Remove ${city}"><i class="fa-solid fa-xmark"></i></button></div>`).join(''); }

async function loadCity(city) { const cleanCity = city.trim(); if (!cleanCity) { showError('Enter a city name to search.'); return; } clearError(); setLoading(true); try { const data = await requestWeather(cleanCity); renderCurrent(data); renderForecast(data); $('#cityInput').value = data.current.name; document.querySelectorAll('.fade-in').forEach((element) => element.classList.remove('fade-in')); } catch (error) { showError(error.message); } finally { setLoading(false); } }
function useLocation() { if (!navigator.geolocation) { showError('Geolocation is not supported by this browser.'); return; } setLoading(true); navigator.geolocation.getCurrentPosition(async ({ coords }) => { try { if (API_KEY === 'YOUR_API_KEY') throw new Error('Add your OpenWeatherMap API key in js/weather.js to use location weather.'); const response = await fetch(`${OPEN_WEATHER_URL}/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}&units=metric`); if (!response.ok) throw new Error('We could not read your location weather.'); const location = await response.json(); await loadCity(location.name); } catch (error) { showError(error.message); setLoading(false); } }, () => { showError('Location access was denied. You can search for a city instead.'); setLoading(false); }); }

$('#searchButton').addEventListener('click', () => loadCity($('#cityInput').value));
$('#cityInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') loadCity($('#cityInput').value); });
$('#clearSearch').addEventListener('click', () => { $('#cityInput').value = ''; $('#cityInput').focus(); });
$('#locationButton').addEventListener('click', useLocation);
$('#logoutButton').addEventListener('click', () => { sessionStorage.removeItem('atmosAuthenticated'); window.location.href = 'login.html'; });
$('#favoriteButton').addEventListener('click', () => { if (!state.weather) return; const city = state.weather.current.name; state.favorites = state.favorites.includes(city) ? state.favorites.filter((favorite) => favorite !== city) : [...state.favorites, city]; localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites)); renderFavorites(); renderCurrent(state.weather); showToast(state.favorites.includes(city) ? `${city} added to favorites` : `${city} removed from favorites`); });
$('#favoritesList').addEventListener('click', (event) => { const removeButton = event.target.closest('[data-remove]'); if (removeButton) { state.favorites = state.favorites.filter((city) => city !== removeButton.dataset.remove); localStorage.setItem('atmosFavorites', JSON.stringify(state.favorites)); renderFavorites(); return; } const favorite = event.target.closest('[data-city]'); if (favorite) loadCity(favorite.dataset.city); });
$('#themeToggle').addEventListener('click', () => { document.body.classList.toggle('dark-theme'); localStorage.setItem('atmosTheme', document.body.classList.contains('dark-theme') ? 'dark' : 'light'); });
$('#menuButton').addEventListener('click', () => showToast('Navigation is available on the desktop sidebar.'));

$('#currentDate').textContent = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
if (localStorage.getItem('atmosTheme') === 'dark') document.body.classList.add('dark-theme');
renderFavorites();
loadCity(DEFAULT_CITY);
