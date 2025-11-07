import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: 'http://localhost:7000/api',
    timeout: 10000
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // 确保返回的错误信息是字符串而不是对象
        let errorMessage = '网络请求失败';
        if (error.response?.data) {
            if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        // 对于401错误（登录失败），不自动跳转，直接返回错误信息
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            // 只有在非登录页面才清除token并跳转
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(new Error(errorMessage));
    }
);

// API方法
export const authAPI = {
    // 用户注册
    register: (userData) => api.post('/auth/register', userData),
    
    // 用户登录
    login: (credentials) => api.post('/auth/login', credentials),
    
    // 退出登录
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

export const productAPI = {
    // 获取商品列表
    getProducts: (params) => api.get('/products', { params }),
    
    // 上架商品
    addProduct: (productData) => api.post('/products', productData),
    
    // 获取商品详情
    getProduct: (id) => api.get(`/products/${id}`)
};

export const cartAPI = {
    // 获取购物车
    getCart: () => api.get('/cart'),
    
    // 添加商品到购物车
    addToCart: (productId, quantity = 1) => api.post('/cart/add', { product_id: productId, quantity }),
    
    // 更新购物车商品数量
    updateCartItem: (itemId, quantity) => api.put('/cart/update', { cart_item_id: itemId, quantity }),
    
    // 从购物车删除商品
    removeFromCart: (itemId) => api.delete(`/cart/remove/${itemId}`),
    
    // 清空购物车
    clearCart: () => api.delete('/cart')
};

export const userAPI = {
    // 获取用户信息（支持通过用户名查询）
    getProfile: (username) => api.get('/user/profile', { params: { username } }),
    
    // 更新用户信息
    updateProfile: (profileData) => api.put('/user/profile', profileData),
    
    // 获取用户订单列表（支持通过用户名查询）
    getUserOrders: (username) => api.get('/user/orders', { params: { username } }),
    
    // 获取订单详情
    getOrderDetail: (orderId) => api.get(`/user/orders/${orderId}`)
};

export const orderAPI = {
    // 创建订单
    createOrder: (items) => api.post('/orders', { items }),
    
    // 获取订单列表
    getOrders: (params) => api.get('/orders', { params })
};

export const financingAPI = {
    // 提交融资申请
    applyFinancing: (applicationData) => api.post('/financing/apply', applicationData),
    
    // 获取融资匹配结果
    getFinancingMatch: (applicationId) => api.get(`/financing/match/${applicationId}`)
};

export const expertAPI = {
    // 获取专家列表
    getExperts: (params) => api.get('/experts', { params }),
    
    // 预约专家
    bookExpert: (bookingData) => api.post('/experts/book', bookingData)
};

export default api;