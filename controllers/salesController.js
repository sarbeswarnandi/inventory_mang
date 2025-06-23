const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Activity = require('../models/Activity');

// Record a new sale and deduct stock
exports.recordSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    const qty = Number(quantitySold);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantitySold" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < qty) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    product.quantity -= qty;
    await product.save();

    const sale = new Sale({
      productId,
      quantitySold: qty,
      salePrice: product.price,
      costPrice: product.costPrice || 0
    });
    await sale.save();

    await Activity.create({
      action: 'Log Sale',
      details: `Sold ${qty} of "${product.name}" for ₹${product.price} each (Cost: ₹${product.costPrice})`
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error('Sale recording error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Paginated and filterable sales log
exports.getSales = async (req, res) => {
  try {
    const { sort = 'desc', startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sortOrder = sort === 'asc' ? 1 : -1;

    const sales = await Sale.find(filter)
      .sort({ date: sortOrder })
      .skip(skip)
      .limit(Number(limit))
      .populate('productId', 'name price');

    const totalSales = await Sale.countDocuments(filter);

    const earningsAgg = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: { $multiply: ['$quantitySold', '$salePrice'] }
          }
        }
      }
    ]);

    const totalEarnings = earningsAgg[0]?.totalEarnings || 0;

    res.json({
      sales,
      totalPages: Math.ceil(totalSales / limit),
      currentPage: Number(page),
      totalEarnings
    });
  } catch (err) {
    console.error('Fetch sales error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// Analytics: daily revenue, profit, top products
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    } else {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 6);
      filter.date = { $gte: weekAgo };
    }

    // Daily revenue and net profit
    const dailySales = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          quantity: { $sum: "$quantitySold" },
          revenue: { $sum: { $multiply: ["$quantitySold", "$salePrice"] } },
          profit: {
            $sum: {
              $multiply: [
                "$quantitySold",
                { $subtract: ["$salePrice", "$costPrice"] }
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top-selling products
    const topProducts = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$productId",
          quantity: { $sum: "$quantitySold" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          name: "$product.name",
          quantity: 1
        }
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 }
    ]);

    const totalRevenue = dailySales.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = dailySales.reduce((sum, d) => sum + d.profit, 0);

    res.json({
      totalRevenue,
      totalProfit,
      dailySales,
      topProducts
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: "Analytics fetch error" });
  }
};
