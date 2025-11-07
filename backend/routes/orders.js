const express = require('express');
const router = express.Router();

// 订单路由
router.get('/', (req, res) => {
  res.json({ message: '获取订单列表' });
});

router.get('/:id', (req, res) => {
  res.json({ message: '获取订单详情' });
});

router.post('/create', (req, res) => {
  res.json({ message: '创建订单' });
});

router.put('/:id/status', (req, res) => {
  res.json({ message: '更新订单状态' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: '取消订单' });
});

module.exports = router;