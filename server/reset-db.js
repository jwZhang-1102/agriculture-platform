const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function resetDatabase() {
    const dbPath = path.join(__dirname, 'agriculture.db');
    const db = new sqlite3.Database(dbPath);
    
    try {
        console.log('开始重置数据库...');
        
        // 备份testuser用户数据
        const testUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', ['testuser'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!testUser) {
            console.log('未找到testuser用户，将创建新用户');
        }
        
        // 删除所有表数据（保留testuser用户）
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                // 删除订单相关数据
                db.run('DELETE FROM order_items');
                db.run('DELETE FROM orders WHERE user_id != ?', [testUser ? testUser.id : 0]);
                
                // 删除购物车数据
                db.run('DELETE FROM cart_items WHERE user_id != ?', [testUser ? testUser.id : 0]);
                
                // 删除其他用户（保留testuser）
                if (testUser) {
                    db.run('DELETE FROM users WHERE id != ?', [testUser.id]);
                } else {
                    db.run('DELETE FROM users');
                }
                
                // 重置商品库存
                db.run('UPDATE products SET stock_quantity = 100');
                
                // 如果testuser不存在，创建它
                if (!testUser) {
                    bcrypt.hash('123456', 10).then(hashedPassword => {
                        db.run(
                            'INSERT INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)',
                            ['testuser', hashedPassword, '13800138000', 'test@example.com'],
                            function(err) {
                                if (err) reject(err);
                                else {
                                    console.log('创建testuser用户成功');
                                    resolve();
                                }
                            }
                        );
                    });
                } else {
                    resolve();
                }
            });
        });
        
        console.log('数据库重置完成！');
        console.log('保留的用户: testuser (密码: 123456)');
        
    } catch (error) {
        console.error('重置数据库时出错:', error);
    } finally {
        db.close();
    }
}

// 执行重置
resetDatabase().catch(console.error);