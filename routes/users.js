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
        const { username, password, role } = req.body;
        
        // 检查用户是否已存在
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: '用户已存在' });
        }

        // 创建新用户
        user = new User({
            username,
            password: await bcrypt.hash(password, 10),
            role
        });

        await user.save();
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 用户登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
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

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 验证 token 的路由
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({ role: user.role });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 