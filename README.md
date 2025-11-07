# 农业平台 (Agriculture Platform)

一个现代化的农产品交易平台，包含前端Vue应用和后端Node.js API服务。

## 项目结构

```
agriculture-platform/
├── frontend/                 # 前端Vue应用
│   ├── src/
│   │   ├── api/              # API接口
│   │   ├── assets/           # 静态资源
│   │   ├── components/       # 组件
│   │   ├── router/           # 路由配置
│   │   ├── store/            # 状态管理
│   │   ├── views/            # 页面视图
│   │   ├── App.vue
│   │   └── main.js
│   ├── public/
│   ├── package.json
│   └── vue.config.js
├── backend/                   # 后端Node.js服务
│   ├── config/               # 配置文件
│   ├── controllers/          # 控制器
│   ├── middleware/           # 中间件
│   ├── models/               # 数据模型
│   ├── routes/               # 路由
│   ├── utils/                # 工具函数
│   ├── app.js
│   └── package.json
├── docs/                     # 文档
└── README.md
```

## 技术栈

### 前端
- Vue 3 + Vue Router + Vuex
- Element Plus UI组件库
- Axios HTTP客户端

### 后端
- Node.js + Express
- MySQL数据库
- JWT认证
- bcryptjs密码加密

## 快速开始

### 前端开发
```bash
cd frontend
npm install
npm run serve
```

### 后端开发
```bash
cd backend
npm install
npm run dev
```

## 功能特性

- 用户认证与授权
- 农产品展示与搜索
- 购物车功能
- 订单管理
- 用户个人中心

## 环境要求

- Node.js >= 14.0
- MySQL >= 5.7
- Vue CLI >= 5.0