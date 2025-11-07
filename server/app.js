require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('./database-mysql');
const createApiRoutes = require('./api-routes');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库实例
const db = new Database();

// 挂载API路由
app.use('/api', createApiRoutes(db));

// 启动服务器
async function startServer() {
    try {
        await db.connect();
        console.log('MySQL数据库连接成功');
        app.listen(PORT, () => {
            console.log(`服务器运行在端口 ${PORT}`);
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        console.log('尝试使用SQLite数据库作为备用...');
        
        // 如果MySQL连接失败，使用SQLite作为备用
        const SqliteDatabase = require('./database-simple');
        const sqliteDb = new SqliteDatabase();
        
        try {
            await sqliteDb.connect();
            console.log('SQLite数据库连接成功');
            app.use('/api', createApiRoutes(sqliteDb));
            app.listen(PORT, () => {
                console.log(`服务器运行在端口 ${PORT} (使用SQLite)`);
            });
        } catch (sqliteError) {
            console.error('SQLite数据库连接也失败:', sqliteError);
            process.exit(1);
        }
    }
}

startServer();

module.exports = app;