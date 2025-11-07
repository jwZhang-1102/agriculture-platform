import { createStore } from 'vuex'
import { authAPI, productAPI, cartAPI } from '@/api'

export default createStore({
    state: {
        user: (() => {
            try {
                const userData = localStorage.getItem('user');
                return userData ? JSON.parse(userData) : null;
            } catch (error) {
                console.error('解析用户数据失败:', error);
                localStorage.removeItem('user'); // 清除无效数据
                return null;
            }
        })(),
        token: localStorage.getItem('token') || null,
        products: [],
        cart: [],
        services: [
            {
                id: 1,
                title: '便捷融资',
                desc: '简化贷款流程，智能匹配投资方',
                icon: 'el-icon-money'
            },
            {
                id: 2,
                title: '农产品交易',
                desc: '直连产销两端，减少中间环节',
                icon: 'el-icon-goods'
            },
            {
                id: 3,
                title: '专家支持',
                desc: '专业农业技术指导，解决生产难题',
                icon: 'el-icon-user-solid'
            }
        ]
    },
    mutations: {
        setUser(state, user) {
            state.user = user
            localStorage.setItem('user', JSON.stringify(user))
        },
        setToken(state, token) {
            state.token = token
            localStorage.setItem('token', token)
        },
        clearAuth(state) {
            state.user = null
            state.token = null
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
        setProducts(state, products) {
            state.products = products
        },
        setCart(state, cart) {
            state.cart = cart
        },
        addToCart(state, item) {
            const existingItem = state.cart.find(cartItem => cartItem.product_id === item.product_id)
            if (existingItem) {
                existingItem.quantity += item.quantity
            } else {
                state.cart.push(item)
            }
        },
        removeFromCart(state, itemId) {
            state.cart = state.cart.filter(item => item.id !== itemId)
        },
        updateCartQuantity(state, { itemId, quantity }) {
            const item = state.cart.find(item => item.id === itemId)
            if (item) {
                item.quantity = quantity
            }
        },
        clearCart(state) {
            state.cart = []
        }
    },
    actions: {
        // 用户注册
        async register({ commit }, userData) {
            try {
                const response = await authAPI.register(userData)
                return response
            } catch (error) {
                throw error
            }
        },
        
        // 用户登录
        async login({ commit }, credentials) {
            try {
                const response = await authAPI.login(credentials)
                console.log('登录API响应:', response)
                
                // 正确处理API返回的数据结构
                if (response && response.data) {
                    commit('setUser', response.data.user)
                    commit('setToken', response.data.token)
                    return response
                } else {
                    throw new Error('登录响应数据格式错误')
                }
            } catch (error) {
                console.error('登录失败:', error)
                // 确保错误信息是字符串而不是对象
                if (error instanceof Error) {
                    throw error
                } else if (typeof error === 'object') {
                    throw new Error(error.error || error.message || '登录失败')
                } else {
                    throw new Error(String(error))
                }
            }
        },
        
        // 用户退出
        logout({ commit }) {
            commit('clearAuth')
            authAPI.logout()
        },
        
        // 获取商品列表
        async fetchProducts({ commit }) {
            try {
                const response = await productAPI.getProducts()
                // 从响应中提取data字段
                const products = response.data?.products || []
                commit('setProducts', products)
                return products
            } catch (error) {
                throw error
            }
        },
        
        // 获取购物车
        async fetchCart({ commit }) {
            try {
                const response = await cartAPI.getCart()
                // 从响应中提取data字段
                const cart = response.data || []
                commit('setCart', cart)
                return cart
            } catch (error) {
                throw error
            }
        },
        
        // 添加商品到购物车
        async addToCart({ commit, dispatch }, { productId, quantity = 1 }) {
            try {
                await cartAPI.addToCart(productId, quantity)
                // 重新获取购物车数据
                await dispatch('fetchCart')
            } catch (error) {
                throw error
            }
        },
        
        // 更新购物车商品数量
        async updateCartQuantity({ commit, dispatch }, { itemId, quantity }) {
            try {
                await cartAPI.updateCartItem(itemId, quantity)
                commit('updateCartQuantity', { itemId, quantity })
            } catch (error) {
                throw error
            }
        },
        
        // 从购物车删除商品
        async removeFromCart({ commit, dispatch }, itemId) {
            try {
                await cartAPI.removeFromCart(itemId)
                commit('removeFromCart', itemId)
            } catch (error) {
                throw error
            }
        },
        
        // 清空购物车
        async clearCart({ commit }) {
            try {
                await cartAPI.clearCart()
                commit('clearCart')
            } catch (error) {
                throw error
            }
        }
    },
    getters: {
        isLoggedIn: state => !!state.user && !!state.token,
        featuredProducts: state => state.products.slice(0, 3),
        cartTotalItems: state => state.cart.reduce((total, item) => total + item.quantity, 0),
        cartTotalPrice: state => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
})