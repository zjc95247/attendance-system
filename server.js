const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 设置严格查询选项
mongoose.set('strictQuery', false);

// 数据库连接配置
const MONGODB_URI = 'mongodb+srv://zjc95247:zjc95247@cluster0.mongodb.net/attendance-system?retryWrites=true&w=majority';

// 连接数据库
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('数据库连接成功');
}).catch((err) => {
    console.error('数据库连接失败:', err);
});

// 监听数据库连接事件
mongoose.connection.on('error', err => {
    console.error('MongoDB 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB 连接断开');
});

// API 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));

// 添加调试路由
app.get('/debug', (req, res) => {
    res.json({
        status: 'ok',
        dbStatus: mongoose.connection.readyState,
        env: process.env.NODE_ENV
    });
});

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ 
        message: '服务器错误',
        error: err.message
    });
});

// 导出 app 以供 Vercel 使用
module.exports = app;

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 