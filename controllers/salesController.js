const Sale = require('../models/Sale');
const Product = require('../models/Product');

// ✅ Record a sale
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

    const sale = await Sale.create({ productId, quantitySold: qty });
    res.status(201).json(sale);
  } catch (err) {
    console.error('Sale recording error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get sales with filters, pagination, earnings
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
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: null,
          totalEarnings: {
            $sum: { $multiply: ['$quantitySold', '$product.price'] }
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

// ✅ Get analytics with optional date filters
exports.getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000); // default 7 days
    const end = endDate ? new Date(endDate) : new Date();

    const dailySales = await Sale.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          quantity: { $sum: "$quantitySold" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const topProducts = await Sale.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
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

    const totalEarningsAgg = await Sale.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ["$quantitySold", "$product.price"] }
          }
        }
      }
    ]);

    const totalEarnings = totalEarningsAgg[0]?.total || 0;

    res.json({
      totalEarnings,
      dailySales,
      topProducts
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: "Analytics fetch error" });
  }
};
