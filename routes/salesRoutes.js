const express = require('express');
const router = express.Router();
const {
  recordSale,
  getSales
} = require('../controllers/salesController');

router.post('/', recordSale);
router.get('/', getSales);

module.exports = router;
