<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="form-title">用户登录</h2>
      
      <el-form 
        ref="loginForm" 
        :model="form" 
        :rules="rules" 
        label-width="80px"
        class="form-content"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            :loading="loading"
            class="login-btn"
          >
            登录
          </el-button>
          <el-button @click="goToRegister">
            注册账号
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions(['login']),
    
    async handleLogin() {
      try {
        const valid = await this.$refs.loginForm.validate()
        if (!valid) return
        
        this.loading = true
        
        await this.login(this.form)
        
        this.$message.success('登录成功')
        this.$router.push('/')
        
      } catch (error) {
        this.$message.error(error.message || '登录失败')
      } finally {
        this.loading = false
      }
    },
    
    goToRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 400px;
}

.form-title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
}

.form-content {
  width: 100%;
}

.login-btn {
  width: 100%;
  margin-bottom: 10px;
}
</style>