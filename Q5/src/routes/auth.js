const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { signToken } = require('../middleware/auth');

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;
    const emp = await Employee.findOne({ employeeId });
    if (!emp) return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });
    const ok = await emp.comparePassword(password);
    if (!ok) return res.status(401).render('login', { title: 'Login', error: 'Invalid credentials' });

    const token = signToken({ id: emp._id, employeeId: emp.employeeId });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.status(500).render('login', { title: 'Login', error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
