<template>
  <header class="header">
    <div class="container nav-container">
      <div class="logo">
        <i class="el-icon-food" style="margin-right: 10px;"></i>
        农产品融销一体平台
      </div>
      <ul class="nav-menu">
        <li><router-link to="/">首页</router-link></li>
        <li><router-link to="/financing">融资服务</router-link></li>
        <li><router-link to="/market">农产品交易</router-link></li>
        <li><router-link to="/expert">专家助力</router-link></li>
      </ul>
      <div class="user-actions">
        <div v-if="!isLoggedIn">
          <el-button type="text" @click="$router.push('/login')">登录</el-button>
          <el-button type="primary" @click="$router.push('/register')">注册</el-button>
        </div>
        <div v-else class="logged-in-actions">
          <!-- 购物车图标 - 更明显的位置 -->
          <div class="cart-icon-wrapper" @click="$router.push('/cart')">
            <el-badge :value="cartTotalItems" :hidden="cartTotalItems === 0" class="cart-badge">
              <i class="el-icon-shopping-cart cart-icon"></i>
            </el-badge>
            <span class="cart-text">购物车</span>
          </div>
          
          <!-- 用户下拉菜单 -->
          <el-dropdown>
            <span class="el-dropdown-link">
              <el-avatar :size="30" :src="(user && user.avatar) || ''"></el-avatar>
              {{ (user && user.username) || '用户' }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')">个人信息</el-dropdown-item>
                <el-dropdown-item @click="goToProfileWithTab('orders')">我的订单</el-dropdown-item>
                <el-dropdown-item @click="goToProfileWithTab('financing')">融资管理</el-dropdown-item>
                <el-dropdown-item @click="$router.push('/product/add')">上架商品</el-dropdown-item>
                <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'CommonHeader',
  computed: {
    ...mapState(['user', 'cart']),
    ...mapGetters(['isLoggedIn', 'cartTotalItems'])
  },
  methods: {
    ...mapActions(['logout']),
    goToProfileWithTab(tab) {
      // 使用sessionStorage来传递标签页信息，确保在路由跳转前设置
      sessionStorage.setItem('profileActiveTab', tab)
      
      // 如果当前已经在个人中心页面，使用事件来更新标签页
      if (this.$route.path === '/profile') {
        // 发送自定义事件给Profile组件来更新标签页
        window.dispatchEvent(new CustomEvent('profileTabChange', { detail: { tab } }))
      } else {
        // 如果不在个人中心页面，跳转到个人中心
        this.$router.push('/profile')
      }
    }
  }
}
</script>

<style scoped>
.header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
  display: flex;
  align-items: center;
}

.nav-menu {
  display: flex;
  list-style: none;
}

.nav-menu li {
  margin: 0 15px;
}

.nav-menu a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-menu a:hover, .nav-menu a.router-link-active {
  color: #2e7d32;
}

.user-actions {
  display: flex;
  align-items: center;
}

.logged-in-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cart-icon-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
  border: 1px solid #e0e0e0;
}

.cart-icon-wrapper:hover {
  background-color: #f5f5f5;
  border-color: #2e7d32;
}

.cart-icon {
  font-size: 20px;
  color: #666;
  margin-right: 8px;
}

.cart-icon-wrapper:hover .cart-icon {
  color: #2e7d32;
}

.cart-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.cart-badge {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
}
</style>