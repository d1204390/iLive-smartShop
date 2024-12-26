<template>
  <div class="payment-container">
    <el-card class="payment-card">
      <template #header>
        <div class="card-header">
          <h2>信用卡付款</h2>
        </div>
      </template>

      <!-- 訂單資訊摘要 -->
      <el-descriptions
          title="訂單資訊"
          :column="1"
          border
          class="order-summary"
      >
        <el-descriptions-item label="訂單金額">
          NT$ {{ orderAmount.toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 信用卡表單 -->
      <el-form
          ref="creditCardFormRef"
          :model="form"
          :rules="rules"
          label-position="top"
          @submit.prevent="handleSubmit"
          class="credit-card-form"
      >
        <!-- 持卡人姓名 -->
        <el-form-item
            label="持卡人姓名"
            prop="cardHolder"
        >
          <el-input
              v-model="form.cardHolder"
              placeholder="請輸入持卡人姓名"
          />
        </el-form-item>

        <!-- 卡號 -->
        <el-form-item label="卡號">
          <div class="card-number-inputs">
            <el-input
                v-for="(_, index) in 4"
                :key="index"
                :ref="el => cardInputs[index] = el"
                v-model="cardNumberGroups[index]"
                maxlength="4"
                :placeholder="'0000'"
                class="card-number-input"
                @input="handleCardNumberInput(index)"
                @keydown="handleBackspace($event, index)"
                @paste="handlePaste($event)"
            />
          </div>
        </el-form-item>

        <div class="form-row">
          <!-- 有效期限 -->
          <el-form-item
              label="有效期限"
              prop="expiryDate"
              class="expiry-input"
          >
            <el-input
                v-model="form.expiryDate"
                placeholder="MM/YY"
                maxlength="5"
                @input="formatExpiryDate"
            >
              <template #prefix>
                <el-icon><Calendar /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- CVC/CVV -->
          <el-form-item
              label="CVC"
              prop="cvv"
              class="cvv-input"
          >
            <el-input
                v-model="form.cvv"
                placeholder="000"
                maxlength="3"
                show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 按鈕區 -->
        <div class="form-actions">
          <el-button @click="goBack">返回</el-button>
          <el-button
              type="primary"
              native-type="submit"
              :loading="isProcessing"
          >
            {{ isProcessing ? '處理中...' : '確認付款' }}
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Calendar, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  orderAmount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['payment-success'])
const router = useRouter()
const isProcessing = ref(false)
const cardInputs = ref([])
const cardNumberGroups = ref(['', '', '', ''])
const creditCardFormRef = ref(null)

const form = ref({
  cardHolder: '',
  cardNumber: '',
  expiryDate: '',
  cvv: ''
})

// 表單驗證規則
const rules = {
  cardHolder: [
    { required: true, message: '請輸入持卡人姓名', trigger: 'blur' },
    { min: 2, message: '持卡人姓名至少需要2個字元', trigger: 'blur' }
  ],
  expiryDate: [
    { required: true, message: '請輸入有效期限', trigger: 'blur' },
    {
      pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
      message: '請輸入正確的有效期限格式，如 03/25',
      trigger: 'blur'
    }
  ],
  cvv: [
    { required: true, message: '請輸入安全碼', trigger: 'blur' },
    { pattern: /^\d{3}$/, message: '請輸入3位數的安全碼', trigger: 'blur' }
  ]
}

// 監聽卡號分組變化，更新完整卡號
watch(cardNumberGroups, (newGroups) => {
  form.value.cardNumber = newGroups.join('')
})

// 處理卡號輸入
const handleCardNumberInput = (groupIndex) => {
  // 確保輸入的是數字且最多4位
  let value = cardNumberGroups.value[groupIndex].replace(/\D/g, '').slice(0, 4)
  cardNumberGroups.value[groupIndex] = value

  // 當輸入4個數字且不是最後一組時，自動跳到下一個輸入框
  if (value.length === 4 && groupIndex < 3 && cardInputs.value[groupIndex + 1]) {
    cardInputs.value[groupIndex + 1].focus()
  }
}

// 處理退格鍵
const handleBackspace = (event, groupIndex) => {
  // 當目前輸入框為空且按下退格鍵時，跳回上一個輸入框
  if (event.key === 'Backspace' && cardNumberGroups.value[groupIndex] === '' && groupIndex > 0) {
    cardInputs.value[groupIndex - 1].focus()
  }
}

// 處理貼上
const handlePaste = (event) => {
  event.preventDefault()
  const pastedText = (event.clipboardData || window.clipboardData).getData('text')
  const numbers = pastedText.replace(/\D/g, '').slice(0, 16)

  // 分配數字到各個輸入框
  for (let i = 0; i < 4; i++) {
    cardNumberGroups.value[i] = numbers.slice(i * 4, (i + 1) * 4)
  }
}

// 格式化有效期限
const formatExpiryDate = (event) => {
  let value = form.value.expiryDate.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  form.value.expiryDate = value
}

// 驗證信用卡號
const validateCardNumber = () => {
  const isCardNumberComplete = cardNumberGroups.value.every(group => group.length === 4)
  if (!isCardNumberComplete) {
    ElMessage.error('請完整輸入16位卡號')
    return false
  }
  return true
}

// 提交表單
const handleSubmit = async () => {
  if (!validateCardNumber()) return

  try {
    await creditCardFormRef.value.validate()

    isProcessing.value = true
    // 模擬付款處理
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 觸發付款成功事件
    emit('payment-success', {
      paymentMethod: 'credit_card',
      last4Digits: form.value.cardNumber.slice(-4)
    })

    ElMessage.success('付款成功！')
    router.push('/orders')
  } catch (error) {
    ElMessage.error('付款失敗，請檢查輸入資訊是否正確')
  } finally {
    isProcessing.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.payment-card {
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.order-summary {
  margin-bottom: 24px;
}

.credit-card-form {
  max-width: 600px;
  margin: 0 auto;
}

.card-number-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.card-number-input {
  text-align: center;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 響應式設計 */
@media (max-width: 640px) {
  .payment-container {
    padding: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .card-number-inputs {
    gap: 8px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }
}
</style>