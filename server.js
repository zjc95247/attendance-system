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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/attendance-system?retryWrites=true&w=majority';
const PORT = process.env.PORT || 3000;

// 连接数据库
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('数据库连接成功');
}).catch((err) => {
  console.error('数据库连接失败:', err);
});

// API 路由
app.use('/api/users', require('./routes/users'));
app.use('/api/attendance', require('./routes/attendance'));

// 所有其他路由返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// 导出 app 以供 Vercel 使用
module.exports = app;

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 