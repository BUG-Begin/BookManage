// 创建测试读者的脚本
const Reader = require('./models/Reader');

async function createTestReader() {
  try {
    console.log('创建测试读者...');
    const reader = await Reader.create({
      name: '测试读者',
      student_id: '20230001',
      phone: '13800138000',
      email: 'test@example.com',
      department: '计算机系'
    });
    console.log('测试读者创建成功:', reader);
  } catch (error) {
    console.error('创建测试读者失败:', error);
  }
}

// 运行脚本
createTestReader();