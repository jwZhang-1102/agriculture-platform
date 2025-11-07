<template>
  <div class="expert container">
    <h2 class="section-title">专家助力</h2>
    
    <!-- 专家搜索和筛选 -->
    <div class="expert-tools">
      <div class="search-filter">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索专家姓名或专业领域..." 
          class="search-input"
          @input="searchExperts"
        >
          <template #append>
            <el-button icon="el-icon-search"></el-button>
          </template>
        </el-input>
        
        <el-select v-model="specialtyFilter" placeholder="专业领域" @change="filterExperts" class="filter-select">
          <el-option label="全部" value=""></el-option>
          <el-option label="果树种植" value="果树种植"></el-option>
          <el-option label="蔬菜种植" value="蔬菜种植"></el-option>
          <el-option label="农业机械" value="农业机械"></el-option>
          <el-option label="土壤肥料" value="土壤肥料"></el-option>
          <el-option label="病虫害防治" value="病虫害防治"></el-option>
          <el-option label="农业经济" value="农业经济"></el-option>
        </el-select>
        
        <el-button type="primary" @click="showBookingDialog = true" class="booking-btn">
          快速预约
        </el-button>
      </div>
    </div>
    
    <!-- 专家列表 -->
    <div class="expert-list">
      <div v-for="expert in filteredExperts" :key="expert.id" class="expert-card">
        <el-card>
          <template #header>
            <div class="expert-header">
              <div class="expert-avatar">
                <el-avatar :size="60" :src="expert.avatar_url">
                  {{ expert.name.charAt(0) }}
                </el-avatar>
              </div>
              <div class="expert-info">
                <h3>{{ expert.name }}</h3>
                <p class="expert-specialty">{{ expert.specialty }}</p>
                <div class="expert-rating">
                  <el-rate v-model="expert.rating" disabled show-score text-color="#ff9900" />
                </div>
              </div>
            </div>
          </template>
          
          <div class="expert-details">
            <div class="detail-item">
              <i class="el-icon-time"></i>
              <span>从业经验: {{ expert.experience }}</span>
            </div>
            <div class="detail-item">
              <i class="el-icon-coin"></i>
              <span>咨询费用: ¥{{ expert.hourly_rate }}/小时</span>
            </div>
            <div class="detail-item">
              <i class="el-icon-user"></i>
              <span>状态: 
                <el-tag :type="expert.available ? 'success' : 'info'">
                  {{ expert.available ? '可预约' : '忙碌中' }}
                </el-tag>
              </span>
            </div>
          </div>
          
          <template #footer>
            <div class="expert-actions">
              <el-button 
                type="primary" 
                @click="bookExpert(expert)"
                :disabled="!expert.available"
              >
                立即预约
              </el-button>
              <el-button @click="viewExpertDetail(expert)">查看详情</el-button>
            </div>
          </template>
        </el-card>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="totalExperts"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 预约对话框 -->
    <el-dialog
      v-model="showBookingDialog"
      title="专家预约"
      width="500px"
      :before-close="handleCloseBooking"
    >
      <el-form :model="bookingForm" :rules="bookingRules" ref="bookingFormRef" label-width="100px">
        <el-form-item label="选择专家" prop="expert_id">
          <el-select v-model="bookingForm.expert_id" placeholder="请选择专家" style="width: 100%">
            <el-option
              v-for="expert in availableExperts"
              :key="expert.id"
              :label="expert.name + ' - ' + expert.specialty"
              :value="expert.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="预约时间" prop="appointment_time">
          <el-date-picker
            v-model="bookingForm.appointment_time"
            type="datetime"
            placeholder="选择预约时间"
            style="width: 100%"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
          />
        </el-form-item>
        
        <el-form-item label="咨询类型" prop="consultation_type">
          <el-select v-model="bookingForm.consultation_type" placeholder="请选择咨询类型" style="width: 100%">
            <el-option label="电话咨询" value="电话咨询"></el-option>
            <el-option label="视频咨询" value="视频咨询"></el-option>
            <el-option label="现场指导" value="现场指导"></el-option>
            <el-option label="书面报告" value="书面报告"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="问题描述" prop="description">
          <el-input
            v-model="bookingForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述您需要咨询的问题..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCloseBooking">取消</el-button>
          <el-button type="primary" @click="submitBooking" :loading="bookingLoading">
            确认预约
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { expertAPI } from '../api/index'

