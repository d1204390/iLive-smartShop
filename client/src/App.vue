<template>
  <div class="app-layout">
    <!-- 管理後台 -->
    <template v-if="isAdminRoute">
      <AdminLayout />
    </template>

    <!-- 前台 -->
    <template v-else>
      <div class="client-layout">
        <!-- 前台 Header -->
        <header class="client-header" :class="{ 'header-shadow': isScrolled }">
          <div class="header-content">
            <!-- Logo區域 -->
            <router-link to="/" class="logo-area">
              <img src="/iLive.jpg" alt="iLive Logo" class="logo-image" />
              <div class="logo-text">
                <span class="text-primary">iLive</span>
                <span class="text-secondary">智慧家電</span>
              </div>
            </router-link>

            <!-- 導航選單 (desktop) -->
            <nav class="nav-desktop" v-show="!isMobile">
              <router-link
                  v-for="item in navItems"
                  :key="item.path"
                  :to="item.path"
                  class="nav-link"
                  @click="() => {
                  showMobileMenu = false
                  unlockScroll()
                  }"
              >
                {{ item.label }}
              </router-link>
            </nav>

            <!-- 用戶操作區 (desktop) -->
            <div class="user-actions" v-show="!isMobile">
              <template v-if="!isAuthenticated">
                <router-link to="/login">
                  <el-button text>登入</el-button>
                </router-link>
                <router-link to="/register">
                  <el-button type="primary">註冊</el-button>
                </router-link>
              </template>
              <template v-else>
                <router-link to="/cart" @click="() => {
                   showMobileMenu = false
                   unlockScroll()
                  }">
                  <el-button block>
                    <el-icon><ShoppingCart /></el-icon>
                    購物車
                    <el-badge :value="cartCount" />
                  </el-button>
                </router-link>
                <el-dropdown @command="handleCommand">
                  <el-button text>
                    <el-icon><User /></el-icon>
                    會員中心
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="profile">個人資料</el-dropdown-item>
                      <el-dropdown-item command="orders">訂單查詢</el-dropdown-item>
                      <el-dropdown-item command="logout">登出</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </div>

            <!-- 手機版選單按鈕 -->
            <div class="mobile-menu-btn" v-show="isMobile" @click="toggleMobileMenu">
              <el-icon :size="24">
                <Close v-if="showMobileMenu" />
                <Menu v-else />
              </el-icon>
            </div>
          </div>

          <!-- 手機版選單 -->
          <transition name="slide-fade">
            <div class="mobile-menu" v-show="isMobile && showMobileMenu">
              <nav class="nav-mobile">
                <router-link
                    v-for="item in navItems"
                    :key="item.path"
                    :to="item.path"
                    class="nav-link"
                    @click="showMobileMenu = false"
                >
                  {{ item.label }}
                </router-link>
              </nav>
              <div class="mobile-user-actions">
                <template v-if="!isAuthenticated">
                  <router-link to="/login" @click="showMobileMenu = false">
                    <el-button block>登入</el-button>
                  </router-link>
                  <router-link to="/register" @click="showMobileMenu = false">
                    <el-button type="primary" block>註冊</el-button>
                  </router-link>
                </template>
                <template v-else>
                  <router-link to="/cart" @click="() => {
                    showMobileMenu = false
                    unlockScroll()
                    }">
                    <el-button block>
                      <el-icon><ShoppingCart /></el-icon>
                      購物車
                      <el-badge :value="cartCount" />
                    </el-button>
                  </router-link>
                  <router-link to="/profile" @click="() => {
                            showMobileMenu = false
                            unlockScroll()
                    }">
                    <el-button block>個人資料</el-button>
                  </router-link>
                  <router-link to="/orders" @click="() => {
                   showMobileMenu = false
                   unlockScroll()
                   }">
                    <el-button block>訂單查詢</el-button>
                  </router-link>
                  <el-button @click="handleLogout" block>登出</el-button>
                </template>
              </div>
            </div>
          </transition>
        </header>

        <!-- 主要內容區 -->
        <main class="client-main">
          <router-view></router-view>
        </main>

        <!-- Footer -->
        <footer class="client-footer">
          <div class="footer-content">
            <div class="footer-grid">
              <!-- 公司簡介 -->
              <div class="footer-section">
                <h3>關於我們</h3>
                <p>iLive智慧家電購物網站提供優質的智能家電產品，讓您的生活更加便利舒適。</p>
              </div>

              <!-- 聯絡資訊 -->
              <div class="footer-section">
                <h3>聯絡資訊</h3>
                <ul>
                  <li><el-icon><Phone /></el-icon> (02) 1234-5678</li>
                  <li><el-icon><Message /></el-icon> service@ilive.com</li>
                  <li><el-icon><Location /></el-icon> 台中市西屯區文華路100號</li>
                </ul>
              </div>

              <!-- 服務時間 -->
              <div class="footer-section">
                <h3>服務時間</h3>
                <ul>
                  <li>週一至週五：09:00-18:00</li>
                  <li>週六：10:00-17:00</li>
                  <li>週日及國定假日休息</li>
                </ul>
              </div>

              <!-- 相關條款 -->
              <div class="footer-section">
                <h3>相關條款</h3>
                <ul>
                  <li><router-link to="/privacy-policy">隱私政策</router-link></li>
                  <li><router-link to="/terms">使用條款</router-link></li>
                </ul>
              </div>
            </div>

            <!-- 版權資訊 -->
            <div class="footer-bottom">
              <p>&copy; {{ currentYear }} iLive智慧家電 版權所有</p>
            </div>
          </div>
        </footer>
      </div>
    </template>

    <!-- 回到頂部按鈕 -->
    <transition name="fade">
      <div v-show="showBackToTop" class="back-to-top" @click="scrollToTop">
        <el-icon><Top /></el-icon>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import AdminLayout from './layouts/AdminLayout.vue'
