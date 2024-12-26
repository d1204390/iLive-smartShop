// server/routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
    getDashboardData,
    getAllUsers,
    updateUserStatus,
    updateUserRole
} = require('../controllers/adminController');

// 所有的管理員路由都需要先驗證是否登入(protect)且是管理員(admin)
router.use(protect, admin);

// 儀表板數據
router.get('/dashboard', getDashboardData);

// 用戶管理路由
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);

module.exports = router;