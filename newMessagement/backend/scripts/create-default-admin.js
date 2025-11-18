// 创建默认管理员用户的脚本
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

async function createDefaultAdmin() {
    try {
        // 检查是否已有默认管理员
        const existingAdmin = await Admin.findByUsername('admin');
        if (existingAdmin) {
            console.log('⚠️  默认管理员已存在');
            return;
        }

        // 创建默认管理员
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const defaultAdmin = await Admin.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword
        });

        if (defaultAdmin) {
            console.log('✅ 默认管理员创建成功！');
            console.log('用户名: admin');
            console.log('密码: admin123');
        } else {
            console.log('❌ 默认管理员创建失败');
        }
    } catch (error) {
        console.error('❌ 创建默认管理员时出错:', error);
    }
}

// 执行脚本
createDefaultAdmin();