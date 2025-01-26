const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Attendance = require('../models/Attendance');

// 中间件：验证JWT token
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

// 签到
router.post('/checkin', auth, async (req, res) => {
    try {
        // 检查今天是否已经签到
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await Attendance.findOne({
            userId: req.user.userId,
            date: {
                $gte: today,
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (existing) {
            return res.status(400).json({ message: '今天已经签到过了' });
        }

        // 创建新的签到记录
        const attendance = new Attendance({
            userId: req.user.userId,
            checkInTime: new Date()
        });

        await attendance.save();
        res.json({ message: '签到成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取签到记录（管理员功能）
router.get('/records', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: '权限不足' });
        }

        const { startDate, endDate } = req.query;
        const query = {};
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const records = await Attendance.find(query)
            .populate('userId', 'username')
            .sort({ date: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

module.exports = router; 