const Product = require('../models/Product');
const Activity = require('../models/Activity');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    const product = await Product.create({ name, quantity, price });

    await Activity.create({
      action: 'Add Product',
      details: `Added "${name}" with quantity ${quantity} and price ₹${price}`
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (edit price or quantity)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price } = req.body;

    const oldProduct = await Product.findById(id);
    if (!oldProduct) return res.status(404).json({ message: 'Product not found' });

    const changes = [];

    if (typeof quantity !== 'undefined' && quantity !== oldProduct.quantity) {
      changes.push(`Quantity: ${oldProduct.quantity} → ${quantity}`);
    }

    if (typeof price !== 'undefined' && price !== oldProduct.price) {
      changes.push(`Price: ₹${oldProduct.price} → ₹${price}`);
    }

    if (changes.length === 0) {
      return res.status(400).json({ message: 'No changes made to the product.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { quantity, price },
      { new: true }
    );

    await Activity.create({
      action: 'Edit Product',
      details: `Updated "${oldProduct.name}". ${changes.join(', ')}`
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Activity.create({
      action: 'Delete Product',
      details: `Deleted "${product.name}" from inventory`
    });

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Add quantity to existing product
const addQuantityToProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantityToAdd } = req.body;

    if (!quantityToAdd || quantityToAdd <= 0) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const oldQty = product.quantity;
    product.quantity += quantityToAdd;
    await product.save();

    await Activity.create({
      action: 'Add Quantity',
      details: `Added ${quantityToAdd} units to "${product.name}" (from ${oldQty} to ${product.quantity})`
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add quantity' });
  }
};

// Get low stock products (default threshold: 5)
const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5');
    const lowStock = await Product.find({ quantity: { $lte: threshold } });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low stock products' });
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
