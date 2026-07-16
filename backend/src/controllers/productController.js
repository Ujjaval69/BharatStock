const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

/** GET /api/products?search=&lowStock=true */
const listProducts = asyncHandler(async (req, res) => {
  const filter = { business: req.businessId, isActive: true };

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  let products = await Product.find(filter).sort({ createdAt: -1 });

  if (req.query.lowStock === 'true') {
    products = products.filter((p) => p.stockQty <= p.lowStockThreshold);
  }

  res.json(products);
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, unit, costPrice, sellingPrice, stockQty, lowStockThreshold } = req.body;

  if (!name || sellingPrice === undefined) {
    res.status(400);
    throw new Error('name and sellingPrice are required');
  }

  const product = await Product.create({
    business: req.businessId,
    name,
    sku,
    category,
    unit,
    costPrice,
    sellingPrice,
    stockQty: stockQty || 0,
    lowStockThreshold,
  });

  res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, business: req.businessId });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const allowedFields = ['name', 'sku', 'category', 'unit', 'costPrice', 'sellingPrice', 'lowStockThreshold', 'isActive'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  await product.save();
  res.json(product);
});

/**
 * PATCH /api/products/:id/adjust-stock
 * Body: { delta: number, reason?: string }
 * Use this instead of directly setting stockQty — it's an atomic increment,
 * so two staff members adjusting stock at the same time can't overwrite
 * each other's change (a classic race condition in inventory systems).
 */
const adjustStock = asyncHandler(async (req, res) => {
  const { delta } = req.body;
  if (typeof delta !== 'number' || delta === 0) {
    res.status(400);
    throw new Error('delta must be a non-zero number (e.g. +10 to restock, -3 to correct a count)');
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId, stockQty: { $gte: delta < 0 ? -delta : 0 } },
    { $inc: { stockQty: delta } },
    { new: true }
  );

  if (!product) {
    res.status(400);
    throw new Error('Product not found, or adjustment would make stock negative');
  }

  res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  // Soft delete: keeps history intact for past orders that reference this product.
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, business: req.businessId },
    { isActive: false },
    { new: true }
  );
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ message: 'Product deactivated' });
});

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
};

