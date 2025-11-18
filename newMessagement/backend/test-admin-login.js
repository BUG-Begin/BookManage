// 测试管理员登录逻辑的脚本
const Admin = require('./models/adminer');
const bcrypt = require('bcrypt');

async function testAdminLogin() {
  try {
    console.log('测试管理员登录逻辑...');
    
    // 测试1：查找管理员
    const admin = await Admin.findByUsername('admin');
    console.log('找到的管理员:', admin);
    
    if (!admin) {
      console.error('找不到管理员');
      return;
    }
    
    // 测试2：直接比较密码
    const password = 'admin123';
    console.log('输入密码:', password);
    console.log('数据库密码:', admin.password);
    console.log('直接比较结果:', password === admin.password);
    
    // 测试3：测试bcrypt验证
    try {
      const bcryptResult = await bcrypt.compare(password, admin.password);
      console.log('bcrypt验证结果:', bcryptResult);
    } catch (e) {
      console.log('bcrypt验证失败:', e.message);
    }
    
    // 测试4：模拟登录流程
    let isValidPassword;
    try {
      isValidPassword = await bcrypt.compare(password, admin.password);
    } catch (e) {
      isValidPassword = password === admin.password;
    }
    
    console.log('最终验证结果:', isValidPassword);
    
    if (isValidPassword) {
      console.log('✅ 登录成功！');
    } else {
      console.log('❌ 登录失败！');
    }
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行脚本
testAdminLogin();