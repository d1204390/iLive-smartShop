// client/src/router/adminRoutes.js
export default [
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
        ]
    }
]