const express = require('express');
const path = require('path');
const app = express();

// 版本 1.0.3 - 新项目部署测试 - ${new Date().toISOString()}

// 基础中间件
app.use(express.json());
app.use(express.static('public'));

// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// CORS 配置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Max-Age', '86400'); // 24小时
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 性能优化
app.use((req, res, next) => {
    res.header('Cache-Control', 'public, max-age=0');
    res.header('X-DNS-Prefetch-Control', 'on');
    next();
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API 路由
app.post('/api/register', (req, res) => {
    console.log('注册请求:', req.body);
    res.json({ message: '注册功能正在开发中' });
});

app.post('/api/login', (req, res) => {
    console.log('登录请求:', req.body);
    res.json({ message: '登录功能正在开发中' });
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        time: new Date().toISOString()
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ message: '服务器错误，请稍后重试' });
});

// 处理其他所有路由
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