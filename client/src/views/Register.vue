<template>
  <div class="register-container">
    <!-- Full-page background with shadow overlay -->
    <div class="background-overlay"></div>

    <el-card class="register-card">
      <template #header>
        <div class="card-header">
          <h2>會員註冊</h2>
          <p>歡迎加入 iLive 智慧家電</p>
        </div>
      </template>

      <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          @submit.prevent="handleSubmit"
          status-icon
      >
        <!-- 電子信箱 -->
        <el-form-item prop="email">
          <el-input
              v-model="registerForm.email"
              placeholder="請輸入電子信箱"
              type="email"
              clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
            <template #append>
              <el-button
                  type="info"
                  @click="sendCode"
                  :disabled="codeSent"
                  class="verification-code-btn"
              >
                {{ codeSent ? `重新發送 (${countdown}s)` : '發送驗證碼' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <!-- 驗證碼 -->
        <el-form-item prop="code">
          <el-input
              v-model="registerForm.code"
              placeholder="請輸入驗證碼"
              maxlength="6"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密碼 -->
        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="請設定密碼"
              show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 確認密碼 -->
        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="再次確認密碼"
              show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 同意協議 -->
        <el-form-item>
          <el-checkbox v-model="agreementChecked">
            我已閱讀並同意
            <el-link type="primary" :underline="false" @click="openPrivacyPolicy">隱私政策</el-link>
            和
            <el-link type="primary" :underline="false" @click="openTerms">用戶協議</el-link>
          </el-checkbox>
        </el-form-item>

        <!-- 提交按鈕 -->
        <el-form-item>
          <el-button
              type="primary"
              class="register-btn"
              native-type="submit"
              :disabled="!agreementChecked"
              :loading="isLoading"
          >
            立即註冊
          </el-button>
        </el-form-item>

        <!-- 登入連結 -->
        <el-form-item>
          <div class="login-link">
            已經是會員？
            <el-link type="primary" @click="$router.push('/login')">
              立即登入
            </el-link>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import {
  ElMessage,
  ElMessageBox
} from 'element-plus'
import {
  Message,
  Lock,
  Key
} from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

// 表單數據
const registerForm = reactive({
  email: '',
  code: '',
  password: '',
  confirmPassword: ''
})

// 表單驗證規則
const registerRules = {
  email: [
    {
      required: true,
      message: '請輸入電子信箱',
      trigger: 'blur'
    },
    {
      type: 'email',
      message: '請輸入正確的電子信箱格式',
      trigger: 'blur'
    }
  ],
  code: [
    {
      required: true,
      message: '請輸入驗證碼',
      trigger: 'blur'
    },
    {
      len: 6,
      message: '驗證碼必須為6位數',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '請輸入密碼',
      trigger: 'blur'
    },
    {
      min: 6,
      message: '密碼至少需要6個字元',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: '請再次確認密碼',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('兩次輸入的密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const registerFormRef = ref(null)
const agreementChecked = ref(false)
const codeSent = ref(false)
const countdown = ref(60)
const isLoading = ref(false)

// 發送驗證碼
const sendCode = async () => {
  // 先驗證郵件
  const emailRule = registerRules.email[1]
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerForm.email)) {
    ElMessage.error('請輸入正確的電子信箱格式')
    return
  }

  try {
    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/send-code`, {
      email: registerForm.email
    })
    ElMessage.success('驗證碼已發送到您的信箱')
    startCountdown()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '發送驗證碼失敗')
  }
}

// 倒數計時
const startCountdown = () => {
  codeSent.value = true
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
      codeSent.value = false
      countdown.value = 60
    }
  }, 1000)
}

// 提交表單
const handleSubmit = async () => {
  // 先驗證表單
  const valid = await registerFormRef.value.validate()
  if (!valid) return

  // 檢查是否同意協議
  if (!agreementChecked.value) {
    ElMessage.warning('請閱讀並同意隱私政策和用戶協議')
    return
  }

  try {
    isLoading.value = true
    await store.dispatch('register', {
      email: registerForm.email,
      password: registerForm.password,
      code: registerForm.code
    })
    ElMessage.success('註冊成功！請登入您的帳號')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '註冊失敗')
  } finally {
    isLoading.value = false
  }
}

// 開啟隱私政策
const openPrivacyPolicy = () => {
  router.push('/privacy-policy')
}

// 開啟用戶協議
const openTerms = () => {
  router.push('/terms')
}
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://plus.unsplash.com/premium_photo-1676321688612-4451a8721435?q=80&w=2007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  background-size: cover;
  background-position: center;
  filter: brightness(0.7) blur(2px);
  z-index: 1;
}

.register-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  z-index: 2;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.9);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin-bottom: 10px;
  color: var(--el-color-primary);
}

.card-header p {
  color: #666;
  margin-bottom: 20px;
}

.register-btn {
  width: 100%;
}

.login-link {
  text-align: center;
  width: 100%;
}

/* 驗證碼按鈕特殊樣式 */
.verification-code-btn {
  background-color: #FFF4E6 !important;
  color: var(--el-color-primary) !important;
  border-color: #FFE4BA !important;
}

.verification-code-btn:hover {
  background-color: #FFE4BA !important;
}

.verification-code-btn:disabled {
  background-color: #FFF4E6 !important;
  color: #CCCCCC !important;
  border-color: #E4E7ED !important;
}
</style>