<template>
  <div class="card service-card">
    <div class="card-content">
      <div class="service-icon">
        <i :class="service.icon"></i>
      </div>
      <h3 class="card-title">{{ service.title }}</h3>
      <p class="card-desc">{{ service.desc }}</p>
      <el-button type="primary" plain @click="handleClick">了解更多</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServiceCard',
  props: {
    service: {
      type: Object,
      required: true
    }
  },
  methods: {
    handleClick() {
      this.$emit('click', this.service)
    }
  }
}
</script>

<style scoped>
.service-card {
  text-align: center;
  padding: 20px;
}

.service-icon {
  font-size: 40px;
  color: #7cb342;
  margin-bottom: 15px;
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
}
</style>