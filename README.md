# ATMOS

> A calmer way to read the sky.

ATMOS is a responsive React + Vite weather dashboard designed to make everyday forecasts feel clear, useful, and easy to scan. Search for any city, check the conditions that matter, and keep favorite places close at hand.

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
- React role-based navigation between user and admin modules

## Quick Start

ATMOS is a React application powered by Vite.

1. Install Node.js 18 or newer.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually https://weather-app-frontend-alpha-three.vercel.app


## Authentication

New accounts are created as regular users and stored in `localStorage` for this browser. The built-in administrator account is seeded locally on first use with username `admin` and password `admin123`; change or remove it before any real deployment. The default user account is `user` / `user123`. The admin module reads the stored account registry and per-user saved locations.

Authentication is intentionally local and backend-free. Signup creates a regular user account in browser `localStorage`; login creates a temporary session in `sessionStorage` and redirects users to the correct module.

## API Configuration

Weather data uses the live [Open-Meteo forecast API](https://open-meteo.com/), city search uses Open-Meteo geocoding, current-location lookup uses browser geolocation plus OpenStreetMap reverse geocoding, and US severe alerts use the National Weather Service API. No API key is required for the current implementation.

## Modules and Project Structure

The React app has two clearly separated modules:

- **User module:** signup/login, city search, current weather, five-day forecast, and per-user favorite cities.
- **Admin module:** administrator-only login, account registry, saved-location totals, and system status.
- **Live weather services:** current conditions, humidity, wind, visibility, sunrise/sunset, a five-day forecast, location-based lookup, OpenStreetMap map visuals, US severe alerts, and weather-aware recommendations.

```text
.
├── index.html            # Vite HTML entry
├── src/
│   ├── main.jsx         # React components and application modules
│   └── app.css          # React app styling
├── package.json          # React/Vite scripts and dependencies
├── vite.config.js        # Vite React plugin configuration
├── vercel.json           # SPA rewrite configuration for Vercel
├── css/
│   └── style.css        # Shared visual styles retained by the React app
├── dashboard.html        # Legacy static dashboard reference
├── login.html            # Legacy static login reference
└── images/              # Image assets
```

## Built With

- Semantic HTML
- CSS with responsive layouts, themes, and motion
- React 18
- Vite
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Font Awesome](https://fontawesome.com/)
- Google Fonts: DM Sans and Space Grotesk

## Browser Support

Use a current version of Chrome, Edge, Firefox, or Safari. Location weather requires browser permission and a secure context such as `localhost` or HTTPS.

## Vercel Deployment

1. Push the repository to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Keep the default settings: Vercel detects Vite, uses `npm run build`, and publishes `dist`.
4. Deploy and open the generated HTTPS URL. The `vercel.json` rewrite keeps the single-page React routes working on refresh.

## License

This project is intended for learning purposes.
