<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <ul>
            <li><a href="#">平台介绍</a></li>
            <li><a href="#">团队介绍</a></li>
            <li><a href="#">合作伙伴</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>帮助中心</h3>
          <ul>
            <li><a href="#">融资指南</a></li>
            <li><a href="#">交易流程</a></li>
            <li><a href="#">常见问题</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>联系我们</h3>
          <ul>
            <li>客服电话: 400-123-4567</li>
            <li>邮箱: support@agri-platform.com</li>
            <li>地址: 某省某市某区某路某号</li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>关注我们</h3>
          <p>扫码关注微信公众号</p>
          <img src="https://via.placeholder.com/100x100" alt="公众号二维码" style="margin-top: 10px;">
        </div>
      </div>
      <div class="copyright">
        © 2023 农产品融销一体平台 版权所有
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style scoped>
.footer {
  background-color: #263238;
  color: white;
  padding: 40px 0 20px;
  margin-top: 40px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.footer-section h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

.footer-section ul {
  list-style: none;
}

.footer-section li {
  margin-bottom: 8px;
}

.footer-section a {
  color: #ccc;
  text-decoration: none;
}

.footer-section a:hover {
  color: white;
}

.copyright {
  text-align: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #37474f;
  color: #78909c;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>