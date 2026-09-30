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
- Responsive login, signup, dashboard, and admin layouts
- Signup and login accounts stored in browser `localStorage`
- JavaScript role-based navigation between user and admin modules

## Quick Start

ATMOS is a browser-first static project, so no build tool or backend is required.

1. Clone or download this repository.
2. Add your OpenWeatherMap API key in `js/weather.js`.
3. Open `login.html` in a browser.
4. Create an account using Signup or sign in with an existing local account.

For the smoothest local experience, serve the folder with a simple local server:

```bash
python -m http.server 5500
```

Then visit [http://localhost:5500/login.html](http://localhost:5500/login.html).

## Authentication

New accounts are created as regular users and stored in `localStorage` for this browser. The built-in administrator account is seeded locally on first use with username `admin` and password `admin123`; change or remove it before any real deployment. The admin module reads the stored account registry and per-user saved locations.

Authentication is intentionally local and backend-free. Signup creates a regular user account in browser `localStorage`; login creates a temporary session in `sessionStorage` and redirects users to the correct module.

## API Configuration

Weather data comes from [OpenWeatherMap](https://openweathermap.org/api). In `js/weather.js`, replace the placeholder API key with your own key:

```js
const API_KEY = 'YOUR_API_KEY';
```

Do not commit a private production API key to a public repository. For a real deployment, proxy weather requests through a backend or serverless function and keep the key in an environment variable. If the existing key has been shared publicly, revoke it and create a replacement.

## Project Structure

```text
.
├── dashboard.html       # Main weather dashboard
├── login.html           # Signup and sign-in screen
├── admin-login.html      # Separate administrator sign-in screen
├── admin.html           # Admin module
├── css/
│   └── style.css        # Shared responsive styling and themes
├── js/
│   ├── login.js         # Local account registration and authentication
│   ├── admin-login.js    # Administrator-only sign-in and redirection
│   ├── admin.js         # Admin module and stored account summary
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

This project is intended for learning purposes.
