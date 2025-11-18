// 创建测试管理员账号的脚本
const Admin = require('./models/admin');

async function createTestAdmin() {
  try {
    console.log('创建测试管理员账号...');
    const admin = await Admin.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123' // 简单密码，仅用于测试
    });
    console.log('测试管理员账号创建成功:', admin);
    console.log('\n登录信息:');
    console.log('用户名:', admin.username);
    console.log('密码:', 'admin123');
  } catch (error) {
    console.error('创建测试管理员账号失败:', error);
  }
}

// 运行脚本
createTestAdmin();