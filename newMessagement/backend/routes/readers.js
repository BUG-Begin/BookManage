const express = require('express');
const ReaderController = require('../controllers/readerController');
const router = express.Router();

/**
 * 读者路由配置
 */

// 获取所有读者
router.get('/', ReaderController.getAllReaders);

// 根据ID获取读者
router.get('/:id', ReaderController.getReaderById);

// 根据学号获取读者
router.get('/student/:student_id', ReaderController.getReaderByStudentId);

// 创建新读者
router.post('/', ReaderController.createReader);

// 更新读者信息
router.put('/:id', ReaderController.updateReader);

// 删除读者
router.delete('/:id', ReaderController.deleteReader);

// 获取读者统计信息
router.get('/stats/summary', ReaderController.getReaderStats);

// 读者认证路由
router.post('/login', ReaderController.login);
router.post('/logout', ReaderController.logout);
router.get('/me', ReaderController.getMe);

module.exports = router;