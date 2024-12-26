// server/models/VerificationCode.js
const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['register', 'password-reset'],
        default: 'register'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10分鐘後自動刪除
    }
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);