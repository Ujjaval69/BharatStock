const asyncHandler = require('express-async-handler');
const Customer = require('../models/Customer');

const listCustomers = asyncHandler(async (req, res) => {
  const customers = await Customer.find({ business: req.businessId }).sort({ name: 1 });
  res.json(customers);
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('name is required');
  }
  const customer = await Customer.create({ business: req.businessId, name, phone, address });
  res.status(201).json(customer);
});

module.exports = { listCustomers, createCustomer };
