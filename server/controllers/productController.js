// server/controllers/productController.js
const Product = require('../models/Product');

// 獲取所有商品
// 在 productController.js 中
exports.getProducts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // 判斷是否為管理員路由
        const isAdminRoute = req.path.includes('/admin');

        // 管理員可以看到所有商品，一般用戶只能看到啟用的商品
        const query = isAdminRoute ? {} : { isActive: true };

        const products = await Product.find(query)
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            data: products,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: '載入商品列表失敗',
            error: err.message
        });
    }
};


// 獲取單個商品
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('-__v');
        if (!product) {
            return res.status(404).json({
                success: false,
                message: '找不到該商品'
            });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: '獲取商品資料失敗',
            error: err.message
        });
    }
};

// 创建商品
exports.createProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            specialPrice,
            description,
            image,
            stock,
            category,
            specifications,
            isActive
        } = req.body;

        // 驗證特惠價格
        if (specialPrice && specialPrice >= price) {
            return res.status(400).json({
                success: false,
                message: '特惠價格必須低於原價'
            });
        }

        // 驗證圖片格式
        if (image && !isValidBase64Image(image)) {
            return res.status(400).json({
                success: false,
                message: '圖片格式不正確，請提供有效的Base64圖片'
            });
        }

        const product = await Product.create({
            name,
            price,
            specialPrice,
            description,
            image,
            stock,
            category,
            specifications,
            isActive: isActive || true
        });

        res.status(201).json({
            success: true,
            message: '商品創建成功',
            data: product
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: '驗證失敗',
                error: Object.values(err.errors).map(error => error.message)
            });
        }
        res.status(500).json({
            success: false,
            message: '創建商品失敗',
            error: err.message
        });
    }
};

// 更新商品
exports.updateProduct = async (req, res) => {
    try {
        const {
            name,
            price,
            specialPrice,
            description,
            image,
            stock,
            category,
            specifications,
            isActive
        } = req.body;

        // 驗證特惠價格
        if (specialPrice && specialPrice >= price) {
            return res.status(400).json({
                success: false,
                message: '特惠價格必須低於原價'
            });
        }

        // 驗證圖片格式
        if (image && !isValidBase64Image(image)) {
            return res.status(400).json({
                success: false,
                message: '圖片格式不正確，請提供有效的Base64圖片'
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                specialPrice,
                description,
                image,
                stock,
                category,
                specifications,
                isActive
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '找不到該商品'
            });
        }

        res.json({
            success: true,
            message: '商品更新成功',
            data: product
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: '驗證失敗',
                error: Object.values(err.errors).map(error => error.message)
            });
        }
        res.status(500).json({
            success: false,
            message: '更新商品失敗',
            error: err.message
        });
    }
};

// 刪除商品
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: '找不到該商品'
            });
        }

        res.json({
            success: true,
            message: '商品已成功刪除'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: '刪除商品失敗',
            error: err.message
        });
    }
};

// 搜尋商品
exports.searchProducts = async (req, res) => {
    try {
        const { keyword, category, minPrice, maxPrice, inStock, hasSpecialPrice } = req.query;

        let query = {};

        // 文字搜尋
        if (keyword) {
            query.$text = { $search: keyword };
        }

        // 分類過濾
        if (category) {
            query.category = category;
        }

        // 價格範圍
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // 庫存過濾
        if (inStock === 'true') {
            query.stock = { $gt: 0 };
        }

        // 特惠商品過濾
        if (hasSpecialPrice === 'true') {
            query.specialPrice = { $exists: true, $ne: null };
        }

        // 只顯示啟用的商品
        query.isActive = true;

        const products = await Product.find(query)
            .select('-__v')
            .sort('-createdAt');

        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: '搜尋商品失敗',
            error: err.message
        });
    }
};

// 驗證Base64圖片格式
const isValidBase64Image = (base64String) => {
    // 檢查是否為有效的Base64圖片格式
    const regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
    if (!regex.test(base64String)) {
        return false;
    }

    // 檢查Base64字串exports.getProducts =是否有效
    try {
        atob(base64String.split(',')[1]);
        return true;
    } catch (e) {
        return false;
    }
};