import {
  User, ShoppingCart, Menu, Close, Phone, Message,
  Location, Top
} from '@element-plus/icons-vue'

// Store & Router
const store = useStore()
const router = useRouter()
const route = useRoute()

// State
const showMobileMenu = ref(false)
const isMobile = ref(false)
const isScrolled = ref(false)
const showBackToTop = ref(false)

// Computed
const isAuthenticated = computed(() => !!store.state.auth.token)
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const cartCount = computed(() => store.state.cart?.length || 0)
const currentYear = computed(() => new Date().getFullYear())

// 導航項目
const navItems = [
  { path: '/', label: '首頁' },
  { path: '/products', label: '商品列表' },
  { path: '/promotions', label: '優惠活動' }
]

// Methods
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      store.dispatch('logout')
      if (isAdminRoute.value) {
        router.push('/admin/login')
      } else {
        router.push('/login')
      }
      break
    case 'profile':
      router.push('/profile')
      break
    case 'orders':
      router.push('/orders')
      break
  }
}

const handleLogout = () => {
  store.dispatch('logout')
  router.push('/login')
  showMobileMenu.value = false
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Handlers
const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  isScrolled.value = scrollTop > 0
  showBackToTop.value = scrollTop > 300
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) {
    showMobileMenu.value = false
    document.body.style.overflow = ''
  }
}

const unlockScroll = () => {
  document.body.style.overflow = ''
}
// 監聽路由變化
watch(() => route.path, () => {
  // 路由變化時解除滾動鎖定
  unlockScroll()
  showMobileMenu.value = false
})

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* 基礎設置 */
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

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

/* 前台樣式 */
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.client-header {
  position: fixed; /* 改成 fixed */
  top: 0;
  left: 0;    /* 新增 */
  right: 0;   /* 新增 */
  width: 100%; /* 新增 */
  background: #fff;
  z-index: 1000;
  transition: box-shadow 0.3s;
}

.header-shadow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 72px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.text-primary {
  color: var(--el-color-primary);
  font-size: 24px;
  font-weight: bold;
  line-height: 1.2;
}

.text-secondary {
  color: #666;
  font-size: 14px;
}

.nav-desktop {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #333;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--el-color-primary);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-btn {
  cursor: pointer;
  padding: 8px;
}

.mobile-menu {
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.client-main {
  padding-top: 72px; /* header 的高度 */
  flex: 1;
  background: #f5f7fa;
  min-height: calc(100vh - 72px - 340px);
}

/* Footer 樣式 */
.client-footer {
  background: #001529;
  padding: 48px 0 24px;
  color: #fff;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 48px;
  margin-bottom: 48px;
}

.footer-section h3 {
  color: var(--el-color-primary);
  font-size: 18px;
  margin-bottom: 16px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-section li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.85);
}

.footer-section a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-section a:hover {
  color: var(--el-color-primary);
}

.social-links {
  display: flex;
  gap: 16px;
  margin-top: 16px;
}

.social-links a {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s;
}

.social-links a:hover {
  background: var(--el-color-primary);
}

.footer-bottom {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.65);
}

/* 回到頂部按鈕 */
.back-to-top {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.back-to-top:hover {
  background: var(--el-color-primary-light-3);
  transform: translateY(-2px);
}

/* 動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .header-content,
  .footer-content {
    max-width: 100%;
  }
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .header-content {
    height: 64px;
  }

  .logo-image {
    width: 32px;
    height: 32px;
  }

  .text-primary {
    font-size: 20px;
  }

  .text-secondary {
    font-size: 12px;
  }

  .nav-desktop,
  .user-actions {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .client-main {
    padding-top: 64px; /* 行動版 header 的高度 */
    min-height: calc(100vh - 64px - 340px);
  }

  /* 管理後台響應式 */
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

@media (max-width: 576px) {
  .header-content {
    padding: 0 16px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .footer-section {
    text-align: center;
  }

  .social-links {
    justify-content: center;
  }

  .footer-section li {
    justify-content: center;
  }

  .back-to-top {
    bottom: 16px;
    right: 16px;
  }
}
</style>