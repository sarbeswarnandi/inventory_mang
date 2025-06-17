const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.recordSale = async (req, res) => {
  const { productId, quantitySold } = req.body;

  if (!productId || quantitySold <= 0) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  if (product.quantity < quantitySold) {
    return res.status(400).json({ message: "Insufficient stock" });
  }

  product.quantity -= quantitySold;
  await product.save();

  const sale = new Sale({ productId, quantitySold });
  await sale.save();

  res.status(201).json(sale);
};

exports.getSales = async (req, res) => {
  const sales = await Sale.find().populate('productId', 'name price');
  res.json(sales);
};
