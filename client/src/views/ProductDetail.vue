<template>
  <div class="product-detail-container">
    <!-- 商品內容區域 -->
    <el-card class="product-card" v-if="product" shadow="never">
      <div class="product-content">
        <!-- 左側商品圖片 -->
        <div class="product-image-section">
          <el-image
              :src="product.image || '/api/placeholder/800/800'"
              fit="cover"
              :preview-src-list="[product.image]"
              hide-on-click-modal
          >
            <template #error>
              <div class="image-placeholder">
                <el-icon :size="48"><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>

        <!-- 右側商品資訊 -->
        <div class="product-info-section">
          <!-- 商品基本資訊 -->
          <div class="product-header">
            <h1 class="product-name">{{ product.name }}</h1>
            <div class="product-status">
              <el-tag
                  v-if="product.stock === 0"
                  type="danger"
                  effect="dark"
              >
                已售完
              </el-tag>
              <el-tag
                  v-else-if="product.specialPrice"
                  type="warning"
                  effect="dark"
              >
                特價商品
              </el-tag>
            </div>
          </div>

          <!-- 價格區域 -->
          <div class="price-section">
            <template v-if="product.specialPrice">
              <div class="special-price">
                NT$ {{ formatPrice(product.specialPrice) }}
                <span class="discount-tag">
                  {{ calculateDiscount(product.price, product.specialPrice) }}% OFF
                </span>
              </div>
              <div class="original-price">
                原價：NT$ {{ formatPrice(product.price) }}
              </div>
            </template>
            <div v-else class="regular-price">
              NT$ {{ formatPrice(product.price) }}
            </div>
          </div>

          <!-- 庫存資訊 -->
          <div class="stock-info">
            庫存狀態：
            <span :class="{ 'text-danger': product.stock === 0 }">
              {{ product.stock > 0 ? `現貨 ${product.stock} 件` : '已售完' }}
            </span>
          </div>

          <!-- 購買區域 -->
          <div class="purchase-section">
            <el-input-number
                v-model="quantity"
                :min="product.stock === 0 ? 0 : 1"
                :max="product.stock"
                :disabled="product.stock === 0"
            />
            <el-button
                type="primary"
                size="large"
                :disabled="product.stock === 0 || !isAuthenticated"
                :loading="loading"
                @click="addToCart"
            >
              {{ getButtonText }}
            </el-button>
          </div>

          <!-- 商品描述 (取代商品規格區域) -->
          <div class="specifications-section">
            <el-divider>商品描述</el-divider>
            <p class="product-description">{{ product.description }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 載入中狀態 -->
    <div v-else-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 錯誤狀態 -->
    <el-empty
        v-else
        description="找不到商品資訊"
    >
      <el-button type="primary" @click="$router.push('/products')">
        返回商品列表
      </el-button>
    </el-empty>
  </div>
</template>



<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'


import {
  Picture
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const product = ref(null)
const loading = ref(false)
const quantity = ref(1)

const isAuthenticated = computed(() => store.state.auth.token)

const getButtonText = computed(() => {
  if (!isAuthenticated.value) return '請先登入'
  if (product.value?.stock === 0) return '已售完'
  return '加入購物車'
})

//變更價格格式
const formatPrice = (price) => {
  return price.toLocaleString('zh-TW')
}

// 計算折扣率
const calculateDiscount = (original, special) => {
  return Math.round((1 - special / original) * 100)
}

// 獲取商品詳情
const fetchProductDetail = async () => {
  const productId = route.params.id
  if (!productId) {
    router.push('/products')
    return
  }

  try {
    loading.value = true
    const response = await fetch(`http://localhost:3000/api/products/${productId}`)
    const result = await response.json()

    if (!result.success && !result._id) {
      ElMessage.error('無法獲取商品資訊')
      return
    }

    product.value = result
  } catch (error) {
    ElMessage.error('獲取商品資訊失敗')
    console.error('獲取商品詳情失敗:', error)
  } finally {
    loading.value = false
  }
}

// 加入購物車
const addToCart = async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('請先登入再購物')
    router.push('/login')
    return
  }

  if (product.value.stock === 0) {
    ElMessage.warning('商品已售完')
    return
  }

  try {
    loading.value = true
    await store.dispatch('addToCart', {
      product: product.value,
      quantity: quantity.value
    })
    ElMessage.success('已加入購物車')
  } catch (error) {
    ElMessage.error(error.message || '加入購物車失敗')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
  // 將頁面滾動到頂部
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // 使用平滑滾動效果
  })
})
</script>

<style scoped>
.product-detail-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

/* 商品圖片區域 */
.product-image-section {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.product-image-section .el-image {
  width: 100%;
  height: 500px;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
}

/* 商品資訊區域 */
.product-info-section {
  padding: 20px 0;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.product-name {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.product-description {
  color: #606266;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* 價格區域 */
.price-section {
  margin-bottom: 24px;
}

.special-price {
  font-size: 32px;
  font-weight: 600;
  color: #f56c6c;
  display: flex;
  align-items: center;
  gap: 12px;
}

.discount-tag {
  font-size: 14px;
  background: #fff2f0;
  color: #f56c6c;
  padding: 4px 8px;
  border-radius: 4px;
}

.original-price {
  font-size: 14px;
  color: #909399;
  text-decoration: line-through;
  margin-top: 4px;
}

.regular-price {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
}

/* 庫存資訊 */
.stock-info {
  margin-bottom: 24px;
  color: #606266;
}

.text-danger {
  color: #f56c6c;
}

/* 購買區域 */
.purchase-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.purchase-section .el-button {
  flex: 1;
}

/* 商品規格 */
.specifications-section {
  margin-top: 32px;
}

/* RWD */
@media (max-width: 992px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .product-image-section .el-image {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .product-detail-container {
    padding: 0 16px;
  }

  .product-name {
    font-size: 20px;
  }

  .special-price,
  .regular-price {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .product-image-section .el-image {
    height: 300px;
  }

  .purchase-section {
    flex-direction: column;
  }

  .product-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style>