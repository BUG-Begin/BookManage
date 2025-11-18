const express = require('express');
const PublisherController = require('../controllers/publisherController');
const router = express.Router();

/**
 * 出版商路由配置
 */

// 获取所有出版商
router.get('/', PublisherController.getAllPublishers);

// 根据ID获取出版商
router.get('/:id', PublisherController.getPublisherById);

// 创建新出版商
router.post('/', PublisherController.createPublisher);

// 更新出版商信息
router.put('/:id', PublisherController.updatePublisher);

// 删除出版商
router.delete('/:id', PublisherController.deletePublisher);

module.exports = router;