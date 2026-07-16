/**
 * Populates the database with one demo shop, a handful of products,
 * and a couple of orders — enough to demo the app end-to-end.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Business = require('../models/Business');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

async function seed() {
  await connectDB();

  console.log('Clearing existing demo data...');
  await Promise.all([
    Business.deleteMany({ name: 'Sharma General Store' }),
  ]);

  const business = await Business.create({
    name: 'Sharma General Store',
    ownerName: 'Rakesh Sharma',
    city: 'Meerut',
  });

  const passwordHash = await User.hashPassword('password123');
  const owner = await User.create({
    business: business._id,
    name: 'Rakesh Sharma',
    email: 'rakesh@sharmastore.test',
    passwordHash,
    role: 'owner',
  });

  const products = await Product.insertMany([
    { business: business._id, name: 'Basmati Rice 5kg', sku: 'RICE-5KG', category: 'Grocery', unit: 'bag', costPrice: 350, sellingPrice: 420, stockQty: 40, lowStockThreshold: 10 },
    { business: business._id, name: 'Tata Salt 1kg', sku: 'SALT-1KG', category: 'Grocery', unit: 'pcs', costPrice: 18, sellingPrice: 25, stockQty: 100, lowStockThreshold: 20 },
    { business: business._id, name: 'Parle-G Biscuit Pack', sku: 'PARLEG-1', category: 'Snacks', unit: 'pcs', costPrice: 8, sellingPrice: 12, stockQty: 8, lowStockThreshold: 15 },
    { business: business._id, name: 'Amul Milk 1L', sku: 'MILK-1L', category: 'Dairy', unit: 'litre', costPrice: 52, sellingPrice: 60, stockQty: 30, lowStockThreshold: 10 },
  ]);

  const customer = await Customer.create({
    business: business._id,
    name: 'Priya Verma',
    phone: '9876543210',
    address: 'Shastri Nagar, Meerut',
  });

  console.log('\nSeed complete.\n');
  console.log('Login with:');
  console.log(`  businessId: ${business._id}`);
  console.log('  email:      rakesh@sharmastore.test');
  console.log('  password:   password123');
  console.log(`\nSample product ID (Parle-G, low stock): ${products[2]._id}`);
  console.log(`Sample customer ID: ${customer._id}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
