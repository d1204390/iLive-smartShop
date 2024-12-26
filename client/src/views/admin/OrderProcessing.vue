<!-- OrderProcessing.vue -->
<template>
  <el-dialog
      v-model="dialogVisible"
      title="訂單出貨處理"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        v-loading="loading"
    >
      <el-form-item label="物流單號" prop="trackingNumber">
        <el-input
            v-model="form.trackingNumber"
            placeholder="請輸入物流單號"
        />
      </el-form-item>

      <el-form-item label="備註">
        <el-input
            v-model="form.notes"
            type="textarea"
            :rows="3"
            placeholder="請輸入備註（選填）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="primary"
            @click="handleSubmit"
            :loading="loading"
        >
          確認出貨
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import axios from 'axios'

export default {
  name: 'OrderProcessing',
  props: {
    orderId: {
      type: String,
      required: true
    }
  },

  setup(props, { emit }) {
    const store = useStore()
    const formRef = ref(null)
    const loading = ref(false)
    const dialogVisible = ref(true)

    const form = reactive({
      trackingNumber: '',
      notes: ''
    })

    const rules = {
      trackingNumber: [
        { required: true, message: '請輸入物流單號', trigger: 'blur' }
      ]
    }

    const handleSubmit = async () => {
      if (!formRef.value) return

      try {
        await formRef.value.validate()
        loading.value = true

        const response = await axios.put(
            `${import.meta.env.VITE_API_BASE_URL}/api/orders/${props.orderId}/status`,
            {
              status: 'shipped',
              trackingNumber: form.trackingNumber,
              notes: form.notes
            },
            {
              headers: { Authorization: `Bearer ${store.state.auth.token}` }
            }
        );


        if (response.data.success) {
          ElMessage.success('訂單出貨成功')
          emit('process-completed')
          handleClose()
        }
      } catch (error) {
        if (error?.message) return // 表單驗證錯誤，不顯示其他錯誤訊息
        ElMessage.error('更新失敗：' + (error.response?.data?.message || '請稍後再試'))
        console.error('更新失敗:', error)
      } finally {
        loading.value = false
      }
    }

    const handleClose = () => {
      dialogVisible.value = false
      emit('close')
    }

    return {
      formRef,
      form,
      rules,
      loading,
      dialogVisible,
      handleSubmit,
      handleClose
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>