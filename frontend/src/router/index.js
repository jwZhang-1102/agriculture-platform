import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Financing from '../views/Financing.vue'
import Market from '../views/Market.vue'
import Expert from '../views/Expert.vue'
import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Cart from '../views/Cart.vue'
import ProductAdd from '../views/ProductAdd.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/financing',
        name: 'Financing',
        component: Financing
    },
    {
        path: '/market',
        name: 'Market',
        component: Market
    },
    {
        path: '/expert',
        name: 'Expert',
        component: Expert
    },
    {
        path: '/profile',
        name: 'Profile',
        component: Profile
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/cart',
        name: 'Cart',
        component: Cart
    },
    {
        path: '/product/add',
        name: 'ProductAdd',
        component: ProductAdd
    }
]

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
})

export default router