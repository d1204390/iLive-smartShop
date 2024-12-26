// server/controllers/authController.js
// server/controllers/authController.js
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// 配置郵件發送器
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 生成驗證碼
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// 發送驗證碼
exports.sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        // 檢查郵箱是否已被註冊
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: '此信箱已被註冊' });
        }

        // 生成驗證碼
        const code = generateVerificationCode();

        // 保存驗證碼
        await VerificationCode.findOneAndUpdate(
            { email },
            { code },
            { upsert: true }
        );

        // 發送郵件
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '註冊驗證碼',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 24px;">歡迎註冊iLive電商平台</h1>
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #666; margin-bottom: 15px;">您的驗證碼是：</p>
                <p style="text-align: center;">
                    <strong style="font-size: 32px; color: #007bff; letter-spacing: 5px; padding: 10px 20px; background-color: #e9ecef; border-radius: 4px;">${code}</strong>
                </p>
            </div>
            <p style="color: #dc3545; font-size: 14px; text-align: center;">此驗證碼將在10分鐘後失效</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d;">
                <p>此為系統自動發送的郵件，請勿直接回覆</p>
            </div>
        </div>
    `
        });

        res.json({ message: '驗證碼已發送到您的信箱' });
    } catch (err) {
        console.error('發送驗證碼錯誤:', err);
        res.status(500).json({ message: '發送驗證碼失敗' });
    }
};
// 所有方法使用 exports
// 註冊
exports.register = async (req, res) => {
    try {
        const { email, password, code } = req.body;

        // 驗證驗證碼
        const verificationCode = await VerificationCode.findOne({ email, code });
        if (!verificationCode) {
            return res.status(400).json({ message: '驗證碼無效或已過期' });
        }

        // 檢查用戶是否存在
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: '此信箱已被註冊' });
        }

        // 創建用戶
        user = new User({
            email,
            password
        });

        // 加密密碼
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // 刪除驗證碼
        await VerificationCode.deleteOne({ email });

        res.status(201).json({
            message: '註冊成功，請登入'
        });
    } catch (err) {
        console.error('註冊錯誤:', err);
        res.status(500).json({ message: '註冊失敗' });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 在 token 中包含用戶 ID 和角色
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role  // 添加角色信息到 token
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE
            }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('登入錯誤:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.registerAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            email,
            password,
            role: 'admin'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// 忘記密碼 - 發送驗證碼
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 檢查用戶是否存在
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: '找不到此信箱的用戶' });
        }

        // 生成驗證碼
        const code = generateVerificationCode();

        // 保存驗證碼
        await VerificationCode.findOneAndUpdate(
            { email },
            {
                code,
                type: 'password-reset',  // 標記這是密碼重設用的驗證碼
                expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10分鐘後過期
            },
            { upsert: true }
        );

        // 發送郵件
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '重設密碼驗證碼',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6;">
            <h1 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 24px;">重設密碼</h1>
            <div style="background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin-bottom: 20px;">
                <p style="color: #666; margin-bottom: 15px;">您的驗證碼是：</p>
                <p style="text-align: center;">
                    <strong style="font-size: 32px; color: #007bff; letter-spacing: 5px; padding: 10px 20px; background-color: #e9ecef; border-radius: 4px;">${code}</strong>
                </p>
            </div>
            <p style="color: #dc3545; font-size: 14px; text-align: center;">此驗證碼將在10分鐘後失效</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #fff3cd; border-radius: 4px; border: 1px solid #ffeeba;">
                <p style="color: #856404; margin: 0; font-size: 14px;">⚠️ 如果這不是您本人的操作，請忽略此郵件。</p>
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; font-size: 12px; color: #6c757d;">
                <p>此為系統自動發送的郵件，請勿直接回覆</p>
            </div>
        </div>
    `
        });

        res.json({ message: '驗證碼已發送到您的信箱' });
    } catch (err) {
        console.error('發送重設密碼驗證碼錯誤:', err);
        res.status(500).json({ message: '發送驗證碼失敗' });
    }
};

// 重設密碼
exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword, checkOnly } = req.body;

        // 驗證驗證碼
        const verificationRecord = await VerificationCode.findOne({
            email,
            code,
            type: 'password-reset'
        });

        if (!verificationRecord) {
            return res.status(400).json({ message: '驗證碼無效或已過期' });
        }

        // 如果只是檢查驗證碼
        if (checkOnly) {
            return res.json({ message: '驗證碼正確' });
        }

        // 查找用戶
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: '用戶不存在' });
        }

        // 更新密碼
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // 刪除驗證碼
        await VerificationCode.deleteOne({ _id: verificationRecord._id });

        res.json({ message: '密碼重設成功' });
    } catch (err) {
        res.status(500).json({ message: '重設密碼失敗' });
    }
};

// 修改密碼
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // 驗證當前密碼
        const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '目前密碼錯誤' });
        }

        // 更新密碼
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.newPassword, salt);
        await user.save();

        res.json({ message: '密碼更新成功' });
    } catch (err) {
        res.status(500).json({ message: '更新密碼失敗' });
    }
};
