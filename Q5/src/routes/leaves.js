const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');

router.get('/', async (req, res) => {
  const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 }).lean();
  res.render('leaves/index', { title: 'My Leaves', leaves });
});

router.get('/new', (req, res) => {
  res.render('leaves/new', { title: 'Apply Leave' });
});

router.post('/', async (req, res) => {
  try {
    const { date, reason, grant } = req.body;
    await Leave.create({
      employee: req.user._id,
      date: new Date(date),
      reason,
      grant: grant === 'yes'
    });
    res.redirect('/leaves');
  } catch (err) {
    console.error(err);
    res.status(400).render('leaves/new', { title: 'Apply Leave', error: 'Invalid data' });
  }
});

module.exports = router;
