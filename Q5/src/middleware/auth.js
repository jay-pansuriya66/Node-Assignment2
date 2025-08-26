const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.redirect('/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Employee.findById(decoded.id).lean();
    if (!user) return res.redirect('/login');

    req.user = user;
    res.locals.user = user;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}

module.exports = { requireAuth, signToken };
