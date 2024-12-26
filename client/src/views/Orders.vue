<template>
  <div class="orders-container">
    <el-card class="orders-card">
      <template #header>
        <div class="card-header">
          <h2>我的訂單</h2>
          <div class="filter-section">
            <el-select
                v-model="selectedStatus"
                placeholder="訂單狀態篩選"
                clearable
                @change="handleFilter"
            >
              <el-option
                  v-for="status in orderStatuses"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
              />
            </el-select>
          </div>
        </div>
      </template>

      <div v-if="orders.length" class="orders-list">
        <el-card
            v-for="order in orders"
            :key="order._id"
            class="order-item"
            shadow="hover"
        >
          <!-- 訂單標頭 -->
          <div class="order-header">
            <div class="order-info">
              <h3>訂單編號: {{ order._id }}</h3>
              <el-tag
                  :type="getStatusType(order.status)"
                  effect="plain"
                  size="small"
              >
                {{ getOrderStatus(order.status) }}
              </el-tag>
            </div>
            <p class="order-date">下單時間: {{ formatDate(order.createdAt) }}</p>

            <!-- 物流資訊 -->
            <template v-if="order.shippingDetails?.trackingNumber">
              <div class="shipping-info">
                <p>物流單號: {{ order.shippingDetails.trackingNumber }}</p>
                <p>出貨時間: {{ formatDate(order.shippingDetails.shippedAt) }}</p>
              </div>
            </template>
          </div>

          <!-- 訂單狀態流程 -->
          <el-steps
              :active="getOrderStepActive(order.status)"
              finish-status="success"
              class="order-steps"
          >
            <el-step title="下單" />
            <el-step title="出貨" />
            <el-step title="送達" />
            <el-step title="完成" />
          </el-steps>

          <!-- 訂單商品列表 -->
          <div class="products-list">
            <div
                v-for="item in order.products"
                :key="item._id"
                class="product-item"
            >
              <div class="product-info">
                <h4>{{ item.productSnapshot.name }}</h4>
                <p class="quantity-info">
                  數量: {{ item.quantity }} × NT$ {{ item.price.toLocaleString() }}
                  <span
                      v-if="item.productSnapshot.price > item.price"
                      class="original-price"
                  >
                    NT$ {{ item.productSnapshot.price.toLocaleString() }}
                  </span>
                </p>
              </div>
              <div class="product-price">
                NT$ {{ (item.price * item.quantity).toLocaleString() }}
              </div>
            </div>
          </div>

          <!-- 金額資訊 -->
          <div class="order-summary">
            <div class="summary-item">
              <span>商品小計</span>
              <span>NT$ {{ order.subtotal.toLocaleString() }}</span>
            </div>
            <div class="summary-item">
              <div class="shipping-label">
                <span>運費</span>
                <el-tag
                    v-if="order.subtotal >= 800"
                    size="small"
                    type="info"
                    effect="plain"
                >
                  免運費
                </el-tag>
              </div>
              <span>NT$ {{ order.shippingFee.toLocaleString() }}</span>
            </div>
            <div class="summary-item total">
              <span>訂單總計</span>
              <span class="total-amount">NT$ {{ order.totalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <!-- 訂單操作按鈕 -->
          <div class="order-actions">
            <el-button
                v-if="order.status === 'pending'"
                type="danger"
                @click="cancelOrder(order._id)"
            >
              取消訂單
            </el-button>

            <el-button
                v-if="order.status === 'shipped'"
                type="primary"
                @click="confirmDelivery(order._id)"
            >
              確認收貨
            </el-button>

            <el-button
                v-if="order.status === 'delivered'"
                type="success"
                @click="confirmCompletion(order._id)"
            >
              確認完成
            </el-button>

            <el-button
                v-if="order.status === 'delivered'"
                type="danger"
                @click="requestReturn(order._id)"
            >
              申請退貨
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 無訂單時顯示 -->
      <el-empty
          v-else
          description="尚無訂單記錄"
      >
        <router-link to="/products">
          <el-button type="primary">去購物</el-button>
        </router-link>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { ElMessageBox, ElMessage } from 'element-plus'

const store = useStore()
const orders = ref([])
const selectedStatus = ref('')
const allOrders = ref([])

// 訂單狀態選項
const orderStatuses = [
  { value: 'pending', label: '待處理' },
  { value: 'processing', label: '處理中' },
  { value: 'shipped', label: '已出貨' },
  { value: 'delivered', label: '已送達' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'returned', label: '已退貨' }
]

// 處理篩選
const handleFilter = () => {
  if (!selectedStatus.value) {
    // 如果沒有選擇狀態，顯示所有訂單
    orders.value = allOrders.value
  } else {
    // 根據選擇的狀態篩選訂單
    orders.value = allOrders.value.filter(order => order.status === selectedStatus.value)
  }
}

const getOrderStatus = (status) => {
  const statusMap = {
    'pending': '待處理',
    'processing': '處理中',
    'shipped': '已出貨',
    'delivered': '已送達',
    'completed': '已完成',
    'cancelled': '已取消',
    'returned': '已退貨'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'processing': 'info',
    'shipped': 'primary',
    'delivered': '',
    'completed': 'success',
    'cancelled': 'danger',
    'returned': 'danger'
  }
  return typeMap[status] || ''
}

const getOrderStepActive = (status) => {
  const stepMap = {
    'pending': 1,
    'processing': 1,
    'shipped': 2,
    'delivered': 3,
    'completed': 4,
    'cancelled': 0,
    'returned': 0
  }
  return stepMap[status] || 0
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const fetchOrders = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${store.state.auth.token}` }
    });
    allOrders.value = response.data.data || [];
    orders.value = allOrders.value;
  } catch (error) {
    console.error('獲取訂單失敗:', error);
    ElMessage.error('獲取訂單失敗');
    allOrders.value = [];
    orders.value = [];
  }
};


const cancelOrder = async (orderId) => {
  try {
    await ElMessageBox.confirm(
        '確定要取消此訂單？',
        '取消訂單',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
    );


    if (response.data.success) {
      ElMessage.success('訂單已取消')
      await fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '取消訂單失敗')
    }
  }
}

const confirmDelivery = async (orderId) => {
  try {
    await ElMessageBox.confirm(
        '確認已收到商品？',
        '確認收貨',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'info'
        }
    )

    // 確保 URL 格式正確
    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`,
        {
          status: 'delivered'
        },
        {
          headers: {
            Authorization: `Bearer ${store.state.auth.token}`,
            'Content-Type': 'application/json'
          }
        }
    );



    // 檢查響應
    if (response.data.success) {
      ElMessage.success('已確認收貨')
      await fetchOrders()
    } else {
      throw new Error(response.data.message || '確認收貨失敗')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('確認收貨錯誤:', error)
      ElMessage.error(
          error.response?.data?.message ||
          error.message ||
          '確認收貨失敗'
      )
    }
  }
}

