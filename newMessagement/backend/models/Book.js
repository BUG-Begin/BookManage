const { executeQuery } = require('../config/database');

class Book {
  /**
   * 获取所有图书（支持分页和搜索）
   * @param {object} options 分页和搜索选项
   * @returns {Promise<Array>} 图书列表
   */
  static async findAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT b.*, c.name as category_name, p.name as publisher_name
      FROM Books b
      JOIN Categories c ON b.category_id = c.id
      JOIN Publishers p ON b.publisher_id = p.id
    `;
    const params = {
      limit,
      offset
    };

    // 添加搜索条件
    if (search) {
      query += ` WHERE b.title LIKE @search OR b.author LIKE @search OR b.isbn LIKE @search`;
      params.search = `%${search}%`;
    }

    // 添加分页
    query += ` ORDER BY b.title OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    try {
      const result = await executeQuery(query, params);
      return result.recordset;
    } catch (error) {
      console.error('获取图书列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取图书
   * @param {number} id 图书ID
   * @returns {Promise<Object|null>} 图书信息
   */
  static async findById(id) {
    const query = `
      SELECT b.*, c.name as category_name, p.name as publisher_name
      FROM Books b
      JOIN Categories c ON b.category_id = c.id
      JOIN Publishers p ON b.publisher_id = p.id
      WHERE b.id = @id
    `;
    
    try {
      const result = await executeQuery(query, { id });
      return result.recordset[0] || null;
    } catch (error) {
      console.error('根据ID获取图书失败:', error);
      throw error;
    }
  }

  /**
   * 创建新图书
   * @param {object} bookData 图书数据
   * @returns {Promise<Object>} 创建的图书信息
   */
  static async create(bookData) {
    const { isbn, title, author, publisher_id, category_id, total_copies, available_copies, description, publication_year, publish_date } = bookData;
    
    const query = `
      INSERT INTO Books (isbn, title, author, publisher_id, category_id, quantity, available_quantity, description, publication_year)
      VALUES (@isbn, @title, @author, @publisher_id, @category_id, @quantity, @available_quantity, @description, @publication_year)
      SELECT SCOPE_IDENTITY() as id
    `;
    
    const params = {
      isbn,
      title,
      author,
      publisher_id,
      category_id,
      quantity: total_copies,
      available_quantity: available_copies || total_copies, // 默认可用数量等于总数量
      description: description || '',
      publication_year: publication_year || (publish_date ? new Date(publish_date).getFullYear() : null) // 使用publish_date的年份作为出版年份
    };
    
    try {
      const result = await executeQuery(query, params);
      const newBookId = parseInt(result.recordset[0].id);
      return await this.findById(newBookId);
    } catch (error) {
      console.error('创建图书失败:', error);
      throw error;
    }
  }

  /**
   * 更新图书信息
   * @param {number} id 图书ID
   * @param {object} bookData 更新的图书数据
   * @returns {Promise<Object|null>} 更新后的图书信息
   */
  static async update(id, bookData) {
    // 构建更新查询，将前端的字段名映射到数据库字段名
    const fieldMapping = {
      total_copies: 'quantity',
      available_copies: 'available_quantity',
      publish_date: 'publication_year'
    };
    
    // 构建更新字段和参数
    const updateFields = [];
    const params = { id };
    
    for (const [key, value] of Object.entries(bookData)) {
      if (!['id', 'created_at', 'updated_at'].includes(key)) {
        const dbField = fieldMapping[key] || key;
        updateFields.push(`${dbField} = @${dbField}`);
        params[dbField] = value;
      }
    }
    
    if (updateFields.length === 0) {
      return await this.findById(id); // 没有需要更新的字段
    }
    
    const query = `
      UPDATE Books
      SET ${updateFields.join(', ')}, updated_at = GETDATE()
      WHERE id = @id
    `;
    
    try {
      await executeQuery(query, params);
      return await this.findById(id);
    } catch (error) {
      console.error('更新图书失败:', error);
      throw error;
    }
  }

  /**
   * 删除图书
   * @param {number} id 图书ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async delete(id) {
    const query = `DELETE FROM Books WHERE id = @id`;
    
    try {
      const result = await executeQuery(query, { id });
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('删除图书失败:', error);
      throw error;
    }
  }

  /**
   * 获取图书统计信息
   * @returns {Promise<Object>} 统计数据
   */
  static async getStats() {
    const query = `
      SELECT
        COUNT(*) as total_books,
        SUM(quantity) as total_copies,
        SUM(available_quantity) as available_copies,
        (SELECT COUNT(*) FROM Categories) as total_categories,
        (SELECT COUNT(*) FROM Publishers) as total_publishers
      FROM Books
    `;
    
    try {
      const result = await executeQuery(query);
      return result.recordset[0];
    } catch (error) {
      console.error('获取图书统计失败:', error);
      throw error;
    }
  }
}

module.exports = Book;