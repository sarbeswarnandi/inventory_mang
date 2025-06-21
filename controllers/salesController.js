const Sale = require('../models/Sale');
const Product = require('../models/Product');

exports.recordSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;
    const qty = Number(quantitySold);

    if (!productId || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid productId or quantitySold" });
    }

    const product = await Product.findById(productId);
    if (!product || product.quantity < qty) {
      return res.status(400).json({ message: "Product not found or insufficient stock" });
    }

    product.quantity -= qty;
    await product.save();

    const sale = await Sale.create({ productId, quantitySold: qty });

    res.status(201).json(sale);
  } catch (err) {
    console.error('Sale error:', err);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

    const sales = await Sale.find(filter)
      .sort({ date: sort === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('productId', 'name price')
      .lean();

    const totalSales = await Sale.countDocuments(filter);

    const earnings = await Sale.aggregate([
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
          totalEarnings: { $sum: { $multiply: ['$quantitySold', '$product.price'] } }
        }
      }
    ]);

    res.json({
      sales,
      totalPages: Math.ceil(totalSales / limit),
      currentPage: Number(page),
      totalEarnings: earnings[0]?.totalEarnings || 0
    });
  } catch (err) {
    console.error('Fetch sales error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    const [dailySales, topProducts, totalEarnings] = await Promise.all([
      Sale.aggregate([
        { $match: { date: { $gte: weekAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            quantity: { $sum: "$quantitySold" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Sale.aggregate([
        { $group: { _id: "$productId", quantity: { $sum: "$quantitySold" } } },
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
      ]),
      Sale.aggregate([
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
            total: { $sum: { $multiply: ["$quantitySold", "$product.price"] } }
          }
        }
      ])
    ]);

    res.json({
      totalEarnings: totalEarnings[0]?.total || 0,
      dailySales,
      topProducts
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: "Analytics fetch error" });
  }
};
