<template>
  <div class="sales-statistics p-6 bg-orange-50">
    <el-card class="border-0 shadow-lg rounded-xl">
      <template #header>
        <div class="flex justify-between items-center py-2">
          <h2 class="text-2xl font-bold text-orange-800">銷售統計</h2>
          <el-button
              :loading="loading"
              class="hover:scale-105 transition-transform duration-200"
              circle
              type="warning"
              @click="fetchSalesData"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <!-- 載入中狀態 -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span class="ml-3 text-orange-600">載入中...</span>
      </div>

      <!-- 錯誤訊息 -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
        <div class="flex items-center">
          <el-icon class="mr-2"><Warning /></el-icon>
          <p class="font-semibold">錯誤通知</p>
        </div>
        <p class="mt-2">{{ error }}</p>
      </div>

      <!-- 統計概要 -->
      <el-row :gutter="24" class="mb-6" v-if="!loading && !error">
        <el-col :span="12">
          <el-card shadow="hover" class="transform hover:-translate-y-1 transition-all duration-300 h-32 bg-gradient-to-br from-orange-100 to-orange-50">
            <div class="flex flex-col justify-between h-full">
              <h3 class="text-orange-700 text-sm font-medium">總訂單數</h3>
              <p class="stat-value text-4xl font-bold text-orange-600">{{ totalOrders }}</p>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="transform hover:-translate-y-1 transition-all duration-300 h-32 bg-gradient-to-br from-amber-100 to-amber-50">
            <div class="flex flex-col justify-between h-full">
              <h3 class="text-amber-700 text-sm font-medium">總銷售商品數</h3>
              <p class="stat-value text-4xl font-bold text-amber-600">{{ totalSoldItems }}</p>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 銷售排行表格 -->
      <el-table
          v-if="!loading && !error"
          :data="salesData"
          border
          stripe
          class="custom-table"
      >
        <el-table-column
            label="排名"
            width="80"
            type="index"
            align="center"
        >
          <template #default="scope">
            <div class="flex justify-center items-center">
              <span class="rank-badge" :class="getRankClass(scope.$index)">
                {{ scope.$index + 1 }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
            prop="name"
            label="商品名稱"
        >
          <template #default="{ row }">
            <div class="font-medium text-orange-900">{{ row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column
            prop="totalQuantity"
            label="銷售數量"
            align="right"
            width="120"
        >
          <template #default="{ row }">
            <span class="font-semibold text-orange-700">{{ row.totalQuantity }}</span>
          </template>
        </el-table-column>
        <el-table-column
            label="銷售佔比"
            align="right"
            width="180"
        >
          <template #default="{ row }">
            <div class="flex items-center justify-end">
              <div class="w-24 bg-orange-100 rounded-full h-2 mr-2">
                <div
                    class="bg-orange-500 h-2 rounded-full"
                    :style="{ width: calculatePercentage(row.totalQuantity) + '%' }"
                ></div>
              </div>
              <span class="font-semibold text-orange-600">{{ calculatePercentage(row.totalQuantity) }}%</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <template #empty>
        <el-empty
            description="暫無銷售數據"
            class="my-8 text-orange-600"
        />
      </template>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { ElMessage } from 'element-plus';
import { Refresh, Warning } from '@element-plus/icons-vue';

export default {
  name: 'SalesStatistics',

  setup() {
    const store = useStore();
    const loading = ref(false);
    const error = ref(null);
    const salesData = ref([]);
    const totalOrders = ref(0);
    const totalSoldItems = ref(0);

    const calculatePercentage = (quantity) => {
      const total = salesData.value.reduce((sum, item) => sum + item.totalQuantity, 0);
      return ((quantity / total) * 100).toFixed(1);
    };

    const getRankClass = (index) => {
      const classes = {
        0: 'bg-amber-400',
        1: 'bg-orange-300',
        2: 'bg-orange-200',
      };
      return classes[index] || 'bg-orange-100';
    };

    const fetchSalesData = async () => {
      try {
        loading.value = true;
        error.value = null;

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/orders/statistics`, {
          headers: {
            Authorization: `Bearer ${store.state.auth.token}`
          }
        });


        if (response.data?.success) {
          salesData.value = response.data.data;
          totalOrders.value = response.data.totalOrders;
          totalSoldItems.value = salesData.value.reduce(
              (sum, item) => sum + item.totalQuantity,
              0
          );
        } else {
          throw new Error(response.data?.message || '獲取數據失敗');
        }
      } catch (err) {
        console.error('獲取銷售數據失敗:', err);
        error.value = err.response?.data?.message || '無法載入銷售統計數據';
        ElMessage.error(error.value);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchSalesData();
    });

    return {
      loading,
      error,
      salesData,
      totalOrders,
      totalSoldItems,
      calculatePercentage,
      getRankClass,
      fetchSalesData,
      Refresh,
      Warning
    };
  }
};
</script>

<style scoped>
.custom-table :deep(.el-table__header) {
  background-color: #fff7ed;
}

.custom-table :deep(.el-table__header-row th) {
  background-color: #fff7ed;
  color: #9a3412;
  font-weight: 600;
  padding: 12px 8px;
}

.custom-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.custom-table :deep(.el-table__row:hover) {
  background-color: #ffedd5;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c2d12;
  font-weight: 600;
  font-size: 0.875rem;
}

/* Element Plus theme overrides */
:deep(.el-card) {
  border-radius: 1rem;
  transition: all 0.3s ease;
  background-color: #fff;
}

:deep(.el-card__header) {
  border-bottom: 1px solid #fed7aa;
  padding: 1rem 1.5rem;
}

:deep(.el-button--warning) {
  background-color: #f97316;
  border-color: #f97316;
  color: white;
}

:deep(.el-button--warning:hover) {
  background-color: #ea580c;
  border-color: #ea580c;
}

:deep(.el-table) {
  --el-table-border-color: #fed7aa;
  --el-table-header-bg-color: #fff7ed;
  --el-table-row-hover-bg-color: #ffedd5;
}

:deep(.el-table th.el-table__cell) {
  background-color: #fff7ed;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background-color: #fff7ed;
}
</style>