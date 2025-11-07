const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;

// 导入数据库连接
const db = require('./config/database');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 路由
app.use('/api', require('./routes/api'));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: '接口不存在' });
});

// 启动服务器并连接数据库
async function startServer() {
  try {
    // 连接数据库
    await db.connect();
    
    // 初始化数据库表结构
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 初始化数据库表结构
async function initializeDatabase() {
  try {
    // 检查表是否存在，如果不存在则创建
    const fs = require('fs');
    const path = require('path');
    
    const initSql = fs.readFileSync(path.join(__dirname, 'config', 'init-db.sql'), 'utf8');
    const statements = initSql.split(';').filter(stmt => stmt.trim());
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          // 跳过不支持的 USE 命令
          if (stmt.trim().toUpperCase().startsWith('USE ')) {
            console.log('跳过不支持的 USE 命令:', stmt.trim());
            continue;
          }
          
          // 使用数据库类的统一查询方法
          await db.query(stmt);
        } catch (error) {
          // 忽略表已存在的错误
          if (!error.message.includes('already exists') && 
              !error.message.includes('Duplicate') &&
              !error.message.includes('ER_UNSUPPORTED_PS')) {
            console.warn('SQL执行警告:', error.message);
          }
        }
      }
    }
    
    console.log('数据库表结构初始化完成');
  } catch (error) {
    console.error('数据库初始化错误:', error);
  }
}

startServer();

module.exports = app;