// 应用主入口文件
const app = {
    // API基础URL
    apiBaseUrl: 'http://localhost:5001/api',
    
    // 初始化应用
    init: function() {
        // 检查用户是否已登录
        if (auth.isAuthenticated()) {
            this.loadDashboard();
        } else {
            this.loadLoginPage();
        }
        
        // 绑定事件
        this.bindEvents();
    },
    
    // 绑定事件
    bindEvents: function() {
        // 退出登录按钮事件
        $(document).on('click', '#logoutBtn', function() {
            auth.logout();
        });
        
        // 侧边栏导航事件
        $(document).on('click', '.nav-link', function(e) {
            e.preventDefault();
            const page = $(this).data('page');
            app.loadPage(page);
        });
        
        // 菜单切换按钮事件
        $(document).on('click', '.menu-toggle', function() {
            $('.sidebar').toggleClass('open');
        });
    },
    
    // 加载登录页面
    loadLoginPage: function() {
        $.get('login.html', function(data) {
            $('#app').html(data);
        });
    },
    
    // 加载仪表板
    loadDashboard: function() {
        $.get('dashboard.html', function(data) {
            $('#app').html(data);
            app.loadDashboardData();
        });
    },
    
    // 加载仪表板数据
    loadDashboardData: async function() {
        try {
            // 获取图书总数
            const booksResponse = await api.books.getAll();
            $('#totalBooks').text(booksResponse.data.length);
            
            // 获取读者总数
            const readersResponse = await api.readers.getAll();
            $('#totalReaders').text(readersResponse.data.length);
            
            // 获取借阅总数
            const borrowsResponse = await api.borrows.getAll();
            $('#totalBorrows').text(borrowsResponse.data.length);
            
            // 模拟逾期图书数量
            $('#overdueBooks').text('5');
            
            // 加载最新动态
            app.loadRecentActivities();
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            app.showAlert('加载数据失败，请重试', 'error');
        }
    },
    
    // 加载最新动态
    loadRecentActivities: function() {
        const activities = [
            { action: '新增图书', content: '《JavaScript高级程序设计》已添加到系统', time: '10分钟前' },
            { action: '读者借阅', content: '张三借阅了《Python编程：从入门到实践》', time: '2小时前' },
            { action: '图书归还', content: '李四归还了《算法导论》', time: '5小时前' },
            { action: '新增读者', content: '王五已注册为新读者', time: '1天前' },
            { action: '图书续借', content: '赵六续借了《深入理解计算机系统》', time: '1天前' }
        ];
        
        const activityList = $('#activityList');
        activityList.empty();
        
        activities.forEach(activity => {
            const activityItem = `
                <li>
                    <i class="fa fa-${activity.action === '新增图书' ? 'plus' : 
                         activity.action === '读者借阅' ? 'arrow-right' : 
                         activity.action === '图书归还' ? 'arrow-left' : 
                         activity.action === '新增读者' ? 'user-plus' : 'refresh'}"></i>
                    <div class="activity-content">
                        <p><strong>${activity.action}</strong> - ${activity.content}</p>
                        <small>${activity.time}</small>
                    </div>
                </li>
            `;
            activityList.append(activityItem);
        });
    },
    
    // 加载指定页面
    loadPage: function(page) {
        // 更新侧边栏激活状态
        $('.nav-item').removeClass('active');
        $(`.nav-link[data-page="${page}"]`).closest('.nav-item').addClass('active');
        
        // 根据页面类型加载不同内容
        switch(page) {
            case 'dashboard':
                app.loadDashboardContent();
                break;
            case 'books':
                books.loadBooksPage();
                break;
            case 'readers':
                readers.loadReadersPage();
                break;
            case 'borrows':
                borrows.loadBorrowsPage();
                break;
            case 'categories':
                app.showAlert('分类管理功能正在开发中', 'info');
                break;
            case 'publishers':
                app.showAlert('出版社管理功能正在开发中', 'info');
                break;
            default:
                app.loadDashboardContent();
        }
    },
    
    // 加载仪表板内容
    loadDashboardContent: function() {
        // 已经在loadDashboard中加载了仪表板完整内容
        // 这里只需刷新数据
        app.loadDashboardData();
    },
    
    // 显示消息提示
    showAlert: function(message, type = 'success') {
        const alertClass = `alert-${type}`;
        const alertHtml = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // 将消息添加到页面内容区域顶部
        $('#pageContent').prepend(alertHtml);
        
        // 3秒后自动关闭
        setTimeout(function() {
            $('.alert').alert('close');
        }, 3000);
    },
    
    // 显示加载动画
    showLoading: function(container) {
        $(container).html('<div class="loading"></div>');
    },
    
    // 隐藏加载动画
    hideLoading: function(container) {
        $(container).find('.loading').remove();
    }
};

// 页面加载完成后初始化应用
$(document).ready(function() {
    app.init();
});