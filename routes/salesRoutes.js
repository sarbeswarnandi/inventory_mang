const express = require('express');
const router = express.Router();
const {
  recordSale,
  getSales,
  getAnalytics
} = require('../controllers/salesController');

router.post('/', recordSale);
router.get('/', getSales);
router.get('/analytics', getAnalytics);  // ✅ ADD THIS

module.exports = router;
