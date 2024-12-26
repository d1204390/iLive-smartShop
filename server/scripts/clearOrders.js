const mongoose = require('mongoose');

// 使用正確的資料庫連接字串
const MONGODB_URI = 'mongodb+srv://vvv3215566:Test123456@ilive.ox2xk.mongodb.net/test?retryWrites=true&w=majority&appName=ilive';

async function clearOrders() {
    try {
        // 連接資料庫
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 清空 orders 集合
        const result = await mongoose.connection.collection('orders').deleteMany({});
        console.log(`已清空 orders 集合中的 ${result.deletedCount} 筆訂單`);

    } catch (error) {
        console.error('錯誤:', error);
        console.error('錯誤詳情:', error.stack);
    } finally {
        // 關閉連接
        await mongoose.connection.close();
        console.log('資料庫連接已關閉');
    }
}

clearOrders();