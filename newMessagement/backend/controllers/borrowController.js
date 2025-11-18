const Borrow = require('../models/borrow');

class BorrowController {
  /**
   * 获取所有借阅记录
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getAllBorrows(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '', status = '' } = req.query;
      const borrows = await Borrow.findAll({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        search, 
        status
      });
      
      res.json({
        success: true,
        data: borrows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          search,
          status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取借阅记录
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getBorrowById(req, res, next) {
    try {
      const { id } = req.params;
      const borrow = await Borrow.findById(parseInt(id));
      
      if (!borrow) {
        return res.status(404).json({
          success: false,
          error: '借阅记录不存在'
        });
      }
      
      res.json({
        success: true,
        data: borrow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新借阅记录（借书）
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async createBorrow(req, res, next) {
    try {
      const borrowData = req.body;
      
      // 验证必填字段
      const requiredFields = ['reader_id', 'book_id'];
      const missingFields = requiredFields.filter(field => !borrowData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      const newBorrow = await Borrow.create(borrowData);
      
      res.status(201).json({
        success: true,
        message: '借书成功',
        data: newBorrow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 归还图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async returnBook(req, res, next) {
    try {
      const { id } = req.params;
      const { return_date } = req.body;
      
      // 检查借阅记录是否存在
      const existingBorrow = await Borrow.findById(parseInt(id));
      if (!existingBorrow) {
        return res.status(404).json({
          success: false,
          error: '借阅记录不存在'
        });
      }
      
      const updatedBorrow = await Borrow.returnBook(parseInt(id), return_date);
      
      res.json({
        success: true,
        message: '图书归还成功',
        data: updatedBorrow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 续借图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async renewBook(req, res, next) {
    try {
      const { id } = req.params;
      const { days = 15 } = req.body;
      
      // 检查借阅记录是否存在
      const existingBorrow = await Borrow.findById(parseInt(id));
      if (!existingBorrow) {
        return res.status(404).json({
          success: false,
          error: '借阅记录不存在'
        });
      }
      
      const updatedBorrow = await Borrow.renewBook(parseInt(id), parseInt(days));
      
      res.json({
        success: true,
        message: '图书续借成功',
        data: updatedBorrow
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除借阅记录
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async deleteBorrow(req, res, next) {
    try {
      const { id } = req.params;
      
      // 检查借阅记录是否存在
      const existingBorrow = await Borrow.findById(parseInt(id));
      if (!existingBorrow) {
        return res.status(404).json({
          success: false,
          error: '借阅记录不存在'
        });
      }
      
      const success = await Borrow.delete(parseInt(id));
      
      if (success) {
        res.json({
          success: true,
          message: '借阅记录删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          error: '借阅记录删除失败'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取借阅统计信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getBorrowStats(req, res, next) {
    try {
      const stats = await Borrow.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取读者的借阅记录
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getBorrowsByReader(req, res, next) {
    try {
      const { reader_id } = req.params;
      const borrows = await Borrow.getBorrowsByReader(parseInt(reader_id));
      
      res.json({
        success: true,
        data: borrows
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BorrowController;