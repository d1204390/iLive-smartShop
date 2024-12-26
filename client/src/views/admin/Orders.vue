//Orders.vue
<template>
  <div class="orders-container">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2>訂單管理</h2>
          <el-button
              :loading="loading"
              circle
              @click="fetchOrders"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 搜尋和篩選 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="8">
          <el-input
              v-model="searchQuery"
              placeholder="搜尋訂單號或用戶信箱"
              :prefix-icon="Search"
              clearable
          />
        </el-col>
        <el-col :span="6">
          <el-select
              v-model="statusFilter"
              placeholder="訂單狀態"
              clearable
              class="w-full"
          >
            <el-option value="" label="全部狀態" />
            <el-option value="pending" label="待處理" />
            <el-option value="processing" label="處理中" />
            <el-option value="shipped" label="已出貨" />
            <el-option value="delivered" label="已送達" />
            <el-option value="completed" label="已完成" />
            <el-option value="cancelled" label="已取消" />
            <el-option value="returned" label="已退貨" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-date-picker
              v-model="dateFilter"
              type="date"
              placeholder="選擇日期"
              clearable
              class="w-full"
              value-format="YYYY-MM-DD"
          />
        </el-col>
        <el-col :span="4">
          <el-button
              type="primary"
              :icon="Search"
              @click="handleSearch"
              :loading="loading"
              class="w-full"
          >
            搜尋
          </el-button>
        </el-col>
      </el-row>

      <!-- 訂單統計 -->
      <el-row :gutter="20" class="mb-4">
        <el-col :span="4">
          <el-card shadow="hover">
            <h3>總訂單數</h3>
            <p class="stat-value">{{ filteredOrders.length }}</p>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover">
            <h3>待處理訂單</h3>
            <p class="stat-value text-warning">{{ getPendingOrdersCount() }}</p>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover">
            <h3>今日訂單</h3>
            <p class="stat-value text-primary">{{ getTodayOrdersCount() }}</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <h3>總營業額</h3>
            <p class="stat-value text-success">NT$ {{ getTotalRevenue().toLocaleString() }}</p>
          </el-card>
        </el-col>
        <el-col :span="4">
          <el-card shadow="hover">
            <h3>退貨訂單</h3>
            <p class="stat-value text-danger">{{ getReturnedOrdersCount() }}</p>
          </el-card>
        </el-col>
      </el-row><!-- 訂單列表 -->
      <el-table
          v-loading="loading"
          :data="pagedOrders"
          border
          stripe
          :default-sort="{ prop: 'createdAt', order: 'descending' }"
      >
        <el-table-column prop="_id" label="訂單編號" width="180">
          <template #default="{ row }">
            <el-button link type="primary" @click="showOrderDetail(row)">
              {{ row._id }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="user.email" label="用戶信箱" width="200" />
        <el-table-column label="訂單時間" width="180" >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getOrderStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="shippingAddress.recipient" label="收件人" width="120" />
        <el-table-column label="商品數量" width="100" align="center">
          <template #default="{ row }">
            {{ getTotalItems(row) }}
          </template>
        </el-table-column>
        <el-table-column label="總金額" width="120" align="right" >
          <template #default="{ row }">
            NT$ {{ row.totalAmount.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
                v-if="row.status === 'pending'"
                type="primary"
                size="small"
                @click="handlePendingOrder(row._id)"
            >
              處理
            </el-button>
            <el-button
                v-if="row.status === 'processing'"
                type="success"
                size="small"
                @click="handleOrderProcessing(row._id)"
            >
              出貨
            </el-button>
            <el-button
                type="info"
                size="small"
                @click="showOrderDetail(row)"
            >
              詳情
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暫無訂單數據" />
        </template>
      </el-table>

      <!-- 分頁 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="filteredOrders.length"
            layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <!-- 訂單詳情對話框 -->
    <el-dialog
        v-model="dialogVisible"
        title="訂單詳情"
        width="50%"
    :top="'1vh'"
    custom-class="custom-dialog"
    @close="handleClose"
    >
      <template v-if="selectedOrder">
        <el-descriptions title="基本資訊" :column="2" border>
          <el-descriptions-item label="訂單編號">{{ selectedOrder._id }}</el-descriptions-item>
          <el-descriptions-item label="下單時間">{{ formatDate(selectedOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="訂單狀態">
            <el-tag :type="getStatusType(selectedOrder.status)">
              {{ getOrderStatus(selectedOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="付款方式">
            {{ getPaymentMethod(selectedOrder.paymentMethod) }}
          </el-descriptions-item>
          <template v-if="selectedOrder.shippingDetails?.trackingNumber">
            <el-descriptions-item label="物流單號">
              {{ selectedOrder.shippingDetails.trackingNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="出貨時間">
              {{ formatDate(selectedOrder.shippingDetails.shippedAt) }}
            </el-descriptions-item>
          </template>
        </el-descriptions>

        <el-descriptions class="mt-4" title="收件資訊" :column="1" border>
          <el-descriptions-item label="收件人">{{ selectedOrder.shippingAddress.recipient }}</el-descriptions-item>
          <el-descriptions-item label="電話">{{ selectedOrder.shippingAddress.phone }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ selectedOrder.shippingAddress.address }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt-4">
          <h4>商品明細</h4>
          <el-table :data="selectedOrder.products" border>
            <el-table-column prop="productSnapshot.name" label="商品名稱" />
            <el-table-column prop="price" label="單價" width="150">
              <template #default="{ row }">NT$ {{ row.price.toLocaleString() }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="數量" width="100" align="center" />
            <el-table-column label="小計" width="150" align="right">
              <template #default="{ row }">
                NT$ {{ (row.price * row.quantity).toLocaleString() }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <el-descriptions class="mt-4" title="金額資訊" :column="1" border>
          <el-descriptions-item label="商品小計">NT$ {{ selectedOrder.subtotal.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="運費">NT$ {{ selectedOrder.shippingFee.toLocaleString() }}</el-descriptions-item>
          <el-descriptions-item label="總金額">
            <span class="text-xl font-bold text-red-500">
              NT$ {{ selectedOrder.totalAmount.toLocaleString() }}
            </span>
          </el-descriptions-item>
        </el-descriptions>

        <el-steps :active="getOrderStep(selectedOrder.status)" finish-status="success" class="mt-4">
          <el-step title="待處理" />
          <el-step title="處理中" />
          <el-step :title="selectedOrder.status === 'returned' ? '已退貨' : '完成'" />
        </el-steps>

        <div v-if="selectedOrder.shippingDetails?.notes" class="mt-4">
          <el-alert
              title="備註資訊"
              :description="selectedOrder.shippingDetails.notes"
              type="info"
          />
        </div>
      </template>
      <template #footer>
        <el-button @click="handleClose">關閉</el-button>
      </template>
    </el-dialog>

    <!-- 訂單處理對話框 -->
    <OrderProcessing
        v-if="showProcessingModal"
        :orderId="selectedOrderId"
        @process-completed="handleProcessingCompleted"
        @close="showProcessingModal = false"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Refresh } from '@element-plus/icons-vue';
import OrderProcessing from './OrderProcessing.vue';

export default {
  name: 'OrdersManagement',

  components: {
    OrderProcessing
  },

  setup() {
    const store = useStore();
    const loading = ref(false);
    const orders = ref([]);
    const selectedOrder = ref(null);
    const searchQuery = ref('');
    const statusFilter = ref('');
    const dateFilter = ref('');
    const selectedOrderId = ref(null);
    const showProcessingModal = ref(false);
    const dialogVisible = ref(false);
    const currentPage = ref(1);
    const pageSize = ref(20);

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-TW');
    };

    const getOrderStatus = (status) => {
      const statusMap = {
        'pending': '待處理',
        'processing': '處理中',
        'shipped': '已出貨',
        'delivered': '已送達',
        'completed': '已完成',
        'cancelled': '已取消',
        'returned': '已退貨'
      };
      return statusMap[status] || status;
    };

    const getStatusType = (status) => {
      const typeMap = {
        'pending': 'warning',
        'processing': 'primary',
        'shipped': 'success',
        'delivered': 'success',
        'completed': 'success',
        'cancelled': 'info',
        'returned': 'danger'
      };
      return typeMap[status] || 'info';
    };

    const getOrderStep = (status) => {
      const stepMap = {
        'pending': 0,
        'processing': 1,
        'shipped': 2,
        'delivered': 2,
        'completed': 2,
        'cancelled': 2,
        'returned': 2
      };
      return stepMap[status] || 0;
    };

    const getPaymentMethod = (method) => {
      const methodMap = {
        'credit_card': '信用卡',
        'bank_transfer': '銀行轉帳',
        'cash_on_delivery': '貨到付款'
      };
      return methodMap[method] || method;
    };

    const getTotalItems = (order) => {
      return order.products.reduce((sum, item) => sum + item.quantity, 0);
    };

    const filteredOrders = computed(() => {
      return orders.value.filter(order => {
        const matchQuery = !searchQuery.value ||
            order._id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            order.user.email.toLowerCase().includes(searchQuery.value.toLowerCase());

        const matchStatus = !statusFilter.value || order.status === statusFilter.value;

        const matchDate = !dateFilter.value ||
            order.createdAt.split('T')[0] === dateFilter.value;

        return matchQuery && matchStatus && matchDate;
      });
    });

    const pagedOrders = computed(() => {
      const startIndex = (currentPage.value - 1) * pageSize.value;
      const endIndex = startIndex + pageSize.value;
      return filteredOrders.value.slice(startIndex, endIndex);
    });

    const handleSearch = () => {
      currentPage.value = 1;
    };

    const fetchOrders = async () => {
      loading.value = true;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders`, {
          headers: { Authorization: `Bearer ${store.state.auth.token}` }
        });
        orders.value = response.data.data || [];
      } catch (error) {
        ElMessage.error('獲取訂單失敗：' + (error.response?.data?.message || '請稍後再試'));
      } finally {
        loading.value = false;
      }
    };


    const startProcessingOrder = async (orderId) => {
      try {
        await ElMessageBox.confirm('確定要開始處理此訂單？', '提示', {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/status`,
            { status: 'processing' },
            { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
        );


        if (response.data.success) {
          ElMessage.success('訂單狀態已更新');
          await fetchOrders();
        }
      } catch (error) {
        if (error === 'cancel') return;
        ElMessage.error('操作失敗：' + (error.response?.data?.message || '請稍後再試'));
      }
    };

    const handleOrderProcessing = (orderId) => {
      selectedOrderId.value = orderId;
      showProcessingModal.value = true;
    };

    const handleProcessingCompleted = async () => {
      showProcessingModal.value = false;
      ElMessage.success('訂單處理完成');
      await fetchOrders();
    };

    const showOrderDetail = (order) => {
      selectedOrder.value = order;
      dialogVisible.value = true;
    };

    const handleClose = () => {
      dialogVisible.value = false;
      selectedOrder.value = null;
    };

    const getPendingOrdersCount = () => {
      return orders.value.filter(order => order.status === 'pending').length;
    };

    const getReturnedOrdersCount = () => {
      return orders.value.filter(order => order.status === 'returned').length;
    };

    const getTodayOrdersCount = () => {
      const today = new Date().toISOString().split('T')[0];
      return orders.value.filter(order =>
          order.createdAt.split('T')[0] === today
      ).length;
    };

    const getTotalRevenue = () => {
      return orders.value
          .filter(order => !['cancelled', 'returned'].includes(order.status))
          .reduce((sum, order) => sum + order.totalAmount, 0);
    };

    const handlePendingOrder = (orderId) => {
      ElMessageBox.confirm(
          '請選擇處理方式',
          '訂單處理',
          {
            confirmButtonText: '開始處理',
            cancelButtonText: '取消訂單',
            distinguishCancelAndClose: true,
            type: 'warning'
          }
      )
          .then(() => {
            // 選擇開始處理
            startProcessingOrder(orderId);
          })
          .catch((action) => {
            if (action === 'cancel') {
              // 選擇取消訂單
              cancelOrder(orderId);
            }
          });
    };

// 新增取消訂單方法
    const cancelOrder = async (orderId) => {
      try {
        const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/orders/${orderId}/admin-cancel`,
            {},
            { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
        );

        if (response.data.success) {
          ElMessage.success('訂單已取消');
          await fetchOrders();
        }
      } catch (error) {
        ElMessage.error('取消訂單失敗：' + (error.response?.data?.message || '請稍後再試'));
      }
    };


    onMounted(async () => {
      await fetchOrders();

      // 檢查 URL 是否包含 orderId 參數
      const urlParams = new URLSearchParams(window.location.search);
      const orderId = urlParams.get('orderId');

      if (orderId) {
        // 找到對應的訂單並顯示詳情
        const order = orders.value.find(o => o._id === orderId);
        if (order) {
          showOrderDetail(order);
        }
      }
    });

    return {
      // 狀態
      loading,
      orders,
      selectedOrder,
      searchQuery,
      statusFilter,
      dateFilter,
      selectedOrderId,
      showProcessingModal,
      dialogVisible,
      currentPage,
      pageSize,

      // 計算屬性
      filteredOrders,
      pagedOrders,

      // 方法
      formatDate,
      getOrderStatus,
      getStatusType,
      getOrderStep,
      getPaymentMethod,
      getTotalItems,
      fetchOrders,
      startProcessingOrder,
      handleOrderProcessing,
      handleProcessingCompleted,
      showOrderDetail,
      handleSearch,
      handleClose,
      getPendingOrdersCount,
      getReturnedOrdersCount,
      getTodayOrdersCount,
      getTotalRevenue,
      handlePendingOrder,
      cancelOrder,

      // 圖標
      Search,
      Refresh
    };
  }
};
</script>

<style scoped>

.custom-dialog {
  margin: 0 auto; /* 水平置中 */
  border-radius: 8px; /* 圓角 */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2); /* 增加陰影 */
}
.orders-container {
  padding: 20px;
}

h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.mb-4 {
  margin-bottom: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

h3 {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

h4 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 12px 0;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin: 0;
  text-align: center;
}

.text-warning {
  color: #E6A23C;
}

.text-primary {
  color: #409EFF;
}

.text-success {
  color: #67C23A;
}

.text-danger {
  color: #F56C6C;
}

:deep(.el-card__body) {
  padding: 15px;
}

:deep(.el-table) {
  margin-top: 1rem;
}

:deep(.el-step__title) {
  font-size: 14px;
}

:deep(.el-card) {
  transition: all 0.3s ease-in-out;
}

:deep(.el-card:hover) {
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.justify-end {
  justify-content: flex-end;
}

.items-center {
  align-items: center;
}

.w-full {
  width: 100%;
}
</style>