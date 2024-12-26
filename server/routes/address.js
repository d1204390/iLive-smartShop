const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { protect } = require('../middleware/auth');

// 獲取當前用戶的所有地址
router.get('/', protect, async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user.id });
        res.json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: '獲取地址失敗' });
    }
});

// 新增地址
router.post('/', protect, async (req, res) => {
    try {
        // 檢查地址數量限制
        const canAdd = await Address.checkAddressLimit(req.user.id);
        if (!canAdd) {
            return res.status(400).json({
                success: false,
                message: '已達到地址數量上限(5個)'
            });
        }

        const address = await Address.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: address });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// 更新地址
router.put('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: '找不到該地址'
            });
        }

        res.json({ success: true, data: address });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// 刪除地址
router.delete('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: '找不到該地址'
            });
        }

        res.json({ success: true, message: '地址已刪除' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '刪除地址失敗'
        });
    }
});

module.exports = router;