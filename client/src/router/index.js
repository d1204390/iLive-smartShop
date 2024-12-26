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
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/forgot-password',
        name: 'ForgotPassword',
        component: () => import('../views/ForgotPassword.vue'),
        meta: { requiresGuest: true }
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
        component: () => import('../views/ProductDetail.vue'),
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
    {
        path: '/checkout',
        name: 'Checkout',
        component: () => import('../views/Checkout.vue'),
        meta: { requiresAuth: true }
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
                meta: { requiresAdmin: true }
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

    // 檢查是否訪問僅限訪客頁面（登入、註冊等）
    if (isAuthenticated) {
        // 如果是管理員，應導向管理後台首頁
        if (to.meta.requiresGuest && isAdmin) {
            next('/admin/dashboard')
            return
        }
        // 如果是一般用戶，導向首頁
        if (to.meta.requiresGuest) {
            next('/')
            return
        }
    }

    // 檢查是否是管理後台路由
    if (to.path.startsWith('/admin')) {
        // 一般用戶（非管理員）登入後訪問管理員登入頁面，重定向到首頁
        if (to.path === '/admin/login' && isAuthenticated && !isAdmin) {
            next('/')
            return
        }

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
        // 檢查是否訪問需要登入的頁面
        if (to.meta.requiresAuth && !isAuthenticated) {
            next('/login')
            return
        }

        // 其他情況放行
        next()
    }
})

export default router