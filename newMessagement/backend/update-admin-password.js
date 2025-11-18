// 更新管理员密码为明文的脚本
const Admin = require('./models/adminer');

async function updateAdminPassword() {
  try {
    console.log('更新管理员密码...');
    
    // 查找用户名是'admin'的管理员
    const admin = await Admin.findByUsername('admin');
    if (!admin) {
      console.error('找不到用户名是admin的管理员');
      return;
    }
    
    // 直接更新密码为明文
    const updatedAdmin = await Admin.updatePassword(admin.id, 'admin123');
    console.log('管理员密码更新成功:', updatedAdmin);
    console.log('\n登录信息:');
    console.log('用户名:', updatedAdmin.username);
    console.log('密码:', 'admin123');
  } catch (error) {
    console.error('更新管理员密码失败:', error);
  }
}

// 运行脚本
updateAdminPassword();