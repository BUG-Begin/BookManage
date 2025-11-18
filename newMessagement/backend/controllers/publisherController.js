const Publisher = require('../models/Publisher');

class PublisherController {
  /**
   * 获取所有出版商
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getAllPublishers(req, res, next) {
    try {
      const publishers = await Publisher.findAll();
      
      res.json({
        success: true,
        data: publishers
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取出版商
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getPublisherById(req, res, next) {
    try {
      const { id } = req.params;
      const publisher = await Publisher.findById(parseInt(id));
      
      if (!publisher) {
        return res.status(404).json({
          success: false,
          error: '出版商不存在'
        });
      }
      
      res.json({
        success: true,
        data: publisher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新出版商
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async createPublisher(req, res, next) {
    try {
      const publisherData = req.body;
      
      // 验证必填字段
      if (!publisherData.name) {
        return res.status(400).json({
          success: false,
          error: '缺少出版商名称'
        });
      }
      
      const newPublisher = await Publisher.create(publisherData);
      
      res.status(201).json({
        success: true,
        message: '出版商创建成功',
        data: newPublisher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新出版商信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async updatePublisher(req, res, next) {
    try {
      const { id } = req.params;
      const publisherData = req.body;
      
      // 检查出版商是否存在
      const existingPublisher = await Publisher.findById(parseInt(id));
      if (!existingPublisher) {
        return res.status(404).json({
          success: false,
          error: '出版商不存在'
        });
      }
      
      // 验证必填字段
      if (!publisherData.name) {
        return res.status(400).json({
          success: false,
          error: '缺少出版商名称'
        });
      }
      
      const updatedPublisher = await Publisher.update(parseInt(id), publisherData);
      
      res.json({
        success: true,
        message: '出版商更新成功',
        data: updatedPublisher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除出版商
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async deletePublisher(req, res, next) {
    try {
      const { id } = req.params;
      
      // 检查出版商是否存在
      const existingPublisher = await Publisher.findById(parseInt(id));
      if (!existingPublisher) {
        return res.status(404).json({
          success: false,
          error: '出版商不存在'
        });
      }
      
      const success = await Publisher.delete(parseInt(id));
      
      if (success) {
        res.json({
          success: true,
          message: '出版商删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          error: '出版商删除失败'
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PublisherController;