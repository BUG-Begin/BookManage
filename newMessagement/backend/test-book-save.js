// 测试图书数据保存功能
const axios = require('axios');

async function testBookSave() {
  try {
    // 首先登录管理员获取token
    const loginResponse = await axios.post('http://localhost:5001/api/admins/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ 管理员登录成功，获取到token');
    
    // 创建分类数据
    const categoryData = {
      name: '计算机科学'
    };
    
    const categoryResponse = await axios.post('http://localhost:5001/api/categories', categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const categoryId = categoryResponse.data.data.id;
    console.log('✅ 分类创建成功，ID:', categoryId);
    
    // 创建出版商数据
    const publisherData = {
      name: '电子工业出版社'
    };
    
    const publisherResponse = await axios.post('http://localhost:5001/api/publishers', publisherData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const publisherId = publisherResponse.data.data.id;
    console.log('✅ 出版商创建成功，ID:', publisherId);
    
    // 测试保存图书数据
    const bookData = {
      isbn: '9787536692930',
      title: 'JavaScript高级程序设计',
      author: 'Nicholas C. Zakas',
      publisher_id: publisherId,
      category_id: categoryId,
      quantity: 5,
      available_quantity: 5,
      description: '一本全面介绍JavaScript的经典书籍',
      publication_year: 2012
    };
    
    const bookResponse = await axios.post('http://localhost:5001/api/books', bookData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ 图书保存成功:', bookResponse.data.data);
    return true;
  } catch (error) {
    console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
    return false;
  }
}

testBookSave();