const path = require('path');
const express = require('express');
const session = require('express-session');
const FileStoreFactory = require('session-file-store');

const app = express();
const PORT = process.env.PORT || 3005;

// Session store config (file-based)
const FileStore = FileStoreFactory(session);
const fileStoreOptions = {
  path: path.join(__dirname, 'sessions'),
  retries: 1,
  fileExtension: '.json'
};

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    name: 'qid',
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: new FileStore(fileStoreOptions),
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// Simple in-memory users (demo only)
const USERS = [{ username: 'admin', password: 'password' }];

function ensureAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  const { error, msg } = req.query;
  res.render('login', { error, msg });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const found = USERS.find(u => u.username === username && u.password === password);
  if (!found) {
    return res.redirect('/login?error=Invalid%20credentials');
  }
  req.session.user = { username };
  res.redirect('/dashboard');
});

// Registration routes
app.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  const { error } = req.query;
  res.render('register', { error });
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.redirect('/register?error=Username%20and%20password%20are%20required');
  }
  const exists = USERS.some(u => u.username === username);
  if (exists) {
    return res.redirect('/register?error=Username%20already%20taken');
  }
  USERS.push({ username, password });
  // Redirect to login with success message
  return res.redirect('/login?msg=Registered%20successfully.%20Please%20log%20in');
});

app.get('/dashboard', ensureAuth, (req, res) => {
  res.render('dashboard', { username: req.session.user.username });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send('Error logging out');
    res.clearCookie('qid');
    res.redirect('/login');
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
