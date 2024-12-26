<template>
  <div class="profile-container">
    <div class="profile-layout">
      <!-- 左側個人資料卡片 -->
      <el-card class="profile-card" shadow="hover">
        <template #header>
          <div class="profile-header">
            <h2>會員資料</h2>
            <el-tag type="success" effect="dark" size="small">
              {{ user?.role === 'user' ? '一般會員' : '管理員' }}
            </el-tag>
          </div>
        </template>

        <div class="profile-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="會員ID">
              {{ user?.id }}
            </el-descriptions-item>
            <el-descriptions-item label="電子信箱">
              {{ user?.email }}
            </el-descriptions-item>
            <el-descriptions-item label="註冊日期">
              {{ user?.createdAt ? formatDate(user.createdAt) : '未提供日期' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 帳號安全區域 -->
        <div class="security-section">
          <div class="section-title">
            <el-icon><Lock /></el-icon>
            <span>帳號安全</span>
          </div>

          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="修改密碼" name="password">
              <el-form
                  @submit.prevent="updatePassword"
                  :model="passwordForm"
                  :rules="passwordRules"
                  ref="passwordFormRef"
                  label-position="top"
                  status-icon
              >
                <el-form-item prop="currentPassword">
                  <el-input
                      v-model="passwordForm.currentPassword"
                      type="password"
                      placeholder="請輸入目前密碼"
                      show-password
                  >
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="newPassword">
                  <el-input
                      v-model="passwordForm.newPassword"
                      type="password"
                      placeholder="請輸入新密碼"
                      show-password
                  >
                    <template #prefix>
                      <el-icon><Lock /></el-icon>
                    </template>
                    <template #suffix>
                      <el-tooltip
                          content="密碼至少需要6個字元"
                          placement="top"
                      >
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                </el-form-item>

                <el-form-item prop="confirmPassword">
                  <el-input
                      v-model="passwordForm.confirmPassword"
                      type="password"
                      placeholder="請再次確認新密碼"
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
                    {{ loading ? '更新中...' : '更新密碼' }}
                  </el-button>
                </el-form-item>
              </el-form>
            </el-collapse-item>
          </el-collapse>

          <el-alert
              v-if="message"
              :title="message"
              :type="messageType === 'error' ? 'error' : 'success'"
              show-icon
              class="message-alert"
          />
        </div>
      </el-card>

      <!-- 右側地址管理區域 -->
      <address-book></address-book>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import AddressBook from './AddressBook.vue'
import {
  Lock,
  Key,
  InfoFilled
} from '@element-plus/icons-vue'

const store = useStore()
const message = ref('')
const messageType = ref('')
const loading = ref(false)
const activeCollapse = ref(['password'])
const passwordFormRef = ref(null)

// Forms data
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validation rules
const passwordRules = {
  currentPassword: [
    { required: true, message: '請輸入目前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '新密碼至少需要6個字元', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請再次確認新密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('新密碼與確認密碼不符'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const user = computed(() => store.state.auth.user)

const formatDate = (date) => {
  if (!date) return '未提供日期';
  try {
    return new Date(date).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Taipei' // 根據您的時區
    });
  } catch (error) {
    console.error('日期格式化錯誤:', error);
    return '日期格式錯誤';
  }
};


const updatePassword = async () => {
  if (loading.value) return

  try {
    const valid = await passwordFormRef.value.validate()
    if (!valid) return

    loading.value = true
    await axios.post('/api/auth/update-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    ElMessage.success('密碼更新成功')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '密碼更新失敗')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 24px;
}

.profile-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
}

/* 個人資料卡片樣式 */
.profile-card {
  height: fit-content;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.profile-header h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.profile-info {
  margin: 24px 0;
}

.security-section {
  margin-top: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.message-alert {
  margin-top: 16px;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .profile-layout {
    max-width: 100%;
    padding: 0 16px;
  }
}

@media (max-width: 992px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .profile-card {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .profile-layout {
    padding: 0;
    gap: 16px;
  }

  .section-title {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: 12px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>