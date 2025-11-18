# 图书管理系统

一个功能完整的图书管理系统，包含图书管理、读者管理和借阅管理等核心功能，支持图书的增删改查、读者管理和借阅记录跟踪。

## 技术栈

### 后端
- **Node.js** - JavaScript运行环境
- **Express** - Web应用框架
- **MSSQL** - SQL Server数据库驱动
- **bcrypt** - 密码加密
- **helmet** - 安全头部设置
- **cors** - 跨域资源共享
- **express-rate-limit** - 速率限制
- **morgan** - 请求日志
- **dotenv** - 环境变量管理

### 前端
- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **JavaScript** - 交互逻辑
- **Bootstrap 5** - 响应式UI框架
- **jQuery** - DOM操作
- **Axios** - HTTP客户端

## 项目结构

```
LibraryManagement/
├── new-library-management/
│   ├── backend/                 # 后端代码
│   │   ├── .env.example         # 环境变量示例
│   │   ├── config/
│   │   │   └── database.js      # 数据库连接配置
│   │   ├── controllers/         # 控制器
│   │   ├── middleware/          # 中间件
│   │   ├── models/              # 数据模型
│   │   ├── routes/              # 路由定义
│   │   ├── scripts/
│   │   │   └── init-database.js # 数据库初始化脚本
│   │   ├── server.js            # 服务器入口
│   │   └── package.json         # 后端依赖
│   └── frontend/                # 前端代码
│       ├── assets/              # 静态资源
│       ├── css/                 # 样式文件
│       ├── js/                  # JavaScript文件
│       ├── index.html           # 主页面
│       ├── login.html           # 登录页面
│       ├── dashboard.html       # 仪表板
│       ├── books.html           # 图书管理
│       ├── readers.html         # 读者管理
│       ├── borrows.html         # 借阅管理
│       └── test-book-save.html  # 测试页面
```

## 安装步骤

### 1. 克隆项目

确保你已经获取了项目的所有文件。

### 2. 安装后端依赖

打开终端，进入后端目录：

```bash
cd new-library-management/backend
npm install
```

### 3. 安装前端依赖

前端使用CDN加载大部分依赖，无需额外安装。

### 4. 数据库初始化

如果需要初始化数据库表结构，可以运行以下命令：

```bash
cd new-library-management/backend
node scripts/init-database.js
```

**注意**：请确保已经配置好.env文件中的数据库连接信息，并且SQL Server服务正在运行。

## 配置说明

### 1. 数据库配置

1. 复制 `.env.example` 为 `.env` 文件
2. 编辑 `backend/.env` 文件，设置数据库连接信息：

```env
# 服务器配置
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:8080

# 数据库配置
DB_SERVER=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=LibraryManagement
DB_PORT=1433
```

### 2. 数据库结构

确保你的SQL Server数据库中已经创建了以下表：

#### `Books` 表
- `id` (INT, PK, IDENTITY)
- `isbn` (NVARCHAR(20))
- `title` (NVARCHAR(100))
- `author` (NVARCHAR(50))
- `publisher_id` (INT, FK)
- `category_id` (INT, FK)
- `total_copies` (INT)
- `available_copies` (INT)
- `publish_date` (DATE)

#### `Readers` 表
- `id` (INT, PK, IDENTITY)
- `student_id` (NVARCHAR(20))
- `name` (NVARCHAR(50))
- `phone` (NVARCHAR(20))
- `email` (NVARCHAR(100))
- `address` (NVARCHAR(200))
- `registration_date` (DATE)

#### `Borrows` 表
- `id` (INT, PK, IDENTITY)
- `reader_id` (INT, FK)
- `book_id` (INT, FK)
- `borrow_date` (DATE)
- `due_date` (DATE)
- `return_date` (DATE)
- `status` (NVARCHAR(20))

#### `Categories` 表
- `id` (INT, PK, IDENTITY)
- `name` (NVARCHAR(50))

#### `Publishers` 表
- `id` (INT, PK, IDENTITY)
- `name` (NVARCHAR(100))
- `address` (NVARCHAR(200))
- `phone` (NVARCHAR(20))

