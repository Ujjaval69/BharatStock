const express = require('express');
const { salesSummary, lowStockReport } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/summary', salesSummary);
router.get('/low-stock', lowStockReport);

module.exports = router;
