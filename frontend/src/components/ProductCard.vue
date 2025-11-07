<template>
  <div class="card product-card">
    <div class="card-img">
      <img :src="product.image_url || product.image" :alt="product.name" @error="handleImageError">
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ product.name }}</h3>
      <p class="card-desc">{{ product.description || product.desc }}</p>
      <div class="product-footer">
        <span class="price">¥{{ product.price }}/{{ product.unit }}</span>
        <el-button type="success" size="small" @click="handleBuy" :loading="loading">
          {{ loading ? '添加中...' : '加入购物车' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    async handleBuy() {
      if (!this.$store.getters.isLoggedIn) {
        this.$message.warning('请先登录')
        return
      }
      
      try {
        this.loading = true
        await this.addToCart({ productId: this.product.id, quantity: 1 })
        this.$message.success(`已添加 ${this.product.name} 到购物车`)
        this.$emit('buy', this.product)
      } catch (error) {
        console.error('添加购物车失败:', error)
        this.$message.error('添加购物车失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    
    handleImageError(event) {
      // 图片加载失败时使用默认图片
      event.target.src = 'https://via.placeholder.com/300x160?text=商品图片'
    }
  }
}
</script>

<style scoped>
.product-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-img {
  height: 160px;
  overflow: hidden;
}

.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 15px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 18px;
  margin-bottom: 10px;
  color: #2e7d32;
}

.card-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 15px;
  flex-grow: 1;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ff9800;
  font-weight: bold;
}
</style>