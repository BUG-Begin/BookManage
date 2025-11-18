// 认证模块
const auth = {
    // 检查用户是否已登录
    isAuthenticated: function() {
        // 从localStorage获取令牌
        const token = localStorage.getItem('authToken');
        return token !== null;
    },
    
    // 登录
    login: function(username, password, loginType = 'admin') {
        // 根据登录类型选择不同的API
        if (loginType === 'admin') {
            return api.admins.login({ username, password })
                .then(response => {
                    if (response.success) {
                        // 保存令牌、用户名和登录类型到localStorage
                        localStorage.setItem('authToken', response.data.token);
                        localStorage.setItem('username', username);
                        localStorage.setItem('loginType', loginType);
                        return response;
                    } else {
                        throw new Error(response.error || '登录失败');
                    }
                })
                .catch(error => {
                    // 处理API错误
                    const errorMessage = error.response?.data?.error || error.message || '用户名或密码错误';
                    throw new Error(errorMessage);
                });
        } else {
            // 读者登录逻辑
            return api.readers.login({ studentId: username, password })
                .then(response => {
                    if (response.success) {
                        // 保存令牌、学号和登录类型到localStorage
                        localStorage.setItem('authToken', response.data.token);
                        localStorage.setItem('username', username);
                        localStorage.setItem('loginType', loginType);
                        return response;
                    } else {
                        throw new Error(response.error || '登录失败');
                    }
                })
                .catch(error => {
                    // 处理API错误
                    const errorMessage = error.response?.data?.error || error.message || '学号或密码错误';
                    throw new Error(errorMessage);
                });
        }
    },
    
    // 退出登录
    logout: function() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        // 重新加载应用
        app.loadLoginPage();
    },
    
    // 获取当前登录用户
    getCurrentUser: function() {
        return {
            username: localStorage.getItem('username'),
            loginType: localStorage.getItem('loginType')
        };
    },
    
    // 获取认证令牌
    getToken: function() {
        return localStorage.getItem('authToken');
    },
    
    // 验证令牌
    validateToken: function() {
        // 这里可以添加令牌验证逻辑
        // 实际项目中应该调用API验证令牌有效性
        return this.isAuthenticated();
    }
};

// 绑定登录表单提交事件
$(document).on('submit', '#loginForm', function(e) {
    e.preventDefault();
    
    const loginType = $('#loginType').val();
    const username = $('#username').val();
    const password = $('#password').val();
    const rememberMe = $('#rememberMe').is(':checked');
    
    // 显示加载状态
    const loginBtn = $(this).find('button[type="submit"]');
    const originalText = loginBtn.text();
    loginBtn.text('登录中...').prop('disabled', true);
    
    // 尝试登录
    auth.login(username, password, loginType)
        .then(response => {
            if (response.success) {
                // 登录成功，加载相应的页面
                if (loginType === 'admin') {
                    app.loadDashboard();
                } else {
                    // 读者登录成功，加载读者页面
                    app.loadReaderPage();
                }
            }
        })
        .catch(error => {
            // 登录失败，显示错误信息
            alert(error.message);
        })
        .finally(() => {
            // 恢复按钮状态
            loginBtn.text(originalText).prop('disabled', false);
        });
});