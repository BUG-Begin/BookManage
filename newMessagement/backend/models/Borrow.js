const { executeQuery, sql } = require('../config/database');

class Borrow {
  /**
   * 获取所有借阅记录（支持分页和搜索）
   * @param {object} options 分页和搜索选项
   * @returns {Promise<Array>} 借阅记录列表
   */
  static async findAll({ page = 1, limit = 10, search = '', status = '' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT b.*, r.name as reader_name, r.student_id, 
             bo.title as book_title, bo.isbn
      FROM Borrows b
      JOIN Readers r ON b.reader_id = r.id
      JOIN Books bo ON b.book_id = bo.id
    `;
    const params = {
      limit,
      offset
    };

    // 添加搜索条件
    const whereConditions = [];
    if (search) {
      whereConditions.push(`(r.name LIKE @search OR r.student_id LIKE @search OR bo.title LIKE @search OR bo.isbn LIKE @search)`);
      params.search = `%${search}%`;
    }
    
    // 添加状态筛选
    if (status === 'active') {
      whereConditions.push(`b.return_date IS NULL`);
    } else if (status === 'returned') {
      whereConditions.push(`b.return_date IS NOT NULL`);
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // 添加分页
    query += ` ORDER BY b.borrow_date DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    try {
      const result = await executeQuery(query, params);
      return result.recordset;
    } catch (error) {
      console.error('获取借阅记录列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取借阅记录
   * @param {number} id 借阅记录ID
   * @returns {Promise<Object|null>} 借阅记录信息
   */
  static async findById(id) {
    const query = `
      SELECT b.*, r.name as reader_name, r.student_id, 
             bo.title as book_title, bo.isbn
      FROM Borrows b
      JOIN Readers r ON b.reader_id = r.id
      JOIN Books bo ON b.book_id = bo.id
      WHERE b.id = @id
    `;
    
    try {
      const result = await executeQuery(query, { id });
      return result.recordset[0] || null;
    } catch (error) {
      console.error('根据ID获取借阅记录失败:', error);
      throw error;
    }
  }

  /**
   * 创建新借阅记录（借书）
   * @param {object} borrowData 借阅数据
   * @returns {Promise<Object>} 创建的借阅记录信息
   */
  static async create(borrowData) {
    const { reader_id, book_id, borrow_date } = borrowData;
    
    // 使用事务确保数据一致性
    const { getPool } = require('../config/database');
    const pool = await getPool();
    const transaction = await pool.beginTransaction();
    
    try {
      // 检查图书是否可借
      const bookQuery = `SELECT available_copies FROM Books WHERE id = @book_id`;
      const bookResult = await transaction.request().input('book_id', book_id).query(bookQuery);
      
      if (bookResult.recordset.length === 0) {
        throw new Error('图书不存在');
      }
      
      const book = bookResult.recordset[0];
      if (book.available_copies <= 0) {
        throw new Error('图书已被借完');
      }
      
      // 插入借阅记录
      const borrowQuery = `
        INSERT INTO Borrows (reader_id, book_id, borrow_date, due_date)
        VALUES (@reader_id, @book_id, @borrow_date, DATEADD(day, 30, @borrow_date))
        SELECT SCOPE_IDENTITY() as id
      `;
      
      const borrowParams = {
        reader_id,
        book_id,
        borrow_date: borrow_date || new Date()
      };
      
      const borrowResult = await transaction.request()
        .input('reader_id', borrowParams.reader_id)
        .input('book_id', borrowParams.book_id)
        .input('borrow_date', borrowParams.borrow_date)
        .query(borrowQuery);
      
      const newBorrowId = parseInt(borrowResult.recordset[0].id);
      
      // 更新图书可用数量
      const updateBookQuery = `
        UPDATE Books
        SET available_copies = available_copies - 1
        WHERE id = @book_id
      `;
      
      await transaction.request().input('book_id', book_id).query(updateBookQuery);
      
      // 提交事务
      await transaction.commit();
      
      return await this.findById(newBorrowId);
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error('创建借阅记录失败:', error);
      throw error;
    }
  }

  /**
   * 归还图书
   * @param {number} id 借阅记录ID
   * @returns {Promise<Object|null>} 更新后的借阅记录信息
   */
  static async returnBook(id, return_date = null) {
    // 使用事务确保数据一致性
    const { getPool } = require('../config/database');
    const pool = await getPool();
    const transaction = await pool.beginTransaction();
    
    try {
      // 获取借阅记录
      const borrowQuery = `SELECT * FROM Borrows WHERE id = @id`;
      const borrowResult = await transaction.request().input('id', id).query(borrowQuery);
      
      if (borrowResult.recordset.length === 0) {
        throw new Error('借阅记录不存在');
      }
      
      const borrow = borrowResult.recordset[0];
      
      if (borrow.return_date !== null) {
        throw new Error('图书已经归还');
      }
      
      // 更新借阅记录
      const updateBorrowQuery = `
        UPDATE Borrows
        SET return_date = @return_date
        WHERE id = @id
      `;
      
      await transaction.request()
        .input('return_date', return_date || new Date())
        .input('id', id)
        .query(updateBorrowQuery);
      
      // 更新图书可用数量
      const updateBookQuery = `
        UPDATE Books
        SET available_copies = available_copies + 1
        WHERE id = @book_id
      `;
      
      await transaction.request().input('book_id', borrow.book_id).query(updateBookQuery);
      
      // 提交事务
      await transaction.commit();
      
      return await this.findById(id);
    } catch (error) {
      // 回滚事务
      await transaction.rollback();
      console.error('归还图书失败:', error);
      throw error;
    }
  }

  /**
   * 续借图书
   * @param {number} id 借阅记录ID
   * @param {number} days 续借天数
   * @returns {Promise<Object|null>} 更新后的借阅记录信息
   */
  static async renewBook(id, days = 15) {
    try {
      // 获取借阅记录
      const borrow = await this.findById(id);
      
      if (!borrow) {
        throw new Error('借阅记录不存在');
      }
      
      if (borrow.return_date !== null) {
        throw new Error('图书已经归还，无法续借');
      }
      
      // 更新借阅记录的到期日期
      const query = `
        UPDATE Borrows
        SET due_date = DATEADD(day, @days, due_date)
        WHERE id = @id
      `;
      
      await executeQuery(query, { id, days });
      
      return await this.findById(id);
    } catch (error) {
      console.error('续借图书失败:', error);
      throw error;
    }
  }

  /**
   * 删除借阅记录
   * @param {number} id 借阅记录ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async delete(id) {
    const query = `DELETE FROM Borrows WHERE id = @id`;
    
    try {
      const result = await executeQuery(query, { id });
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('删除借阅记录失败:', error);
      throw error;
    }
  }

  /**
   * 获取借阅统计信息
   * @returns {Promise<Object>} 统计数据
   */
  static async getStats() {
    const query = `
      SELECT
        COUNT(*) as total_borrows,
        COUNT(CASE WHEN return_date IS NULL THEN 1 END) as active_borrows,
        COUNT(CASE WHEN return_date IS NOT NULL THEN 1 END) as completed_borrows,
        COUNT(CASE WHEN due_date < GETDATE() AND return_date IS NULL THEN 1 END) as overdue_borrows
      FROM Borrows
    `;
    
    try {
      const result = await executeQuery(query);
      return result.recordset[0];
    } catch (error) {
      console.error('获取借阅统计失败:', error);
      throw error;
    }
  }

  /**
   * 获取读者的借阅记录
   * @param {number} reader_id 读者ID
   * @returns {Promise<Array>} 借阅记录列表
   */
  static async getBorrowsByReader(reader_id) {
    const query = `
      SELECT b.*, bo.title as book_title, bo.isbn
      FROM Borrows b
      JOIN Books bo ON b.book_id = bo.id
      WHERE b.reader_id = @reader_id
      ORDER BY b.borrow_date DESC
    `;
    
    try {
      const result = await executeQuery(query, { reader_id });
      return result.recordset;
    } catch (error) {
      console.error('获取读者借阅记录失败:', error);
      throw error;
    }
  }
}

module.exports = Borrow;