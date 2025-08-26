import { Router } from 'express';
import fetch from 'node-fetch';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /tools -> show utility page with weather form and frontend joke demo
router.get('/', requireAdmin, (req, res) => {
  res.render('tools/index', { title: 'Utilities', weather: null, query: '' });
});

// GET /tools/weather?q=city
router.get('/weather', requireAdmin, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      req.flash('error', 'Please enter a city name');
      return res.render('tools/index', { title: 'Utilities', weather: null, query: '' });
    }

    // 1) Geocode city -> lat/lon using Open-Meteo Geocoding (no API key)
    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', q);
    geoUrl.searchParams.set('count', '1');

    const geoResp = await fetch(geoUrl.href);
    if (!geoResp.ok) throw new Error('Geocoding failed');
    const geo = await geoResp.json();
    if (!geo || !geo.results || !geo.results.length) {
      req.flash('error', 'City not found');
      return res.render('tools/index', { title: 'Utilities', weather: null, query: q });
    }
    const place = geo.results[0];

    // 2) Fetch current weather
    const wxUrl = new URL('https://api.open-meteo.com/v1/forecast');
    wxUrl.searchParams.set('latitude', String(place.latitude));
    wxUrl.searchParams.set('longitude', String(place.longitude));
    wxUrl.searchParams.set('current_weather', 'true');

    const wxResp = await fetch(wxUrl.href);
    if (!wxResp.ok) throw new Error('Weather fetch failed');
    const wx = await wxResp.json();

    const weather = {
      city: `${place.name}${place.country ? ', ' + place.country : ''}`,
      latitude: place.latitude,
      longitude: place.longitude,
      temperatureC: wx?.current_weather?.temperature ?? null,
      windSpeed: wx?.current_weather?.windspeed ?? null,
      windDirection: wx?.current_weather?.winddirection ?? null,
      weatherCode: wx?.current_weather?.weathercode ?? null,
      time: wx?.current_weather?.time ?? null,
    };

    return res.render('tools/index', { title: 'Utilities', weather, query: q });
  } catch (err) {
    console.error('GET /tools/weather error', err);
    req.flash('error', 'Failed to fetch weather');
    return res.render('tools/index', { title: 'Utilities', weather: null, query: req.query.q || '' });
  }
});

export default router;
