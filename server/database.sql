-- 农业平台数据库表结构设计 (符合3NF范式)

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
    user_id INTEGER NOT NULL,  -- 关联上架用户ID
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

-- 插入测试数据
INSERT OR IGNORE INTO categories (name, description) VALUES 
('水果', '新鲜水果'),
('蔬菜', '有机蔬菜'),
('谷物', '优质谷物'),
('茶叶', '高山茶叶');

INSERT OR IGNORE INTO products (name, description, price, unit, stock_quantity, category_id, image_url) VALUES 
('有机苹果', '新鲜采摘的有机苹果，香甜可口', 12.80, '斤', 100, 1, 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=160&fit=crop'),
('生态大米', '无污染农田种植，营养丰富', 6.50, '斤', 200, 3, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=160&fit=crop'),
('高山茶叶', '海拔1000米以上茶园，清香醇厚', 158.00, '盒', 50, 4, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=160&fit=crop'),
('新鲜番茄', '自然成熟，酸甜可口', 8.50, '斤', 80, 2, 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=300&h=160&fit=crop'),
('有机橙子', '汁多味甜，富含维生素C', 15.00, '斤', 120, 1, 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=160&fit=crop');