// server/routes/products.js
const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// 管理員路由
router.get('/admin', protect, admin, getProducts); // 管理員專用路由
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// 公開路由
router.get('/', getProducts); // 一般用戶路由
router.get('/search', searchProducts);
router.get('/:id', getProduct);

module.exports = router;