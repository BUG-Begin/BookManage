// 测试Reader模型的简单脚本
const Reader = require('./models/Reader');

async function testReaderFindByStudentId() {
  try {
    console.log('测试Reader.findByStudentId方法...');
    const reader = await Reader.findByStudentId('20230001');
    console.log('读者信息:', reader);
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testReaderFindByStudentId();