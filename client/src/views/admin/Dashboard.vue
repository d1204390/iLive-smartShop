<template>
  <div class="dashboard-container">
    <!-- 統計卡片區 -->
    <el-row :gutter="20" class="stat-cards">
      <!-- 訂單統計卡片 -->
      <el-col :span="8">
        <el-card v-loading="loading" shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon><List /></el-icon>
                訂單統計
              </span>
              <el-tag size="small">總訂單: {{ orderStats.total }}</el-tag>
            </div>
          </template>
          <el-collapse>
            <el-collapse-item name="1">
              <template #title>
                <div class="collapse-title">
                  <span>訂單狀態分佈</span>
                  <div class="quick-stats">
                    <el-tag size="small" type="success">今日: {{ orderStats.today }}</el-tag>
                    <el-tag size="small" type="warning">待處理: {{ orderStats.pending }}</el-tag>
                  </div>
                </div>
              </template>
              <!-- 使用 v-memo 優化渲染 -->
              <div v-memo="[orderStats.processing, orderStats.shipped, orderStats.delivered,
                           orderStats.completed, orderStats.returned, orderStats.cancelled]"
                   class="status-grid">
                <div class="status-item">
                  <span>進行中</span>
                  <el-tag size="small" type="info">{{ orderStats.processing }}</el-tag>
                </div>
                <div class="status-item">
                  <span>已出貨</span>
                  <el-tag size="small" type="primary">{{ orderStats.shipped }}</el-tag>
                </div>
                <div class="status-item">
                  <span>已送達</span>
                  <el-tag size="small">{{ orderStats.delivered }}</el-tag>
                </div>
                <div class="status-item">
                  <span>已完成</span>
                  <el-tag size="small" type="success">{{ orderStats.completed }}</el-tag>
                </div>
                <div class="status-item">
                  <span>退貨</span>
                  <el-tag size="small" type="danger">{{ orderStats.returned }}</el-tag>
                </div>
                <div class="status-item">
                  <span>已取消</span>
                  <el-tag size="small" type="info">{{ orderStats.cancelled }}</el-tag>
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>

      <!-- 財務統計卡片 -->
      <el-col :span="8">
        <el-card v-loading="loading" shadow="hover" class="stat-card">
          <template #header>
            <div class="card-header">
              <span>
                <el-icon><Money /></el-icon>
                財務統計
              </span>
            </div>
          </template>
          <!-- 使用 v-memo 優化渲染 -->
          <div v-memo="[orderStats.totalRevenue, orderStats.actualRevenue, orderStats.returnedAmount]"
               class="finance-stats">
            <div class="main-stat">
              <span>總營業額</span>
              <span class="amount success">NT$ {{ orderStats.totalRevenue.toLocaleString() }}</span>
            </div>
            <div class="sub-stats">
              <div class="stat-item">
                <span>實際收入　</span>
                <span class="amount primary">NT$ {{ orderStats.actualRevenue.toLocaleString() }}</span>
              </div>
              <div class="stat-item">
                <span>退款金額　</span>
                <span class="amount danger">NT$ {{ orderStats.returnedAmount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 商品和用戶統計卡片 -->
      <el-col :span="8">
        <el-card v-loading="loading" shadow="hover" class="stat-card">
          <el-tabs>
            <el-tab-pane label="商品統計">
              <!-- 使用 v-memo 優化渲染 -->
              <div v-memo="[productStats.total, productStats.lowStock]" class="tab-content">
                <div class="stat-row">
                  <span>刊登的商品總個數</span>
                  <el-tag size="large">{{ productStats.total }}</el-tag>
                </div>
                <div class="stat-row">
                  <span>庫存不足商品個數</span>
                  <el-tag size="large" type="danger">{{ productStats.lowStock }}</el-tag>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="用戶統計">
              <!-- 使用 v-memo 優化渲染 -->
              <div v-memo="[userStats.total, userStats.today]" class="tab-content">
                <div class="stat-row">
                  <span>用戶總數</span>
                  <el-tag size="large">{{ userStats.total }}</el-tag>
                </div>
                <div class="stat-row">
                  <span>今日新增</span>
                  <el-tag size="large" type="success">{{ userStats.today }}</el-tag>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>

    <!-- 詳細數據區域 -->
    <el-tabs class="detail-tabs" type="border-card">
      <el-tab-pane>
        <template #label>
          <span class="tab-label">
            <el-icon><List /></el-icon>
            最新訂單
          </span>
        </template>
        <!-- 使用虛擬滾動優化表格 -->
        <el-table
            v-memo="[recentOrders]"
            v-loading="tableLoading"
            :data="recentOrders"
            style="width: 100%"
            size="large"
            height="400"
            :virtual-scrolling="true"
            :estimated-row-height="60"
        >
          <el-table-column prop="_id" label="訂單編號" width="180" />
          <el-table-column prop="user.email" label="用戶" width="220" />
          <el-table-column label="金額" width="150">
            <template #default="scope">
              <span class="amount">NT$ {{ scope.row.totalAmount.toLocaleString() }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="120">
            <template #default="scope">
              <el-tag :type="getOrderTagType(scope.row.status)">
                {{ getOrderStatus(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="120">
            <template #default="scope">
              <el-button type="primary" link @click="$router.push(`/admin/orders?orderId=${scope.row._id}`)">查看詳情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane v-if="lowStockProducts.length > 0">
        <template #label>
          <span class="tab-label">
            <el-icon><Warning /></el-icon>
            庫存警告
            <el-badge :value="lowStockProducts.length" class="warning-badge" type="danger" />
          </span>
        </template>
        <el-table
            v-memo="[lowStockProducts]"
            :data="lowStockProducts"
            style="width: 100%"
            size="large"
        >
          <el-table-column prop="name" label="商品名稱" />
          <el-table-column prop="stock" label="目前庫存" width="120">
            <template #default="scope">
              <el-tag type="danger">{{ scope.row.stock }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="120">
            <template #default>
              <el-button type="primary" link @click="$router.push('/admin/products')">
                補充庫存
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import {
  List,
  Money,
  Goods,
  User,
  Warning
} from '@element-plus/icons-vue'

// 使用 Map 結構優化狀態查詢
const ORDER_STATUS_MAP = new Map([
  ['pending', '待處理'],
  ['processing', '處理中'],
  ['shipped', '已出貨'],
  ['delivered', '已送達'],
  ['completed', '已完成'],
  ['cancelled', '已取消'],
  ['returned', '已退貨']
])

const ORDER_TAG_TYPE_MAP = new Map([
  ['pending', 'warning'],
  ['processing', 'info'],
  ['shipped', 'primary'],
  ['delivered', ''],
  ['completed', 'success'],
  ['cancelled', 'info'],
  ['returned', 'danger']
])

export default {
  setup() {
    const store = useStore()
    const loading = ref(false)
    const tableLoading = ref(false)

    // 使用 ref 優化響應式性能
    const orderStats = ref({
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      returned: 0,
      cancelled: 0,
      today: 0,
      totalRevenue: 0,
      returnedAmount: 0,
      actualRevenue: 0
    })

    const productStats = ref({ total: 0, lowStock: 0 })
    const userStats = ref({ total: 0, today: 0 })
    const recentOrders = ref([])
    const lowStockProducts = ref([])

    // 優化狀態查詢
    const getOrderStatus = (status) => ORDER_STATUS_MAP.get(status) || status
    const getOrderTagType = (status) => ORDER_TAG_TYPE_MAP.get(status) || ''

    // 使用防抖優化頻繁請求
    let fetchTimeout = null
    const debouncedFetch = (fn) => {
      if (fetchTimeout) clearTimeout(fetchTimeout)
      fetchTimeout = setTimeout(fn, 300)
    }

    const fetchDashboardData = async () => {
      loading.value = true
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${store.state.auth.token}` }
        });
        // 批量更新數據以減少重渲染
        orderStats.value = {
          total: data?.orderStats?.total || 0,
          pending: data?.orderStats?.pending || 0,
          processing: data?.orderStats?.processing || 0,
          shipped: data?.orderStats?.shipped || 0,
          delivered: data?.orderStats?.delivered || 0,
          completed: data?.orderStats?.completed || 0,
          returned: data?.orderStats?.returned || 0,
          cancelled: data?.orderStats?.cancelled || 0,
          today: data?.orderStats?.today || 0,
          totalRevenue: data?.orderStats?.totalRevenue || 0,
          returnedAmount: data?.orderStats?.returnedAmount || 0,
          actualRevenue: data?.orderStats?.actualRevenue || 0
        }

        productStats.value = {
          total: data?.productStats?.total || 0,
          lowStock: data?.productStats?.lowStock || 0
        }

        userStats.value = {
          total: data?.userStats?.total || 0,
          today: data?.userStats?.today || 0
        }

        // 延遲加載訂單數據
        debouncedFetch(async () => {
          tableLoading.value = true
          try {
            recentOrders.value = data?.recentOrders || []
            lowStockProducts.value = data?.lowStockProducts || []
          } finally {
            tableLoading.value = false
          }
        })

      } catch (error) {
        console.error('獲取儀表板資料失敗:', error)
      } finally {
        loading.value = false
      }
    }

    // 使用 requestAnimationFrame 優化初始化時機
    onMounted(() => {
      requestAnimationFrame(() => {
        fetchDashboardData()
      })
    })

    return {
      loading,
      tableLoading,
      orderStats,
      productStats,
      userStats,
      recentOrders,
      lowStockProducts,
      getOrderStatus,
      getOrderTagType
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.stat-cards {
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.quick-stats {
  display: flex;
  gap: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.finance-stats {
  padding: 10px 0;
}

.main-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.sub-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.amount {
  font-family: monospace;
  font-weight: 600;
}

.amount.success {
  color: var(--el-color-success);
  font-size: 20px;
}

.amount.primary {
  color: var(--el-color-primary);
}

.amount.danger {
  color: var(--el-color-danger);
}

.tab-content {
  padding: 10px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-tabs {
  margin-top: 20px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-badge :deep(.el-badge__content) {
  z-index: 1;
}

@media (max-width: 1200px) {
  .stat-cards > .el-col {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>