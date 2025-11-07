<template>
  <div class="cart container">
    <h2 class="section-title">购物车</h2>
    
    <div v-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车为空">
        <el-button type="primary" @click="$router.push('/market')">去购物</el-button>
      </el-empty>
    </div>
    
    <div v-else class="cart-content">
      <div class="cart-items">
        <div v-for="item in cartItems" :key="item.id" class="cart-item">
          <div class="item-image">
            <img :src="item.image_url" :alt="item.name" />
          </div>
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p class="item-price">¥{{ item.price }} / {{ item.unit }}</p>
          </div>
          <div class="item-quantity">
            <el-button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</el-button>
            <span class="quantity">{{ item.quantity }}</span>
            <el-button @click="updateQuantity(item.id, item.quantity + 1)">+</el-button>
          </div>
          <div class="item-total">
            ¥{{ (item.price * item.quantity).toFixed(2) }}
          </div>
          <div class="item-actions">
            <el-button type="danger" text @click="removeItem(item.id)">删除</el-button>
          </div>
        </div>
      </div>
      
      <div class="cart-summary">
        <div class="summary-card">
          <h3>订单摘要</h3>
          <div class="summary-item">
            <span>商品数量:</span>
            <span>{{ totalItems }} 件</span>
          </div>
          <div class="summary-item">
            <span>商品总价:</span>
            <span>¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <div class="summary-item total">
            <span>应付总额:</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="large" @click="createOrder" :loading="loading" class="checkout-btn">
            立即结算
          </el-button>
          <el-button @click="clearCart" class="clear-btn">清空购物车</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { orderAPI } from '../api/index'

export default {
  name: 'Cart',
  data() {
    return {
      loading: false
    }
  },
  computed: {
    ...mapState(['cart']),
    ...mapGetters(['cartTotalItems', 'cartTotalPrice']),
    cartItems() {
      return this.cart || []
    },
    totalItems() {
      return this.cartTotalItems
    },
    totalPrice() {
      return this.cartTotalPrice
    }
  },
  async mounted() {
    await this.fetchCart()
  },
  methods: {
    ...mapActions(['fetchCart', 'updateCartQuantity', 'removeFromCart', 'clearCart']),
    
    async updateQuantity(itemId, newQuantity) {
      if (newQuantity < 1) return
      try {
        await this.updateCartQuantity({ itemId, quantity: newQuantity })
      } catch (error) {
        this.$message.error('更新数量失败')
      }
    },
    
    async removeItem(itemId) {
      try {
        await this.removeFromCart(itemId)
        this.$message.success('商品已删除')
      } catch (error) {
        this.$message.error('删除失败')
      }
    },
    
    async createOrder() {
      try {
        this.loading = true
        
        if (this.cartItems.length === 0) {
          this.$message.warning('购物车为空')
          return
        }
        
        const items = this.cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
        
        const response = await orderAPI.createOrder({ items })
        this.$message.success('订单创建成功')
        
        // 跳转到订单页面
        this.$router.push('/profile?tab=orders')
        
      } catch (error) {
        console.error('创建订单失败:', error)
        this.$message.error('创建订单失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 30px;
}

.cart-items {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 80px;
  gap: 15px;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.item-price {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quantity {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
}

.item-total {
  font-weight: bold;
  color: #2e7d32;
  font-size: 16px;
}

.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
  height: fit-content;
}

.summary-card h3 {
  margin: 0 0 20px 0;
  color: #2e7d32;
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.summary-item.total {
  border-bottom: none;
  font-weight: bold;
  font-size: 16px;
}

.total-price {
  color: #2e7d32;
  font-size: 18px;
}

.checkout-btn {
  width: 100%;
  margin-top: 20px;
  margin-bottom: 10px;
}

.clear-btn {
  width: 100%;
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
}

@media (max-width: 768px) {
  .cart-content {
    grid-template-columns: 1fr;
  }
  
  .cart-item {
    grid-template-columns: 60px 1fr;
    gap: 10px;
  }
  
  .item-quantity,
  .item-total,
  .item-actions {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 10px;
  }
}
</style>