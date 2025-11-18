const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// 中间件配置
app.use(helmet()); // 安全头部
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 限制每个IP 100个请求
});
app.use(limiter);

// 请求日志
app.use(morgan('combined'));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API路由
app.use('/api/books', require('./routes/books'));
app.use('/api/readers', require('./routes/readers'));
app.use('/api/borrows', require('./routes/borrows'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/publishers', require('./routes/publishers'));
app.use('/api/admins', require('./routes/admins'));

// 404处理
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: '路由不存在',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('未处理的错误:', error);
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '发生了一些错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📊 环境: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS 允许: ${process.env.CORS_ORIGIN}`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n🔄 正在优雅关闭服务器...');
  const { closePool } = require('./config/database');
  await closePool();
  process.exit(0);
});

module.exports = app;