<template>
  <div class="checkout-container">
    <el-card class="checkout-card">
      <template #header>
        <div class="card-header">
          <h2>結帳資訊</h2>
        </div>
      </template>

      <!-- 購物車空的提示 -->
      <el-empty
          v-if="!cart.length"
          description="購物車是空的"
      >
        <router-link to="/products">
          <el-button type="primary">繼續購物</el-button>
        </router-link>
      </el-empty>

      <div v-else>
        <!-- 信用卡付款介面 -->
        <CreditCardPayment
            v-if="showCreditCardForm"
            :order-amount="totalAmount"
            @payment-success="handlePaymentSuccess"
        />

        <!-- 一般結帳流程 -->
        <div v-else>
          <!-- 商品明細 -->
          <div v-if="!isConfirmed" class="order-details">
            <!-- 運費說明 -->
            <el-alert
                type="info"
                :closable="false"
                show-icon
                class="shipping-alert"
            >
              <template #title>
                <span class="alert-title">運費說明</span>
              </template>
              <p>訂單金額超過NT$800元（含），即可享有免運費服務。</p>
              <p>未達免運標準時，收取運輸費用NT$100。</p>
              <p>（此運輸費如於收貨後辦理退貨，將不予退回）</p>
            </el-alert>

            <div class="section-title">
              <h3>商品明細</h3>
            </div>

            <!-- 商品列表 -->
            <div class="product-list">
              <el-card
                  v-for="item in cart"
                  :key="item.product._id"
                  class="product-item"
                  shadow="hover"
              >
                <div class="product-info">
                  <h4>{{ item.product.name }}</h4>
                  <p class="quantity">數量：{{ item.quantity }}</p>
                </div>
                <div class="product-price">
                  <template v-if="item.product.specialPrice">
                    <div class="special-price">
                      NT$ {{ (item.product.specialPrice * item.quantity).toLocaleString() }}
                    </div>
                    <div class="original-price">
                      NT$ {{ (item.product.price * item.quantity).toLocaleString() }}
                    </div>
                  </template>
                  <div v-else class="regular-price">
                    NT$ {{ (item.product.price * item.quantity).toLocaleString() }}
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 金額計算 -->
            <el-card class="price-summary" shadow="never">
              <div class="price-row">
                <span>商品小計</span>
                <span>NT$ {{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="price-row">
                <div class="shipping-info">
                  <span>運費</span>
                  <el-tag size="small" type="info" effect="plain">
                    {{ subtotal >= 800 ? '(已達免運門檻)' : '(未達免運門檻NT$800)' }}
                  </el-tag>
                </div>
                <span>NT$ {{ shippingFee.toLocaleString() }}</span>
              </div>
              <div class="price-row total">
                <span>訂單總計</span>
                <span class="total-amount">NT$ {{ totalAmount.toLocaleString() }}</span>
              </div>
            </el-card>

            <el-button
                type="primary"
                class="next-step-btn"
                @click="isConfirmed = true"
            >
              確認商品，填寫資料
            </el-button>
          </div>

          <!-- 收件資訊表單 -->
          <el-form
              v-else
              ref="checkoutFormRef"
              :model="form"
              :rules="formRules"
              label-position="top"
              @submit.prevent="handleSubmit"
              class="checkout-form"
          >
            <div class="form-section">
              <div class="section-title">
                <h3>收件人資訊</h3>
              </div>

              <!-- 常用地址選擇 -->
              <div v-if="savedAddresses.length > 0" class="saved-addresses">
                <el-button
                    type="primary"
                    link
                    @click="showAddressList = !showAddressList"
                >
                  選擇常用地址
                </el-button>

                <el-collapse-transition>
                  <div v-if="showAddressList" class="address-list">
                    <el-card
                        v-for="address in savedAddresses"
                        :key="address._id"
                        class="address-item"
                        shadow="hover"
                    >
                      <div class="address-content">
                        <div class="address-info">
                          <p>{{ address.name }} - {{ address.phone }}</p>
                          <p>{{ address.address }}</p>
                        </div>
                        <el-button
                            type="primary"
                            link
                            @click="applyAddress(address)"
                        >
                          使用此地址
                        </el-button>
                      </div>
                    </el-card>
                  </div>
                </el-collapse-transition>
              </div>

              <el-form-item label="收件人姓名" prop="recipient">
                <el-input
                    v-model="form.recipient"
                    placeholder="請輸入收件人姓名"
                />
              </el-form-item>

              <el-form-item label="聯絡電話" prop="phone">
                <el-input
                    v-model="form.phone"
                    placeholder="請輸入手機號碼"
                />
              </el-form-item>

              <el-form-item label="收件地址" prop="address">
                <el-input
                    v-model="form.address"
                    placeholder="請輸入完整收件地址"
                    type="textarea"
                    :rows="2"
                />
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="section-title">
                <h3>付款方式</h3>
              </div>

              <el-form-item prop="paymentMethod">
                <el-select
                    v-model="form.paymentMethod"
                    placeholder="請選擇付款方式"
                    class="payment-select"
                >
                  <el-option
                      label="信用卡付款"
                      value="credit_card"
                  />
                  <el-option
                      label="貨到付款"
                      value="cash_on_delivery"
                  />
                </el-select>
              </el-form-item>
            </div>

            <div class="form-section">
              <div class="section-title">
                <h3>訂單備註</h3>
              </div>

              <el-form-item prop="note">
                <el-input
                    v-model="form.note"
                    type="textarea"
                    :rows="3"
                    placeholder="選填"
                />
              </el-form-item>
            </div>

            <!-- 金額確認 -->
            <el-card class="price-summary" shadow="never">
              <div class="price-row">
                <span>商品小計</span>
                <span>NT$ {{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="price-row">
                <span>運費</span>
                <span>NT$ {{ shippingFee.toLocaleString() }}</span>
              </div>
              <div class="price-row total">
                <span>訂單總計</span>
                <span class="total-amount">NT$ {{ totalAmount.toLocaleString() }}</span>
              </div>
            </el-card>

            <!-- 表單按鈕 -->
            <div class="form-actions">
              <el-button
                  @click="isConfirmed = false"
              >
                返回修改商品
              </el-button>
              <el-button
                  type="primary"
                  native-type="submit"
                  :loading="isLoading"
              >
                確認結帳
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import CreditCardPayment from './CreditCardPayment.vue'

const store = useStore()
const router = useRouter()

// 響應式狀態
const isConfirmed = ref(false)
const savedAddresses = ref([])
const showAddressList = ref(false)
const showCreditCardForm = ref(false)
const isLoading = ref(false)
const checkoutFormRef = ref(null)

// 購物車數據
const cart = computed(() => store.state.cart)

// 表單數據
const form = ref({
  recipient: store.state.auth.user?.name || '',
  phone: '',
  address: '',
  paymentMethod: 'credit_card',
  note: ''
})

// 表單驗證規則
const formRules = {
  recipient: [
    { required: true, message: '請輸入收件人姓名', trigger: 'blur' },
    { min: 2, message: '姓名長度至少 2 個字元', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入聯絡電話', trigger: 'blur' },
    { pattern: /^09\d{8}$/, message: '請輸入正確的手機號碼格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '請輸入收件地址', trigger: 'blur' },
    { min: 8, message: '地址長度至少 8 個字元', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '請選擇付款方式', trigger: 'change' }
  ]
}

// 計算商品小計
const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => {
    const price = item.product.specialPrice || item.product.price
    return sum + (price * item.quantity)
  }, 0)
})

// 計算運費
const shippingFee = computed(() => {
  return subtotal.value >= 800 ? 0 : 100
})

// 計算總金額（含運費）
const totalAmount = computed(() => {
  return subtotal.value + shippingFee.value
})

// 獲取常用地址
const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/addresses`);
    savedAddresses.value = response.data.data
  } catch (error) {
    console.error('獲取地址失敗:', error)
    ElMessage.error('獲取常用地址失敗')
  }
}

// 套用選擇的地址
const applyAddress = (address) => {
  form.value.recipient = address.name
  form.value.phone = address.phone
  form.value.address = address.address
  showAddressList.value = false
}

// 處理表單提交
const handleSubmit = async () => {
  if (!checkoutFormRef.value) return

  try {
    await checkoutFormRef.value.validate()

    // 如果選擇信用卡付款，顯示信用卡表單
    if (form.value.paymentMethod === 'credit_card') {
      showCreditCardForm.value = true
      return
    }

    // 其他付款方式直接創建訂單
    await createOrder()
  } catch (error) {
    // 表單驗證失敗
    return
  }
}

// 處理信用卡付款成功
const handlePaymentSuccess = async (paymentDetails) => {
  await createOrder()
}

// 創建訂單
const createOrder = async () => {
  try {
    isLoading.value = true

    const orderData = {
      products: cart.value.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.specialPrice || item.product.price
      })),
      shippingAddress: {
        recipient: form.value.recipient,
        phone: form.value.phone,
        address: form.value.address
      },
      paymentMethod: form.value.paymentMethod,
      note: form.value.note,
      subtotal: subtotal.value,
      shippingFee: shippingFee.value,
      totalAmount: totalAmount.value
    }

    await store.dispatch('createOrder', orderData)
    await store.dispatch('clearCart')

    ElMessage.success('訂單已成功建立！')
    router.push('/orders')
  } catch (error) {
    console.error('Create order error:', error)
    ElMessage.error(error.response?.data?.message || '建立訂單失敗')
  } finally {
    isLoading.value = false
  }
}

// 在組件掛載時獲取地址
onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.checkout-card {
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

.shipping-alert {
  margin-bottom: 24px;
}

.alert-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.section-title {
  margin: 24px 0 16px;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  color: var(--el-text-color-primary);
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.product-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.quantity {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.product-price {
  text-align: right;
}

.special-price {
  color: var(--el-color-danger);
  font-weight: 500;
}

.original-price {
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
  font-size: 14px;
}

.regular-price {
  font-weight: 500;
}

.price-summary {
  background-color: var(--el-fill-color-blank);
  margin: 24px 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.price-row:last-child {
  margin-bottom: 0;
}

.shipping-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total {
  padding-top: 12px;
  margin-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 18px;
  font-weight: 500;
}

.total-amount {
  color: var(--el-color-primary);
}

.next-step-btn {
  width: 100%;
  margin-top: 24px;
}

.checkout-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.saved-addresses {
  margin-bottom: 24px;
}

.address-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-item {
  transition: all 0.3s ease;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.payment-select {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkout-container {
    padding: 12px;
  }

  .product-item {
    flex-direction: column;
    gap: 12px;
  }

  .product-price {
    text-align: left;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .el-button {
    width: 100%;
  }

  .address-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>