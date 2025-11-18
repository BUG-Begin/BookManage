const Book = require('../models/Book');

class BookController {
  /**
   * 获取所有图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getAllBooks(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const books = await Book.findAll({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        search 
      });
      
      res.json({
        success: true,
        data: books,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          search
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据ID获取图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getBookById(req, res, next) {
    try {
      const { id } = req.params;
      const book = await Book.findById(parseInt(id));
      
      if (!book) {
        return res.status(404).json({
          success: false,
          error: '图书不存在'
        });
      }
      
      res.json({
        success: true,
        data: book
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async createBook(req, res, next) {
    try {
      const bookData = req.body;
      
      // 验证必填字段
      const requiredFields = ['isbn', 'title', 'author', 'publisher_id', 'category_id', 'total_copies'];
      const missingFields = requiredFields.filter(field => !bookData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 验证可用数量不超过总数量
      if (bookData.available_copies && bookData.available_copies > bookData.total_copies) {
        return res.status(400).json({
          success: false,
          error: '可用数量不能超过总数量'
        });
      }
      
      const newBook = await Book.create(bookData);
      
      res.status(201).json({
        success: true,
        message: '图书创建成功',
        data: newBook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新图书信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const bookData = req.body;
      
      // 检查图书是否存在
      const existingBook = await Book.findById(parseInt(id));
      if (!existingBook) {
        return res.status(404).json({
          success: false,
          error: '图书不存在'
        });
      }
      
      // 验证可用数量不超过总数量
      const totalCopies = bookData.total_copies || existingBook.quantity;
      const availableCopies = bookData.available_copies || existingBook.available_quantity;
      
      if (availableCopies > totalCopies) {
        return res.status(400).json({
          success: false,
          error: '可用数量不能超过总数量'
        });
      }
      
      const updatedBook = await Book.update(parseInt(id), bookData);
      
      res.json({
        success: true,
        message: '图书更新成功',
        data: updatedBook
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除图书
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async deleteBook(req, res, next) {
    try {
      const { id } = req.params;
      
      // 检查图书是否存在
      const existingBook = await Book.findById(parseInt(id));
      if (!existingBook) {
        return res.status(404).json({
          success: false,
          error: '图书不存在'
        });
      }
      
      const success = await Book.delete(parseInt(id));
      
      if (success) {
        res.json({
          success: true,
          message: '图书删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          error: '图书删除失败'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取图书统计信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getBookStats(req, res, next) {
    try {
      const stats = await Book.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BookController;