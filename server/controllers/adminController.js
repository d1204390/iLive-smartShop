// server/controllers/adminController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// 使用物件方式定義所有方法
const adminController = {
    // 獲取儀表板資料
    getDashboardData: async (req, res) => {
        try {
            // 訂單統計
            const today = new Date(new Date().setHours(0, 0, 0, 0));

            // 基本訂單統計
            const orderStats = {
                total: await Order.countDocuments(),
                pending: await Order.countDocuments({ status: 'pending' }),
                processing: await Order.countDocuments({ status: 'processing' }),
                shipped: await Order.countDocuments({ status: 'shipped' }),
                delivered: await Order.countDocuments({ status: 'delivered' }),
                completed: await Order.countDocuments({ status: 'completed' }),
                returned: await Order.countDocuments({ status: 'returned' }),
                cancelled: await Order.countDocuments({ status: 'cancelled' }),
                today: await Order.countDocuments({
                    createdAt: { $gte: today }
                })
            };

            // 財務統計
            const allOrders = await Order.find();
            const validOrders = allOrders.filter(order =>
                !['cancelled', 'returned'].includes(order.status));
            const returnedOrders = allOrders.filter(order =>
                order.status === 'returned');

            orderStats.totalRevenue = validOrders.reduce((sum, order) =>
                sum + order.totalAmount, 0);
            orderStats.returnedAmount = returnedOrders.reduce((sum, order) =>
                sum + order.totalAmount, 0);
            orderStats.actualRevenue = orderStats.totalRevenue - orderStats.returnedAmount;

            // 商品統計
            const productStats = {
                total: await Product.countDocuments(),
                lowStock: await Product.countDocuments({ stock: { $lt: 10 } }),
                outOfStock: await Product.countDocuments({ stock: 0 })
            };

            // 用戶統計
            const userStats = {
                total: await User.countDocuments(),
                today: await User.countDocuments({
                    createdAt: { $gte: today }
                }),
                active: await User.countDocuments({ isActive: true })
            };

            // 最新訂單（包含更多資訊）
            const recentOrders = await Order.find()
                .populate('user', 'email')
                .populate('products.product', 'name')
                .sort('-createdAt')
                .limit(5)
                .select('_id user totalAmount status createdAt products shippingAddress');

            // 庫存警告商品（包含更多資訊）
            const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
                .select('name stock price specialPrice category')
                .sort('stock')
                .limit(5);

            // 銷售趨勢（最近7天）
            const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
            const dailyOrders = await Order.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sevenDaysAgo },
                        status: { $nin: ['cancelled', 'returned'] }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        revenue: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            res.json({
                orderStats,
                productStats,
                userStats,
                recentOrders,
                lowStockProducts,
                salesTrend: dailyOrders
            });

        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).json({
                success: false,
                message: '獲取儀表板資料失敗',
                error: error.message
            });
        }
    },

    // 獲取所有用戶
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: '獲取用戶列表失敗' });
        }
    },

    // 更新用戶狀態
    updateUserStatus: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { isActive: req.body.isActive },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: '更新用戶狀態失敗' });
        }
    },

    // 更新用戶角色
    updateUserRole: async (req, res) => {
        try {
            const user = await User.findByIdAndUpdate(
                req.params.userId,
                { role: req.body.role },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ message: '用戶不存在' });
            }

            res.json(user);
        } catch (error) {
            res.status(500).json({ message: '更新用戶角色失敗' });
        }
    }
};

// 導出整個控制器物件
module.exports = adminController;