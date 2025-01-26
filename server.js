const express = require('express');
const app = express();

// 版本 1.0.3 - 新项目部署测试 - ${new Date().toISOString()}

// 基础中间件
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// CORS 配置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
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
    res.send(`
        <html>
            <head>
                <title>服务器状态</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1>服务器正常运行中</h1>
                <p>当前时间: ${new Date().toLocaleString()}</p>
                <p>环境: ${process.env.NODE_ENV || 'development'}</p>
                <p>区域: ${process.env.VERCEL_REGION || 'local'}</p>
            </body>
        </html>
    `);
});

// 状态检查
app.get('/status', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        env: process.env.NODE_ENV,
        region: process.env.VERCEL_REGION,
        headers: req.headers
    });
});

// API 测试
app.get('/api/test', (req, res) => {
    res.json({
        message: '接口正常',
        time: new Date().toISOString(),
        clientIP: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: '服务器错误',
        message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
    });
});

// 处理 404
app.use((req, res) => {
    res.status(404).json({
        error: '未找到请求的资源',
        path: req.path
    });
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