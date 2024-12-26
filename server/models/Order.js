// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productSnapshot: {
            name: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            },
            specialPrice: {
                type: Number
            },
            category: {
                type: String,
                required: true
            },
            image: {
                type: String
            }
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true,
            validate: {
                validator: function(value) {
                    // 確保價格不高於原始價格
                    return value <= this.productSnapshot.price;
                },
                message: '訂單價格不能高於商品原價'
            }
        }
    }],
    shippingFee: {
        type: Number,
        required: true,
        default: 100
    },
    subtotal: {  // 商品小計（未含運費）
        type: Number,
        required: true
    },
    totalAmount: {  // 總金額（含運費）
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled','returned'],
        default: 'pending'
    },
    shippingDetails: {
        trackingNumber: String,  // 物流單號
        shippedAt: Date,        // 出貨時間
        shippingMethod: String,  // 物流方式
        notes: String           // 出貨備註
    },
    shippingAddress: {
        recipient: String,
        phone: String,
        address: String
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'bank_transfer', 'cash_on_delivery'],
        required: true,
        default: 'credit_card'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新時間中間件
orderSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// 計算總金額的方法
orderSchema.methods.calculateTotal = function() {
    return this.products.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

// 驗證訂單狀態變更是否合法
orderSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        // 如果訂單已經取消或完成，不能再改變狀態
        if (this._originalStatus &&
            (this._originalStatus === 'cancelled' ||
                this._originalStatus === 'completed')) {
            next(new Error('無法變更已完成或已取消的訂單狀態'));
        }
    }
    next();
});

// 虛擬屬性：訂單編號
orderSchema.virtual('orderNumber').get(function() {
    return `ORD${this._id.toString().slice(-6).toUpperCase()}`;
});

// 保存訂單時的庫存檢查和更新
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Product = mongoose.model('Product');

        try {
            for (const item of this.products) {
                const product = await Product.findById(item.product);

                if (!product) {
                    throw new Error(`商品 ${item.product} 不存在`);
                }

                if (product.stock < item.quantity) {
                    throw new Error(`商品 ${product.name} 庫存不足`);
                }

                // 更新庫存
                product.stock -= item.quantity;
                await product.save();
            }
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Order', orderSchema);