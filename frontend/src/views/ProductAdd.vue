<template>
  <div class="product-add container">
    <h2 class="section-title">上架商品</h2>
    
    <el-card class="add-card">
      <template #header>
        <div class="card-header">
          <h3>商品信息</h3>
          <span class="subtitle">请填写商品详细信息</span>
        </div>
      </template>
      
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input 
            v-model="productForm.name" 
            placeholder="请输入商品名称"
            style="width: 400px"
          />
        </el-form-item>
        
        <el-form-item label="商品描述" prop="description">
          <el-input 
            v-model="productForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入商品详细描述"
            style="width: 500px"
          />
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number 
            v-model="productForm.price" 
            :min="0.01" 
            :precision="2"
            placeholder="请输入价格"
            style="width: 200px"
          >
            <template #append>元</template>
          </el-input-number>
        </el-form-item>
        
        <el-form-item label="计量单位" prop="unit">
          <el-select v-model="productForm.unit" placeholder="请选择单位" style="width: 200px">
            <el-option label="斤" value="斤"></el-option>
            <el-option label="公斤" value="公斤"></el-option>
            <el-option label="个" value="个"></el-option>
            <el-option label="箱" value="箱"></el-option>
            <el-option label="袋" value="袋"></el-option>
            <el-option label="盒" value="盒"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="库存数量" prop="stock_quantity">
          <el-input-number 
            v-model="productForm.stock_quantity" 
            :min="0" 
            :precision="0"
            placeholder="请输入库存数量"
            style="width: 200px"
          />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="category_id">
          <el-select v-model="productForm.category_id" placeholder="请选择分类" style="width: 200px">
            <el-option 
              v-for="category in categories" 
              :key="category.id"
              :label="category.name" 
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="image_url">
          <el-upload
            class="upload-demo"
            action="/api/upload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :show-file-list="false"
          >
            <el-button type="primary">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg、png 格式，大小不超过 2MB
              </div>
            </template>
          </el-upload>
          
          <div v-if="productForm.image_url" class="image-preview">
            <img :src="productForm.image_url" alt="商品图片" class="preview-image" />
            <el-button 
              type="danger" 
              text 
              @click="productForm.image_url = ''"
              class="remove-image"
            >
              删除
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitProduct" :loading="loading">
            上架商品
          </el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button @click="$router.push('/market')">返回市场</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 我的商品列表 -->
    <div class="my-products">
      <h3>我的商品</h3>
      <el-table :data="myProducts" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="150"></el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="scope">
            ¥{{ scope.row.price }}
          </template>
        </el-table-column>
        <el-table-column prop="stock_quantity" label="库存" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '上架中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上架时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="editProduct(scope.row)">编辑</el-button>
            <el-button 
              link 
              :type="scope.row.status === 'active' ? 'warning' : 'success'"
              @click="toggleProductStatus(scope.row)"
            >
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="deleteProduct(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { productAPI } from '../api/index'

export default {
  name: 'ProductAdd',
  data() {
    return {
      loading: false,
      productForm: {
        name: '',
        description: '',
        price: 0,
        unit: '斤',
        stock_quantity: 0,
        category_id: '',
        image_url: ''
      },
      productRules: {
        name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '价格必须大于0', trigger: 'blur' }
        ],
        stock_quantity: [
          { required: true, message: '请输入库存数量', trigger: 'blur' },
          { type: 'number', min: 0, message: '库存不能为负数', trigger: 'blur' }
        ],
        category_id: [
          { required: true, message: '请选择商品分类', trigger: 'change' }
        ]
      },
      categories: [
        { id: 1, name: '水果' },
        { id: 2, name: '蔬菜' },
        { id: 3, name: '谷物' },
        { id: 4, name: '茶叶' }
      ],
      myProducts: []
    }
  },
  async mounted() {
    await this.loadMyProducts()
  },
  methods: {
    async submitProduct() {
      try {
        this.loading = true
        
        const valid = await this.$refs.productFormRef.validate()
        if (!valid) return
        
        const response = await productAPI.addProduct(this.productForm)
        
        this.$message.success('商品上架成功！')
        this.resetForm()
        await this.loadMyProducts()
        
      } catch (error) {
        console.error('上架商品失败:', error)
        this.$message.error('上架失败：' + error.message)
      } finally {
        this.loading = false
      }
    },
    
    resetForm() {
      this.$refs.productFormRef.resetFields()
      this.productForm = {
        name: '',
        description: '',
        price: 0,
        unit: '斤',
        stock_quantity: 0,
        category_id: '',
        image_url: ''
      }
    },
    
    async loadMyProducts() {
      try {
        // 这里应该调用API获取当前用户的商品
        // 暂时使用模拟数据
        this.myProducts = [
          {
            id: 1,
            name: '有机苹果',
            price: 12.80,
            stock_quantity: 50,
            status: 'active',
            created_at: '2024-01-15 10:30:00'
          },
          {
            id: 2,
            name: '新鲜番茄',
            price: 8.50,
            stock_quantity: 30,
            status: 'active',
            created_at: '2024-01-10 14:20:00'
          }
        ]
      } catch (error) {
        console.error('加载商品列表失败:', error)
      }
    },
    
    editProduct(product) {
      this.productForm = { ...product }
      this.$message.info('编辑商品：' + product.name)
    },
    
    async toggleProductStatus(product) {
      try {
        const newStatus = product.status === 'active' ? 'inactive' : 'active'
        // 这里应该调用API更新商品状态
        this.$message.success(`商品${newStatus === 'active' ? '上架' : '下架'}成功`)
        await this.loadMyProducts()
      } catch (error) {
        console.error('更新商品状态失败:', error)
        this.$message.error('操作失败')
      }
    },
    
    async deleteProduct(product) {
      try {
        await this.$confirm(`确定要删除商品"${product.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        // 这里应该调用API删除商品
        this.$message.success('商品删除成功')
        await this.loadMyProducts()
        
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除商品失败:', error)
          this.$message.error('删除失败')
        }
      }
    },
    
    handleUploadSuccess(response, file) {
      this.productForm.image_url = URL.createObjectURL(file.raw)
      this.$message.success('图片上传成功')
    },
    
    handleUploadError(error) {
      console.error('图片上传失败:', error)
      this.$message.error('图片上传失败')
    },
    
    beforeUpload(file) {
      const isJPGOrPNG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPGOrPNG) {
        this.$message.error('只能上传 JPG/PNG 格式的图片!')
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!')
      }

      return isJPGOrPNG && isLt2M
    }
  }
}
</script>

<style scoped>
.add-card {
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

.image-preview {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image {
  margin-left: 10px;
}

.my-products {
  margin-top: 40px;
}

.my-products h3 {
  color: #2e7d32;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .el-form-item {
    margin-bottom: 20px;
  }
  
  .el-input, .el-select, .el-input-number {
    width: 100% !important;
  }
}
</style>