const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    console.log('请求参数:', req.query); // 调试日志
    
    const { category_id, page, limit } = req.query;
    
    // 严格的参数验证和类型转换
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit) || 10, 100));
    const offsetNum = (pageNum - 1) * limitNum;
    
    console.log('转换后参数:', { pageNum, limitNum, offsetNum }); // 调试日志

    let whereClause = '';
    let params = [];

    if (category_id && category_id !== 'null' && category_id !== 'undefined') {
      whereClause = 'WHERE p.category_id = ?';
      params.push(parseInt(category_id));
    }

    // 确保参数类型正确
    const queryParams = [...params, Number(limitNum), Number(offsetNum)];
    
    console.log('最终SQL参数:', queryParams); // 调试日志
    
    // 构建SQL查询 - 修复字段名和表结构匹配
    let sql = `SELECT p.*, c.name as category_name 
               FROM products p 
               LEFT JOIN categories c ON p.category_id = c.id 
               ${whereClause} 
               ORDER BY p.created_at DESC 
               LIMIT ? OFFSET ?`;
    console.log('SQL语句:', sql); // 调试日志
    
    // 修复参数数量匹配问题
    let products;
    if (params.length === 0) {
      // 如果没有条件参数，直接使用 LIMIT 和 OFFSET
      sql = `SELECT p.*, c.name as category_name 
             FROM products p 
             LEFT JOIN categories c ON p.category_id = c.id 
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?`;
      products = await db.all(sql, [Number(limitNum), Number(offsetNum)]);
    } else {
      // 有分类条件时，参数顺序应该是: category_id, limit, offset
      products = await db.all(sql, [...params, Number(limitNum), Number(offsetNum)]);
    }

    // 修复总数查询 - 确保参数匹配
    let countSql = `SELECT COUNT(*) as total FROM products p ${whereClause}`;
    const totalResult = await db.get(countSql, params);

    res.json({
      success: true,
      data: {
        products: products || [],
        total: totalResult ? totalResult.total : 0,
        page: pageNum,
        limit: limitNum
      }
    });

  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取商品列表失败',
      error: error.message 
    });
  }
});

// 获取商品详情
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db.get(`
      SELECT * FROM products WHERE id = ?
    `, [id]);

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: '商品不存在' 
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取商品详情失败',
      error: error.message
    });
  }
});

module.exports = router;