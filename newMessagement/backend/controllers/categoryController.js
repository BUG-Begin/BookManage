const Category = require('../models/Category');

class CategoryController {
  /**
   * 获取所有分类
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getAllCategories(req, res, next) {
    try {
      const categories = await Category.findAll();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取分类
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await Category.findById(parseInt(id));
      
      if (!category) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }
      
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新分类
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async createCategory(req, res, next) {
    try {
      const categoryData = req.body;
      
      // 验证必填字段
      if (!categoryData.name) {
        return res.status(400).json({
          success: false,
          error: '缺少分类名称'
        });
      }
      
      const newCategory = await Category.create(categoryData);
      
      res.status(201).json({
        success: true,
        message: '分类创建成功',
        data: newCategory
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新分类信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      // 检查分类是否存在
      const existingCategory = await Category.findById(parseInt(id));
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }
      
      // 验证必填字段
      if (!categoryData.name) {
        return res.status(400).json({
          success: false,
          error: '缺少分类名称'
        });
      }
      
      const updatedCategory = await Category.update(parseInt(id), categoryData);
      
      res.json({
        success: true,
        message: '分类更新成功',
        data: updatedCategory
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除分类
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      
      // 检查分类是否存在
      const existingCategory = await Category.findById(parseInt(id));
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          error: '分类不存在'
        });
      }
      
      const success = await Category.delete(parseInt(id));
      
      if (success) {
        res.json({
          success: true,
          message: '分类删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          error: '分类删除失败'
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;