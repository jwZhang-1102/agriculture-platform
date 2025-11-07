<template>
  <div class="home">
    <!-- 轮播图 -->
    <div class="banner">
      <el-carousel height="400px">
        <el-carousel-item v-for="(banner, index) in banners" :key="index">
          <img class="banner-img" :src="banner.src" :alt="banner.alt">
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 核心服务 -->
    <div class="container">
      <h2 class="section-title">核心服务</h2>
      <div class="card-container">
        <ServiceCard
            v-for="service in services"
            :key="service.id"
            :service="service"
            @click="handleServiceClick(service)"
        />
      </div>

      <!-- 特色服务区域 -->
      <div class="feature-services">
        <h2 class="section-title">特色功能</h2>
        <div class="card-container">
          <div class="card">
            <div class="card-content">
              <h3 class="card-title">AI价格预测</h3>
              <p class="card-desc">基于大数据分析，预测农产品价格趋势，辅助决策</p>
            </div>
          </div>

          <div class="card">
            <div class="card-content">
              <h3 class="card-title">个性化规划</h3>
              <p class="card-desc">根据您的农场情况，提供个性化农业发展方案</p>
            </div>
          </div>

          <div class="card">
            <div class="card-content">
              <h3 class="card-title">社区交流</h3>
              <p class="card-desc">与同行交流经验，分享知识，共同成长</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门农产品 -->
      <h2 class="section-title">热门农产品</h2>
      <div class="card-container">
        <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
            @buy="handleBuyProduct"
        />
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <el-button type="primary" size="large" @click="$router.push('/market')">浏览更多商品</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ServiceCard from '@/components/ServiceCard.vue'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'Home',
  components: {
    ServiceCard,
    ProductCard
  },
  data() {
    return {
      banners: [
        {
          src: require('@/assets/image/homepage1.jpg'),
          alt: '现代农业'
        },
        {
          src: require('@/assets/image/homepage2.jpg'),
          alt: '农产品交易'
        },
        {
          src: require('@/assets/image/homepage3.jpg'),
          alt: '农业技术'
        }
      ]
    }
  },
  computed: {
    ...mapState(['services']),
    ...mapGetters(['featuredProducts'])
  },
  methods: {
    ...mapActions(['fetchProducts']),
    async mounted() {
      try {
        await this.fetchProducts()
      } catch (error) {
        console.error('获取商品数据失败:', error)
      }
    },
    handleServiceClick(service) {
      if (service.title === '便捷融资') {
        this.$router.push('/financing')
      } else if (service.title === '农产品交易') {
        this.$router.push('/market')
      } else if (service.title === '专家支持') {
        this.$router.push('/expert')
      }
    },
    handleBuyProduct(product) {
      // 这个事件现在由ProductCard组件处理，这里可以留空或添加额外逻辑
      console.log('商品购买事件:', product)
    }
  }
}
</script>

<style scoped>
.banner {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-services {
  background-color: #f5f9f5;
  padding: 40px 0;
  margin: 40px 0;
}
</style>