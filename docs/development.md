# 开发指南

## 项目结构说明

### 前端结构 (frontend/)
```
frontend/
├── src/
│   ├── api/           # API接口封装
│   ├── assets/       # 静态资源
│   ├── components/    # 可复用组件
│   ├── router/       # 路由配置
│   ├── store/        # 状态管理
│   ├── views/        # 页面组件
│   ├── App.vue       # 根组件
│   └── main.js       # 入口文件
├── public/           # 公共资源
├── package.json      # 依赖配置
└── vue.config.js     # Vue配置
```

### 后端结构 (backend/)
```
backend/
├── config/           # 配置文件
│   ├── database.js   # 数据库配置
│   └── init-db.sql   # 数据库初始化脚本
├── controllers/      # 控制器
├── middleware/       # 中间件
├── models/          # 数据模型
├── routes/          # 路由定义
├── utils/           # 工具函数
├── app.js           # 应用入口
└── package.json     # 依赖配置
```

## 开发流程

### 1. 环境准备
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖  
cd backend
npm install
```

### 2. 数据库配置
1. 确保MySQL服务运行
2. 修改 `backend/.env` 中的数据库配置
3. 执行数据库初始化脚本

### 3. 启动开发服务器
```bash
# 启动后端服务
cd backend
npm run dev

# 启动前端服务（新终端）
cd frontend
npm run serve
```

## API设计规范

### 响应格式
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

### 错误处理
- 400: 参数错误
- 401: 未授权
- 403: 禁止访问
- 404: 资源不存在
- 500: 服务器错误

## 代码规范

### 前端
- 使用Vue 3 Composition API
- 组件命名使用PascalCase
- 文件命名使用kebab-case

### 后端
- 使用async/await处理异步
- 错误处理统一使用try-catch
- 路由文件按功能模块划分

## 部署说明

### 生产环境配置
1. 修改环境变量为生产环境
2. 构建前端静态文件
3. 配置Nginx反向代理
4. 使用PM2管理Node.js进程

### 性能优化
- 前端代码压缩和代码分割
- 数据库查询优化和索引
- API响应缓存策略