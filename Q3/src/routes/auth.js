const express = require('express');
const { ensureAuthenticated } = require('../middleware/auth');
const router = express.Router();

// Hardcoded demo user (replace with DB in real apps)
const DEMO_USER = { id: 1, username: 'admin', password: 'password', name: 'Admin User' };

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { title: 'Login', error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    req.session.user = { id: DEMO_USER.id, username: DEMO_USER.username, name: DEMO_USER.name };
    return req.session.save(() => res.redirect('/dashboard'));
  }
  res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });
});

router.post('/logout', ensureAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to logout');
    res.clearCookie(req.session?.cookie?.name || process.env.SESSION_NAME || 'qid');
    res.redirect('/login');
  });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.render('dashboard', { title: 'Dashboard' });
});

module.exports = router;