const confirmCompletion = async (orderId) => {
  try {
    await ElMessageBox.confirm(
        '確認商品無問題？完成後將無法退貨。',
        '確認完成',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'success'
        }
    )

    await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`,
        { status: 'completed' },
        { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
    );


    ElMessage.success('訂單已完成')
    await fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '確認完成失敗')
    }
  }
}

const requestReturn = async (orderId) => {
  try {
    await ElMessageBox.confirm(
        '提交申請後，客服人員將會主動與您聯繫，協助處理後續退貨事宜。',
        '申請退貨確認',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/return`,
        {},
        { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
    );


    if (response.data.success) {
      ElMessage.success('退貨申請已提交，客服人員將盡快與您聯繫')
      await fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '申請退貨失敗')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.orders-card {
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-section :deep(.el-select) {
  width: 160px;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-item {
  transition: all 0.3s ease;
}

.order-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.order-date {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.shipping-info {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.order-steps {
  margin: 24px 0;
}

.products-list {
  margin: 20px 0;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.product-item:last-child {
  border-bottom: none;
}

.product-info h4 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.quantity-info {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.original-price {
  text-decoration: line-through;
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}

.product-price {
  font-weight: 500;
}

.order-summary {
  background-color: var(--el-fill-color-blank);
  padding: 16px;
  border-radius: 4px;
  margin: 20px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.shipping-label {
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

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .orders-container {
    padding: 12px;
  }

  .order-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .product-item {
    flex-direction: column;
    gap: 12px;
  }

  .product-price {
    align-self: flex-end;
  }

  .order-actions {
    flex-direction: column;
    gap: 8px;
  }

  .order-actions .el-button {
    width: 100%;
  }

  .order-steps {
    margin: 16px 0;
  }

  .order-steps :deep(.el-steps__title) {
    font-size: 12px;
  }

  .summary-item {
    font-size: 14px;
  }

  .total {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .orders-container {
    padding: 8px;
  }

  .card-header h2 {
    font-size: 20px;
  }

  .order-header {
    padding-bottom: 12px;
    margin-bottom: 16px;
  }

  .shipping-info {
    flex-direction: column;
    gap: 4px;
  }

  .order-steps :deep(.el-step__title) {
    font-size: 11px;
  }
}
</style>