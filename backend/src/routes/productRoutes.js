const express = require('express');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  adjustStock,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // every route below requires a valid token

router.get('/', listProducts);
router.post('/', createProduct);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.patch('/:id/adjust-stock', adjustStock);
router.delete('/:id', deleteProduct);

module.exports = router;
