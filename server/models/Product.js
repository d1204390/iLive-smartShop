const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    specialPrice: {
        type: Number,
        min: 0,
        required: false
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    image: {
        type: String, // Base64 字串
        required: false, // 設為非必填
        validate: {
            validator: function(value) {
                // 如果沒有值就跳過驗證
                if (!value) return true;
                // 如果有值才驗證 Base64 格式
                return /^(data:image\/[a-zA-Z]+;base64,)?[A-Za-z0-9+/=]+$/.test(value);
            },
            message: 'Image must be a valid Base64 string'
        }
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    category: {
        type: String,
        required: true,
        enum: [
            'smart_lighting',
            'smart_security',
            'smart_kitchen',
            'smart_climate',
            'smart_audio',
            'smart_cleaning',
            'others'
        ]
    },
    specifications: {
        brand: String,
        connectivity: String,
        powerSource: String,
        compatibility: [String],
        dimensions: String,
        warranty: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);