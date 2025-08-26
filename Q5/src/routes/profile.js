const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const user = req.user;
  res.render('profile', { title: 'My Profile', user });
});

module.exports = router;
