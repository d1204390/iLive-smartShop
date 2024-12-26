<template>
  <el-card class="address-book" shadow="hover">
    <template #header>
      <div class="card-header">
        <div class="header-left">
          <el-icon><Location /></el-icon>
          <span>常用地址管理</span>
          <el-tag size="small" type="info" effect="plain">
            最多可設定 5 個地址
          </el-tag>
        </div>
        <el-button
            type="primary"
            :icon="Plus"
            @click="showAddressForm = true"
            :disabled="addresses.length >= 5"
        >
          新增地址
        </el-button>
      </div>
    </template>

    <!-- 地址列表 -->
    <div class="address-list">
      <el-empty
          v-if="!addresses.length"
          description="尚未新增地址"
      />

      <transition-group name="list">
        <el-card
            v-for="address in addresses"
            :key="address._id"
            class="address-item"
            shadow="hover"
        >
          <div class="address-content">
            <div class="address-main">
              <div class="address-header">
                <h4>{{ address.name }}</h4>
                <el-tag size="small" type="success" effect="light">常用地址</el-tag>
              </div>
              <div class="address-details">
                <p class="detail-item">
                  <el-icon><Phone /></el-icon>
                  {{ address.phone }}
                </p>
                <p class="detail-item">
                  <el-icon><Message /></el-icon>
                  {{ address.email }}
                </p>
                <p class="detail-item address-text">
                  <el-icon><Location /></el-icon>
                  {{ address.address }}
                </p>
              </div>
            </div>
            <div class="address-actions">
              <el-button
                  type="primary"
                  link
                  :icon="Edit"
                  @click="editAddress(address)"
              >
                編輯
              </el-button>
              <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  @click="confirmDelete(address._id)"
              >
                刪除
              </el-button>
            </div>
          </div>
        </el-card>
      </transition-group>
    </div>

    <!-- 地址表單對話框 -->
    <el-dialog
        v-model="showAddressForm"
        :title="editingAddress ? '編輯地址' : '新增地址'"
        width="500px"
        destroy-on-close
        :before-close="closeAddressForm"
    >
      <el-form
          ref="addressFormRef"
          :model="addressForm"
          :rules="addressRules"
          label-position="top"
          @submit.prevent="handleAddressSubmit"
          status-icon
      >
        <el-form-item label="收件人姓名" prop="name">
          <el-input
              v-model="addressForm.name"
              placeholder="請輸入收件人姓名"
              clearable
          />
        </el-form-item>

        <el-form-item label="聯絡電話" prop="phone">
          <el-input
              v-model="addressForm.phone"
              placeholder="請輸入手機號碼 (格式: 0912345678)"
              maxlength="10"
              clearable
          />
        </el-form-item>

        <el-form-item label="電子信箱" prop="email">
          <el-input
              v-model="addressForm.email"
              placeholder="請輸入電子信箱"
              clearable
          />
        </el-form-item>

        <el-form-item label="完整地址" prop="address">
          <el-input
              v-model="addressForm.address"
              type="textarea"
              :rows="2"
              placeholder="請輸入完整收件地址"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closeAddressForm">取消</el-button>
          <el-button
              type="primary"
              @click="handleAddressSubmit"
              :loading="submitting"
          >
            {{ editingAddress ? '更新' : '新增' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import {
  Location,
  Phone,
  Message,
  Edit,
  Delete,
  Plus
} from '@element-plus/icons-vue'

// 響應式狀態
const addresses = ref([])
const showAddressForm = ref(false)
const editingAddress = ref(null)
const submitting = ref(false)
const addressFormRef = ref(null)

// 表單數據
const addressForm = ref({
  name: '',
  phone: '',
  email: '',
  address: ''
})

// 表單驗證規則
const addressRules = {
  name: [
    { required: true, message: '請輸入收件人姓名', trigger: 'blur' },
    { min: 2, message: '姓名長度至少 2 個字元', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入手機號碼', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子信箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的電子信箱格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '請輸入完整地址', trigger: 'blur' },
    { min: 8, message: '地址長度至少 8 個字元', trigger: 'blur' }
  ]
}

// 獲取地址列表
const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/addresses`);
    addresses.value = response.data.data;
  } catch (error) {
    ElMessage.error('獲取地址列表失敗');
    console.error('獲取地址失敗:', error);
  }
};


// 處理地址表單提交
const handleAddressSubmit = async () => {
  if (!addressFormRef.value) return

  try {
    await addressFormRef.value.validate()
    submitting.value = true

    if (editingAddress.value) {
      await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/addresses/${editingAddress.value._id}`,
          addressForm.value
      );
      ElMessage.success('地址更新成功');
    } else {
      await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/addresses`,
          addressForm.value
      );
      ElMessage.success('地址新增成功');
    }


    await fetchAddresses()
    closeAddressForm()
  } catch (error) {
    if (error.response) {
      ElMessage.error(error.response.data.message || '操作失敗')
    }
  } finally {
    submitting.value = false
  }
}

// 編輯地址
const editAddress = (address) => {
  editingAddress.value = address
  addressForm.value = { ...address }
  showAddressForm.value = true
}

// 刪除地址確認
const confirmDelete = async (addressId) => {
  try {
    await ElMessageBox.confirm(
        '確定要刪除此地址嗎？此操作不可恢復。',
        '刪除確認',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning',
        }
    )
    await deleteAddress(addressId)
  } catch {
    // 用戶取消刪除
  }
}

// 刪除地址
const deleteAddress = async (addressId) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/addresses/${addressId}`);
    ElMessage.success('地址已刪除');
    await fetchAddresses();
  } catch (error) {
    ElMessage.error('刪除地址失敗');
  }
};


// 關閉地址表單
const closeAddressForm = (done) => {
  showAddressForm.value = false;
  editingAddress.value = null;
  addressForm.value = {
    name: '',
    phone: '',
    email: '',
    address: ''
  };
  if (addressFormRef.value) {
    addressFormRef.value.resetFields();
  }
  if (done) done(); // 確保 Dialog 能正常關閉
};


// 生命週期鉤子
onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.address-book {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.header-left .el-tag {
  margin-left: 12px;
}

.address-list {
  margin-top: 16px;
}

.address-item {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.address-item:hover {
  transform: translateY(-2px);
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-main {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.address-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.address-details {
  color: var(--el-text-color-regular);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-item .el-icon {
  font-size: 16px;
  color: var(--el-text-color-secondary);
}

.address-text {
  color: var(--el-text-color-secondary);
}

.address-actions {
  display: flex;
  gap: 12px;
}

/* 列表動畫 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .address-content {
    flex-direction: column;
  }

  .address-actions {
    margin-top: 12px;
    justify-content: flex-end;
  }

  .header-left {
    flex-wrap: wrap;
  }

  .header-left .el-tag {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>