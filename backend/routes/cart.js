const express = require('express');
const router = express.Router();

// 购物车路由
router.get('/', (req, res) => {
  res.json({ message: '获取购物车列表' });
});

router.post('/add', (req, res) => {
  res.json({ message: '添加商品到购物车' });
});

router.put('/update/:id', (req, res) => {
  res.json({ message: '更新购物车商品数量' });
});

router.delete('/remove/:id', (req, res) => {
  res.json({ message: '从购物车移除商品' });
});

module.exports = router;