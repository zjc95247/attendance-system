const express = require('express');
const path = require('path');

const app = express();

// CORS 中间件
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 性能优化中间件
app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    next();
});

// 中间件
app.use(express.json());
app.use(express.static('public', {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

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