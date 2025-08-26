import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'q7-secret', resave: false, saveUninitialized: true }));

// expose session cart size
app.use((req, res, next) => {
  const items = req.session.cart?.items || [];
  res.locals.cartCount = items.reduce((sum, it) => sum + it.qty, 0);
  next();
});

app.use('/', shopRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Q7 Shop running at http://localhost:${PORT}`);
});
