export function requireAdmin(req, res, next) {
  if (!req.session.admin) {
    req.flash('error', 'Please login as admin');
    return res.redirect('/login');
  }
  next();
}
