const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 添加 auth 中间件
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: '请先登录' });
    }
};

// 用户注册
router.post('/register', async (req, res) => {
    try {
        console.log('收到注册请求:', req.body);
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }

        // 检查用户是否已存在
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: '用户已存在' });
        }

        // 创建新用户
        user = new User({
            username,
            password: await bcrypt.hash(password, 10),
            role: 'user'  // 默认角色为普通用户
        });

        await user.save();
        console.log('用户注册成功:', username);
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        console.log('收到登录请求:', req.body);
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: '用户名和密码不能为空' });
        }
        
        // 查找用户
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 生成JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            'your_jwt_secret',
            { expiresIn: '1d' }
        );

        console.log('用户登录成功:', username);
        res.json({ token });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

// 验证 token 的路由
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: '用户不存在' });
        }
        res.json({ role: user.role });
    } catch (error) {
        console.error('验证错误:', error);
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 