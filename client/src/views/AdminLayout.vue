<template>
  <div class="admin-layout">
    <template v-if="isAuthenticated">
      <!-- 已登入狀態 -->
      <el-container>
        <el-aside width="240px" class="admin-aside">
          <div class="logo-container">
            <h1>iLive智慧家電</h1>
          </div>
          <el-menu
              :default-active="activeMenu"
              class="admin-menu"
              router
              background-color="#1e4c88"
              text-color="#fff"
              active-text-color="#409eff"
          >
            <el-menu-item index="/admin/dashboard">
              <el-icon><Odometer /></el-icon>
              <span>管理總覽</span>
            </el-menu-item>
            <el-menu-item index="/admin/products">
              <el-icon><Goods /></el-icon>
              <span>商品管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/orders">
              <el-icon><List /></el-icon>
              <span>訂單管理</span>
            </el-menu-item>
            <el-menu-item index="/admin/users">
              <el-icon><User /></el-icon>
              <span>會員管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>

        <el-container>
          <el-header class="admin-header">
            <div class="header-right">
              <el-dropdown @command="handleCommand">
                <span class="user-profile">
                  <el-icon><User /></el-icon>
                  管理員
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="logout">登出系統</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>

          <el-main class="admin-main">
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </template>

    <template v-else>
      <!-- 未登入狀態 -->
      <div class="admin-login-container">
        <div class="welcome-content">
          <el-icon class="welcome-icon" :size="64"><Platform /></el-icon>
          <h1>歡迎使用 iLive 後台管理系統</h1>
          <p>請先登入以進行操作</p>
          <el-button
              type="primary"
              size="large"
              @click="$router.push('/admin/login')"
          >
            管理員登入
          </el-button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import {ElMessage} from 'element-plus'
import {
  Odometer,
  Goods,
  List,
  User,
  Platform,
  Lock
} from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()
const route = useRoute()
const loginFormRef = ref(null)
const loading = ref(false)
const formData = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    {required: true, message: '請輸入管理員帳號', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '請輸入密碼', trigger: 'blur'}
  ]
}

const isAuthenticated = computed(() => {
  return !!store.state.auth.token && store.state.auth.user?.role === 'admin'
})
const activeMenu = computed(() => route.path)

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    const result = await store.dispatch('login', formData.value)

    if (result.user?.role === 'admin') {
      ElMessage.success('登入成功')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('您沒有管理員權限')
      await store.dispatch('logout')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登入失敗，請檢查帳號密碼')
  } finally {
    loading.value = false
  }
}

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout')
    router.push('/admin/login')
  }
}
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
}

/* 側邊欄樣式 */
.admin-aside {
  background-color: #1e4c88;
  height: 100vh;
  transition: all 0.3s ease;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #2760a5;
  transition: all 0.3s ease;
}

.logo-container h1 {
  font-size: 18px;
  margin: 0;
}

.admin-menu {
  border-right: none;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background-color: #2760a5;
}

.admin-menu :deep(.el-menu-item:hover) {
  background-color: #2760a5;
}

/* 頂部欄樣式 */
.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #1e4c88;
}

.user-profile .el-icon {
  margin-right: 8px;
}

/* 主內容區域 */
.admin-main {
  background-color: #f5f7fa;
  padding: 20px;
}

/* 未登入狀態樣式 */
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(45deg, #1e4c88 0%, #409eff 100%);
}

.welcome-content {
  text-align: center;
  color: #fff;
  padding: 40px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.welcome-icon {
  margin-bottom: 24px;
  opacity: 0.9;
}

.welcome-content h1 {
  font-size: 28px;
  margin-bottom: 16px;
  font-weight: 500;
}

.welcome-content p {
  font-size: 16px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.login-form {
  text-align: left;
  margin-top: 30px;
}

.login-form :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.login-form :deep(.el-input__inner) {
  color: #fff;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.login-form :deep(.el-input__prefix-inner) {
  color: rgba(255, 255, 255, 0.7);
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  background: #ffffff;
  color: #1e4c88;
  border: none;
}

.login-button:hover {
  background: #f5f7fa;
  color: #1e4c88;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .admin-aside {
    width: 64px !important;
  }

  .logo-container h1 {
    display: none;
  }

  .admin-menu :deep(.el-menu-item span) {
    display: none;
  }
}
</style>