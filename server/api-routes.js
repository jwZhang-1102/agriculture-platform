const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'agriculture-platform-secret-key';

// 创建路由函数，接收数据库实例
function createApiRoutes(db) {
    const router = express.Router();

// 认证中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: '访问令牌缺失' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '令牌无效' });
        }
        req.user = user;
        next();
    });
};

// 1. 用户认证接口
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password, phone, email } = req.body;

        // 验证必填字段
        if (!username || !password || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名、密码和手机号为必填项' 
            });
        }

        // 检查用户名是否已存在
        const existingUser = await db.get(`SELECT id FROM users WHERE username = ?`, [username]);
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名已存在' 
            });
        }

        // 检查手机号是否已存在
        const existingPhone = await db.get(`SELECT id FROM users WHERE phone = ?`, [phone]);
        if (existingPhone) {
            return res.status(400).json({ 
                success: false, 
                message: '手机号已注册' 
            });
        }

        // 加密密码
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 插入用户
        const result = await db.run(
            `INSERT INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)`,
            [username, passwordHash, phone, email]
        );

        // 生成JWT令牌
        const token = jwt.sign({ id: result.lastID, username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: '注册成功',
            data: {
                user: { id: result.lastID, username, phone, email },
                token
            }
        });

    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名和密码为必填项' 
            });
        }

        // 查找用户
        const user = await db.get(
            `SELECT id, username, password_hash, phone, email FROM users WHERE username = ?`,
            [username]
        );

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }

        // 验证密码
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ 
                success: false, 
                message: '用户名或密码错误' 
            });
        }

        // 生成JWT令牌
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });

        res.json({
            success: true,
            message: '登录成功',
            data: {
                user: { 
                    id: user.id, 
                    username: user.username, 
                    phone: user.phone, 
                    email: user.email 
                },
                token
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 2. 个人中心接口
router.get('/user/profile', authenticateToken, async (req, res) => {
    try {
        const { username } = req.query;
        
        let query, params;
        
        if (username) {
            // 通过用户名查询用户信息（管理员权限）
            query = `SELECT id, username, phone, email, created_at FROM users WHERE username = ?`;
            params = [username];
        } else {
            // 查询当前登录用户信息
            query = `SELECT id, username, phone, email, created_at FROM users WHERE id = ?`;
            params = [req.user.id];
        }

        const user = await db.get(query, params);

        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        res.json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.put('/user/profile', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;

        await db.run(
            `UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [email, req.user.id]
        );

        res.json({
            success: true,
            message: '信息更新成功'
        });

    } catch (error) {
        console.error('更新用户信息错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 用户订单接口
router.get('/user/orders', authenticateToken, async (req, res) => {
    try {
        const { username } = req.query;
        
        let query, params;
        
        if (username) {
            // 通过用户名查询用户订单（管理员权限）
            query = `
                SELECT 
                    o.id,
                    o.order_number,
                    o.total_amount,
                    o.status,
                    o.created_at,
                    COUNT(oi.id) as item_count
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                JOIN users u ON o.user_id = u.id
                WHERE u.username = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `;
            params = [username];
        } else {
            // 查询当前登录用户订单
            query = `
                SELECT 
                    o.id,
                    o.order_number,
                    o.total_amount,
                    o.status,
                    o.created_at,
                    COUNT(oi.id) as item_count
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.user_id = ?
                GROUP BY o.id
                ORDER BY o.created_at DESC
            `;
            params = [req.user.id];
        }

        const orders = await db.all(query, params);

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('获取用户订单列表错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.get('/user/orders/:orderId', authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        // 验证订单属于当前用户
        const order = await db.get(`
            SELECT o.*, u.username, u.phone, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.id = ? AND o.user_id = ?
        `, [orderId, req.user.id]);

        if (!order) {
            return res.status(404).json({ success: false, message: '订单不存在' });
        }

        // 获取订单商品详情
        const orderItems = await db.all(`
            SELECT oi.*, p.name as product_name, p.image_url
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [orderId]);

        res.json({
            success: true,
            data: {
                order: {
                    id: order.id,
                    order_number: order.order_number,
                    total_amount: order.total_amount,
                    status: order.status,
                    created_at: order.created_at,
                    username: order.username,
                    phone: order.phone,
                    email: order.email
                },
                items: orderItems
            }
        });

    } catch (error) {
        console.error('获取订单详情错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 3. 购物车接口
router.get('/cart', authenticateToken, async (req, res) => {
    try {
        const cartItems = await db.all(`
            SELECT ci.id, ci.product_id, p.name, p.price, ci.quantity, p.image_url, p.unit
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.user_id = ?
        `, [req.user.id]);

        res.json({
            success: true,
            data: cartItems
        });

    } catch (error) {
        console.error('获取购物车错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.post('/cart/add', authenticateToken, async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        // 检查商品是否存在
        const product = await db.get(`SELECT id FROM products WHERE id = ?`, [product_id]);
        if (!product) {
            return res.status(404).json({ success: false, message: '商品不存在' });
        }

        // 检查是否已在购物车
        const existingItem = await db.get(`
            SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?
        `, [req.user.id, product_id]);

        if (existingItem) {
            // 更新数量
            await db.run(`
                UPDATE cart_items SET quantity = quantity + ? WHERE id = ?
            `, [quantity, existingItem.id]);
        } else {
            // 新增商品
            await db.run(`
                INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)
            `, [req.user.id, product_id, quantity]);
        }

        res.json({
            success: true,
            message: '添加成功'
        });

    } catch (error) {
        console.error('添加购物车错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.put('/cart/update', authenticateToken, async (req, res) => {
    try {
        const { cart_item_id, quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ success: false, message: '数量必须大于0' });
        }

        await db.run(`
            UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?
        `, [quantity, cart_item_id, req.user.id]);

        res.json({
            success: true,
            message: '更新成功'
        });

    } catch (error) {
        console.error('更新购物车错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.delete('/cart/remove/:cart_item_id', authenticateToken, async (req, res) => {
    try {
        const { cart_item_id } = req.params;

        await db.run(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`, [cart_item_id, req.user.id]);

        res.json({
            success: true,
            message: '删除成功'
        });

    } catch (error) {
        console.error('删除购物车商品错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 4. 商品管理接口
router.get('/products', async (req, res) => {
    try {
        const { category_id, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (category_id) {
            whereClause = 'WHERE p.category_id = ?';
            params.push(category_id);
        }

        const products = await db.all(`
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ${whereClause}
            ORDER BY p.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        const totalResult = await db.get(`
            SELECT COUNT(*) as total FROM products p ${whereClause}
        `, params.length > 0 ? params : []);

        res.json({
            success: true,
            data: {
                products,
                total: totalResult.total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('获取商品列表错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.post('/products', authenticateToken, async (req, res) => {
    try {
        const { name, description, price, unit, stock_quantity, category_id, image_url } = req.body;

        // 验证必填字段
        if (!name || !price || !unit || !category_id) {
            return res.status(400).json({ 
                success: false, 
                message: '商品名称、价格、单位和分类为必填项' 
            });
        }

        const result = await db.run(`
            INSERT INTO products (user_id, name, description, price, unit, stock_quantity, category_id, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [req.user.id, name, description, price, unit, stock_quantity, category_id, image_url]);

        res.json({
            success: true,
            message: '商品上架成功',
            data: { product_id: result.lastID }
        });

    } catch (error) {
        console.error('上架商品错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 5. 订单接口
router.post('/orders', authenticateToken, async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: '订单商品不能为空' 
            });
        }

        // 计算总金额并验证库存
        let totalAmount = 0;
        for (const item of items) {
            const product = await db.get(`SELECT price, stock_quantity FROM products WHERE id = ?`, [item.product_id]);
            if (!product) {
                return res.status(400).json({ success: false, message: `商品ID ${item.product_id} 不存在` });
            }
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    success: false, 
                    message: `商品 ${item.product_id} 库存不足` 
                });
            }
            totalAmount += product.price * item.quantity;
        }

        // 生成订单号
        const orderNumber = 'ORDER' + Date.now();

        // 创建订单
        const orderResult = await db.run(`
            INSERT INTO orders (user_id, order_number, total_amount) VALUES (?, ?, ?)
        `, [req.user.id, orderNumber, totalAmount]);

        // 添加订单商品
        for (const item of items) {
            const product = await db.get(`SELECT price FROM products WHERE id = ?`, [item.product_id]);
            await db.run(`
                INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                VALUES (?, ?, ?, ?)
            `, [orderResult.lastID, item.product_id, item.quantity, product.price]);

            // 更新库存
            await db.run(`
                UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
            `, [item.quantity, item.product_id]);
        }

        res.json({
            success: true,
            message: '订单创建成功',
            data: {
                order_id: orderResult.lastID,
                order_number: orderNumber,
                total_amount: totalAmount
            }
        });

    } catch (error) {
        console.error('创建订单错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE o.user_id = ?';
        let params = [req.user.id];

        if (status) {
            whereClause += ' AND o.status = ?';
            params.push(status);
        }

        const orders = await db.all(`
            SELECT o.*, 
                   GROUP_CONCAT(oi.product_id || ':' || oi.quantity || ':' || oi.unit_price) as items_data
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            ${whereClause}
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        // 格式化订单数据
        const formattedOrders = orders.map(order => {
            const items = order.items_data ? order.items_data.split(',').map(item => {
                const [product_id, quantity, unit_price] = item.split(':');
                return { product_id: parseInt(product_id), quantity: parseInt(quantity), unit_price: parseFloat(unit_price) };
            }) : [];
            
            return {
                id: order.id,
                order_number: order.order_number,
                total_amount: order.total_amount,
                status: order.status,
                created_at: order.created_at,
                items
            };
        });

        const totalResult = await db.get(`
            SELECT COUNT(*) as total FROM orders o ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                orders: formattedOrders,
                total: totalResult.total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('获取订单列表错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 6. 融资服务接口
router.post('/financing/apply', authenticateToken, async (req, res) => {
    try {
        const { amount, purpose, duration, description, collateral } = req.body;

        if (!amount || !purpose || !duration) {
            return res.status(400).json({ 
                success: false, 
                message: '融资金额、用途和期限为必填项' 
            });
        }

        const result = await db.run(`
            INSERT INTO financing_applications (user_id, amount, purpose, duration, description, collateral)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [req.user.id, amount, purpose, duration, description, collateral]);

        // 异步执行融资匹配算法
        setTimeout(() => {
            executeFinancingMatch(result.lastID);
        }, 1000);

        res.json({
            success: true,
            message: '融资申请提交成功',
            data: {
                application_id: result.lastID,
                estimated_time: '预计1-3个工作日内完成匹配'
            }
        });

    } catch (error) {
        console.error('提交融资申请错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 银行大额放贷匹配多个农户算法
async function executeFinancingMatch(applicationId) {
    try {
        const application = await db.get(`
            SELECT * FROM financing_applications WHERE id = ?
        `, [applicationId]);

        // 获取所有可用的银行投资方（大额资金方）
        const banks = await db.all(`SELECT * FROM investors WHERE type = '银行' AND available = 1`);

        // 获取所有等待融资的农户申请（按信用评分排序）
        const farmerApplications = await db.all(`
            SELECT fa.*, u.username as farmer_name, u.phone as farmer_phone,
                   (fa.amount / 10000) as credit_score_base, -- 金额越大信用基础分越高
                   CASE 
                       WHEN fa.duration <= 12 THEN 20 
                       WHEN fa.duration <= 24 THEN 15 
                       ELSE 10 
                   END as duration_score
            FROM financing_applications fa
            JOIN users u ON fa.user_id = u.id
            WHERE fa.status = 'pending' 
            AND fa.amount <= 500000 -- 农户单笔申请不超过50万
            AND fa.id != ? -- 排除当前申请
            ORDER BY (fa.amount / 10000) + duration_score DESC
            LIMIT 20
        `, [applicationId]);

        const matches = [];
        
        for (const bank of banks) {
            // 检查银行资金是否足够匹配当前农户群体
            let remainingBankAmount = bank.max_amount;
            const farmerGroup = [];
            let totalMatchedAmount = 0;

            // 为银行匹配农户群体
            for (const farmer of farmerApplications) {
                if (remainingBankAmount >= farmer.amount && farmer.amount <= 500000) {
                    // 计算农户匹配度
                    let farmerMatchScore = calculateFarmerMatchScore(farmer, bank);
                    
                    if (farmerMatchScore >= 60) {
                        farmerGroup.push({
                            farmer_application_id: farmer.id,
                            farmer_name: farmer.farmer_name,
                            farmer_phone: farmer.farmer_phone,
                            amount: farmer.amount,
                            match_score: farmerMatchScore,
                            interest_rate: calculateBankInterestRate(bank.interest_rate_range, farmerMatchScore),
                            terms: generateBankTerms(farmer.duration)
                        });
                        
                        totalMatchedAmount += farmer.amount;
                        remainingBankAmount -= farmer.amount;
                    }
                }
                
                // 如果银行资金已分配完或农户群体达到一定规模，停止匹配
                if (remainingBankAmount <= 100000 || farmerGroup.length >= 10) {
                    break;
                }
            }

            // 如果成功匹配到农户群体，创建银行匹配记录
            if (farmerGroup.length > 0) {
                const bankMatchScore = calculateBankOverallMatchScore(farmerGroup, totalMatchedAmount, bank);
                
                if (bankMatchScore >= 70) { // 银行整体匹配阈值
                    matches.push({
                        bank_id: bank.id,
                        bank_name: bank.name,
                        total_matched_amount: totalMatchedAmount,
                        farmer_count: farmerGroup.length,
                        match_score: bankMatchScore,
                        farmer_group: farmerGroup
                    });
                }
            }
        }

        // 按匹配度排序，选择最优的银行匹配方案
        matches.sort((a, b) => b.match_score - a.match_score);

        // 保存匹配结果
        for (const match of matches.slice(0, 2)) { // 保存前2个最优方案
            // 创建银行匹配主记录
            const matchResult = await db.run(`
                INSERT INTO financing_matches (application_id, investor_id, match_score, interest_rate, terms, match_type)
                VALUES (?, ?, ?, ?, ?, 'bank_to_farmers')
            `, [applicationId, match.bank_id, match.match_score, '批量匹配', '银行批量放贷']);

            const matchId = matchResult.lastID;

            // 保存农户群体匹配详情
            for (const farmer of match.farmer_group) {
                await db.run(`
                    INSERT INTO farmer_match_details (match_id, farmer_application_id, farmer_name, 
                    matched_amount, match_score, interest_rate, terms)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [matchId, farmer.farmer_application_id, farmer.farmer_name, farmer.amount, 
                    farmer.match_score, farmer.interest_rate, farmer.terms]);

                // 更新农户申请状态为已匹配
                await db.run(`
                    UPDATE financing_applications SET status = 'matched' WHERE id = ?
                `, [farmer.farmer_application_id]);
            }
        }

        // 更新当前申请状态
        await db.run(`
            UPDATE financing_applications SET status = 'matched', updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `, [applicationId]);

    } catch (error) {
        console.error('银行大额放贷匹配错误:', error);
    }
}

// 计算农户匹配度
function calculateFarmerMatchScore(farmer, bank) {
    let score = 0;
    
    // 金额匹配度 (30%权重)
    if (farmer.amount >= 10000 && farmer.amount <= 500000) {
        const amountRatio = Math.min(farmer.amount / 500000, 1);
        score += amountRatio * 30;
    }
    
    // 期限匹配度 (25%权重)
    const bankDurations = bank.preferred_duration.split('-').map(Number);
    if (farmer.duration >= bankDurations[0] && farmer.duration <= bankDurations[1]) {
        score += 25;
    }
    
    // 用途合理性 (20%权重)
    const validPurposes = ['购买设备', '扩大种植', '技术升级', '基础设施建设'];
    if (validPurposes.some(purpose => farmer.purpose.includes(purpose))) {
        score += 20;
    }
    
    // 抵押物评估 (15%权重)
    if (farmer.collateral && farmer.collateral.includes('农田') || farmer.collateral.includes('设备')) {
        score += 15;
    }
    
    // 随机因素 (10%权重)
    score += Math.floor(Math.random() * 10);
    
    return Math.min(score, 100);
}

// 计算银行整体匹配度
function calculateBankOverallMatchScore(farmerGroup, totalAmount, bank) {
    let score = 0;
    
    // 资金利用率 (40%权重)
    const utilizationRate = totalAmount / bank.max_amount;
    score += utilizationRate * 40;
    
    // 农户群体规模 (30%权重)
    const groupSizeScore = Math.min(farmerGroup.length / 10 * 30, 30);
    score += groupSizeScore;
    
    // 平均匹配度 (20%权重)
    const avgFarmerScore = farmerGroup.reduce((sum, farmer) => sum + farmer.match_score, 0) / farmerGroup.length;
    score += (avgFarmerScore / 100) * 20;
    
    // 风险分散度 (10%权重)
    const riskDiversification = 1 - (Math.max(...farmerGroup.map(f => f.amount)) / totalAmount);
    score += riskDiversification * 10;
    
    return Math.min(score, 100);
}

// 计算银行利率
function calculateBankInterestRate(range, matchScore) {
    const [min, max] = range.replace('%', '').split('-').map(Number);
    // 匹配度越高，利率越优惠
    const rateAdjustment = (100 - matchScore) / 100 * (max - min) * 0.3;
    const finalRate = min + rateAdjustment;
    return parseFloat(finalRate.toFixed(2));
}

// 生成银行条款
function generateBankTerms(duration) {
    if (duration <= 12) {
        return `${duration}个月，等额本息，季度还款`;
    } else if (duration <= 36) {
        return `${duration}个月，先息后本，年度还本`;
    } else {
        return `${duration}个月，灵活还款，根据收成调整`;
    }
}

function calculateInterestRate(range, matchScore) {
    const [min, max] = range.replace('%', '').split('-').map(Number);
    const baseRate = min + (max - min) * (matchScore / 100);
    return parseFloat(baseRate.toFixed(2));
}

function generateTerms(duration) {
    if (duration <= 12) {
        return `${duration}个月，等额本息`;
    } else {
        return `${duration}个月，先息后本`;
    }
}

router.get('/financing/match/:application_id', authenticateToken, async (req, res) => {
    try {
        const { application_id } = req.params;

        const application = await db.get(`
            SELECT * FROM financing_applications WHERE id = ? AND user_id = ?
        `, [application_id, req.user.id]);

        if (!application) {
            return res.status(404).json({ success: false, message: '融资申请不存在' });
        }

        const matches = await db.all(`
            SELECT fm.*, i.name as investor_name, i.contact_info, i.type as investor_type
            FROM financing_matches fm
            JOIN investors i ON fm.investor_id = i.id
            WHERE fm.application_id = ?
            ORDER BY fm.match_score DESC
        `, [application_id]);

        // 获取农户匹配详情（如果是银行大额放贷）
        const matchDetails = [];
        for (const match of matches) {
            if (match.match_type === 'bank_to_farmers') {
                const farmerDetails = await db.all(`
                    SELECT * FROM farmer_match_details WHERE match_id = ?
                `, [match.id]);
                
                matchDetails.push({
                    match_id: match.id,
                    farmer_details: farmerDetails
                });
            }
        }

        res.json({
            success: true,
            data: {
                application_id: parseInt(application_id),
                status: application.status,
                matches: matches.map(match => ({
                    investor_id: match.investor_id,
                    investor_name: match.investor_name,
                    investor_type: match.investor_type,
                    match_score: match.match_score,
                    interest_rate: match.interest_rate,
                    terms: match.terms,
                    match_type: match.match_type,
                    total_matched_amount: match.total_matched_amount,
                    farmer_count: match.farmer_count,
                    contact_info: match.contact_info,
                    farmer_details: matchDetails.find(d => d.match_id === match.id)?.farmer_details || []
                }))
            }
        });

    } catch (error) {
        console.error('获取融资匹配结果错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

// 7. 专家预约接口
router.get('/experts', async (req, res) => {
    try {
        const { specialty, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (specialty) {
            whereClause = 'WHERE specialty LIKE ?';
            params.push(`%${specialty}%`);
        }

        const experts = await db.all(`
            SELECT * FROM experts
            ${whereClause}
            ORDER BY rating DESC
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);

        const totalResult = await db.get(`
            SELECT COUNT(*) as total FROM experts ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                experts,
                total: totalResult.total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('获取专家列表错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

router.post('/experts/book', authenticateToken, async (req, res) => {
    try {
        const { expert_id, appointment_time, consultation_type, description } = req.body;

        if (!expert_id || !appointment_time || !consultation_type) {
            return res.status(400).json({ 
                success: false, 
                message: '专家ID、预约时间和咨询类型为必填项' 
            });
        }

        // 检查专家是否存在且可用
        const expert = await db.get(`SELECT * FROM experts WHERE id = ? AND available = 1`, [expert_id]);
        if (!expert) {
            return res.status(400).json({ success: false, message: '专家不可用或不存在' });
        }

        const result = await db.run(`
            INSERT INTO expert_bookings (user_id, expert_id, appointment_time, consultation_type, description)
            VALUES (?, ?, ?, ?, ?)
        `, [req.user.id, expert_id, appointment_time, consultation_type, description]);

        res.json({
            success: true,
            message: '预约成功',
            data: {
                booking_id: result.lastID,
                expert_name: expert.name,
                appointment_time
            }
        });

    } catch (error) {
        console.error('专家预约错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

    return router;
}

module.exports = createApiRoutes;