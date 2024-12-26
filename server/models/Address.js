const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, '請輸入姓名'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, '請輸入電話'],
        match: [/^09\d{8}$/, '請輸入有效的手機號碼']
    },
    email: {
        type: String,
        required: [true, '請輸入 email'],
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '請輸入有效的 email']
    },
    address: {
        type: String,
        required: [true, '請輸入地址'],
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// 確保每個用戶最多只能有5個地址
addressSchema.statics.checkAddressLimit = async function(userId) {
    const count = await this.countDocuments({ user: userId });
    return count < 5;
};

module.exports = mongoose.model('Address', addressSchema);