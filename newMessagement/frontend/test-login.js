// 测试登录API的脚本
const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('测试管理员登录...');
        const response = await axios.post('http://localhost:5001/api/admins/login', {
            username: 'admin',
            password: 'admin123'
        });
        console.log('管理员登录成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('管理员登录失败:', error.response?.data || error.message);
        console.error('错误详情:', error);
        return null;
    }
}

async function testReaderLogin() {
    try {
        console.log('\n测试读者登录...');
        const response = await axios.post('http://localhost:5001/api/readers/login', {
            studentId: '20230001'
        });
        console.log('读者登录成功:', response.data);
        return response.data;
    } catch (error) {
        console.error('读者登录失败:', error.response?.data || error.message);
        console.error('错误详情:', error);
        return null;
    }
}

// 运行测试
testAdminLogin().then(() => {
    testReaderLogin();
});