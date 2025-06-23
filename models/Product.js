const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },         // Selling price
  costPrice: { type: Number, required: true },     // Cost price
  lowStockThreshold: { type: Number, default: 10 }  // Custom threshold for alerts
});

module.exports = mongoose.model('Product', productSchema);
