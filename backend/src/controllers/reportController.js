const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * GET /api/reports/summary?from=&to=
 * Basic sales dashboard: revenue, order count, and top-selling products
 * within an optional date range (defaults to last 30 days).
 */
const salesSummary = asyncHandler(async (req, res) => {
  const to = req.query.to ? new Date(req.query.to) : new Date();
  const from = req.query.from ? new Date(req.query.from) : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const match = {
    business: new mongoose.Types.ObjectId(req.businessId),
    status: { $ne: 'cancelled' },
    createdAt: { $gte: from, $lte: to },
  };

  const totals = await Order.aggregate([
    { $match: match },
    { $group: { _id: null, revenue: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
  ]);

  const salesByDay = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" } },
        revenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const topProducts = await Order.aggregate([
    { $match: match },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        unitsSold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.qty', '$items.unitPrice'] } },
      },
    },
    { $sort: { unitsSold: -1 } },
    { $limit: 5 },
  ]);

  res.json({
    range: { from, to },
    revenue: totals[0]?.revenue || 0,
    orderCount: totals[0]?.orderCount || 0,
    salesByDay,
    topProducts,
  });
});

/** GET /api/reports/low-stock — products at or below their threshold. */
const lowStockReport = asyncHandler(async (req, res) => {
  const products = await Product.find({ business: req.businessId, isActive: true });
  const lowStock = products
    .filter((p) => p.stockQty <= p.lowStockThreshold)
    .sort((a, b) => a.stockQty - b.stockQty);
  res.json(lowStock);
});

module.exports = { salesSummary, lowStockReport };
