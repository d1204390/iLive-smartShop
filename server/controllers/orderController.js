// server/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

const orderController = {
    // 獲取用戶的訂單
// server/controllers/orderController.js
    getMyOrders: async (req, res) => {
        try {
            const orders = await Order.find({ user: req.user._id })
                .populate('products.product')  // 確保填充商品資訊
                .sort('-createdAt');

            console.log('Found orders:', orders); // 調試用

            res.json({
                success: true,
                data: orders
            });
        } catch (err) {
            console.error('Get orders error:', err); // 調試用
            res.status(500).json({
                success: false,
                message: '獲取訂單失敗',
                error: err.message
            });
        }
    },

    // 創建訂單
    createOrder: async (req, res) => {
        try {
            const { products } = req.body;
            let subtotal = 0;
            const orderProducts = [];

            // 驗證商品並計算價格
            for (const item of products) {
                const product = await Product.findById(item.product);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: `找不到商品 ${item.product}`
                    });
                }

                // 檢查庫存
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: `商品 ${product.name} 庫存不足`
                    });
                }

                // 使用特惠價格（如果有）或原價
                const actualPrice = product.specialPrice || product.price;
                const itemTotal = actualPrice * item.quantity;
                subtotal += itemTotal;

                // 創建商品快照
                orderProducts.push({
                    product: product._id,
                    productSnapshot: {
                        name: product.name,
                        price: product.price,
                        specialPrice: product.specialPrice,
                        category: product.category,
                        image: product.image
                    },
                    quantity: item.quantity,
                    price: actualPrice
                });

                // 移除這裡的庫存更新，讓它只在 Order model 的 pre-save hook 中執行
            }

            const shippingFee = subtotal >= 800 ? 0 : 100;
            const totalAmount = subtotal + shippingFee;

            const order = await Order.create({
                user: req.user._id,
                products: orderProducts,
                subtotal,
                shippingFee,
                totalAmount,
                paymentMethod: req.body.paymentMethod || 'credit_card',
                shippingAddress: req.body.shippingAddress
            });

            await order.populate('products.product', 'name price specialPrice');

            res.status(201).json({
                success: true,
                message: '訂單創建成功',
                data: order
            });
        } catch (err) {
            console.error('創建訂單錯誤:', err);
            res.status(500).json({
                success: false,
                message: '創建訂單失敗',
                error: err.message
            });
        }
    },

    // 取得所有訂單（管理員用）
    getAllOrders: async (req, res) => {
        try {
            const orders = await Order.find()
                .populate('user', 'email')
                .populate('products.product', 'name price specialPrice')
                .sort('-createdAt');

            res.json({
                success: true,
                data: orders
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '獲取訂單失敗',
                error: err.message
            });
        }
    },

