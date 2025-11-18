// API调用模块
const api = {
    // API基础URL
    baseUrl: 'http://localhost:5001/api',
    
    // 图书相关API
    books: {
        // 获取所有图书
        getAll: async (params = {}) => {
            try {
                const response = await axios.get(`${api.baseUrl}/books`, { params });
                return response.data;
            } catch (error) {
                console.error('获取图书列表失败:', error);
                throw error;
            }
        },
        
        // 根据ID获取图书
        getById: async (id) => {
            try {
                const response = await axios.get(`${api.baseUrl}/books/${id}`);
                return response.data;
            } catch (error) {
                console.error('获取图书失败:', error);
                throw error;
            }
        },
        
        // 创建图书
        create: async (bookData) => {
            try {
                const response = await axios.post(`${api.baseUrl}/books`, bookData);
                return response.data;
            } catch (error) {
                console.error('创建图书失败:', error);
                throw error;
            }
        },
        
        // 更新图书
        update: async (id, bookData) => {
            try {
                const response = await axios.put(`${api.baseUrl}/books/${id}`, bookData);
                return response.data;
            } catch (error) {
                console.error('更新图书失败:', error);
                throw error;
            }
        },
        
        // 删除图书
        delete: async (id) => {
            try {
                const response = await axios.delete(`${api.baseUrl}/books/${id}`);
                return response.data;
            } catch (error) {
                console.error('删除图书失败:', error);
                throw error;
            }
        }
    },
    
    // 读者相关API
    readers: {
        // 获取所有读者
        getAll: async (params = {}) => {
            try {
                const response = await axios.get(`${api.baseUrl}/readers`, { params });
                return response.data;
            } catch (error) {
                console.error('获取读者列表失败:', error);
                throw error;
            }
        },
        
        // 根据ID获取读者
        getById: async (id) => {
            try {
                const response = await axios.get(`${api.baseUrl}/readers/${id}`);
                return response.data;
            } catch (error) {
                console.error('获取读者失败:', error);
                throw error;
            }
        },
        
        // 创建读者
        create: async (readerData) => {
            try {
                const response = await axios.post(`${api.baseUrl}/readers`, readerData);
                return response.data;
            } catch (error) {
                console.error('创建读者失败:', error);
                throw error;
            }
        },
        
        // 更新读者
        update: async (id, readerData) => {
            try {
                const response = await axios.put(`${api.baseUrl}/readers/${id}`, readerData);
                return response.data;
            } catch (error) {
                console.error('更新读者失败:', error);
                throw error;
            }
        },
        
        // 删除读者
        delete: async (id) => {
            try {
                const response = await axios.delete(`${api.baseUrl}/readers/${id}`);
                return response.data;
            } catch (error) {
                console.error('删除读者失败:', error);
                throw error;
            }
        },
        
        // 登录
        login: async (credentials) => {
            try {
                const response = await axios.post(`${api.baseUrl}/readers/login`, credentials);
                return response.data;
            } catch (error) {
                console.error('登录失败:', error);
                throw error;
            }
        },
        
        // 注销
        logout: async () => {
            try {
                const response = await axios.post(`${api.baseUrl}/readers/logout`);
                return response.data;
            } catch (error) {
                console.error('注销失败:', error);
                throw error;
            }
        },
        
        // 获取当前读者信息
        getCurrent: async () => {
            try {
                const response = await axios.get(`${api.baseUrl}/readers/me`);
                return response.data;
            } catch (error) {
                console.error('获取读者信息失败:', error);
                throw error;
            }
        }
    },
    
    // 借阅相关API
    borrows: {
        // 获取所有借阅记录
        getAll: async (params = {}) => {
            try {
                const response = await axios.get(`${api.baseUrl}/borrows`, { params });
                return response.data;
            } catch (error) {
                console.error('获取借阅记录失败:', error);
                throw error;
            }
        },
        
        // 根据ID获取借阅记录
        getById: async (id) => {
            try {
                const response = await axios.get(`${api.baseUrl}/borrows/${id}`);
                return response.data;
            } catch (error) {
                console.error('获取借阅记录失败:', error);
                throw error;
            }
        },
        
        // 创建借阅记录
        create: async (borrowData) => {
            try {
                const response = await axios.post(`${api.baseUrl}/borrows`, borrowData);
                return response.data;
            } catch (error) {
                console.error('创建借阅记录失败:', error);
                throw error;
            }
        },
        
        // 更新借阅记录
        update: async (id, borrowData) => {
            try {
                const response = await axios.put(`${api.baseUrl}/borrows/${id}`, borrowData);
                return response.data;
            } catch (error) {
                console.error('更新借阅记录失败:', error);
                throw error;
            }
        },
        
        // 归还图书
        returnBook: async (id) => {
            try {
                const response = await axios.put(`${api.baseUrl}/borrows/${id}/return`);
                return response.data;
            } catch (error) {
                console.error('归还图书失败:', error);
                throw error;
            }
        },
        
        // 续借图书
        renewBook: async (id) => {
            try {
                const response = await axios.put(`${api.baseUrl}/borrows/${id}/renew`);
                return response.data;
            } catch (error) {
                console.error('续借图书失败:', error);
                throw error;
            }
        }
    },
    
    // 分类相关API
    categories: {
        // 获取所有分类
        getAll: async () => {
            try {
                const response = await axios.get(`${api.baseUrl}/categories`);
                return response.data;
            } catch (error) {
                console.error('获取分类列表失败:', error);
                throw error;
            }
        }
    },
    
    // 出版商相关API
    publishers: {
        // 获取所有出版商
        getAll: async () => {
            try {
                const response = await axios.get(`${api.baseUrl}/publishers`);
                return response.data;
            } catch (error) {
                console.error('获取出版商列表失败:', error);
                throw error;
            }
        }
    },
    
    // 管理员相关API
    admins: {
        // 登录
        login: async (credentials) => {
            try {
                const response = await axios.post(`${api.baseUrl}/admins/login`, credentials);
                return response.data;
            } catch (error) {
                console.error('登录失败:', error);
                throw error;
            }
        },
        
        // 注销
        logout: async () => {
            try {
                const response = await axios.post(`${api.baseUrl}/admins/logout`);
                return response.data;
            } catch (error) {
                console.error('注销失败:', error);
                throw error;
            }
        },
        
        // 获取当前用户信息
        getCurrent: async () => {
            try {
                const response = await axios.get(`${api.baseUrl}/admins/me`);
                return response.data;
            } catch (error) {
                console.error('获取用户信息失败:', error);
                throw error;
            }
        }
    }

};

window.api = api;