// Users.vue
<template>
  <div class="users-container">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <h2>用戶管理</h2>
          <el-button
              :loading="loading"
              circle
              @click="fetchUsers"
          >
            <el-icon><Refresh /></el-icon>
          </el-button>
        </div>
      </template>

      <el-table
          v-loading="loading"
          :data="filteredUsers"
          border
          stripe
      >
        <el-table-column prop="email" label="用戶信箱" width="250" />
        <el-table-column label="註冊時間" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="row.role === 'admin' ? 'danger' : 'primary'">
              {{ getUserRole(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="狀態" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '啟用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
                :type="row.isActive ? 'danger' : 'success'"
                size="small"
                @click="toggleUserStatus(row._id, !row.isActive)"
            >
              {{ row.isActive ? '停用' : '啟用' }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暫無用戶數據" />
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useStore } from 'vuex';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';

export default {
  name: 'UsersManagement',

  setup() {
    const store = useStore();
    const users = ref([]);
    const loading = ref(false);

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('zh-TW');
    };

    const getUserRole = (role) => {
      return role === 'admin' ? '管理員' : '一般用戶';
    };

    // 篩選不顯示 admin 角色的用戶
    const filteredUsers = computed(() => {
      return users.value.filter(user => user.role !== 'admin');
    });

    // 獲取所有用戶
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await axios.get('http://localhost:3000/api/admin/users', {
          headers: { Authorization: `Bearer ${store.state.auth.token}` },
        });
        users.value = response.data;
      } catch (error) {
        ElMessage.error('獲取用戶列表失敗：' + (error.response?.data?.message || '請稍後再試'));
      } finally {
        loading.value = false;
      }
    };

    // 切換用戶狀態（啟用/停用）
    const toggleUserStatus = async (userId, isActive) => {
      try {
        await ElMessageBox.confirm(
            `確定要${isActive ? '啟用' : '停用'}此用戶帳號？`,
            '提示',
            {
              confirmButtonText: '確定',
              cancelButtonText: '取消',
              type: isActive ? 'success' : 'warning'
            }
        );

        await axios.put(
            `http://localhost:3000/api/admin/users/${userId}/status`,
            { isActive },
            { headers: { Authorization: `Bearer ${store.state.auth.token}` } }
        );

        await fetchUsers();
        ElMessage.success('用戶狀態已更新');
      } catch (error) {
        if (error === 'cancel') return;
        ElMessage.error('更新失敗：' + (error.response?.data?.message || '請稍後再試'));
      }
    };

    onMounted(() => {
      fetchUsers();
    });

    return {
      users,
      loading,
      filteredUsers,
      formatDate,
      getUserRole,
      toggleUserStatus,
      Refresh
    };
  },
};
</script>

<style scoped>
.users-container {
  padding: 20px;
}

h2 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}
</style>