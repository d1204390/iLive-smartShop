<template>
  <div class="admin-layout">
    <!-- 側邊欄切換按鈕 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon><Fold v-if="sidebarOpen" /><Expand v-else /></el-icon>
    </div>

    <!-- 側邊欄 -->
    <div class="admin-sidebar" :class="{ 'sidebar-closed': !sidebarOpen }">
      <div class="admin-logo">
        <img src="/iLive.jpg" alt="iLive Logo" />
        <span v-show="sidebarOpen">iLive智慧家電</span>
      </div>

      <el-menu
          :default-active="activeMenu"
          class="admin-menu"
          :collapse="!sidebarOpen"
          router
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
        <el-menu-item index="/admin/sales-statistics">
          <el-icon><TrendCharts /></el-icon>
          <span>銷量統計</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主要內容區 -->
    <div class="admin-main" :class="{ 'main-expanded': !sidebarOpen }">
      <div class="admin-header">
        <div class="header-tools">
          <el-dropdown v-if="isAuthenticated" @command="handleCommand">
            <span class="admin-user">
              <el-avatar :size="32" src="/admin-avatar.jpg" />
              <span>管理員</span>
              <el-icon><CaretBottom /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">登出系統</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <div class="admin-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import {
  Odometer, Goods, List, User, TrendCharts,
  Fold, Expand, CaretBottom
} from '@element-plus/icons-vue'

// Store & Router
const store = useStore()
const router = useRouter()
const route = useRoute()

// State
const sidebarOpen = ref(true)

// Computed
const isAuthenticated = computed(() => !!store.state.auth.token)
const activeMenu = computed(() => route.path)

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    store.dispatch('logout')
    router.push('/admin/login')
  }
}
</script>

<style scoped>
/* 管理後台樣式 */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-sidebar {
  width: 240px;
  background: #001529;
  transition: all 0.3s;
  position: fixed;
  height: 100vh;
  z-index: 1000;
}

.sidebar-closed {
  width: 64px;
}

.admin-logo {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  overflow: hidden;
}

.admin-logo img {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  flex-shrink: 0;
}

.admin-main {
  flex: 1;
  margin-left: 240px;
  transition: all 0.3s;
  min-height: 100vh;
  background: #f0f2f5;
}

.main-expanded {
  margin-left: 64px;
}

.admin-header {
  height: 64px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.admin-content {
  padding: 24px;
  min-height: calc(100vh - 64px);
}

.sidebar-toggle {
  position: fixed;
  bottom: 24px;
  left: 200px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 1001;
}

.sidebar-closed + .admin-main .sidebar-toggle {
  left: 24px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.show {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0 !important;
  }

  .sidebar-toggle {
    display: none;
  }
}
</style>