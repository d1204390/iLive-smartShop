<template>
  <div class="forgot-password-page">
    <!-- 左側形象區 -->
    <div class="login-banner">
      <div class="banner-content">
        <h1 class="banner-title">
          <span class="text-primary">iLive</span>
          <span class="text-white">智慧家電</span>
        </h1>
        <p class="banner-text">安全可靠的帳戶管理，讓您使用無慮</p>
      </div>
    </div>

    <!-- 右側重設密碼區 -->
    <div class="form-container">
      <div class="form-wrapper">
        <h2 class="page-title">重設密碼</h2>

        <!-- 步驟 1: 輸入信箱 -->
        <div v-if="step === 1">
          <form @submit.prevent="sendVerificationCode" class="reset-form">
            <div class="form-item">
              <label class="input-label">電子信箱：</label>
              <input
                  type="email"
                  v-model="email"
                  @input="errorMessage = ''"
                  class="el-input"
                  required>
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <button type="submit" :disabled="isLoading || !isValidEmail" class="submit-button">
              {{ isLoading ? '發送中...' : '取得驗證碼' }}
            </button>
          </form>
        </div>

        <!-- 步驟 2: 驗證碼確認 -->
        <div v-if="step === 2">
          <form @submit.prevent="verifyCode" class="reset-form">
            <div class="form-item">
              <label class="input-label">驗證碼：</label>
              <input
                  type="text"
                  v-model="verificationCode"
                  @input="errorMessage = ''"
                  class="el-input"
                  required
                  maxlength="6">
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <button type="submit" :disabled="isLoading" class="submit-button">
              {{ isLoading ? '驗證中...' : '驗證' }}
            </button>
          </form>
        </div>

        <!-- 步驟 3: 重設密碼 -->
        <div v-if="step === 3">
          <form @submit.prevent="resetPassword" class="reset-form">
            <div class="form-item">
              <label class="input-label">新密碼：</label>
              <input
                  type="password"
                  v-model="newPassword"
                  @input="validatePasswords"
                  class="el-input"
                  required
                  minlength="6">
            </div>
            <div class="form-item">
              <label class="input-label">確認新密碼：</label>
              <input
                  type="password"
                  v-model="confirmPassword"
                  @input="validatePasswords"
                  class="el-input"
                  required
                  minlength="6">
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
            <button type="submit" :disabled="isLoading || !isPasswordValid" class="submit-button">
              {{ isLoading ? '處理中...' : '重設密碼' }}
            </button>
          </form>
        </div>

        <!-- 步驟 4: 完成 -->
        <div v-if="step === 4" class="success-message">
          <p>密碼已成功重設！</p>
          <p>將在 3 秒後自動跳轉到登入頁面...</p>
          <router-link to="/login" class="login-link">立即返回登入</router-link>
        </div>

        <!-- 返回登入連結 -->
        <div v-if="step !== 4" class="back-to-login">
          <router-link to="/login" class="login-link">返回登入</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 保持原本的 script 內容不變
import { ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const step = ref(1)
    const email = ref('')
    const verificationCode = ref('')
    const newPassword = ref('')
    const confirmPassword = ref('')
    const errorMessage = ref('')
    const isLoading = ref(false)
    const isPasswordValid = ref(true)

    // 驗證 email 格式
    const isValidEmail = computed(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email.value)
    })

    // 驗證密碼
    const validatePasswords = () => {
      if (newPassword.value.length < 6) {
        errorMessage.value = '密碼長度至少需要6個字元'
        isPasswordValid.value = false
      } else if (newPassword.value !== confirmPassword.value) {
        errorMessage.value = '兩次輸入的密碼不一致'
        isPasswordValid.value = false
      } else {
        errorMessage.value = ''
        isPasswordValid.value = true
      }
    }

    // 發送驗證碼
    const sendVerificationCode = async () => {
      if (!isValidEmail.value) {
        errorMessage.value = '請輸入有效的電子郵件格式';
        return;
      }

      try {
        isLoading.value = true;
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/forgot-password`, {
          email: email.value
        });
        errorMessage.value = '';
        step.value = 2;
      } catch (error) {
        errorMessage.value = error.response?.data?.message || '發送驗證碼失敗';
      } finally {
        isLoading.value = false;
      }
    };


    // 驗證碼確認
    const verifyCode = async () => {
      if (!verificationCode.value) {
        errorMessage.value = '請輸入驗證碼'
        return
      }

      try {
        isLoading.value = true
        // 這裡發送一個請求來確認驗證碼是否存在且正確
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
          email: email.value,
          code: verificationCode.value,
          checkOnly: true  // 只檢查驗證碼，不重設密碼
        });
        errorMessage.value = ''
        step.value = 3
      } catch (error) {
        errorMessage.value = error.response?.data?.message || '驗證碼錯誤'
      } finally {
        isLoading.value = false
      }
    }

    // 重設密碼
    const resetPassword = async () => {
      if (!isPasswordValid.value) {
        return
      }

      try {
        isLoading.value = true
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password`, {
          email: email.value,
          code: verificationCode.value,
          checkOnly: true  // 只檢查驗證碼，不重設密碼
        });

        step.value = 4
        errorMessage.value = ''

        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (error) {
        errorMessage.value = error.response?.data?.message || '重設密碼失敗'
      } finally {
        isLoading.value = false
      }
    }

    return {
      step,
      email,
      verificationCode,
      newPassword,
      confirmPassword,
      errorMessage,
      isLoading,
      isValidEmail,
      isPasswordValid,
      sendVerificationCode,
      verifyCode,
      resetPassword,
      validatePasswords
    }
  }
}
</script>

<style scoped>
.forgot-password-page {
  min-height: 100vh;
  display: flex;
}

/* 左側形象區 */
.login-banner {
  flex: 1;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  url('https://images.unsplash.com/photo-1528255671579-01b9e182ed1d?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
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

/* 右側表單區 */
.form-container {
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
.reset-form {
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.el-input {
  width: 100%;
  height: 40px;
  padding: 0 15px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
}

.el-input:focus {
  outline: none;
  border-color: var(--el-color-primary);
}

.error-message {
  color: var(--el-color-danger);
  font-size: 12px;
  margin-top: 8px;
}

.submit-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  color: #fff;
  background-color: var(--el-color-primary);
  border: none;
  border-radius: 22px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.submit-button:hover {
  opacity: 0.9;
}

.submit-button:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

/* 成功訊息 */
.success-message {
  text-align: center;
  padding: 40px 0;
}

.success-message p {
  color: #666;
  margin-bottom: 16px;
}

/* 返回登入連結 */
.back-to-login {
  text-align: center;
  margin-top: 24px;
}

.login-link {
  color: var(--el-color-primary);
  text-decoration: none;
  font-size: 14px;
}

.login-link:hover {
  opacity: 0.8;
}

/* RWD */
@media (max-width: 992px) {
  .login-banner {
    display: none;
  }

  .form-container {
    width: 100%;
  }

  .form-wrapper {
    max-width: 460px;
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .form-container {
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