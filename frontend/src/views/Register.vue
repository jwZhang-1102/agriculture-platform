<template>
  <div class="register-container">
    <div class="register-form">
      <h2 class="form-title">用户注册</h2>
      
      <el-form 
        ref="registerForm" 
        :model="form" 
        :rules="rules" 
        label-width="100px"
        class="form-content"
      >
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名（3-20个字符）"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码（6-20个字符）"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input 
            v-model="form.phone" 
            placeholder="请输入手机号"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="form.email" 
            placeholder="请输入邮箱（可选）"
            clearable
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleRegister" 
            :loading="loading"
            class="register-btn"
          >
            注册
          </el-button>
          <el-button @click="goToLogin">
            返回登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    const validateUsername = async (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入用户名'))
      } else if (value.length < 3 || value.length > 20) {
        callback(new Error('用户名长度在 3 到 20 个字符'))
      } else {
        callback()
      }
    }
    
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else if (value.length < 6 || value.length > 20) {
        callback(new Error('密码长度在 6 到 20 个字符'))
      } else {
        if (this.form.confirmPassword) {
          this.$refs.registerForm.validateField('confirmPassword')
        }
        callback()
      }
    }
    
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }
    
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号格式'))
      } else {
        callback()
      }
    }
    
    const validateEmail = (rule, value, callback) => {
      if (value && !/^[\w.-]+@[\w.-]+\.\w+$/.test(value)) {
        callback(new Error('请输入正确的邮箱格式'))
      } else {
        callback()
      }
    }
    
    return {
      loading: false,
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        email: ''
      },
      rules: {
        username: [
          { validator: validateUsername, trigger: 'blur' }
        ],
        password: [
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        phone: [
          { validator: validatePhone, trigger: 'blur' }
        ],
        email: [
          { validator: validateEmail, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions(['register']),
    
    async handleRegister() {
      try {
        const valid = await this.$refs.registerForm.validate()
        if (!valid) return
        
        this.loading = true
        
        // 准备注册数据
        const registerData = {
          username: this.form.username,
          password: this.form.password,
          phone: this.form.phone,
          email: this.form.email || ''
        }
        
        await this.register(registerData)
        
        this.$message.success('注册成功，请登录')
        this.$router.push('/login')
        
      } catch (error) {
        this.$message.error(error.message || '注册失败')
      } finally {
        this.loading = false
      }
    },
    
    goToLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 450px;
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

.register-btn {
  width: 100%;
  margin-bottom: 10px;
}
</style>