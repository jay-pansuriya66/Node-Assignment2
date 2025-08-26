import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static
app.use(express.static(path.join(__dirname, '../public')));

// parsers
app.use(express.urlencoded({ extended: true }));

// Home page
app.get('/', (req, res) => {
  res.render('index', { title: 'Q6 Utilities', query: '', weather: null, error: null });
});

// Backend weather via Open-Meteo
app.get('/weather', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) {
    return res.render('index', { title: 'Q6 Utilities', query: '', weather: null, error: 'Please provide a city name' });
  }
  try {
    const geoUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.searchParams.set('name', q);
    geoUrl.searchParams.set('count', '1');
    const geoResp = await fetch(geoUrl.href);
    if (!geoResp.ok) throw new Error('Geocoding failed');
    const geo = await geoResp.json();
    if (!geo?.results?.length) {
      return res.render('index', { title: 'Q6 Utilities', query: q, weather: null, error: 'City not found' });
    }
    const place = geo.results[0];

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
    return res.render('index', { title: 'Q6 Utilities', query: q, weather, error: null });
  } catch (e) {
    console.error('Weather error:', e.message);
    return res.render('index', { title: 'Q6 Utilities', query: q, weather: null, error: 'Failed to fetch weather' });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Q6 Utilities running at http://localhost:${PORT}`);
});
