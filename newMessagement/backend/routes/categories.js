const express = require('express');
const CategoryController = require('../controllers/categoryController');
const router = express.Router();

/**
 * 分类路由配置
 */

// 获取所有分类
router.get('/', CategoryController.getAllCategories);

// 根据ID获取分类
router.get('/:id', CategoryController.getCategoryById);

// 创建新分类
router.post('/', CategoryController.createCategory);

// 更新分类信息
router.put('/:id', CategoryController.updateCategory);

// 删除分类
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;