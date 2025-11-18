const express = require('express');
const BookController = require('../controllers/bookController');
const router = express.Router();

/**
 * 图书路由配置
 */

// 获取所有图书
router.get('/', BookController.getAllBooks);

// 根据ID获取图书
router.get('/:id', BookController.getBookById);

// 创建新图书
router.post('/', BookController.createBook);

// 更新图书信息
router.put('/:id', BookController.updateBook);

// 删除图书
router.delete('/:id', BookController.deleteBook);

// 获取图书统计信息
router.get('/stats/summary', BookController.getBookStats);

module.exports = router;