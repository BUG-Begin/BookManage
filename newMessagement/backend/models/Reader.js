const { executeQuery } = require('../config/database');

class Reader {
  constructor(id, name, student_id, phone, email, department, created_at, updated_at) {
    this.id = id;
    this.name = name;
    this.student_id = student_id;
    this.phone = phone;
    this.email = email;
    this.department = department;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
  /**
   * 获取所有读者（支持分页和搜索）
   * @param {object} options 分页和搜索选项
   * @returns {Promise<Array>} 读者列表
   */
  static async findAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT * FROM Readers
    `;
    const params = {
      limit,
      offset
    };

    // 添加搜索条件
    if (search) {
      query += ` WHERE name LIKE @search OR student_id LIKE @search OR phone LIKE @search OR email LIKE @search`;
      params.search = `%${search}%`;
    }

    // 添加分页
    query += ` ORDER BY name OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    try {
      const result = await executeQuery(query, params);
      return result.recordset.map(reader => new Reader(
        reader.id,
        reader.name,
        reader.student_id,
        reader.phone,
        reader.email,
        reader.department,
        reader.created_at,
        reader.updated_at
      ));
    } catch (error) {
      console.error('获取读者列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取读者
   * @param {number} id 读者ID
   * @returns {Promise<Object|null>} 读者信息
   */
  static async findById(id) {
    const query = `
      SELECT * FROM Readers
      WHERE id = @id
    `;
    
    try {
      const result = await executeQuery(query, { id });
      return result.recordset.length > 0 ? new Reader(
        result.recordset[0].id,
        result.recordset[0].name,
        result.recordset[0].student_id,
        result.recordset[0].phone,
        result.recordset[0].email,
        result.recordset[0].department,
        result.recordset[0].created_at,
        result.recordset[0].updated_at
      ) : null;
    } catch (error) {
      console.error('根据ID获取读者失败:', error);
      throw error;
    }
  }

  /**
   * 创建新读者
   * @param {object} readerData 读者数据
   * @returns {Promise<Object>} 创建的读者信息
   */
  static async create(readerData) {
    const { name, student_id, phone, email, department } = readerData;
    
    const query = `
      INSERT INTO Readers (name, student_id, phone, email, department)
      VALUES (@name, @student_id, @phone, @email, @department)
      SELECT SCOPE_IDENTITY() as id
    `;
    
    const params = {
      name,
      student_id,
      phone,
      email: email || null,
      department: department || null
    };
    
    try {
      const result = await executeQuery(query, params);
      const newReaderId = parseInt(result.recordset[0].id);
      return await this.findById(newReaderId);
    } catch (error) {
      console.error('创建读者失败:', error);
      throw error;
    }
  }

  /**
   * 根据学号查找读者
   * @param {string} studentId 学号
   * @returns {Promise<Object|null>} 读者信息
   */
  static async findByStudentId(studentId) {
    const query = `
      SELECT * FROM Readers
      WHERE student_id = @studentId
    `;
    
    try {
      const result = await executeQuery(query, { studentId });
      return result.recordset.length > 0 ? new Reader(
        result.recordset[0].id,
        result.recordset[0].name,
        result.recordset[0].student_id,
        result.recordset[0].phone,
        result.recordset[0].email,
        result.recordset[0].department,
        result.recordset[0].created_at,
        result.recordset[0].updated_at
      ) : null;
    } catch (error) {
      console.error('根据学号获取读者失败:', error);
      throw error;
    }
  }

  /**
   * 更新读者密码
   * @param {number} id 读者ID
   * @param {string} password 新密码
   * @returns {Promise<Object|null>} 更新后的读者信息
   */
  // 注意：读者表中没有密码字段，所以这个方法暂时不实现
  static async updatePassword(id, password) {
    throw new Error('读者表中没有密码字段');
  }

  /**
   * 更新读者信息
   * @param {number} id 读者ID
   * @param {object} readerData 更新的读者数据
   * @returns {Promise<Object|null>} 更新后的读者信息
   */
  static async update(id, readerData) {
    // 构建更新查询
    const updateFields = Object.keys(readerData)
      .filter(key => !['id', 'created_at', 'updated_at'].includes(key))
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    if (!updateFields) {
      return await this.findById(id); // 没有需要更新的字段
    }
    
    const query = `
      UPDATE Readers
      SET ${updateFields}, updated_at = GETDATE()
      WHERE id = @id
    `;
    
    const params = {
      id,
      ...readerData
    };
    
    try {
      await executeQuery(query, params);
      return await this.findById(id);
    } catch (error) {
      console.error('更新读者失败:', error);
      throw error;
    }
  }

  /**
   * 删除读者
   * @param {number} id 读者ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async delete(id) {
    const query = `DELETE FROM Readers WHERE id = @id`;
    
    try {
      const result = await executeQuery(query, { id });
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('删除读者失败:', error);
      throw error;
    }
  }

  /**
   * 获取读者统计信息
   * @returns {Promise<Object>} 统计数据
   */
  static async getStats() {
    const query = `
      SELECT
        COUNT(*) as total_readers,
        (SELECT COUNT(*) FROM Borrows WHERE return_date IS NULL) as active_borrows
      FROM Readers
    `;
    
    try {
      const result = await executeQuery(query);
      return result.recordset[0];
    } catch (error) {
      console.error('获取读者统计失败:', error);
      throw error;
    }
  }


}

module.exports = Reader;