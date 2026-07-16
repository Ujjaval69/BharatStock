const asyncHandler = require('express-async-handler');
const Business = require('../models/Business');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/auth/register-business
 * Creates a new tenant (Business) plus its first user (owner) in one step.
 * This is the "sign up my shop" flow.
 */
const registerBusiness = asyncHandler(async (req, res) => {
  const { businessName, ownerName, city, email, password } = req.body;

  if (!businessName || !ownerName || !email || !password) {
    res.status(400);
    throw new Error('businessName, ownerName, email and password are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const business = await Business.create({ name: businessName, ownerName, city });

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    business: business._id,
    name: ownerName,
    email,
    passwordHash,
    role: 'owner',
  });

  const token = generateToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    business: { id: business._id, name: business.name },
  });
});

/**
 * POST /api/auth/login
 * Body: { businessId, email, password }
 * A user logs into a *specific* business, since the same email could
 * in theory exist under different shops. Simplest MVP approach: the
 * login form first asks "find my shop" (by name/phone) then password.
 * For now we accept businessId directly (frontend resolves it via a
 * lightweight business lookup step, or the user just has one shop).
 */
const login = asyncHandler(async (req, res) => {
  const { businessId, email, password } = req.body;

  if (!businessId || !email || !password) {
    res.status(400);
    throw new Error('businessId, email and password are required');
  }

  const user = await User.findOne({ business: businessId, email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = generateToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

/** GET /api/auth/me — return the logged-in user + business, using the token only. */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('-passwordHash');
  const business = await Business.findById(req.businessId);
  res.json({ user, business });
});

/** PUT /api/auth/business — Update business details (Name, City, GSTIN, default threshold). */
const updateBusiness = asyncHandler(async (req, res) => {
  const { name, ownerName, city, gstin, lowStockThresholdDefault } = req.body;

  const business = await Business.findById(req.businessId);
  if (!business) {
    res.status(404);
    throw new Error('Business not found');
  }

  if (name !== undefined) business.name = name;
  if (ownerName !== undefined) business.ownerName = ownerName;
  if (city !== undefined) business.city = city;
  if (gstin !== undefined) business.gstin = gstin;
  if (lowStockThresholdDefault !== undefined) {
    business.lowStockThresholdDefault = Number(lowStockThresholdDefault);
  }

  await business.save();
  res.json(business);
});

module.exports = { registerBusiness, login, getMe, updateBusiness };


