const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const leaveRoutes = require('./routes/leaves');
const { requireAuth } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use('/', authRoutes);
app.use('/profile', requireAuth, profileRoutes);
app.use('/leaves', requireAuth, leaveRoutes);

app.get('/', (req, res) => {
  return res.redirect('/profile');
});

app.use((req, res) => {
  res.status(404).render('404', { title: 'Not Found' });
});

module.exports = app;
