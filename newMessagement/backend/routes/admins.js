// 管理员路由
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 登录路由
router.post('/login', adminController.login);

// 注销路由
router.post('/logout', adminController.logout);

// 获取当前登录用户信息
router.get('/me', adminController.getMe);

// 更新用户信息
router.put('/me', adminController.updateMe);

module.exports = router;