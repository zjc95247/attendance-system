const express = require('express');
const path = require('path');

// 版本 1.0.3 - 新项目部署测试 - ${new Date().toISOString()}
const app = express();

// 基础中间件
app.use(express.json());
app.use(express.static('public'));

// CORS 配置
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// 简单的主页路由
app.get('/', (req, res) => {
    res.send('服务器正常运行中');
});

// 健康检查路由
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: '服务器正常'
    });
});

// 测试路由
app.get('/test', (req, res) => {
    res.json({
        message: '测试接口正常',
        time: new Date().toISOString()
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: '服务器内部错误',
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