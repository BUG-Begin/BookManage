const { executeQuery } = require('../config/database');

class Publisher {
  /**
   * 获取所有出版商
   * @returns {Promise<Array>} 出版商列表
   */
  static async findAll() {
    const query = `
      SELECT * FROM Publishers
      ORDER BY name
    `;
    
    try {
      const result = await executeQuery(query);
      return result.recordset;
    } catch (error) {
      console.error('获取出版商列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取出版商
   * @param {number} id 出版商ID
   * @returns {Promise<Object|null>} 出版商信息
   */
  static async findById(id) {
    const query = `
      SELECT * FROM Publishers
      WHERE id = @id
    `;
    
    try {
      const result = await executeQuery(query, { id });
      return result.recordset[0] || null;
    } catch (error) {
      console.error('根据ID获取出版商失败:', error);
      throw error;
    }
  }

  /**
   * 创建新出版商
   * @param {object} publisherData 出版商数据
   * @returns {Promise<Object>} 创建的出版商信息
   */
  static async create(publisherData) {
    const { name } = publisherData;
    
    const query = `
      INSERT INTO Publishers (name)
      VALUES (@name)
      SELECT SCOPE_IDENTITY() as id
    `;
    
    try {
      const result = await executeQuery(query, { name });
      const newPublisherId = parseInt(result.recordset[0].id);
      return await this.findById(newPublisherId);
    } catch (error) {
      console.error('创建出版商失败:', error);
      throw error;
    }
  }

  /**
   * 更新出版商信息
   * @param {number} id 出版商ID
   * @param {object} publisherData 更新的出版商数据
   * @returns {Promise<Object|null>} 更新后的出版商信息
   */
  static async update(id, publisherData) {
    const { name } = publisherData;
    
    const query = `
      UPDATE Publishers
      SET name = @name
      WHERE id = @id
    `;
    
    try {
      await executeQuery(query, { id, name });
      return await this.findById(id);
    } catch (error) {
      console.error('更新出版商失败:', error);
      throw error;
    }
  }

  /**
   * 删除出版商
   * @param {number} id 出版商ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async delete(id) {
    const query = `DELETE FROM Publishers WHERE id = @id`;
    
    try {
      const result = await executeQuery(query, { id });
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('删除出版商失败:', error);
      throw error;
    }
  }
}

module.exports = Publisher;