import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import flash from 'connect-flash';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import employeeRoutes from './routes/employees.js';
import { ensureAdminSeed } from './models/Admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/erp_q4';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('MongoDB connected');
  return ensureAdminSeed();
}).catch(err => console.error('MongoDB error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use(express.static(path.join(__dirname, '../public')));

// Parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Robust method override from form body
app.use(methodOverride(function (req) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    const method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

// Session
const SESSION_SECRET = process.env.SESSION_SECRET || 'change_me_secret';
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 2 } // 2 hours
}));

app.use(flash());

// Expose flash and user to views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.admin = req.session.admin || null;
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/employees', employeeRoutes);

app.get('/', (req, res) => {
  if (!req.session.admin) return res.redirect('/login');
  res.render('dashboard', { title: 'Admin Dashboard' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Q4 ERP Admin running on http://localhost:${PORT}`));
