const Reader = require('../models/Reader');
const bcrypt = require('bcrypt');

class ReaderController {
  /**
   * 获取所有读者
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getAllReaders(req, res, next) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const readers = await Reader.findAll({ 
        page: parseInt(page), 
        limit: parseInt(limit), 
        search 
      });
      
      res.json({
        success: true,
        data: readers,
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
   * 根据ID获取读者
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getReaderById(req, res, next) {
    try {
      const { id } = req.params;
      const reader = await Reader.findById(parseInt(id));
      
      if (!reader) {
        return res.status(404).json({
          success: false,
          error: '读者不存在'
        });
      }
      
      res.json({
        success: true,
        data: reader
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 根据学号获取读者
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getReaderByStudentId(req, res, next) {
    try {
      const { student_id } = req.params;
      const reader = await Reader.findByStudentId(student_id);
      
      if (!reader) {
        return res.status(404).json({
          success: false,
          error: '该学号未注册'
        });
      }
      
      res.json({
        success: true,
        data: reader
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 创建新读者
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async createReader(req, res, next) {
    try {
      const readerData = req.body;
      
      // 验证必填字段
      const requiredFields = ['name', 'student_id', 'phone'];
      const missingFields = requiredFields.filter(field => !readerData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `缺少必填字段: ${missingFields.join(', ')}`
        });
      }
      
      // 检查学号是否已存在
      const existingReader = await Reader.findByStudentId(readerData.student_id);
      if (existingReader) {
        return res.status(400).json({
          success: false,
          error: '该学号已被注册'
        });
      }
      
      // 如果提供了密码，进行加密
      if (readerData.password) {
        readerData.password = await bcrypt.hash(readerData.password, 10);
      }
      
      const newReader = await Reader.create(readerData);
      
      res.status(201).json({
        success: true,
        message: '读者创建成功',
        data: newReader
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 更新读者信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async updateReader(req, res, next) {
    try {
      const { id } = req.params;
      const readerData = req.body;
      
      // 检查读者是否存在
      const existingReader = await Reader.findById(parseInt(id));
      if (!existingReader) {
        return res.status(404).json({
          success: false,
          error: '读者不存在'
        });
      }
      
      // 如果更新学号，检查是否已被其他读者使用
      if (readerData.student_id && readerData.student_id !== existingReader.student_id) {
        const duplicateReader = await Reader.findByStudentId(readerData.student_id);
        if (duplicateReader) {
          return res.status(400).json({
            success: false,
            error: '该学号已被其他读者注册'
          });
        }
      }
      
      // 如果提供了密码，进行加密
      if (readerData.password) {
        readerData.password = await bcrypt.hash(readerData.password, 10);
      }
      
      const updatedReader = await Reader.update(parseInt(id), readerData);
      
      res.json({
        success: true,
        message: '读者信息更新成功',
        data: updatedReader
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 删除读者
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async deleteReader(req, res, next) {
    try {
      const { id } = req.params;
      
      // 检查读者是否存在
      const existingReader = await Reader.findById(parseInt(id));
      if (!existingReader) {
        return res.status(404).json({
          success: false,
          error: '读者不存在'
        });
      }
      
      const success = await Reader.delete(parseInt(id));
      
      if (success) {
        res.json({
          success: true,
          message: '读者删除成功'
        });
      } else {
        res.status(500).json({
          success: false,
          error: '读者删除失败'
        });
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取读者统计信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getReaderStats(req, res, next) {
    try {
      const stats = await Reader.getStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 读者登录
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async login(req, res, next) {
    try {
      const { studentId } = req.body;
      
      // 验证输入
      if (!studentId) {
        return res.status(400).json({
          success: false,
          error: '学号不能为空'
        });
      }
      
      // 查找读者
      const reader = await Reader.findByStudentId(studentId);
      if (!reader) {
        return res.status(401).json({
          success: false,
          error: '学号不存在'
        });
      }
      
      // 返回读者信息
      const readerInfo = {
        id: reader.id,
        name: reader.name,
        student_id: reader.student_id,
        phone: reader.phone,
        email: reader.email,
        department: reader.department,
        created_at: reader.created_at,
        updated_at: reader.updated_at
      };
      
      res.status(200).json({
        success: true,
        data: {
          reader: readerInfo,
          token: 'mock-token-' + Date.now()
        },
        message: '登录成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 读者注销
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async logout(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: '注销成功'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前登录读者信息
   * @param {express.Request} req 请求对象
   * @param {express.Response} res 响应对象
   * @param {express.NextFunction} next 中间件函数
   */
  static async getMe(req, res, next) {
    try {
      // 这里应该从令牌中获取用户ID并查询用户信息
      // 为了演示，这里使用模拟数据
      const studentId = '20230001';
      
      const reader = await Reader.findByStudentId(studentId);
      if (!reader) {
        return res.status(404).json({
          success: false,
          error: '读者不存在'
        });
      }
      
      // 返回读者信息（不包含密码）
      const { password: _, ...readerInfo } = reader;
      
      res.status(200).json({
        success: true,
        data: readerInfo
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReaderController;