// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    registerAdmin,
    sendVerificationCode,
    forgotPassword,
    resetPassword,
    updatePassword
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/register-admin', registerAdmin);
router.post('/send-code', sendVerificationCode);  // 用於註冊
router.post('/forgot-password', forgotPassword);  // 用於忘記密碼
router.post('/reset-password', resetPassword);
router.post('/update-password', protect, updatePassword);

module.exports = router;