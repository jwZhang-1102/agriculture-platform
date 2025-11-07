-- 扩展数据库表结构

-- 融资申请表
CREATE TABLE IF NOT EXISTS financing_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    duration INTEGER NOT NULL,
    description TEXT,
    collateral VARCHAR(200),
    status VARCHAR(20) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 投资方表
CREATE TABLE IF NOT EXISTS investors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 银行、信用社、投资机构等
    min_amount DECIMAL(15,2),
    max_amount DECIMAL(15,2),
    preferred_duration VARCHAR(50),
    interest_rate_range VARCHAR(50),
    contact_info VARCHAR(200),
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 融资匹配结果表
CREATE TABLE IF NOT EXISTS financing_matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    investor_id INTEGER NOT NULL,
    match_score INTEGER NOT NULL,
    interest_rate DECIMAL(5,2),
    terms TEXT,
    match_type VARCHAR(50) DEFAULT 'direct', -- direct: 直接匹配, bank_to_farmers: 银行匹配农户群体
    total_matched_amount DECIMAL(15,2), -- 银行匹配的总金额
    farmer_count INTEGER, -- 匹配的农户数量
    status VARCHAR(20) DEFAULT 'proposed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES financing_applications(id),
    FOREIGN KEY (investor_id) REFERENCES investors(id)
);

-- 农户匹配详情表（银行大额放贷拆分给多个农户）
CREATE TABLE IF NOT EXISTS farmer_match_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id INTEGER NOT NULL,
    farmer_application_id INTEGER NOT NULL,
    farmer_name VARCHAR(50) NOT NULL,
    matched_amount DECIMAL(15,2) NOT NULL,
    match_score INTEGER NOT NULL,
    interest_rate DECIMAL(5,2),
    terms TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES financing_matches(id),
    FOREIGN KEY (farmer_application_id) REFERENCES financing_applications(id)
);

-- 专家表
CREATE TABLE IF NOT EXISTS experts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    experience VARCHAR(50),
    rating DECIMAL(3,2) DEFAULT 0.0,
    avatar_url VARCHAR(255),
    available BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 专家预约表
CREATE TABLE IF NOT EXISTS expert_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    expert_id INTEGER NOT NULL,
    appointment_time DATETIME NOT NULL,
    consultation_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (expert_id) REFERENCES experts(id)
);

-- 插入测试数据
INSERT OR IGNORE INTO investors (name, type, min_amount, max_amount, preferred_duration, interest_rate_range, contact_info, rating) VALUES 
('农业银行', '银行', 10000, 500000, '12-36个月', '4.5%-6.5%', '张经理 13800138000', 4.8),
('农村信用社', '信用社', 5000, 200000, '6-24个月', '4.2%-5.8%', '李经理 13900139000', 4.5),
('农业发展基金', '投资机构', 50000, 1000000, '24-60个月', '5.0%-7.0%', '王总监 13600136000', 4.7);

INSERT OR IGNORE INTO experts (name, specialty, experience, rating, avatar_url, available, hourly_rate) VALUES 
('张教授', '果树种植', '15年', 4.8, 'expert1.jpg', true, 200.00),
('李专家', '蔬菜种植', '12年', 4.6, 'expert2.jpg', true, 180.00),
('王技术员', '农业机械', '8年', 4.5, 'expert3.jpg', true, 150.00),
('赵顾问', '土壤肥料', '10年', 4.7, 'expert4.jpg', false, 220.00);