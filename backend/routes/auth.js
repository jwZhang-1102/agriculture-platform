const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/database');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, phone, email } = req.body;

    // 验证必填字段
    if (!username || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和手机号为必填项'
      });
    }

    // 检查用户是否已存在
    const existingUser = await db.get(
      'SELECT id FROM users WHERE username = ? OR phone = ?',
      [username, phone]
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名或手机号已存在'
      });
    }

    // 加密密码
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const result = await db.query(
      'INSERT INTO users (username, password_hash, phone, email) VALUES (?, ?, ?, ?)',
      [username, passwordHash, phone, email]
    );

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
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
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          phone: user.phone,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
});

module.exports = router;