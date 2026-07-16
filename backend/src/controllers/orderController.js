const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Business = require('../models/Business');
const Customer = require('../models/Customer');

/**
 * Generates the next sequential order number for a business using an
 * atomic $inc on Business.orderCounter. Two staff creating orders at the
 * same instant will never collide on the same number.
 */
async function nextOrderNumber(businessId) {
  const business = await Business.findByIdAndUpdate(
    businessId,
    { $inc: { orderCounter: 1 } },
    { new: true }
  );
  return `ORD-${String(business.orderCounter).padStart(5, '0')}`;
}

/**
 * POST /api/orders
 * Body: { customerId?, customerName?, items: [{ productId, qty }] }
 *
 * Stock is decremented per line item using an atomic conditional update
 * (only succeeds if stockQty >= qty). If any line item can't be fulfilled
 * (not enough stock), we roll back the items already decremented and
 * reject the whole order — this keeps stock counts trustworthy even
 * when two orders race for the last few units of the same product.
 */
const createOrder = asyncHandler(async (req, res) => {
  const { customerId, customerName, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Order must include at least one item');
  }

  const decrementedSoFar = []; // for rollback if a later item fails
  const orderItems = [];
  let totalAmount = 0;

  try {
    for (const { productId, qty } of items) {
      if (!productId || !qty || qty < 1) {
        throw new Error('Each item needs a valid productId and qty >= 1');
      }

      const product = await Product.findOneAndUpdate(
        { _id: productId, business: req.businessId, stockQty: { $gte: qty } },
        { $inc: { stockQty: -qty } },
        { new: true }
      );

      if (!product) {
        const existing = await Product.findOne({ _id: productId, business: req.businessId });
        const label = existing ? existing.name : productId;
        throw new Error(`Not enough stock for "${label}" (or product not found)`);
      }

      decrementedSoFar.push({ productId, qty });
      orderItems.push({
        product: product._id,
        name: product.name,
        qty,
        unitPrice: product.sellingPrice,
      });
      totalAmount += product.sellingPrice * qty;
    }

    let customerNameSnapshot = customerName || 'Walk-in';
    if (customerId) {
      const customer = await Customer.findOne({ _id: customerId, business: req.businessId });
      if (customer) customerNameSnapshot = customer.name;
    }

    const orderNumber = await nextOrderNumber(req.businessId);

    const order = await Order.create({
      business: req.businessId,
      orderNumber,
      customer: customerId || null,
      customerNameSnapshot,
      items: orderItems,
      totalAmount,
      status: 'pending',
      createdBy: req.userId,
    });

    res.status(201).json(order);
  } catch (err) {
    // Roll back any stock we already decremented before the failure.
    for (const { productId, qty } of decrementedSoFar) {
      await Product.updateOne(
        { _id: productId, business: req.businessId },
        { $inc: { stockQty: qty } }
      );
    }
    res.status(400);
    throw err;
  }
});

/** GET /api/orders?status=&from=&to= */
const listOrders = asyncHandler(async (req, res) => {
  const filter = { business: req.businessId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json(orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, business: req.businessId });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

/**
 * PATCH /api/orders/:id/status
 * Body: { status: 'fulfilled' | 'cancelled' }
 * Cancelling restores stock for every line item.
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['fulfilled', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error("status must be 'fulfilled' or 'cancelled'");
  }

  const order = await Order.findOne({ _id: req.params.id, business: req.businessId });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.status !== 'pending') {
    res.status(400);
    throw new Error(`Order is already ${order.status}`);
  }

  if (status === 'cancelled') {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, business: req.businessId },
        { $inc: { stockQty: item.qty } }
      );
    }
  }

  order.status = status;
  await order.save();
  res.json(order);
});

module.exports = { createOrder, listOrders, getOrder, updateOrderStatus };