#### `Admins` 表
- `id` (INT, PK, IDENTITY)
- `username` (NVARCHAR(50))
- `password` (NVARCHAR(100))

## 运行项目

### 1. 启动后端服务器

在后端目录下执行：

```bash
node server.js
```

或者使用开发模式（需要安装nodemon）：

```bash
npm run dev
```

后端服务器将在 `http://localhost:5001` 启动。

### 2. 启动前端服务器

在前端目录下执行：

```bash
python -m http.server 8080
```

或者使用其他静态文件服务器，如Node.js的http-server：

```bash
npx http-server -p 8080
```

前端将在 `http://localhost:8080` 启动。

### 3. 访问系统

打开浏览器，访问 `http://localhost:8080`，进入登录页面。

## API文档

### 图书API
- `GET /api/books` - 获取所有图书
- `GET /api/books/:id` - 根据ID获取图书
- `POST /api/books` - 创建图书
- `PUT /api/books/:id` - 更新图书
- `DELETE /api/books/:id` - 删除图书

### 读者API
- `GET /api/readers` - 获取所有读者
- `GET /api/readers/:id` - 根据ID获取读者
- `POST /api/readers` - 创建读者
- `PUT /api/readers/:id` - 更新读者
- `DELETE /api/readers/:id` - 删除读者

### 借阅API
- `GET /api/borrows` - 获取所有借阅记录
- `GET /api/borrows/:id` - 根据ID获取借阅记录
- `POST /api/borrows` - 创建借阅记录
- `PUT /api/borrows/:id/return` - 归还图书
- `PUT /api/borrows/:id/renew` - 续借图书

### 分类API
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:id` - 根据ID获取分类
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 出版商API
- `GET /api/publishers` - 获取所有出版商
- `GET /api/publishers/:id` - 根据ID获取出版商
- `POST /api/publishers` - 创建出版商
- `PUT /api/publishers/:id` - 更新出版商
- `DELETE /api/publishers/:id` - 删除出版商

### 管理员API
- `POST /api/admins/login` - 管理员登录

## 功能说明

### 1. 图书管理
- 查看图书列表
- 添加新图书
- 编辑图书信息
- 删除图书
- 按分类、出版商、ISBN等条件搜索图书

### 2. 读者管理
- 查看读者列表
- 添加新读者
- 编辑读者信息
- 删除读者
- 按学号、姓名等条件搜索读者

### 3. 借阅管理
- 查看借阅记录
- 借阅图书
- 归还图书
- 续借图书
- 按状态、读者、图书等条件搜索借阅记录

### 4. 统计分析
- 图书总量、可借数量统计
- 读者数量统计
- 借阅记录统计
- 近期借阅趋势

## 注意事项

1. 确保SQL Server服务正在运行，并且数据库连接信息正确。
2. 前端服务器默认使用8000端口，后端默认使用5001端口。
3. 如果端口被占用，可以在配置文件中修改端口号。
4. 系统使用基本的身份验证，请确保管理员账户信息正确。
5. 建议在开发环境中使用nodemon来自动重启后端服务器。

## 故障排除

### 1. 后端服务器启动失败
- 检查数据库连接信息是否正确
- 确保所有依赖都已安装
- 检查端口是否被占用

### 2. 前端无法连接后端
- 检查CORS配置是否正确（当前设置为http://localhost:8080）
- 确保后端服务器正在运行
- 检查API地址是否正确
- 检查浏览器控制台是否有JavaScript错误

### 3. 数据库连接错误
- 检查SQL Server服务是否正在运行
- 确保防火墙允许SQL Server连接
- 检查数据库用户名和密码是否正确

## 开发建议

1. 在开发环境中使用`npm run dev`命令启动后端，可以自动重启服务器。
2. 使用Postman或类似工具测试API。
3. 在生产环境中，建议使用PM2或类似工具管理Node.js进程。
4. 定期备份数据库，防止数据丢失。

## 许可证

本项目采用MIT许可证。