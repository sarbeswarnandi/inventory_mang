const express = require('express');
const Activity = require('../models/Activity');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const logs = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity logs' });
  }
});

module.exports = router;
