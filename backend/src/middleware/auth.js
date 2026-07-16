const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

/**
 * Verifies the JWT and attaches req.businessId / req.userId / req.role.
 * IMPORTANT: businessId always comes from the verified token, never from
 * the request body/params/query. This is what enforces tenant isolation —
 * a user literally cannot construct a request that reads or writes another
 * business's data, because every controller filters by req.businessId.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.businessId = decoded.businessId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token invalid or expired');
  }
});

/** Restricts a route to business owners (e.g. inviting staff, deleting products). */
const requireOwner = (req, res, next) => {
  if (req.role !== 'owner') {
    res.status(403);
    throw new Error('Only the business owner can perform this action');
  }
  next();
};

module.exports = { protect, requireOwner };