// 更新訂單狀態
    updateOrderStatus: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: '訂單不存在'
                });
            }

            // 驗證用戶權限
            if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: '沒有權限更新此訂單'
                });
            }

            const { status, trackingNumber, notes } = req.body;

            // 驗證狀態變更的合法性
            const immutableStatuses = ['cancelled', 'completed'];
            if (immutableStatuses.includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    message: `已${order.status === 'cancelled' ? '取消' : '完成'}的訂單無法更改狀態`
                });
            }

            // 定義各角色可以進行的狀態變更
            const adminAllowedStatuses = ['processing', 'shipped'];
            const userAllowedStatuses = ['delivered', 'completed'];

            // 驗證狀態變更的權限
            if (req.user.isAdmin) {
                if (!adminAllowedStatuses.includes(status)) {
                    return res.status(403).json({
                        success: false,
                        message: '管理員只能將訂單更新為處理中或已出貨狀態'
                    });
                }
            } else {
                if (!userAllowedStatuses.includes(status)) {
                    return res.status(403).json({
                        success: false,
                        message: '用戶只能確認收貨或完成訂單'
                    });
                }
            }

            // 狀態變更的邏輯檢查
            if (status === 'delivered' && order.status !== 'shipped') {
                return res.status(400).json({
                    success: false,
                    message: '只有已出貨的訂單可以標記為已送達'
                });
            }

            if (status === 'completed' && order.status !== 'delivered') {
                return res.status(400).json({
                    success: false,
                    message: '只有已送達的訂單可以標記為已完成'
                });
            }

            // 更新訂單狀態
            order.status = status;

            // 更新物流資訊（僅管理員在出貨時）
            if (status === 'shipped' && req.user.isAdmin) {
                if (!trackingNumber) {
                    return res.status(400).json({
                        success: false,
                        message: '出貨狀態需要物流單號'
                    });
                }
                order.shippingDetails = {
                    trackingNumber,
                    shippedAt: new Date(),
                    notes: notes || ''
                };
            }

            await order.save();

            res.json({
                success: true,
                message: '訂單狀態已更新',
                data: order
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '更新訂單失敗',
                error: err.message
            });
        }
    },


    // 取消訂單
    cancelOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: '訂單不存在'
                });
            }

            // 檢查是否可以取消
            if (order.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: '只能取消待處理的訂單'
                });
            }

            // 確保只有訂單的擁有者或管理員可以取消訂單
            if (order.user.toString() !== req.user._id.toString() && !req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: '沒有權限取消此訂單'
                });
            }

            // 恢復庫存
            for (const item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            order.status = 'cancelled';
            await order.save();

            res.json({
                success: true,
                message: '訂單已取消',
                data: order
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '取消訂單失敗',
                error: err.message
            });
        }
    },
    // orderController.js 新增
    adminCancelOrder: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: '訂單不存在'
                });
            }

            // 檢查是否可以取消
            if (order.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: '只能取消待處理的訂單'
                });
            }

            // 恢復庫存
            for (const item of order.products) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock += item.quantity;
                    await product.save();
                }
            }

            order.status = 'cancelled';
            await order.save();

            res.json({
                success: true,
                message: '訂單已取消',
                data: order
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '取消訂單失敗',
                error: err.message
            });
        }
    },

// 獲取銷量統計
    getSalesStatistics: async (req, res) => {
        try {
            // 只獲取已完成的訂單
            const completedOrders = await Order.find({
                status: 'completed'
            }).populate('products.product'); // 我們需要商品的完整資訊

            // 用於存儲每個商品的銷量統計
            const productStats = {};

            // 遍歷所有已完成訂單
            completedOrders.forEach(order => {
                order.products.forEach(item => {
                    const productId = item.product._id.toString();
                    const productName = item.productSnapshot.name;
                    const quantity = item.quantity;

                    // 如果這個商品已經在統計中，增加數量
                    if (productStats[productId]) {
                        productStats[productId].totalQuantity += quantity;
                    } else {
                        // 如果是新商品，創建新的統計項目
                        productStats[productId] = {
                            productId,
                            name: productName,
                            totalQuantity: quantity
                        };
                    }
                });
            });

            // 將物件轉換為陣列並按銷量排序
            const sortedStats = Object.values(productStats)
                .sort((a, b) => b.totalQuantity - a.totalQuantity);

            res.json({
                success: true,
                data: sortedStats,
                totalOrders: completedOrders.length
            });

        } catch (err) {
            console.error('獲取銷量統計失敗:', err);
            res.status(500).json({
                success: false,
                message: '獲取銷量統計失敗',
                error: err.message
            });
        }
    },
    // 退貨
    requestReturn: async (req, res) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: '訂單不存在'
                });
            }

            // 確認是訂單擁有者
            if (order.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: '沒有權限申請退貨'
                });
            }

            // 檢查訂單狀態是否符合退貨條件
            if (!['delivered'].includes(order.status)) {
                return res.status(400).json({
                    success: false,
                    message: '只有已送達的訂單可以申請退貨'
                });
            }

            // 更新訂單狀態為已退貨
            order.status = 'returned';
            await order.save();

            res.json({
                success: true,
                message: '退貨申請已提交，客服人員將盡快與您聯繫',
                data: order
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: '申請退貨失敗',
                error: err.message
            });
        }
    }

};



module.exports = orderController;