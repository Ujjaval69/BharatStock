const express = require('express');
const { createOrder, listOrders, getOrder, updateOrderStatus } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', listOrders);
router.post('/', createOrder);
router.get('/:id', getOrder);
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
