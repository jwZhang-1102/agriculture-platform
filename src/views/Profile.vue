<template>
  <div class="profile container">
    <h2 class="section-title">个人中心</h2>

    <div class="profile-content">
      <div class="profile-sidebar">
        <div class="user-info">
          <el-avatar :size="100" :src="(user && user.avatar) || ''" style="background-color: #67C23A;">
            <span style="font-size: 36px; color: white;">{{ (userForm.name || '用户').charAt(0).toUpperCase() }}</span>
          </el-avatar>
          <h3>{{ userForm.name || '用户' }}</h3>
          <p class="user-id">用户ID: {{ (user && user.id) || '未知' }}</p>
        </div>

        <el-menu :default-active="getActiveIndex()" class="profile-menu">
          <el-menu-item index="1" @click="setActiveTab('info')">
            <i class="el-icon-user"></i>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="2" @click="setActiveTab('orders')">
            <i class="el-icon-document"></i>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="3" @click="setActiveTab('financing')">
            <i class="el-icon-money"></i>
            <span>融资管理</span>
          </el-menu-item>
          <el-menu-item index="4" @click="setActiveTab('settings')">
            <i class="el-icon-setting"></i>
            <span>账户设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="profile-main">
        <div v-if="activeTab === 'info'" class="tab-content">
          <h3>个人信息</h3>
          <el-form :model="userForm" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userForm.name" disabled></el-input>
              <span class="form-tip">用户名不可修改</span>
            </el-form-item>
            <el-form-item label="用户ID">
              <el-input :value="user?.id || '未知'" disabled></el-input>
              <span class="form-tip">系统自动生成</span>
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userForm.phone" disabled></el-input>
              <span class="form-tip">手机号不可修改</span>
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userForm.email" placeholder="请输入邮箱地址" type="email"></el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="updateUserInfo" :loading="loading">保存修改</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="activeTab === 'orders'" class="tab-content">
          <h3>我的订单</h3>
          <el-table :data="orders" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="订单号" width="180"></el-table-column>
            <el-table-column prop="product" label="商品" width="180"></el-table-column>
            <el-table-column prop="amount" label="金额"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="text" @click="viewOrderDetail(scope.row.id)">查看详情</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div v-if="orders.length === 0" class="empty-state">
            <el-empty description="暂无订单记录"></el-empty>
          </div>
        </div>

        <div v-else-if="activeTab === 'financing'" class="tab-content">
          <h3>融资管理</h3>
          <div class="financing-status">
            <el-card class="status-card">
              <div class="status-value">¥{{ financingData.totalFinancing.toLocaleString() }}</div>
              <div class="status-label">已获融资</div>
            </el-card>
            <el-card class="status-card">
              <div class="status-value">{{ financingData.activeProjects }}</div>
              <div class="status-label">进行中项目</div>
            </el-card>
            <el-card class="status-card">
              <div class="status-value">{{ financingData.completedProjects }}</div>
              <div class="status-label">已完成项目</div>
            </el-card>
          </div>

          <h4>融资申请记录</h4>
          <el-table :data="financingData.applications" style="width: 100%">
            <el-table-column prop="id" label="申请编号"></el-table-column>
            <el-table-column prop="type" label="类型"></el-table-column>
            <el-table-column prop="amount" label="金额"></el-table-column>
            <el-table-column prop="date" label="申请日期"></el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div v-else-if="activeTab === 'settings'" class="tab-content">
          <h3>账户设置</h3>
          <el-form label-width="100px">
            <el-form-item label="修改密码">
              <el-input type="password" placeholder="新密码" style="width: 200px;"></el-input>
              <el-button type="primary" style="margin-left: 10px;">确认修改</el-button>
            </el-form-item>
            <el-form-item label="消息通知">
              <el-switch v-model="notifications"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="logout">退出登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { userAPI } from '../api/index'

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'info',
      userForm: {
        name: '',
        phone: '',
        email: '',
        address: ''
      },
      orders: [],
      financingData: {
        totalFinancing: 0,
        activeProjects: 0,
        completedProjects: 0,
        applications: []
      },
      notifications: true,
      loading: false
    }
  },
  computed: {
    ...mapState(['user'])
  },
  async mounted() {
    // 首先检查sessionStorage中的标签页信息
    const savedTab = sessionStorage.getItem('profileActiveTab')
    if (savedTab && ['info', 'orders', 'financing', 'settings'].includes(savedTab)) {
      this.activeTab = savedTab
      sessionStorage.removeItem('profileActiveTab')
    }
    
    // 监听自定义事件，用于在个人中心页面内切换标签页
    window.addEventListener('profileTabChange', this.handleProfileTabChange)
    
    await this.loadUserProfile()
    await this.loadUserOrders()
    await this.loadFinancingData()
  },
  
  watch: {
    '$route'(to, from) {
      // 当路由变化时，检查路由参数中的标签页信息
      this.checkRouteTab()
    }
  },
  
  beforeUnmount() {
    // 清理事件监听器
    window.removeEventListener('profileTabChange', this.handleProfileTabChange)
  },
  methods: {
    ...mapActions(['logout']),
    async loadUserProfile() {
      try {
        this.loading = true
        console.log('开始加载用户信息...')
        console.log('当前Vuex用户信息:', this.user)
        
        // 首先尝试从API获取用户信息
        const response = await userAPI.getProfile()
        console.log('API返回的用户信息:', response)
        
        // 直接使用API返回的数据
        if (response && response.data) {
          this.userForm.name = response.data.username || '用户'
          this.userForm.phone = response.data.phone || ''
          this.userForm.email = response.data.email || ''
          console.log('使用API数据填充表单:', this.userForm)
        } else {
          // 如果API没有返回数据，使用Vuex中的用户信息
          if (this.user) {
            this.userForm.name = this.user.username || '用户'
            this.userForm.phone = this.user.phone || ''
            this.userForm.email = this.user.email || ''
            console.log('使用Vuex数据填充表单:', this.userForm)
          }
        }
        
        // 如果仍然没有数据，设置默认值
        if (!this.userForm.name) {
          this.userForm.name = '用户'
        }
        if (!this.userForm.phone) {
          this.userForm.phone = ''
        }
        if (!this.userForm.email) {
          this.userForm.email = ''
        }
        
        console.log('最终表单数据:', this.userForm)
        
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 如果API调用失败，使用Vuex中的用户信息
        if (this.user) {
          this.userForm.name = this.user.username || '用户'
          this.userForm.phone = this.user.phone || ''
          this.userForm.email = this.user.email || ''
        } else {
          // 如果Vuex也没有数据，设置默认值
          this.userForm.name = '用户'
          this.userForm.phone = ''
          this.userForm.email = ''
        }
        this.$message.error('获取用户信息失败')
      } finally {
        this.loading = false
      }
    },
    async loadUserOrders() {
      try {
        const response = await userAPI.getUserOrders()
        console.log('API返回的订单数据:', response)
        
        if (response && response.data) {
          this.orders = response.data.map(order => ({
            id: order.order_number,
            product: `${order.item_count}件商品`,
            amount: `¥${order.total_amount}`,
            status: this.getOrderStatusText(order.status),
            originalStatus: order.status
          }))
        } else {
          this.orders = []
        }
        console.log('处理后的订单数据:', this.orders)
      } catch (error) {
        console.error('获取订单列表失败:', error)
        this.$message.error('获取订单列表失败')
      }
    },
    async updateUserInfo() {
      try {
        // 表单验证 - 只验证邮箱
        if (this.userForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.userForm.email)) {
          this.$message.error('请输入正确的邮箱地址')
          return
        }
        
        this.loading = true
        // 只更新邮箱，手机号不可修改
        await userAPI.updateProfile({
          email: this.userForm.email
        })
        
        // 更新Vuex中的用户信息
        if (this.user) {
          this.$store.commit('setUser', Object.assign({}, this.user, {
            email: this.userForm.email
          }))
        }
        
        this.$message.success('个人信息已更新')
      } catch (error) {
        console.error('更新用户信息失败:', error)
        this.$message.error('更新用户信息失败')
      } finally {
        this.loading = false
      }
    },
    
    // 重置表单
    resetForm() {
      if (this.user) {
        this.userForm.name = this.user.username || '用户'
        this.userForm.phone = this.user.phone || ''
        this.userForm.email = this.user.email || ''
      }
      this.$message.info('表单已重置')
    },
    async loadFinancingData() {
      try {
        // 模拟从数据库获取融资数据
        // 在实际应用中，这里应该调用API接口获取真实数据
        this.financingData = {
          totalFinancing: 50000,
          activeProjects: 2,
          completedProjects: 5,
          applications: [
            { id: 'FIN2023001', type: '信用贷款', amount: '¥20,000', date: '2023-05-10', status: '已通过' },
            { id: 'FIN2023002', type: '农产品预售融资', amount: '¥30,000', date: '2023-06-15', status: '审核中' }
          ]
        }
      } catch (error) {
        console.error('获取融资数据失败:', error)
        this.$message.error('获取融资数据失败')
      }
    },
    getOrderStatusText(status) {
      const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '配送中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    getStatusType(status) {
      const types = {
        '已通过': 'success',
        '审核中': 'warning',
        '已拒绝': 'danger',
        '待付款': 'warning',
        '已付款': 'success',
        '配送中': 'info',
        '已完成': 'success',
        '已取消': 'danger'
      }
      return types[status] || ''
    },
    async viewOrderDetail(orderId) {
      try {
        const response = await userAPI.getOrderDetail(orderId)
        this.$message.success(`查看订单详情: ${orderId}`)
        console.log('订单详情:', response)
        // 这里可以打开一个弹窗显示订单详情
      } catch (error) {
        console.error('获取订单详情失败:', error)
        this.$message.error('获取订单详情失败')
      }
    },
    
    handleProfileTabChange(event) {
      const { tab } = event.detail
      this.setActiveTab(tab)
    },
    
    checkRouteTab() {
      // 检查路由参数中的标签页信息
      const routeTab = this.$route.query.tab
      if (routeTab && ['info', 'orders', 'financing', 'settings'].includes(routeTab)) {
        this.setActiveTab(routeTab)
        // 清除路由参数，避免重复触发
        this.$router.replace({ ...this.$route, query: {} })
      }
    },
    
    setActiveTab(tab) {
      this.activeTab = tab
      // 强制更新菜单的高亮状态
      this.$nextTick(() => {
        // 这里可以添加额外的逻辑来确保菜单高亮状态正确
      })
    },
    
    getActiveIndex() {
      const tabToIndex = {
        'info': '1',
        'orders': '2', 
        'financing': '3',
        'settings': '4'
      }
      return tabToIndex[this.activeTab] || '1'
    },
    goToMarket() {
      this.$router.push('/market')
    },
    goToFinancing() {
      this.$router.push('/financing')
    }
  }
}
</script>

<style scoped>
.profile-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
}

.profile-sidebar {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.user-info {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.user-info h3 {
  margin: 15px 0 5px;
  color: #2e7d32;
}

.profile-menu {
  border: none;
}

.profile-main {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
}

.tab-content h3 {
  margin-bottom: 20px;
  color: #2e7d32;
}

.financing-status {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.status-card {
  text-align: center;
}

.status-value {
  font-size: 24px;
  font-weight: bold;
  color: #2e7d32;
}

.status-label {
  color: #666;
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .financing-status {
    grid-template-columns: 1fr;
  }
}
</style>