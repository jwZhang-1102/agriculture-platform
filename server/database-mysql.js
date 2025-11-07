const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class Database {
    constructor() {
        this.connection = null;
    }

    // 连接数据库
    async connect() {
        try {
            // 先连接到MySQL服务器（不指定数据库）
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                charset: 'utf8mb4'
            });

            console.log('MySQL服务器连接成功');
            await this.initTables();
        } catch (error) {
            console.error('数据库连接失败:', error.message);
            throw error;
        }
    }

    // 初始化表结构
    async initTables() {
        try {
            // 创建数据库（如果不存在）
            await this.connection.execute(`CREATE DATABASE IF NOT EXISTS agriculture_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            // 使用 query 方法执行 USE 命令（execute 方法不支持 USE）
            await this.connection.query(`USE agriculture_platform`);

            const tables = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    phone VARCHAR(20) UNIQUE NOT NULL,
                    email VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )`,

                `CREATE TABLE IF NOT EXISTS categories (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`,

                `CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    name VARCHAR(100) NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    unit VARCHAR(20) NOT NULL,
                    stock_quantity INT DEFAULT 0,
                    category_id INT,
                    image_url VARCHAR(255),
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (category_id) REFERENCES categories(id)
                )`,

                `CREATE TABLE IF NOT EXISTS cart_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT DEFAULT 1,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (product_id) REFERENCES products(id),
                    UNIQUE KEY unique_user_product (user_id, product_id)
                )`,

                `CREATE TABLE IF NOT EXISTS orders (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    order_number VARCHAR(50) UNIQUE NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`,

                `CREATE TABLE IF NOT EXISTS order_items (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    order_id INT NOT NULL,
                    product_id INT NOT NULL,
                    quantity INT NOT NULL,
                    unit_price DECIMAL(10,2) NOT NULL,
                    FOREIGN KEY (order_id) REFERENCES orders(id),
                    FOREIGN KEY (product_id) REFERENCES products(id)
                )`,

                `CREATE TABLE IF NOT EXISTS financing_applications (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    amount DECIMAL(15,2) NOT NULL,
                    purpose VARCHAR(255) NOT NULL,
                    duration INT NOT NULL,
                    description TEXT,
                    collateral TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )`,

                `CREATE TABLE IF NOT EXISTS investors (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(50) NOT NULL,
                    contact_info VARCHAR(255),
                    max_amount DECIMAL(15,2),
                    preferred_duration VARCHAR(50),
                    interest_rate_range VARCHAR(50),
                    available BOOLEAN DEFAULT true
                )`,

                `CREATE TABLE IF NOT EXISTS financing_matches (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    application_id INT NOT NULL,
                    investor_id INT NOT NULL,
                    match_score INT,
                    interest_rate VARCHAR(50),
                    terms TEXT,
                    match_type VARCHAR(50),
                    total_matched_amount DECIMAL(15,2),
                    farmer_count INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (application_id) REFERENCES financing_applications(id),
                    FOREIGN KEY (investor_id) REFERENCES investors(id)
                )`,

                `CREATE TABLE IF NOT EXISTS farmer_match_details (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    match_id INT NOT NULL,
                    farmer_application_id INT NOT NULL,
                    farmer_name VARCHAR(100),
                    matched_amount DECIMAL(15,2),
                    match_score INT,
                    interest_rate VARCHAR(50),
                    terms TEXT,
                    FOREIGN KEY (match_id) REFERENCES financing_matches(id),
                    FOREIGN KEY (farmer_application_id) REFERENCES financing_applications(id)
                )`,

                `CREATE TABLE IF NOT EXISTS experts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    specialty VARCHAR(100),
                    rating DECIMAL(3,2),
                    available BOOLEAN DEFAULT true
                )`,

                `CREATE TABLE IF NOT EXISTS expert_bookings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT NOT NULL,
                    expert_id INT NOT NULL,
                    appointment_time DATETIME,
                    consultation_type VARCHAR(50),
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (expert_id) REFERENCES experts(id)
                )`
            ];

            for (const tableSql of tables) {
                await this.connection.execute(tableSql);
            }

            await this.seedData();
        } catch (error) {
            console.error('初始化表结构失败:', error);
            throw error;
        }
    }

    // 插入测试数据
    async seedData() {
        try {
            const categories = [
                { name: '水果', description: '新鲜水果' },
                { name: '蔬菜', description: '有机蔬菜' },
                { name: '谷物', description: '优质谷物' },
                { name: '茶叶', description: '高山茶叶' }
            ];

            // 插入分类数据
            for (const category of categories) {
                await this.run('INSERT IGNORE INTO categories (name, description) VALUES (?, ?)', 
                    [category.name, category.description]);
            }

            // 创建测试用户
            const hashedPassword = await bcrypt.hash('123456', 10);
            await this.run('INSERT IGNORE INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)',
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
                    await this.run('INSERT IGNORE INTO products (user_id, name, description, price, unit, stock_quantity, category_id, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [user.id, product.name, product.description, product.price, product.unit, product.stock_quantity, product.category_id, product.image_url]);
                }
            }

            console.log('测试数据插入完成');
        } catch (error) {
            console.error('插入测试数据失败:', error);
        }
    }

    // 执行SQL查询
    async run(sql, params = []) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return { id: result.insertId, changes: result.affectedRows };
        } catch (error) {
            console.error('SQL执行错误:', error);
            throw error;
        }
    }

    // 执行SQL查询并返回单行结果
    async get(sql, params = []) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows[0] || null;
        } catch (error) {
            console.error('SQL查询错误:', error);
            throw error;
        }
    }

    // 执行SQL查询并返回多行结果
    async all(sql, params = []) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('SQL查询错误:', error);
            throw error;
        }
    }

    // 关闭数据库连接
    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('数据库连接已关闭');
        }
    }
}

module.exports = Database;