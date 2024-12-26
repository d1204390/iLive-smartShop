import { createStore } from 'vuex'
import axios from 'axios'

// 安全的 JSON parse 函數
const safeJSONParse = (data, defaultValue) => {
    if (!data) return defaultValue;
    try {
        return JSON.parse(data);
    } catch (e) {
        return defaultValue;
    }
};

const store = createStore({
    state: {
        auth: {
            token: localStorage.getItem('token') || null,
            user: safeJSONParse(localStorage.getItem('user'), null)
        },
        cart: safeJSONParse(localStorage.getItem('cart'), []),
        products: [],
        orders: []
    },
    mutations: {
        SET_AUTH(state, { token, user }) {
            state.auth.token = token
            state.auth.user = user
            if (token && user) {
                localStorage.setItem('token', token)
                localStorage.setItem('user', JSON.stringify(user))
            } else {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
            }
        },
        CLEAR_AUTH(state) {
            state.auth.token = null
            state.auth.user = null
            localStorage.removeItem('token')
            localStorage.removeItem('user')
        },
        SET_CART(state, products) {
            state.cart = products
            localStorage.setItem('cart', JSON.stringify(products))
        },
        SET_PRODUCTS(state, products) {
            state.products = products
        },
        SET_ORDERS(state, orders) {
            state.orders = orders
        },
        ADD_TO_CART(state, { product, quantity }) {
            const existingItem = state.cart.find(item => item.product._id === product._id)

            if (existingItem) {
                // 檢查是否超過庫存
                if (existingItem.quantity + quantity > product.stock) {
                    throw new Error(`超過商品庫存上限 ${product.stock} 件`)
                }
                existingItem.quantity += quantity
            } else {
                // 檢查新增數量是否超過庫存
                if (quantity > product.stock) {
                    throw new Error(`超過商品庫存上限 ${product.stock} 件`)
                }
                state.cart.push({ product, quantity })
            }
            localStorage.setItem('cart', JSON.stringify(state.cart))
        },
        REMOVE_FROM_CART(state, productId) {
            state.cart = state.cart.filter(item => item.product._id !== productId)
            localStorage.setItem('cart', JSON.stringify(state.cart))
        },
        UPDATE_CART_QUANTITY(state, { productId, quantity }) {
            const item = state.cart.find(item => item.product._id === productId)
            if (item) {
                // 檢查更新數量是否超過庫存
                if (quantity > item.product.stock) {
                    throw new Error(`超過商品庫存上限 ${item.product.stock} 件`)
                }
                item.quantity = quantity
                localStorage.setItem('cart', JSON.stringify(state.cart))
            }
        },
        CLEAR_CART(state) {
            state.cart = []
            localStorage.removeItem('cart')
        }
    },
    actions: {
        // 登入
        async login({ commit }, credentials) {
            try {
                const { data } = await axios.post('http://localhost:3000/api/auth/login', credentials)
                commit('SET_AUTH', { token: data.token, user: data.user })
                return data
            } catch (error) {
                throw error.response?.data || error
            }
        },
        // 註冊
        async register({ commit }, credentials) {
            try {
                const { data } = await axios.post('http://localhost:3000/api/auth/register', credentials)
                commit('SET_AUTH', { token: data.token, user: data.user })
                return data
            } catch (error) {
                throw error.response?.data || error
            }
        },
        // 登出
        logout({ commit }) {
            commit('CLEAR_AUTH')
            commit('CLEAR_CART')
        },
        // 獲取產品列表
        async fetchProducts({ commit }) {
            try {
                const { data } = await axios.get('http://localhost:3000/api/products')
                const products = Array.isArray(data) ? data : (data.data || [])
                commit('SET_PRODUCTS', products)
                return products
            } catch (error) {
                throw error.response?.data || { message: '獲取商品失敗' }
            }
        },
        // 獲取訂單列表
        async fetchOrders({ commit, state }) {
            try {
                const response = await axios.get('http://localhost:3000/api/orders/my-orders', {
                    headers: { Authorization: `Bearer ${state.auth.token}` }
                });
                const orders = response.data.success ? response.data.data : response.data;
                commit('SET_ORDERS', orders);
                return orders;
            } catch (error) {
                throw error.response?.data || { message: '獲取訂單失敗' };
            }
        },
        addToCart({ commit }, { product, quantity = 1 }) {
            commit('ADD_TO_CART', { product, quantity })
        },
        removeFromCart({ commit }, productId) {
            commit('REMOVE_FROM_CART', productId)
        },
        updateCartQuantity({ commit }, { productId, quantity }) {
            commit('UPDATE_CART_QUANTITY', { productId, quantity })
        },
        clearCart({ commit }) {
            commit('CLEAR_CART')
        },
        async cancelOrder({ state }, orderId) {
            try {
                await axios.put(`http://localhost:3000/api/orders/${orderId}/cancel`, null, {
                    headers: { Authorization: `Bearer ${state.auth.token}` }
                })
            } catch (error) {
                throw error.response?.data || error
            }
        },
        // 創建訂單
        async createOrder({ state, commit }, orderData) {
            try {
                const response = await axios.post('http://localhost:3000/api/orders', orderData, {
                    headers: { Authorization: `Bearer ${state.auth.token}` }
                });

                if (response.data.success === false) {
                    throw new Error(response.data.message);
                }

                return response.data;
            } catch (error) {
                throw error.response?.data || { message: '創建訂單失敗' };
            }
        }
    }
})

// Axios 請求攔截器
axios.interceptors.request.use(config => {
    const token = store.state.auth.token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default store