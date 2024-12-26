// client/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'

const routes = [
    // 客戶端路由
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue')
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue')
    },
    {
        path: '/products',
        name: 'Products',
        component: () => import('../views/Products.vue')
    },
    {
        path: '/cart',
        name: 'Cart',
        component: () => import('../views/Cart.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/terms',
        name: 'Terms',
        component: () => import('../views/Terms.vue'),
    },
    {
        path: '/privacy-policy',
        name: 'PrivacyPolicy',
        component: () => import('../views/PrivacyPolicy.vue'),
    },
    {
        path: '/products/:id',
        name: 'ProductDetail',
        component:()=>import('../views/ProductDetail.vue'),
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/About.vue'),
    },
    {
        path: '/promotions',
        name: 'Promotions',
        component: () => import('../views/Promotions.vue'),
    },

    // 管理後台路由
    {
        path: '/admin',
        component: () => import('../views/AdminPortal.vue'),
        children: [
            {
                path: 'login',
                name: 'AdminLogin',
                component: () => import('../views/admin/Login.vue')
            },
            {
                path: 'dashboard',
                name: 'AdminDashboard',
                component: () => import('../views/admin/Dashboard.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'products',
                name: 'AdminProducts',
                component: () => import('../views/admin/Products.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'orders',
                name: 'AdminOrders',
                component: () => import('../views/admin/Orders.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'users',
                name: 'AdminUsers',
                component: () => import('../views/admin/Users.vue'),
                meta: { requiresAdmin: true }
            },
            {
                path: 'sales-statistics',
                name: 'SalesStatistics',
                component: () => import('../views/admin/SalesStatistics.vue'),
            },
            {
                path: '/checkout',
                name: 'Checkout',
                component: () => import('../views/Checkout.vue'),
                meta: { requiresAuth: true }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守衛
router.beforeEach((to, from, next) => {
    const isAuthenticated = store.state.auth.token
    const isAdmin = store.state.auth.user?.role === 'admin'

    // 檢查是否是管理後台路由
    if (to.path.startsWith('/admin')) {
        if (to.path === '/admin/login') {
            // 已登入的管理員不能再訪問登入頁
            if (isAuthenticated && isAdmin) {
                next('/admin/dashboard')
            } else {
                next()
            }
        } else if (!isAuthenticated || !isAdmin) {
            // 未登入或非管理員訪問管理頁面
            next('/admin/login')
        } else {
            next()
        }
    } else {
        // 一般用戶路由檢查
        if (to.meta.requiresAuth && !isAuthenticated) {
            next('/login')
        } else {
            next()
        }
    }
})

export default router