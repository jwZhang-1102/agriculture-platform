const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

async function createUser() {
    const dbPath = path.join(__dirname, 'agriculture.db');
    const db = new sqlite3.Database(dbPath);
    
    try {
        console.log('开始创建用户...');
        
        // 检查用户是否已存在
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', ['user'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (existingUser) {
            console.log('用户已存在，更新用户信息...');
            // 更新现有用户
            const hashedPassword = await bcrypt.hash('123456', 10);
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE users SET password_hash = ?, phone = ?, email = ? WHERE username = ?',
                    [hashedPassword, '10000000000', 'user@example.com', 'user'],
                    function(err) {
                        if (err) reject(err);
                        else {
                            console.log('用户信息更新成功');
                            resolve();
                        }
                    }
                );
            });
        } else {
            console.log('创建新用户...');
            // 创建新用户
            const hashedPassword = await bcrypt.hash('123456', 10);
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)',
                    ['user', hashedPassword, '10000000000', 'user@example.com'],
                    function(err) {
                        if (err) reject(err);
                        else {
                            console.log('用户创建成功');
                            resolve();
                        }
                    }
                );
            });
        }
        
        // 显示用户信息
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', ['user'], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        console.log('用户创建/更新完成！');
        console.log('用户名: user');
        console.log('密码: 123456');
        console.log('手机号: 10000000000');
        console.log('用户ID:', user.id);
        
    } catch (error) {
        console.error('创建用户时出错:', error);
    } finally {
        db.close();
    }
}

// 执行创建用户
createUser().catch(console.error);