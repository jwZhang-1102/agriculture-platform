<template>
  <div class="market container">
    <h2 class="section-title">农产品交易市场</h2>

    <div class="market-tools">
      <div class="search-filter">
        <el-input placeholder="搜索农产品..." v-model="searchKeyword" class="search-input">
          <template #append>
            <el-button icon="el-icon-search"></el-button>
          </template>
        </el-input>

        <el-select v-model="categoryFilter" placeholder="分类筛选" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="水果" value="fruit"></el-option>
          <el-option label="蔬菜" value="vegetable"></el-option>
          <el-option label="粮食" value="grain"></el-option>
          <el-option label="茶叶" value="tea"></el-option>
        </el-select>
      </div>
    </div>

    <div class="product-list">
      <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @buy="handleBuyProduct"
      />
    </div>

    <div class="pagination">
      <el-pagination
          background
          layout="prev, pager, next"
          :total="100"
          :page-size="9"
          @current-change="handlePageChange"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import ProductCard from '@/components/ProductCard.vue'

export default {
  name: 'Market',
  components: {
    ProductCard
  },
  data() {
    return {
      searchKeyword: '',
      categoryFilter: '',
      currentPage: 1
    }
  },
  computed: {
    ...mapState(['products']),
    filteredProducts() {
      // 在实际应用中，这里应该调用API进行筛选和分页
      // 这里仅做前端模拟
      let filtered = this.products

      if (this.searchKeyword) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(this.searchKeyword.toLowerCase())
        )
      }

      return filtered
    }
  },
  methods: {
    ...mapActions(['fetchProducts']),
    handleBuyProduct(product) {
      // 这个事件现在由ProductCard组件处理，这里可以留空或添加额外逻辑
      console.log('商品购买事件:', product)
    },
    handlePageChange(page) {
      this.currentPage = page
      // 在实际应用中，这里应该调用API获取对应页面的数据
    }
  },
  async mounted() {
    try {
      await this.fetchProducts()
    } catch (error) {
      console.error('获取商品数据失败:', error)
    }
  }
}
</script>

<style scoped>
.market-tools {
  margin-bottom: 30px;
}

.search-filter {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 150px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.pagination {
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input, .filter-select {
    width: 100%;
  }
}
</style>