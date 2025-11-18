const express = require('express');
const BorrowController = require('../controllers/borrowController');
const router = express.Router();

/**
 * 借阅路由配置
 */

// 获取所有借阅记录
router.get('/', BorrowController.getAllBorrows);

// 根据ID获取借阅记录
router.get('/:id', BorrowController.getBorrowById);

// 创建新借阅记录（借书）
router.post('/', BorrowController.createBorrow);

// 归还图书
router.put('/:id/return', BorrowController.returnBook);

// 续借图书
router.put('/:id/renew', BorrowController.renewBook);

// 删除借阅记录
router.delete('/:id', BorrowController.deleteBorrow);

// 获取借阅统计信息
router.get('/stats/summary', BorrowController.getBorrowStats);

// 获取读者的借阅记录
router.get('/reader/:reader_id', BorrowController.getBorrowsByReader);

module.exports = router;