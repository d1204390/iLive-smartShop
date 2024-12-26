<template>
  <div class="admin-login-page">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>iLive管理員登入</h2>
        </div>
      </template>

      <el-form
          ref="loginFormRef"
          :model="formData"
          :rules="rules"
          @submit.prevent="handleSubmit"
          label-position="top"
      >
        <el-form-item label="管理員帳號" prop="email">
          <el-input
              v-model="formData.email"
              placeholder="請輸入管理員帳號"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密碼" prop="password">
          <el-input
              v-model="formData.password"
              type="password"
              placeholder="請輸入密碼"
              show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              native-type="submit"
              :loading="loading"
              class="submit-btn"
          >
            登入
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 新增回到消費者主頁的按鈕 -->
      <div class="home-button-container">
        <el-button
            type="text"
            class="home-btn"
            @click="goToHome"
        >
          回到消費端主頁
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const store = useStore()
const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const rules = {
  email: [
    { required: true, message: '請輸入管理員帳號', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
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

// 導航到消費者主頁的函數
const goToHome = () => {
  window.location.href = 'http://localhost:5173/'
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(45deg, #1e4c88 0%, #409eff 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background-color: rgba(255, 255, 255, 0.95);
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1e4c88;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}

.home-button-container {
  margin-top: 10px;
  text-align: center;
}

.home-btn {
  font-size: 14px;
  color: #409eff;
  cursor: pointer;
}
</style>
