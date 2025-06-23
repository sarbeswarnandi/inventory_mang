const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantitySold: { type: Number, required: true },
  salePrice: { type: Number, required: true },     // New
  costPrice: { type: Number, required: true },     // New
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Sale', saleSchema);
