const express = require('express');
const { listCustomers, createCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listCustomers);
router.post('/', createCustomer);

module.exports = router;
