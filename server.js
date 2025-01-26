const express = require('express');
const path = require('path');

const app = express();

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 基础路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// API 路由
app.post('/api/register', (req, res) => {
    console.log('收到注册请求:', req.body);
    res.json({ message: '注册功能正在维护中' });
});

app.post('/api/login', (req, res) => {
    console.log('收到登录请求:', req.body);
    res.json({ message: '登录功能正在维护中' });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ message: '服务器错误' });
});

// 处理所有其他路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 导出 app
module.exports = app;

// 本地开发服务器
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`服务器运行在端口 ${PORT}`);
    });
} 