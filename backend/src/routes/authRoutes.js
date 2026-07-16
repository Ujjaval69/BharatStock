const express = require('express');
const { registerBusiness, login, getMe, updateBusiness } = require('../controllers/authController');
const { protect, requireOwner } = require('../middleware/auth');

const router = express.Router();

router.post('/register-business', registerBusiness);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/business', protect, requireOwner, updateBusiness);

module.exports = router;

