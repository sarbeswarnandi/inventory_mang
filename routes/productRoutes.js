const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts // ✅ Importing low stock controller
} = require('../controllers/productController');

// Routes
router.get('/', getAllProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// ✅ Low stock alert route
router.get('/low-stock', getLowStockProducts);

module.exports = router;
