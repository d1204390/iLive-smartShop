// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // 檢查 header 中的 token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            console.log('Token found:', req.headers.authorization);
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        try {
            // 驗證 token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            // 檢查用戶是否存在
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            // 將用戶信息添加到請求中，包含 isAdmin 屬性
            req.user = user;
            req.user.isAdmin = user.role === 'admin';

            next();
        } catch (err) {
            console.error('Token verification error:', err);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.admin = async (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};