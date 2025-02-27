const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express();

// 版本 1.0.3 - 新项目部署测试 - ${new Date().toISOString()}

// 数据库连接重试
let retryCount = 0;
const maxRetries = 5;

const connectDB = async () => {
    try {
        if (retryCount >= maxRetries) {
            console.error('达到最大重试次数，停止重试');
            return;
        }

        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://zjc95247:zjc95247@cluster0.xtxvxvx.mongodb.net/attendance-system?retryWrites=true&w=majority';
        
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 60000,
            connectTimeoutMS: 15000,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            retryWrites: true,
            w: 'majority'
        });

        console.log('数据库连接成功');
        retryCount = 0; // 重置重试计数
    } catch (error) {
        console.error('数据库连接失败:', error.message);
        retryCount++;
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // 指数退避，最大10秒
        console.log(`将在 ${retryDelay/1000} 秒后进行第 ${retryCount} 次重试...`);
        setTimeout(connectDB, retryDelay);
    }
};

// 监听数据库连接事件
mongoose.connection.on('disconnected', () => {
    console.log('数据库连接断开，尝试重新连接...');
    setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
    console.error('数据库错误:', err);
    if (err.name === 'MongoNetworkError') {
        setTimeout(connectDB, 5000);
    }
});

// 用户模型
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

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
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 创建新用户
        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '注册失败，请稍后重试' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        if (user.password !== password) {
            return res.status(401).json({ message: '用户名或密码错误' });
        }

        res.json({ 
            message: '登录成功',
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '登录失败，请稍后重试' });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        time: new Date().toISOString(),
        dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
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

// 连接数据库并启动服务器
connectDB().then(() => {
    if (process.env.NODE_ENV !== 'production') {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`服务器运行在端口 ${PORT}`);
        });
    }
});

module.exports = app; 