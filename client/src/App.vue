<template>
  <div class="app-container">
    <!-- 管理後台導航列 -->
    <template v-if="isAdminRoute">
      <el-container>
        <el-aside
            v-if="isAuthenticated"
            width="240px"
            class="admin-aside"
            :class="{ 'show': showMobileMenu }"
        >
          <div class="logo-container">
            <h1>iLive智慧家電</h1>
          </div>
          <el-menu
              :default-active="activeMenu"
              class="admin-menu"
              router
              background-color="#2c1810"
              text-color="#fff"
              active-text-color="#ff9900"
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
        </el-aside>

        <el-container>
          <el-header class="admin-header">
            <!-- 手機版選單切換按鈕 -->
            <div class="mobile-menu-toggle" @click="toggleMobileMenu">
              <el-icon size="24"><Menu /></el-icon>
            </div>

            <div class="header-right">
              <el-dropdown v-if="isAuthenticated" @command="handleCommand">
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

          <el-main>
            <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </template>

    <!-- 前台導航列 -->
    <template v-else>
      <el-container>
        <el-header class="client-header">
          <div class="header-container">
            <div class="logo">
              <router-link to="/" class="logo-link">
                <div class="logo-text-container">
                  <span class="logo-text">iLive</span>
                  <span class="logo-sub">智慧家電</span>
                </div>
              </router-link>
            </div>

            <!-- 手機版選單切換按鈕 -->
            <div class="mobile-menu-toggle" @click="toggleMobileMenu">
              <el-icon size="24"><Menu /></el-icon>
            </div>

            <el-menu
                mode="horizontal"
                :router="true"
                class="main-menu"
                :class="{ 'mobile-menu': showMobileMenu }"
                :ellipsis="false"
            >
              <el-menu-item index="/">首頁</el-menu-item>
              <el-menu-item index="/products">商品列表</el-menu-item>
              <el-menu-item index="/promotions">優惠活動</el-menu-item>
            </el-menu>

            <div class="user-actions" :class="{ 'mobile-user-actions': showMobileMenu }">
              <img src="/iLive.jpg" alt="iLive Logo" class="logo-image" />
              <template v-if="!isAuthenticated">
                <router-link to="/login">
                  <el-button text>登入</el-button>
                </router-link>
                <router-link to="/register">
                  <el-button type="primary">註冊</el-button>
                </router-link>
              </template>
              <template v-else>
                <router-link to="/cart">
                  <el-badge :value="cartCount" class="cart-badge">
                    <el-button text>
                      <el-icon><ShoppingCart /></el-icon>
                      購物車
                    </el-button>
                  </el-badge>
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
                      <el-dropdown-item v-if="isAuthenticated" divided command="logout">登出</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </div>
          </div>
        </el-header>

        <el-main>
          <router-view></router-view>
        </el-main>

        <el-footer height="340px" class="site-footer">
          <div class="footer-content">
            <div class="footer-sections">
              <div class="footer-section">
                <h3>關於我們</h3>
                <p>iLive智慧家電購物網站提供優質的智能家電產品，讓您的生活更加便利舒適。</p>
              </div>

              <div class="footer-section">
                <h3>聯絡資訊</h3>
                <p>電話：(02) 1234-5678</p>
                <p>信箱：service@ilive.com</p>
                <p>地址：台中市西屯區文華路100號</p>
              </div>

              <div class="footer-section">
                <h3>服務時間</h3>
                <p>週一至週五：09:00-18:00</p>
                <p>週六：10:00-17:00</p>
                <p>週日及國定假日休息</p>
              </div>

              <div class="footer-section">
                <h3>相關條款</h3>
                <ul>
                  <li><a href="/privacy-policy">隱私政策</a></li>
                  <li><a href="/terms">使用條款</a></li>
                </ul>
              </div>
            </div>

            <div class="footer-bottom">
              <p>&copy; 2024 iLive智慧家電 版權所有</p>
            </div>
          </div>
        </el-footer>
      </el-container>
    </template>

    <div
        v-if="showTopButton"
        class="top-button"
        @click="scrollToTop"
    >
      TOP
    </div>
  </div>
</template>



<script setup>
import { computed } from 'vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import {
  Odometer,
  Goods,
  List,
  User,
  ShoppingCart,
  TrendCharts,Menu
} from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()
const route = useRoute()
const showTopButton = ref(false)
const isMobileMenuOpen = ref(false)
const showMobileMenu = ref(false)



const isAuthenticated = computed(() => !!store.state.auth.token)
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const activeMenu = computed(() => route.path)
const cartCount = computed(() => store.state.cart?.length || 0)


// 添加切換行動選單的方法
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

