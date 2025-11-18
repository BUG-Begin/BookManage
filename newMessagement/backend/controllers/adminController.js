// 管理员控制器
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

const adminController = {
    // 登录
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            
            // 验证输入
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    error: '用户名和密码不能为空'
                });
            }
            
            // 查找管理员
            const admin = await Admin.findByUsername(username);
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }
            
            // 验证密码
            let isValidPassword;
            
            // 先尝试使用bcrypt验证密码
            isValidPassword = await bcrypt.compare(password, admin.password);
            
            // 如果bcrypt验证失败，尝试直接比较（处理明文密码情况）
            if (!isValidPassword) {
                isValidPassword = password === admin.password;
            }
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: '用户名或密码错误'
                });
            }
            
            // 返回管理员信息（不包含密码）
            const { password: _, ...adminInfo } = admin;
            
            res.status(200).json({
                success: true,
                data: {
                    admin: adminInfo,
                    token: 'mock-token-' + Date.now() // 这里应该使用 JWT 生成真实的令牌
                },
                message: '登录成功'
            });
        } catch (error) {
            console.error('登录错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        }
    },
    
    // 注销
    logout: async (req, res) => {
        try {
            // 这里应该实现令牌失效逻辑
            res.status(200).json({
                success: true,
                message: '注销成功'
            });
        } catch (error) {
            console.error('注销错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        }
    },
    
    // 获取当前登录用户信息
    getMe: async (req, res) => {
        try {
            // 这里应该从令牌中获取用户ID并查询用户信息
            const admin = await Admin.findByUsername('admin'); // 模拟获取当前用户
            
            if (!admin) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            // 返回管理员信息（不包含密码）
            const { password: _, ...adminInfo } = admin;
            
            res.status(200).json({
                success: true,
                data: adminInfo
            });
        } catch (error) {
            console.error('获取用户信息错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        }
    },
    
    // 更新用户信息
    updateMe: async (req, res) => {
        try {
            // 这里应该从令牌中获取用户ID
            const adminId = 1; // 模拟用户ID
            const { username, email } = req.body;
            
            // 验证输入
            if (!username || !email) {
                return res.status(400).json({
                    success: false,
                    error: '用户名和邮箱不能为空'
                });
            }
            
            // 更新管理员信息
            const updatedAdmin = await Admin.update(adminId, { username, email });
            
            if (!updatedAdmin) {
                return res.status(404).json({
                    success: false,
                    error: '用户不存在'
                });
            }
            
            // 返回更新后的管理员信息（不包含密码）
            const { password: _, ...adminInfo } = updatedAdmin;
            
            res.status(200).json({
                success: true,
                data: adminInfo,
                message: '用户信息更新成功'
            });
        } catch (error) {
            console.error('更新用户信息错误:', error);
            res.status(500).json({
                success: false,
                error: '服务器内部错误',
                message: error.message
            });
        }
    }
};

module.exports = adminController;