const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

class Database {
    constructor() {
        this.db = null;
    }

    // 连接数据库
    connect() {
        return new Promise((resolve, reject) => {
            const dbPath = path.join(__dirname, 'agriculture.db');
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('数据库连接失败:', err.message);
                    reject(err);
                } else {
                    console.log('SQLite数据库连接成功');
                    this.initTables().then(resolve).catch(reject);
                }
            });
        });
    }

    // 初始化表结构
    async initTables() {
        const sql = `
            -- 用户表
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(20) UNIQUE NOT NULL,
                email VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- 商品分类表
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(50) NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- 商品表
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                unit VARCHAR(20) NOT NULL,
                stock_quantity INTEGER DEFAULT 0,
                category_id INTEGER,
                image_url VARCHAR(255),
                status VARCHAR(20) DEFAULT 'active',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (category_id) REFERENCES categories(id)
            );

            -- 购物车表
            CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id),
                UNIQUE(user_id, product_id)
            );

            -- 订单表
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            -- 订单商品详情表
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            );

            -- 融资申请表
            CREATE TABLE IF NOT EXISTS financing_applications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                purpose VARCHAR(255) NOT NULL,
                duration INTEGER NOT NULL,
                description TEXT,
                collateral TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            -- 投资方表
            CREATE TABLE IF NOT EXISTS investors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                type VARCHAR(50) NOT NULL,
                contact_info VARCHAR(255),
                max_amount DECIMAL(15,2),
                preferred_duration VARCHAR(50),
                interest_rate_range VARCHAR(50),
                available BOOLEAN DEFAULT 1
            );

            -- 融资匹配表
            CREATE TABLE IF NOT EXISTS financing_matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id INTEGER NOT NULL,
                investor_id INTEGER NOT NULL,
                match_score INTEGER,
                interest_rate VARCHAR(50),
                terms TEXT,
                match_type VARCHAR(50),
                total_matched_amount DECIMAL(15,2),
                farmer_count INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES financing_applications(id),
                FOREIGN KEY (investor_id) REFERENCES investors(id)
            );

            -- 农户匹配详情表
            CREATE TABLE IF NOT EXISTS farmer_match_details (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                match_id INTEGER NOT NULL,
                farmer_application_id INTEGER NOT NULL,
                farmer_name VARCHAR(100),
                matched_amount DECIMAL(15,2),
                match_score INTEGER,
                interest_rate VARCHAR(50),
                terms TEXT,
                FOREIGN KEY (match_id) REFERENCES financing_matches(id),
                FOREIGN KEY (farmer_application_id) REFERENCES financing_applications(id)
            );

            -- 专家表
            CREATE TABLE IF NOT EXISTS experts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL,
                specialty VARCHAR(100),
                rating DECIMAL(3,2),
                available BOOLEAN DEFAULT 1
            );

            -- 专家预约表
            CREATE TABLE IF NOT EXISTS expert_bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                expert_id INTEGER NOT NULL,
                appointment_time DATETIME,
                consultation_type VARCHAR(50),
                description TEXT,
                status VARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (expert_id) REFERENCES experts(id)
            );
        `;

        return new Promise((resolve, reject) => {
            this.db.exec(sql, async (err) => {
                if (err) {
                    reject(err);
                } else {
                    await this.seedData();
                    resolve();
                }
            });
        });
    }

    // 插入测试数据
    async seedData() {
        try {
            // 检查是否已有数据，避免重复插入
            const existingUsers = await this.get('SELECT COUNT(*) as count FROM users');
            
            if (existingUsers.count === 0) {
                const categories = [
                    { name: '水果', description: '新鲜水果' },
                    { name: '蔬菜', description: '有机蔬菜' },
                    { name: '谷物', description: '优质谷物' },
                    { name: '茶叶', description: '高山茶叶' }
                ];

                // 插入分类数据
                for (const category of categories) {
                    await this.run('INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)', 
                        [category.name, category.description]);
                }

                // 创建测试用户
                const hashedPassword = await bcrypt.hash('123456', 10);
                await this.run('INSERT OR IGNORE INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)',
                    ['testuser', hashedPassword, '13800138000', 'test@example.com']);

                // 获取用户ID
                const user = await this.get('SELECT id FROM users WHERE username = ?', ['testuser']);
                
                if (user) {
                    const products = [
                        { name: '有机苹果', description: '新鲜采摘的有机苹果，香甜可口', price: 12.80, unit: '斤', stock_quantity: 100, category_id: 1, image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=160&fit=crop' },
                        { name: '生态大米', description: '无污染农田种植，营养丰富', price: 6.50, unit: '斤', stock_quantity: 200, category_id: 3, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=160&fit=crop' },
                        { name: '高山茶叶', description: '海拔1000米以上茶园，清香醇厚', price: 158.00, unit: '盒', stock_quantity: 50, category_id: 4, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=160&fit=crop' },
                        { name: '新鲜番茄', description: '自然成熟，酸甜可口', price: 8.50, unit: '斤', stock_quantity: 80, category_id: 2, image_url: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=300&h=160&fit=crop' },
                        { name: '有机橙子', description: '汁多味甜，富含维生素C', price: 15.00, unit: '斤', stock_quantity: 120, category_id: 1, image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=160&fit=crop' }
                    ];

                    // 插入商品数据
                    for (const product of products) {
                        await this.run('INSERT OR IGNORE INTO products (user_id, name, description, price, unit, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            [user.id, product.name, product.description, product.price, product.unit, product.stock_quantity, product.category_id, product.image_url]);
                    }
                }

                console.log('测试数据插入完成');
            } else {
                console.log('数据库已有数据，跳过测试数据插入');
            }
        } catch (error) {
            console.error('插入测试数据失败:', error);
        }
    }

    // 执行SQL查询
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // 执行SQL查询并返回单行结果
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // 执行SQL查询并返回多行结果
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // 关闭数据库连接
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = Database;