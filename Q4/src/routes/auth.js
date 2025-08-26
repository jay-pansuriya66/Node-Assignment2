import { Router } from 'express';
import { Admin } from '../models/Admin.js';

const router = Router();

router.get('/login', (req, res) => {
  if (req.session.admin) return res.redirect('/');
  res.render('login', { title: 'Admin Login' });
});

router.get('/register', (req, res) => {
  if (req.session.admin) return res.redirect('/');
  res.render('register', { title: 'Admin Register' });
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      req.flash('error', 'Admin with this email already exists');
      return res.redirect('/register');
    }
    const admin = await Admin.create({ email, password });
    req.session.admin = { id: admin._id.toString(), email: admin.email };
    req.flash('success', 'Registration successful');
    res.redirect('/');
  } catch (e) {
    console.error(e);
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/login');
    }
    req.session.admin = { id: admin._id.toString(), email: admin.email };
    req.flash('success', 'Welcome back');
    res.redirect('/');
  } catch (e) {
    console.error(e);
    req.flash('error', 'Login error');
    res.redirect('/login');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

export default router;
