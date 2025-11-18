const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 15000,
    requestTimeout: 15000
  }
};

let poolPromise;

/**
 * 获取数据库连接池
 * @returns {Promise<sql.ConnectionPool>} 数据库连接池
 */
exports.getPool = async () => {
  if (!poolPromise) {
    poolPromise = (async () => {
      try {
        console.log('🔗 正在连接数据库...');
        const pool = new sql.ConnectionPool(dbConfig);
        const connectedPool = await pool.connect();
        console.log('✅ 数据库连接成功!');
        return connectedPool;
      } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
        throw error;
      }
    })();
  }
  return poolPromise;
};

/**
 * 执行SQL查询
 * @param {string} query SQL查询语句
 * @param {object} params 查询参数
 * @returns {Promise<sql.IRecordSet<any>>} 查询结果
 */
exports.executeQuery = async (query, params = {}) => {
  try {
    const pool = await exports.getPool();
    const request = pool.request();
    
    // 添加查询参数
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ 查询执行失败:', error);
    throw error;
  }
};

/**
 * 关闭数据库连接池
 * @returns {Promise<void>}
 */
exports.closePool = async () => {
  try {
    if (poolPromise) {
      const pool = await poolPromise;
      await pool.close();
      console.log('🔒 数据库连接池已关闭');
    }
  } catch (error) {
    console.error('❌ 关闭连接池时出错:', error);
  }
};

// 导出sql模块供其他地方使用
exports.sql = sql;