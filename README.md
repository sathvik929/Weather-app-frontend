# ATMOS

> A calmer way to read the sky.

ATMOS is a responsive weather dashboard designed to make everyday forecasts feel clear, useful, and easy to scan. Search for any city, check the conditions that matter, and keep favorite places close at hand.

## Highlights

- Live current weather and a 5-day forecast
- City search with clear error states
- Browser geolocation support
- Sunrise, sunset, humidity, wind, pressure, visibility, and feels-like temperature
- Weather-aware suggestions for the day
- Favorite cities saved in `localStorage`
- Light and dark themes
- Responsive login and dashboard layouts
- Demo login flow using `sessionStorage`

## Quick Start

ATMOS is a browser-first static project, so no build tool or backend is required.

1. Clone or download this repository.
2. Add your OpenWeatherMap API key in `js/weather.js`.
3. Open `login.html` in a browser.
4. Sign in with the demo account below.

For the smoothest local experience, serve the folder with a simple local server:

```bash
python -m http.server 5500
```

Then visit [http://localhost:5500/login.html](http://localhost:5500/login.html).

## Demo Access

| Field | Value |
| --- | --- |
| Username | `admin` |
| Password | `admin123` |

This is a frontend-only demo login and is not intended for production authentication.

## API Configuration

Weather data comes from [OpenWeatherMap](https://openweathermap.org/api). In `js/weather.js`, replace the placeholder API key with your own key:

```js
const API_KEY = 'YOUR_API_KEY';
```

Do not commit a private production API key to a public repository. For a real deployment, proxy weather requests through a backend or serverless function and keep the key in an environment variable. If the existing key in this demo has been shared publicly, revoke it and create a replacement.

## Project Structure

```text
.
├── dashboard.html       # Main weather dashboard
├── login.html           # Demo sign-in screen
├── css/
│   └── style.css        # Shared responsive styling and themes
├── js/
│   ├── login.js         # Demo authentication behavior
│   └── weather.js        # Weather API, forecast, favorites, and UI logic
└── images/              # Image assets
```

## Built With

- Semantic HTML
- CSS with responsive layouts, themes, and motion
- Vanilla JavaScript
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Font Awesome](https://fontawesome.com/)
- Google Fonts: DM Sans and Space Grotesk

## Browser Support

Use a current version of Chrome, Edge, Firefox, or Safari. Location weather requires browser permission and a secure context such as `localhost` or HTTPS.

## License

This project is intended for learning and demonstration purposes.
