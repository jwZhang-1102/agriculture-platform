<template>
  <div class="financing container">
    <h2 class="section-title">融资服务</h2>
    
    <!-- 融资申请表单 -->
    <div class="financing-apply">
      <el-card class="apply-card">
        <template #header>
          <div class="card-header">
            <h3>融资申请</h3>
            <span class="subtitle">快速匹配适合您的融资方案</span>
          </div>
        </template>
        
        <el-form :model="applyForm" :rules="applyRules" ref="applyFormRef" label-width="120px">
          <el-form-item label="融资金额" prop="amount">
            <el-input-number 
              v-model="applyForm.amount" 
              :min="10000" 
              :max="1000000" 
              :step="10000"
              placeholder="请输入融资金额"
              style="width: 300px"
            >
              <template #append>元</template>
            </el-input-number>
          </el-form-item>
          
          <el-form-item label="融资期限" prop="duration">
            <el-select v-model="applyForm.duration" placeholder="请选择融资期限" style="width: 300px">
              <el-option label="6个月" :value="6"></el-option>
              <el-option label="12个月" :value="12"></el-option>
              <el-option label="24个月" :value="24"></el-option>
              <el-option label="36个月" :value="36"></el-option>
              <el-option label="48个月" :value="48"></el-option>
              <el-option label="60个月" :value="60"></el-option>
            </el-select>
          </el-form-item>
          
          <el-form-item label="融资用途" prop="purpose">
            <el-input 
              v-model="applyForm.purpose" 
              type="textarea" 
              :rows="3" 
              placeholder="请详细描述融资用途，如：购买农业设备、扩大种植面积、技术升级等"
              style="width: 500px"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="详细描述" prop="description">
            <el-input 
              v-model="applyForm.description" 
              type="textarea" 
              :rows="4" 
              placeholder="请详细描述您的项目情况、预期收益、还款来源等"
              style="width: 500px"
            ></el-input>
          </el-form-item>
          
          <el-form-item label="抵押物" prop="collateral">
            <el-input 
              v-model="applyForm.collateral" 
              placeholder="如：农田使用权、农业设备、房产等"
              style="width: 500px"
            ></el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitApplication" :loading="loading">
              提交申请
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <!-- 融资匹配结果 -->
    <div v-if="matchResults.length > 0" class="match-results">
      <h3>融资匹配结果</h3>
      
      <div v-for="(match, index) in matchResults" :key="match.investor_id" class="match-card">
        <el-card>
          <template #header>
            <div class="match-header">
              <div class="match-info">
                <h4>{{ match.investor_name }} ({{ match.investor_type }})</h4>
                <span class="match-score">匹配度: {{ match.match_score }}%</span>
              </div>
              <el-tag :type="getMatchType(match.match_score)">
                {{ getMatchLevel(match.match_score) }}
              </el-tag>
            </div>
          </template>
          
          <div class="match-details">
            <div class="detail-item">
              <span class="label">匹配金额:</span>
              <span class="value">¥{{ match.total_matched_amount?.toLocaleString() || '待分配' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">利率:</span>
              <span class="value">{{ match.interest_rate }}%</span>
            </div>
            <div class="detail-item">
              <span class="label">还款方式:</span>
              <span class="value">{{ match.terms }}</span>
            </div>
            <div v-if="match.farmer_count" class="detail-item">
              <span class="label">匹配农户:</span>
              <span class="value">{{ match.farmer_count }} 户</span>
            </div>
            <div class="detail-item">
              <span class="label">联系方式:</span>
              <span class="value">{{ match.contact_info }}</span>
            </div>
          </div>
          
          <!-- 农户群体详情（银行大额放贷） -->
          <div v-if="match.match_type === 'bank_to_farmers' && match.farmer_details.length > 0" class="farmer-group">
            <el-collapse>
              <el-collapse-item title="农户群体详情">
                <div v-for="farmer in match.farmer_details" :key="farmer.farmer_application_id" class="farmer-item">
                  <div class="farmer-info">
                    <span class="farmer-name">{{ farmer.farmer_name }}</span>
                    <span class="farmer-amount">¥{{ farmer.matched_amount.toLocaleString() }}</span>
                    <span class="farmer-score">匹配度: {{ farmer.match_score }}%</span>
                    <span class="farmer-rate">利率: {{ farmer.interest_rate }}%</span>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <template #footer>
            <div class="match-actions">
              <el-button type="primary" @click="contactInvestor(match)">联系投资方</el-button>
              <el-button @click="viewDetails(match)">查看详情</el-button>
            </div>
          </template>
        </el-card>
      </div>
    </div>
    
    <!-- 融资申请历史 -->
    <div class="application-history">
      <h3>融资申请历史</h3>
      <el-table :data="applicationHistory" style="width: 100%">
        <el-table-column prop="id" label="申请ID" width="80"></el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="scope">
            ¥{{ scope.row.amount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="期限" width="100">
          <template #default="scope">
            {{ scope.row.duration }}个月
          </template>
        </el-table-column>
        <el-table-column prop="purpose" label="用途" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="申请时间" width="180"></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button link type="primary" @click="viewApplication(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { financingAPI } from '../api/index'

export default {
  name: 'Financing',
  data() {
    return {
      loading: false,
      applyForm: {
        amount: 100000,
        duration: 12,
        purpose: '',
        description: '',
        collateral: ''
      },
      applyRules: {
        amount: [
          { required: true, message: '请输入融资金额', trigger: 'blur' }
        ],
        duration: [
          { required: true, message: '请选择融资期限', trigger: 'change' }
        ],
        purpose: [
          { required: true, message: '请输入融资用途', trigger: 'blur' }
        ]
      },
      matchResults: [],
      applicationHistory: [],
      currentApplicationId: null
    }
  },
  async mounted() {
    await this.loadApplicationHistory()
  },
  methods: {
    async submitApplication() {
      try {
        this.loading = true
        
        const valid = await this.$refs.applyFormRef.validate()
        if (!valid) return
        
        const response = await financingAPI.applyFinancing(this.applyForm)
        
        this.$message.success('融资申请提交成功！匹配结果将在1-3个工作日内完成')
        
        // 保存申请ID用于查询匹配结果
        this.currentApplicationId = response.data.application_id
        
        // 重新加载申请历史
        await this.loadApplicationHistory()
        
        // 开始轮询匹配结果
        this.pollMatchResults()
        
      } catch (error) {
        console.error('提交融资申请失败:', error)
        this.$message.error('提交申请失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    async pollMatchResults() {
      if (!this.currentApplicationId) return
      
      try {
        const response = await financingAPI.getFinancingMatch(this.currentApplicationId)
        
        if (response.data.status === 'matched') {
          this.matchResults = response.data.matches
          this.$message.success('融资匹配完成！')
        } else {
          // 继续轮询
          setTimeout(() => {
            this.pollMatchResults()
          }, 5000)
        }
      } catch (error) {
        console.error('获取匹配结果失败:', error)
      }
    },
    
    async loadApplicationHistory() {
      try {
        // 这里应该调用API获取申请历史
        // 暂时使用模拟数据
        this.applicationHistory = [
          {
            id: 1,
            amount: 200000,
            duration: 24,
            purpose: '购买新型农业设备',
            status: 'matched',
            created_at: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            amount: 150000,
            duration: 12,
            purpose: '扩大种植面积',
            status: 'pending',
            created_at: '2024-01-10 14:20:00'
          }
        ]
      } catch (error) {
        console.error('加载申请历史失败:', error)
      }
    },
    
    resetForm() {
      this.$refs.applyFormRef.resetFields()
    },
    
    contactInvestor(match) {
      this.$message.info(`请联系：${match.contact_info}`)
    },
    
    viewDetails(match) {
      this.$message.info('查看匹配详情')
    },
    
    viewApplication(application) {
      this.$message.info(`查看申请ID: ${application.id}`)
    },
    
    getMatchType(score) {
      if (score >= 80) return 'success'
      if (score >= 60) return 'warning'
      return 'danger'
    },
    
    getMatchLevel(score) {
      if (score >= 80) return '高度匹配'
      if (score >= 60) return '一般匹配'
      return '低匹配度'
    },
    
    getStatusType(status) {
      const types = {
        'pending': 'info',
        'matched': 'success',
        'rejected': 'danger',
        'completed': ''
      }
      return types[status] || 'info'
    },
    
    getStatusText(status) {
      const texts = {
        'pending': '待匹配',
        'matched': '已匹配',
        'rejected': '已拒绝',
        'completed': '已完成'
      }
      return texts[status] || status
    }
  }
}
</script>

<style scoped>
.financing {
  max-width: 1200px;
  margin: 0 auto;
}

.apply-card {
  margin-bottom: 30px;
}

.card-header h3 {
  margin: 0;
  color: #2e7d32;
}

.subtitle {
  color: #666;
  font-size: 14px;
}

.match-results {
  margin: 30px 0;
}

.match-results h3 {
  color: #2e7d32;
  margin-bottom: 20px;
}

.match-card {
  margin-bottom: 20px;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-info h4 {
  margin: 0;
  color: #333;
}

.match-score {
  color: #666;
  font-size: 14px;
}

.match-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin: 15px 0;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: bold;
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  margin-top: 5px;
}

.farmer-group {
  margin-top: 15px;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.farmer-item {
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 10px;
}

.farmer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.match-actions {
  text-align: right;
}

.application-history {
  margin-top: 40px;
}

.application-history h3 {
  color: #2e7d32;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .match-details {
    grid-template-columns: 1fr;
  }
  
  .farmer-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>