// 監聽視窗寬度變化
const handleResize = () => {
  if (window.innerWidth > 768) {
    showMobileMenu.value = false
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      store.dispatch('logout'); // 執行登出操作
      if (isAdminRoute.value) {
        // 如果當前是管理員路由，登出後導引到管理員登入頁
        router.push('/admin/login');
      } else {
        // 如果是普通用戶，登出後導引到普通登入頁
        router.push('/login');
      }
      break;
    case 'profile':
      router.push('/profile'); // 導引到個人資料頁
      break;
    case 'orders':
      router.push('/orders'); // 導引到訂單查詢頁
      break;
  }
};

const handleScroll = () => {
  // 獲取頁面高度
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
  const clientHeight = document.documentElement.clientHeight || window.innerHeight

  // 如果捲動超過一半，顯示按鈕
  showTopButton.value = scrollTop > (scrollHeight - clientHeight) / 2
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
:root {
  --el-color-primary: #ff6b00;
  --el-color-primary-light-3: #ff9900;
  --el-color-primary-light-5: #ffb84d;
  --el-color-primary-light-7: #ffd699;
  --el-color-primary-light-9: #fff3e0;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
}

/* 管理後台樣式 */
.admin-aside {
  background-color: #2c1810;
  height: 100vh;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background-color: #2c1810;
}

.logo-container h1 {
  font-size: 18px;
  margin: 0;
}

.admin-menu {
  border-right: none;
}

.admin-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-profile .el-icon {
  margin-right: 8px;
}

/* 前台樣式 */
.client-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.logo-image {
  width: 40px;  /* 設定 logo 寬度 */
  height: 40px;  /* 設定 logo 高度 */
  object-fit: cover;  /* 確保圖片比例正確 */
  border-radius: 8px;  /* 添加圓角效果 */
}



.logo-text {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-right: 8px;
}

.logo-sub {
  font-size: 16px;
  color: #666;
}

.main-menu {
  border-bottom: none;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-badge {
  margin-right: 16px;
}

.el-main {
  padding: 20px;
  background-color: #fafafa;
}

/* 頁尾樣式 */
.site-footer {
  background-color: #000000;
  color: #fff;
  padding: 40px 0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-sections {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h3 {
  font-size: 18px;
  margin-bottom: 16px;
  color: var(--el-color-primary);
}

.footer-section p,
.footer-section li {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 8px;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-section a:hover {
  color: var(--el-color-primary);
}

.footer-bottom {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

header.el-header.client-header {
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2),
  0 15px 30px rgba(0, 0, 0, 0.1); /* 疊加兩層陰影 */
}



@media (max-width: 768px) {
  .footer-sections {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .footer-sections {
    grid-template-columns: 1fr;
  }
}
.top-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.top-button:hover {
  background-color: var(--el-color-primary-light-3);
}

.top-button:active {
  transform: scale(0.9);
}

/* 平板樣式 (768px ~ 1024px) */
@media screen and (max-width: 1024px) {
  .header-container {
    padding: 0 16px;
  }

  .logo-text {
    font-size: 24px;
  }

  .logo-sub {
    font-size: 14px;
  }

  .user-actions {
    gap: 8px;
  }
}

/* 手機樣式 (< 768px) */
@media screen and (max-width: 768px) {
  .header-container {
    position: relative;
    padding: 0 12px;
  }

  .mobile-menu-toggle {
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: auto;
    padding: 8px;
  }

  .main-menu {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #fff;
    flex-direction: column;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .main-menu.mobile-menu {
    display: flex;
  }

  .el-menu--horizontal > .el-menu-item {
    height: 50px;
    line-height: 50px;
    border-bottom: 1px solid #f0f0f0;
  }

  .user-actions {
    display: none;
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    padding: 8px 16px;
    background-color: #fff;
    border-top: 1px solid #f0f0f0;
  }

  .user-actions.mobile-user-actions {
    display: flex;
  }

  .cart-badge {
    margin-right: 0;
    margin-bottom: 8px;
  }

  /* 調整購物車和會員中心按鈕樣式 */
  .user-actions .el-button {
    width: 100%;
    justify-content: center;
    margin-bottom: 8px;
  }

  /* Footer 響應式調整 */
  .footer-sections {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 16px;
  }

  .footer-section {
    text-align: center;
  }

  /* 管理後台響應式調整 */
  .admin-aside {
    position: fixed;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .admin-aside.show {
    transform: translateX(0);
  }

  .el-container .el-main {
    margin-left: 0;
    width: 100%;
  }
}

/* 極小螢幕樣式 (< 480px) */
@media screen and (max-width: 480px) {
  .logo-text {
    font-size: 20px;
  }

  .logo-sub {
    display: none;
  }

  .logo-image {
    width: 32px;
    height: 32px;
  }

  .el-dropdown-menu {
    min-width: 120px;
  }
}

/* 隱藏桌機版選單開關按鈕 */
.mobile-menu-toggle {
  display: none;
}

@media screen and (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
  }
}

</style>