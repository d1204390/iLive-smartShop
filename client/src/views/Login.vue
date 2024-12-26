<template>
  <div class="login-page">
    <!-- 左側形象區 -->
    <div class="login-banner">
      <div class="banner-content">
        <h1 class="banner-title">
          <span class="text-primary">iLive</span>
          <span class="text-white">智慧家電</span>
        </h1>
        <p class="banner-text">打造智能生活，體驗科技帶來的便利</p>
      </div>
    </div>

    <!-- 右側登入區 -->
    <div class="login-form-container">
      <div class="form-wrapper">
        <h2 class="page-title">會員登入</h2>

        <el-form
            ref="loginForm"
            :model="formData"
            :rules="rules"
            @submit.prevent="handleSubmit"
            label-position="top"
            size="large"
            class="login-form"
        >
          <!-- 電子郵件輸入框 -->
          <el-form-item prop="email">
            <template #label>
              <span class="input-label">電子郵件</span>
            </template>
            <el-autocomplete
                v-model="formData.email"
                :fetch-suggestions="querySearch"
                placeholder="請輸入電子郵件"
                :trigger-on-focus="false"
                clearable
                @select="handleSelect"
                class="w-full"
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-autocomplete>
          </el-form-item>

          <!-- 密碼輸入框 -->
          <el-form-item prop="password">
            <template #label>
              <span class="input-label">密碼</span>
            </template>
            <el-input
                v-model="formData.password"
                type="password"
                placeholder="請輸入密碼"
                show-password
                :prefix-icon="Lock"
            />
          </el-form-item>

          <!-- 記住我和忘記密碼 -->
          <div class="form-actions">
            <el-checkbox v-model="rememberMe">記住我</el-checkbox>
            <router-link to="/forgot-password" class="forget-link">
              忘記密碼？
            </router-link>
          </div>

          <!-- 登入按鈕 -->
          <el-button
              type="primary"
              native-type="submit"
              class="submit-button"
              :loading="loading"
              round
          >
            登入
          </el-button>

          <!-- 註冊提示 -->
          <div class="register-tip">
            還不是會員？
            <router-link to="/register" class="register-link">
              立即註冊
            </router-link>
          </div>
        </el-form>

        <!-- 頁尾 -->
        <div class="login-footer">
          <p>登入即表示您同意</p>
          <div class="footer-links">
            <router-link to="/terms" class="footer-link">用戶協議</router-link>
            <span class="divider">|</span>
            <router-link to="/privacy-policy" class="footer-link">隱私政策</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
// 添加常用電子郵件域名列表
const emailDomains = [
  '@gmail.com',
  '@yahoo.com.tw',
  '@hotmail.com',
  '@outlook.com',
  '@icloud.com',
  '@msn.com',
  '@yahoo.com'
]
// 添加搜尋建議的處理函數
const querySearch = (queryString, cb) => {
  const emailPrefix = queryString.split('@')[0]
  // 只有在有輸入內容且還沒有輸入 @ 符號時才顯示建議
  if (emailPrefix && !queryString.includes('@')) {
    // 根據輸入的前綴生成建議列表
    const suggestions = emailDomains.map(domain => ({
      value: emailPrefix + domain
    }))
    cb(suggestions)
  } else {
    cb([])
  }
}

// 添加選擇建議項目的處理函數
const handleSelect = (item) => {
  formData.email = item.value
  // 可選：立即觸發驗證
  loginForm.value?.validateField('email')
}

const store = useStore()
const router = useRouter()
const loginForm = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

// 表單數據
const formData = reactive({
  email: '',
  password: ''
})

// 表單驗證規則
const rules = {
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度至少為6個字符', trigger: 'blur' }
  ]
}

// 提交處理
const handleSubmit = async () => {
  if (!loginForm.value) return

  try {
    await loginForm.value.validate()
    loading.value = true

    await store.dispatch('login', formData)

    ElMessage({
      message: '登入成功',
      type: 'success'
    })

    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)

  } catch (error) {
    console.error('登入失敗:', error)
    ElMessage({
      message: error.response?.data?.message || '登入失敗，請檢查帳號密碼',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
}

/* 左側形象區 */
.login-banner {
  flex: 1;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  url('https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: white;
  position: relative;
}

.banner-content {
  max-width: 500px;
  text-align: center;
}

.banner-title {
  font-size: 48px;
  font-weight: 600;
  margin-bottom: 24px;
}

.text-primary {
  color: #fff;
}

.text-white {
  color: rgba(255, 255, 255, 0.9);
}

.banner-text {
  font-size: 20px;
  opacity: 0.9;
  line-height: 1.6;
}

/* 右側登入區 */
.login-form-container {
  width: 460px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 40px;
}

.form-wrapper {
  width: 100%;
}

.page-title {
  font-size: 28px;
  color: #333;
  font-weight: 500;
  margin: 0 0 40px;
  text-align: center;
}

/* 表單樣式 */
.login-form {
  margin-bottom: 24px;
}

.input-label {
  font-size: 14px;
  color: #333;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forget-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
}

.forget-link:hover {
  opacity: 0.8;
}

.submit-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin-bottom: 24px;
}

/* 註冊提示 */
.register-tip {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 40px;
}

.register-link {
  color: var(--el-color-primary);
  text-decoration: none;
  margin-left: 4px;
}

.register-link:hover {
  opacity: 0.8;
}

/* 頁尾 */
.login-footer {
  text-align: center;
  color: #999;
  font-size: 12px;
}

.footer-links {
  margin-top: 8px;
}

.footer-link {
  color: #666;
  text-decoration: none;
}

.footer-link:hover {
  color: var(--el-color-primary);
}

.footer-links .divider {
  margin: 0 8px;
  color: #e0e0e0;
}

/* 在原有的樣式中添加 */
:deep(.el-autocomplete) {
  width: 100%;
}

/* RWD */
@media (max-width: 992px) {
  .login-banner {
    display: none;
  }

  .login-form-container {
    width: 100%;
  }

  .form-wrapper {
    max-width: 460px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 30px;
  }

  .banner-title {
    font-size: 32px;
  }

  .banner-text {
    font-size: 16px;
  }
}
</style>