const Product = require('../models/Product');
const Activity = require('../models/Activity');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, quantity, price, costPrice, lowStockThreshold } = req.body;
    const product = await Product.create({ name, quantity, price, costPrice, lowStockThreshold });
    await Activity.create({
      action: 'Add Product',
      details: `"${name}" added (qty ${quantity}, price ₹${price}, cost ₹${costPrice}, threshold ${lowStockThreshold})`
    });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: 'Create failed' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price, costPrice, lowStockThreshold } = req.body;
    const old = await Product.findById(id);
    if (!old) return res.status(404).json({ message: 'Not found' });

    const changes = [];
    if (quantity !== undefined && quantity !== old.quantity)
      changes.push(`Qty ${old.quantity}→${quantity}`);
    if (price !== undefined && price !== old.price)
      changes.push(`Price ₹${old.price}→₹${price}`);
    if (costPrice !== undefined && costPrice !== old.costPrice)
      changes.push(`Cost ₹${old.costPrice}→₹${costPrice}`);
    if (lowStockThreshold !== undefined && lowStockThreshold !== old.lowStockThreshold)
      changes.push(`Threshold ${old.lowStockThreshold}→${lowStockThreshold}`);

    if (!changes.length) return res.status(400).json({ message: 'No changes' });

    const updated = await Product.findByIdAndUpdate(id, { quantity, price, costPrice, lowStockThreshold }, { new: true });
    await Activity.create({ action: 'Edit Product', details: `"${old.name}" updated: ${changes.join(', ')}` });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const prod = await Product.findByIdAndDelete(req.params.id);
    if (prod) {
      await Activity.create({ action: 'Delete Product', details: `"${prod.name}" deleted` });
      return res.json({ message: 'Deleted' });
    }
    res.status(404).json({ message: 'Not found' });
  } catch {
    res.status(500).json({ message: 'Delete failed' });
  }
};

const addQuantityToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToAdd } = req.body;
    if (!quantityToAdd || quantityToAdd <= 0) return res.status(400).json({ message: 'Bad qty' });

    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: 'Not found' });
    const oldQty = prod.quantity;
    prod.quantity += quantityToAdd;
    await prod.save();

    await Activity.create({
      action: 'Add Quantity',
      details: `"${prod.name}" qty ${oldQty}→${prod.quantity}`
    });

    res.json(prod);
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const low = await Product.find({ quantity: { $lte: threshold } });
    res.json(low);
  } catch {
    res.status(500).json({ message: 'Fetch failed' });
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addQuantityToProduct,
  getLowStockProducts
};
