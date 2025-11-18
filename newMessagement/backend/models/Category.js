const { executeQuery } = require('../config/database');

class Category {
  /**
   * 获取所有分类
   * @returns {Promise<Array>} 分类列表
   */
  static async findAll() {
    const query = `
      SELECT * FROM Categories
      ORDER BY name
    `;
    
    try {
      const result = await executeQuery(query);
      return result.recordset;
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取分类
   * @param {number} id 分类ID
   * @returns {Promise<Object|null>} 分类信息
   */
  static async findById(id) {
    const query = `
      SELECT * FROM Categories
      WHERE id = @id
    `;
    
    try {
      const result = await executeQuery(query, { id });
      return result.recordset[0] || null;
    } catch (error) {
      console.error('根据ID获取分类失败:', error);
      throw error;
    }
  }

  /**
   * 创建新分类
   * @param {object} categoryData 分类数据
   * @returns {Promise<Object>} 创建的分类信息
   */
  static async create(categoryData) {
    const { name } = categoryData;
    
    const query = `
      INSERT INTO Categories (name)
      VALUES (@name)
      SELECT SCOPE_IDENTITY() as id
    `;
    
    try {
      const result = await executeQuery(query, { name });
      const newCategoryId = parseInt(result.recordset[0].id);
      return await this.findById(newCategoryId);
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新分类信息
   * @param {number} id 分类ID
   * @param {object} categoryData 更新的分类数据
   * @returns {Promise<Object|null>} 更新后的分类信息
   */
  static async update(id, categoryData) {
    const { name } = categoryData;
    
    const query = `
      UPDATE Categories
      SET name = @name
      WHERE id = @id
    `;
    
    try {
      await executeQuery(query, { id, name });
      return await this.findById(id);
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  }

  /**
   * 删除分类
   * @param {number} id 分类ID
   * @returns {Promise<boolean>} 删除是否成功
   */
  static async delete(id) {
    const query = `DELETE FROM Categories WHERE id = @id`;
    
    try {
      const result = await executeQuery(query, { id });
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  }
}

module.exports = Category;