export default {
  name: 'Expert',
  data() {
    return {
      searchKeyword: '',
      specialtyFilter: '',
      currentPage: 1,
      pageSize: 8,
      totalExperts: 0,
      experts: [],
      showBookingDialog: false,
      bookingLoading: false,
      bookingForm: {
        expert_id: '',
        appointment_time: '',
        consultation_type: '',
        description: ''
      },
      bookingRules: {
        expert_id: [
          { required: true, message: '请选择专家', trigger: 'change' }
        ],
        appointment_time: [
          { required: true, message: '请选择预约时间', trigger: 'change' }
        ],
        consultation_type: [
          { required: true, message: '请选择咨询类型', trigger: 'change' }
        ],
        description: [
          { required: true, message: '请输入问题描述', trigger: 'blur' }
        ]
      },
      shortcuts: [
        {
          text: '明天上午',
          value: () => {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            date.setHours(9, 0, 0, 0)
            return date
          }
        },
        {
          text: '明天下午',
          value: () => {
            const date = new Date()
            date.setTime(date.getTime() + 3600 * 1000 * 24)
            date.setHours(14, 0, 0, 0)
            return date
          }
        }
      ]
    }
  },
  computed: {
    filteredExperts() {
      let filtered = this.experts
      
      if (this.searchKeyword) {
        filtered = filtered.filter(expert => 
          expert.name.includes(this.searchKeyword) || 
          expert.specialty.includes(this.searchKeyword)
        )
      }
      
      if (this.specialtyFilter) {
        filtered = filtered.filter(expert => expert.specialty === this.specialtyFilter)
      }
      
      return filtered
    },
    
    availableExperts() {
      return this.experts.filter(expert => expert.available)
    }
  },
  async mounted() {
    await this.loadExperts()
  },
  methods: {
    async loadExperts() {
      try {
        const response = await expertAPI.getExperts({
          page: this.currentPage,
          limit: this.pageSize
        })
        
        if (response.success) {
          this.experts = response.data.experts
          this.totalExperts = response.data.total
        }
      } catch (error) {
        console.error('加载专家列表失败:', error)
        // 使用模拟数据
        this.experts = [
          {
            id: 1,
            name: '张教授',
            specialty: '果树种植',
            experience: '15年',
            rating: 4.8,
            hourly_rate: 200,
            available: true,
            avatar_url: ''
          },
          {
            id: 2,
            name: '李专家',
            specialty: '蔬菜种植',
            experience: '12年',
            rating: 4.6,
            hourly_rate: 180,
            available: true,
            avatar_url: ''
          },
          {
            id: 3,
            name: '王技术员',
            specialty: '农业机械',
            experience: '8年',
            rating: 4.5,
            hourly_rate: 150,
            available: false,
            avatar_url: ''
          },
          {
            id: 4,
            name: '赵顾问',
            specialty: '土壤肥料',
            experience: '10年',
            rating: 4.7,
            hourly_rate: 220,
            available: true,
            avatar_url: ''
          }
        ]
        this.totalExperts = this.experts.length
      }
    },
    
    searchExperts() {
      this.currentPage = 1
      this.loadExperts()
    },
    
    filterExperts() {
      this.currentPage = 1
      this.loadExperts()
    },
    
    handlePageChange(page) {
      this.currentPage = page
      this.loadExperts()
    },
    
    bookExpert(expert) {
      this.bookingForm.expert_id = expert.id
      this.bookingForm.consultation_type = '电话咨询'
      this.showBookingDialog = true
    },
    
    viewExpertDetail(expert) {
      this.$message.info(`查看专家 ${expert.name} 的详细信息`)
    },
    
    disabledDate(time) {
      return time.getTime() < Date.now() - 8.64e7
    },
    
    handleCloseBooking() {
      this.showBookingDialog = false
      this.$refs.bookingFormRef?.resetFields()
    },
    
    async submitBooking() {
      try {
        this.bookingLoading = true
        
        const valid = await this.$refs.bookingFormRef.validate()
        if (!valid) return
        
        const bookingData = {
          ...this.bookingForm,
          appointment_time: this.bookingForm.appointment_time.toISOString()
        }
        
        const response = await expertAPI.bookExpert(bookingData)
        
        this.$message.success('预约成功！专家将在预约时间前联系您')
        this.handleCloseBooking()
        
      } catch (error) {
        console.error('预约失败:', error)
        this.$message.error('预约失败：' + error.message)
      } finally {
        this.bookingLoading = false
      }
    }
  }
}
</script>

<style scoped>
.expert-tools {
  margin-bottom: 30px;
}

.search-filter {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 200px;
}

.booking-btn {
  margin-left: auto;
}

.expert-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.expert-card {
  transition: transform 0.3s;
}

.expert-card:hover {
  transform: translateY(-5px);
}

.expert-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.expert-info h3 {
  margin: 0 0 5px 0;
  color: #333;
}

.expert-specialty {
  color: #666;
  margin: 0 0 10px 0;
}

.expert-details {
  margin: 15px 0;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  color: #666;
}

.expert-actions {
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .search-filter {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input, .filter-select {
    width: 100%;
  }
  
  .booking-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .expert-list {
    grid-template-columns: 1fr;
  }
  
  .expert-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>