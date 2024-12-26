// server/routes/orders.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    getSalesStatistics,
    cancelOrder,
    requestReturn, adminCancelOrder  // 添加 requestReturn 到解構列表中
} = require('../controllers/orderController');

// 一般路由
router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
// 在現有的路由配置中添加
router.get('/statistics', protect, admin,getSalesStatistics);
// 訂單狀態路由
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/status', protect, updateOrderStatus);
router.put('/:id/return', protect, requestReturn);  // 使用解構出來的 requestReturn

// 管理員路由
router.get('/', protect, admin, getAllOrders);
router.put('/:id/admin-status', protect, admin, updateOrderStatus);
// orders.js 新增路由
router.put('/:id/admin-cancel', protect, admin, adminCancelOrder);

module.exports = router;