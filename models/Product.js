const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 5 } 
});

module.exports = mongoose.model('Product', productSchema);
