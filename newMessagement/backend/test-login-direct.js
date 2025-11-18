// 直接测试管理员登录控制器逻辑
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Admin = require('./models/adminer');
const bcrypt = require('bcrypt');

app.use(bodyParser.json());

// 模拟登录函数
async function mockLogin(username, password) {
  try {
    console.log(`测试登录: 用户名=${username}, 密码=${password}`);
    
    // 查找管理员
    const admin = await Admin.findByUsername(username);
    console.log('找到的管理员:', admin);
    
    if (!admin) {
      return { success: false, error: '用户名不存在' };
    }
    
    // 测试密码验证
    let isValidPassword;
    
    // 先尝试bcrypt验证
    console.log('测试bcrypt验证...');
    isValidPassword = await bcrypt.compare(password, admin.password);
    console.log('bcrypt验证结果:', isValidPassword);
    
    // 如果失败，尝试直接比较
    if (!isValidPassword) {
      console.log('测试直接比较...');
      isValidPassword = password === admin.password;
      console.log('直接比较结果:', isValidPassword);
    }
    
    if (!isValidPassword) {
      return { success: false, error: '密码错误' };
    }
    
    return { 
      success: true, 
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        },
        token: 'mock-token-' + Date.now()
      },
      message: '登录成功'
    };
  } catch (error) {
    console.error('登录错误:', error);
    return { success: false, error: '服务器错误' };
  }
}

// 运行测试
async function runTest() {
  try {
    console.log('===== 测试管理员登录 =====');
    
    // 测试1：使用正确的用户名和密码
    const result1 = await mockLogin('admin', 'admin123');
    console.log('测试结果1:', result1);
    
    console.log('\n===== 测试完成 =====');
  } catch (error) {
    console.error('测试错误:', error);
  } finally {
    // 关闭数据库连接
    process.exit();
  }
}

runTest();