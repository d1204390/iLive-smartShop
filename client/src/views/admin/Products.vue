<template>
  <div class="products-container">
    <!-- 頁面頂部 -->
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="showForm = true" :icon="Plus">
        新增商品
      </el-button>
    </div>

    <!-- 過濾器 -->
    <div class="filter-section">
      <el-select
          v-model="selectedCategory"
          placeholder="類別"
          clearable
          class="filter-item"
          size="default"
      >
        <el-option label="全部類別" value="" />
        <el-option
            v-for="(label, value) in categoryMap"
            :key="value"
            :label="label"
            :value="value"
        />
      </el-select>

      <el-select
          v-model="stockFilter"
          placeholder="庫存"
          clearable
          class="filter-item"
          size="default"
      >
        <el-option label="全部商品" value="" />
        <el-option label="庫存不足" value="low" />
        <el-option label="庫存充足" value="sufficient" />
      </el-select>

      <el-select
          v-model="statusFilter"
          placeholder="狀態"
          clearable
          class="filter-item"
          size="default"
      >
        <el-option label="全部狀態" value="" />
        <el-option label="販售中" value="active" />
        <el-option label="已下架" value="inactive" />
      </el-select>

      <el-button
          type="info"
          plain
          @click="resetFilters"
          :icon="Refresh"
      >
        重置篩選
      </el-button>
    </div>

    <!-- 商品列表 -->
    <el-card shadow="hover" class="products-table">
      <el-table
          :data="filteredProducts"
          style="width: 100%"
          border
          stripe
          v-loading="loading"
      >
        <el-table-column label="商品圖片" width="100">
          <template #default="scope">
            <el-image
                v-if="scope.row.image"
                :src="scope.row.image"
                fit="cover"
                :preview-src-list="getImagePreviewList(scope.row.image)"
                :initial-index="0"
                preview-teleported
                class="product-image"
            />
            <el-image
                v-else
                src="/api/placeholder/100/100"
                fit="cover"
                class="product-image"
            />
          </template>
        </el-table-column>

        <el-table-column prop="name" label="商品名稱" min-width="200" />

        <el-table-column prop="category" label="類別" width="120">
          <template #default="scope">
            <el-tag>{{ formatCategory(scope.row.category) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="價格" width="150">
          <template #default="scope">
            <div class="price-column">
              <span :class="{ 'original-price': scope.row.specialPrice }">
                NT$ {{ scope.row.price.toLocaleString() }}
              </span>
              <span v-if="scope.row.specialPrice" class="special-price">
                NT$ {{ scope.row.specialPrice.toLocaleString() }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="stock" label="庫存" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.stock > 10 ? 'success' : 'danger'">
              {{ scope.row.stock }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.isActive ? 'success' : 'info'">
              {{ scope.row.isActive ? '販售中' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button-group>
              <el-button
                  type="primary"
                  link
                  :icon="Edit"
                  @click="editProduct(scope.row)"
              >
                編輯
              </el-button>
              <el-button
                  :type="scope.row.isActive ? 'warning' : 'success'"
                  link
                  :icon="scope.row.isActive ? 'Remove' : 'Check'"
                  @click="toggleProductStatus(scope.row)"
              >
                {{ scope.row.isActive ? '下架' : '上架' }}
              </el-button>
              <el-popconfirm
                  title="確定要刪除此商品嗎？"
                  @confirm="deleteProduct(scope.row._id)"
              >
                <template #reference>
                  <el-button
                      type="danger"
                      link
                      :icon="Delete"
                  >
                    刪除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 商品表單對話框 -->
    <el-dialog
        v-model="showForm"
        :title="editingProduct ? '編輯商品' : '新增商品'"
        width="650px"
        destroy-on-close
    >
      <el-form
          ref="productForm"
          :model="form"
          label-width="100px"
          :rules="formRules"
      >
        <el-form-item label="商品圖片">
          <el-upload
              class="image-upload"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handleImageUpload"
          >
            <el-image
                v-if="imagePreview"
                :src="imagePreview"
                fit="cover"
                class="upload-preview"
            />
            <div v-else class="upload-placeholder">
              <el-icon :size="30"><Plus /></el-icon>
              <span>點擊上傳圖片</span>
            </div>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品名稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="類別" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option label="智慧照明" value="smart_lighting" />
            <el-option label="智慧安防" value="smart_security" />
            <el-option label="智慧廚房" value="smart_kitchen" />
            <el-option label="智慧空調" value="smart_climate" />
            <el-option label="智慧影音" value="smart_audio" />
            <el-option label="智慧清潔" value="smart_cleaning" />
            <el-option label="其他" value="others" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="原價" prop="price">
              <el-input-number
                  v-model="form.price"
                  :min="0"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="特惠價">
              <el-input-number
                  v-model="form.specialPrice"
                  :min="0"
                  :max="form.price"
                  style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="庫存" prop="stock">
          <el-input-number
              v-model="form.stock"
              :min="0"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="form.description"
              type="textarea"
              :rows="4"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          {{ editingProduct ? '更新' : '創建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Delete,
  Check,
  Remove,
  Hide,
  View, Refresh,
} from '@element-plus/icons-vue'

export default {
  setup() {
    const store = useStore()
    const loading = ref(false) // 添加 loading ref
    const products = ref([])
    const showForm = ref(false)
    const editingProduct = ref(null)
    const imagePreview = ref('')
    const productForm = ref(null)

    // 商品狀態統計
    const activeCount = computed(() =>
        products.value.filter(p => p.isActive).length
    )

    const inactiveCount = computed(() =>
        products.value.filter(p => !p.isActive).length
    )

    // 篩選狀態
    const selectedCategory = ref('')
    const stockFilter = ref('')
    const statusFilter = ref('')

    // 類別映射
    const categoryMap = {
      smart_lighting: '智慧照明',
      smart_security: '智慧安防',
      smart_kitchen: '智慧廚房',
      smart_climate: '智慧空調',
      smart_audio: '智慧影音',
      smart_cleaning: '智慧清潔',
      others: '其他'
    }
    const getImagePreviewList = (image) => {
      return image ? [image] : []
    }

    // 過濾後的商品列表
    const filteredProducts = computed(() => {
      return products.value.filter(product => {
        // 類別過濾
        if (selectedCategory.value && product.category !== selectedCategory.value) {
          return false
        }

        // 庫存狀態過濾
        if (stockFilter.value) {
          const isLowStock = product.stock <= 10
          if (stockFilter.value === 'low' && !isLowStock) return false
          if (stockFilter.value === 'sufficient' && isLowStock) return false
        }

        // 商品狀態過濾
        if (statusFilter.value) {
          const isActive = product.isActive
          if (statusFilter.value === 'active' && !isActive) return false
          if (statusFilter.value === 'inactive' && isActive) return false
        }

        return true
      })
    })

    // 表單驗證規則
    const formRules = {
      name: [
        { required: true, message: '請輸入商品名稱', trigger: 'blur' }
      ],
      category: [
        { required: true, message: '請選擇商品類別', trigger: 'change' }
      ],
      price: [
        { required: true, message: '請輸入商品價格', trigger: 'blur' }
      ],
      specialPrice: [
        {
          validator: (rule, value, callback) => {
            if (!value) {
              callback();
              return;
            }
            if (value <= 0) {
              callback(new Error('特惠價格必須大於0'));
              return;
            }
            if (value >= form.value.price) {
              callback(new Error('特惠價格必須低於原價'));
              return;
            }
            callback();
          },
          trigger: ['blur', 'change']
        }
      ],
      stock: [
        { required: true, message: '請輸入商品庫存', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '請輸入商品描述', trigger: 'blur' }
      ]
    }

    const form = ref({
      name: '',
      category: '',
      price: 0,
      specialPrice: null,
      stock: 0,
      description: '',
      image: ''
    })

    // 格式化類別顯示
    const formatCategory = (category) => {
      return categoryMap[category] || category
    }

    // 保持原有的所有方法不變
    const handleImageUpload = (event) => {
      const file = event.raw || event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
          form.value.image = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const fetchProducts = async () => {
      try {
        loading.value = true
        const response = await fetch('http://localhost:3000/api/products/admin', {
          headers: {
            'Authorization': `Bearer ${store.state.auth.token}`
          }
        })
        const result = await response.json()

        if (result.success === false) {
          throw new Error(result.message)
        }

        if (Array.isArray(result)) {
          products.value = result
        } else if (result.data) {
          products.value = result.data
        } else {
          products.value = []
        }

        console.log('商品列表:', products.value)
      } catch (error) {
        console.error('獲取商品失敗:', error)
        ElMessage.error('獲取商品列表失敗')
        products.value = []
      } finally {
        loading.value = false
      }
    }

    const resetFilters = () => {
      selectedCategory.value = ''
      stockFilter.value = ''
      statusFilter.value = ''
      ElMessage.success('已重置所有篩選條件')
    }

    const editProduct = (product) => {
      editingProduct.value = product
      form.value = { ...product }
      imagePreview.value = product.image
      showForm.value = true
    }

    const toggleProductStatus = async (product) => {
      try {
        await fetch(`http://localhost:3000/api/products/${product._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.state.auth.token}`
          },
          body: JSON.stringify({
            isActive: !product.isActive
          })
        })
        await fetchProducts()
        ElMessage.success(product.isActive ? '商品已下架' : '商品已上架')
      } catch (error) {
        console.error('更新商品狀態失敗:', error)
        ElMessage.error('操作失敗')
      }
    }

    const deleteProduct = async (productId) => {
      try {
        await fetch(`http://localhost:3000/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${store.state.auth.token}`
          }
        })
        await fetchProducts()
        ElMessage.success('商品已刪除')
      } catch (error) {
        console.error('刪除商品失敗:', error)
        ElMessage.error('刪除失敗')
      }
    }

    const handleSubmit = async () => {
      if (!productForm.value) return;

      try {
        await productForm.value.validate();

        const productData = {
          name: form.value.name.trim(),
          category: form.value.category,
          price: Number(form.value.price),
          specialPrice: form.value.specialPrice && form.value.specialPrice > 0 && form.value.specialPrice < form.value.price ?
              Number(form.value.specialPrice) :
              null,
          stock: Number(form.value.stock),
          description: form.value.description.trim(),
          isActive: editingProduct.value ? editingProduct.value.isActive : true,
          image: form.value.image
        };

        // 添加詳細的日誌
        console.log('編輯模式:', !!editingProduct.value);
        console.log('商品ID:', editingProduct.value?._id);
        console.log('完整表單數據:', form.value);
        console.log('處理後的數據:', productData);

        const url = editingProduct.value
            ? `http://localhost:3000/api/products/${editingProduct.value._id}`
            : 'http://localhost:3000/api/products';

        console.log('請求URL:', url);

        const response = await fetch(url, {
          method: editingProduct.value ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${store.state.auth.token}`
          },
          body: JSON.stringify(productData)
        });

        const result = await response.json();
        console.log('API 響應:', result);

        if (!response.ok) {
          throw new Error(result.message || '操作失敗');
        }

        await fetchProducts();
        closeForm();
        ElMessage.success(editingProduct.value ? '商品已更新' : '商品已創建');
      } catch (error) {
        // 更詳細的錯誤日誌
        console.error('保存商品失敗，詳細錯誤:', {
          error: error.message,
          stack: error.stack,
          form: form.value,
          editingProduct: editingProduct.value
        });
        ElMessage.error(error.message || '保存失敗');
      }
    };


    const closeForm = () => {
      showForm.value = false
      editingProduct.value = null
      imagePreview.value = ''
      form.value = {
        name: '',
        category: '',
        price: 0,
        specialPrice: null,
        stock: 0,
        description: '',
        image: ''
      }
      if (productForm.value) {
        productForm.value.resetFields()
      }
    }

    onMounted(() => {
      fetchProducts()
    })

    return {
      resetFilters,
      loading,
      products,
      showForm,
      editingProduct,
      form,
      imagePreview,
      productForm,
      formRules,
      selectedCategory,
      stockFilter,
      statusFilter,
      categoryMap,
      filteredProducts,
      activeCount,
      inactiveCount,
      handleImageUpload,
      editProduct,
      toggleProductStatus,
      deleteProduct,
      handleSubmit,
      closeForm,
      formatCategory,
      getImagePreviewList,
      // Icons
      Plus,
      Edit,
      Delete,
      Check,
      Remove,
      Hide,
      View,
      Refresh
    }
  }
}
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.filter-section {
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.filter-item {
  min-width: 140px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.products-table {
  margin-bottom: 20px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.price-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.original-price {
  text-decoration: line-through;
  color: #909399;
  font-size: 13px;
}

.special-price {
  color: var(--el-color-danger);
  font-weight: 600;
}

.image-upload {
  display: block;
  width: 100%;
}

.upload-preview {
  width: 200px;
  height: 200px;
  border-radius: 4px;
  border: 1px solid var(--el-border-color);
}

.upload-placeholder {
  width: 200px;
  height: 200px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-placeholder:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.upload-placeholder span {
  margin-top: 8px;
  font-size: 14px;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}
</style>