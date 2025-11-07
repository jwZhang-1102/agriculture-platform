const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agriculture_platform',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: 10
};

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool(dbConfig);
      
      // 测试连接
      const connection = await this.pool.getConnection();
      console.log('MySQL数据库连接成功');
      connection.release();
      
      return this.pool;
    } catch (error) {
      console.error('MySQL数据库连接失败:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      // 对于不支持预处理语句的命令，使用 connection.query
      if (sql.trim().toUpperCase().startsWith('CREATE DATABASE') || 
          sql.trim().toUpperCase().startsWith('INSERT IGNORE') ||
          sql.trim().toUpperCase().startsWith('USE ')) {
        const connection = await this.pool.getConnection();
        try {
          const [rows] = await connection.query(sql, params);
          return rows;
        } finally {
          connection.release();
        }
      } else {
        // 对于SELECT查询，使用query而不是execute，避免预处理语句问题
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
          const connection = await this.pool.getConnection();
          try {
            const [rows] = await connection.query(sql, params);
            return rows;
          } finally {
            connection.release();
          }
        } else {
          const [rows] = await this.pool.execute(sql, params);
          return rows;
        }
      }
    } catch (error) {
      console.error('SQL查询错误:', error);
      console.error('SQL语句:', sql);
      console.error('参数:', params);
      throw error;
    }
  }

  async get(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  async all(sql, params = []) {
    return await this.query(sql, params);
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('数据库连接已关闭');
    }
  }
}

module.exports = new Database();