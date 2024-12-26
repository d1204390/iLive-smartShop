<template>
  <div class="products-page">
    <!-- 分類導航 -->
    <div class="category-nav">
      <div class="container">
        <el-menu
            mode="horizontal"
            :default-active="selectedCategory"
            class="category-menu"
            @select="handleCategorySelect"
        >
          <el-menu-item index="">全部商品</el-menu-item>
          <el-menu-item
              v-for="cat in categories"
              :key="cat.value"
              :index="cat.value"
          >
            {{ cat.label }}
          </el-menu-item>
        </el-menu>
      </div>
    </div>

    <div class="container">
      <!-- 篩選工具列 -->
      <div class="toolbar">
        <div class="search-box">
          <el-input
              v-model="searchKeyword"
              placeholder="搜尋商品"
              :prefix-icon="Search"
              clearable
          />
        </div>
        <div class="sort-box">
          <el-radio-group v-model="sortMethod" size="large">
            <el-radio-button label="default">預設</el-radio-button>
            <el-radio-button label="priceAsc">價格由低到高</el-radio-button>
            <el-radio-button label="priceDesc">價格由高到低</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="products-grid">
        <div
            v-for="product in sortedProducts"
            @click="router.push(`/products/${product._id}`)"
            :key="product._id"
            class="product-item"
        >
          <div class="product-card" :class="{ 'sold-out': product.stock === 0 }">
            <!-- 商品圖片 -->
            <div class="product-image">
              <el-image
                  :src="product.image || '/api/placeholder/800/800'"
                  fit="cover"
                  loading="lazy"
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon :size="48"><Picture /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- 標籤 -->
              <div class="product-labels" v-if="product.specialPrice || product.stock === 0">
                <span v-if="product.stock === 0" class="sold-out-label">已售完</span>
                <span v-else-if="product.specialPrice" class="discount-label">
                  優惠 {{ calculateDiscount(product.price, product.specialPrice) }}% OFF
                </span>
              </div>
            </div>

            <!-- 商品資訊 -->
            <div class="product-info">
              <h3 class="product-name">{{ product.name }}</h3>

              <!-- 價格區 -->
              <div class="product-price">
                <template v-if="product.specialPrice">
                  <span class="current-price">NT$ {{ formatPrice(product.specialPrice) }}</span>
                  <span class="original-price">NT$ {{ formatPrice(product.price) }}</span>
                </template>
                <span v-else class="current-price">NT$ {{ formatPrice(product.price) }}</span>
              </div>

              <!-- 按鈕區 -->
              <div class="product-action">
                <el-button
                    type="primary"
                    class="buy-button"
                    :disabled="!isAuthenticated || product.stock === 0"
                    :loading="loading"
                    @click.stop="addToCart(product)"
                >
                  {{ getButtonText(product) }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 無商品時顯示 -->
      <el-empty
          v-if="!filteredProducts.length"
          description="暫無相關商品"
      >
        <el-button type="primary" @click="resetFilters">重新篩選</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  Search,
  Picture
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const store = useStore()
const products = ref([])
const searchKeyword = ref('')
const selectedCategory = ref('')
const sortMethod = ref('default')
const loading = ref(false)
const router = useRouter()
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
const route = useRoute()


// 商品分類
const categories = [
  { label: '智慧照明', value: 'smart_lighting' },
  { label: '智慧安防', value: 'smart_security' },
  { label: '智慧廚房', value: 'smart_kitchen' },
  { label: '智慧空調', value: 'smart_climate' },
  { label: '智慧影音', value: 'smart_audio' },
  { label: '智慧清潔', value: 'smart_cleaning' }
]

const isAuthenticated = computed(() => !!store.state.auth.token)

// 篩選商品
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchKeyword = (product.name + product.description)
        .toLowerCase()
        .includes(searchKeyword.value.toLowerCase())
    const matchCategory = !selectedCategory.value || product.category === selectedCategory.value
    return matchKeyword && matchCategory && product.isActive
  })
})

// 排序商品
const sortedProducts = computed(() => {
  const sorted = [...filteredProducts.value]
  switch (sortMethod.value) {
    case 'priceAsc':
      return sorted.sort((a, b) => (a.specialPrice || a.price) - (b.specialPrice || b.price))
    case 'priceDesc':
      return sorted.sort((a, b) => (b.specialPrice || b.price) - (a.specialPrice || a.price))
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    default:
      return sorted
  }
})

// 計算折扣率
const calculateDiscount = (original, special) => {
  return Math.round((1 - special / original) * 100)
}

// 獲取按鈕文字
const getButtonText = (product) => {
  if (!isAuthenticated.value) return '加入購物車前請先登入'
  if (product.stock === 0) return '已售完'
  return '加入購物車'
}

// 處理分類選擇
const handleCategorySelect = (category) => {
  selectedCategory.value = category
}

// 加入購物車
const addToCart = async (product) => {
  if (!isAuthenticated.value) {
    ElMessage({
      message: '請先登入再購物',
      type: 'warning'
    })
    return
  }

  if (product.stock === 0) {
    ElMessage({
      message: '商品已售完',
      type: 'warning'
    })
    return
  }

  try {
    loading.value = true
    await store.dispatch('addToCart', { product, quantity: 1 })
    ElMessage.success('已加入購物車')
  } catch (error) {
    ElMessage.error(error.message || '加入購物車失敗')
  } finally {
    loading.value = false
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('zh-TW')
}

// 重置篩選
const resetFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  sortMethod.value = 'default'
}

// 獲取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products`)
    const result = await response.json()
    products.value = Array.isArray(result) ? result : (result.data || [])
  } catch (error) {
    ElMessage.error('獲取商品列表失敗')
  } finally {
    loading.value = false
  }
}

// 滾動到頂部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}


// 監聽路由參數變化
onBeforeRouteUpdate((to) => {
  const categoryFromQuery = to.query.category
  if (categoryFromQuery) {
    selectedCategory.value = categoryFromQuery
  }
  scrollToTop()
})

// 從路由參數中獲取分類
onMounted(() => {
  fetchProducts()
  // 如果URL中有category參數，設置選中的分類
  const categoryFromQuery = route.query.category
  if (categoryFromQuery) {
    selectedCategory.value = categoryFromQuery
  }
  scrollToTop()
})
</script>

<style scoped>
/* 基礎布局 */
.products-page {
  background: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1226px;
  margin: 0 auto;
  padding: 0 14px;
}

/* 分類導航 */
.category-nav {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  margin-bottom: 24px;
}

.category-menu {
  border: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.category-menu :deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  padding: 0 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-radius: 6px;
  margin: 6px 0;
}

.category-menu :deep(.el-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.04);
  color: #ff6700;
}

.category-menu :deep(.el-menu-item.is-active) {
  font-weight: 600;
  color: #ff6700;
  background-color: rgba(255, 103, 0, 0.1);
}

/* 工具列 */
.toolbar {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 28px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

.search-box :deep(.el-input) {
  --el-input-hover-border-color: #ff6700;
  --el-input-focus-border-color: #ff6700;
}

.search-box :deep(.el-input__wrapper) {
  border-radius: 8px;
  padding: 4px 12px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-box :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #ff6700;
}

.search-box :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(255, 103, 0, 0.2);
}

.sort-box {
  justify-self: end;
}

.sort-box :deep(.el-radio-group) {
  display: flex;
  gap: 12px;
}

.sort-box :deep(.el-radio-button__inner) {
  padding: 0 20px;
  height: 44px;
  line-height: 42px;
  font-size: 14px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  transition: all 0.3s ease;
}

.sort-box :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: #ff6700;
  border-color: #ff6700;
  box-shadow: none;
}

.sort-box :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 8px;
}

.sort-box :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 8px;
}

/* 商品網格 */
.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 40px;
}

/* 商品卡片 */
.product-card {
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);

}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}

/* 商品圖片 */
.product-image {
  position: relative;
  padding-top: 100%;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
}

.product-image .el-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image .el-image {
  transform: scale(1.05);
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 商品標籤 */
.product-labels {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
}

.discount-label,
.sold-out-label {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #fff;
}

.discount-label {
  background: #ff6700;
}

.sold-out-label {
  background: #999;
}

/* 商品資訊 */
.product-info {
  padding: 20px;
}

.product-name {
  font-size: 16px;
  font-weight: 400;
  color: #333;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.product-card:hover .product-name {
  color: #ff6700;
}

.product-brief {
  font-size: 12px;
  color: #757575;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;  /* 限制為2行 */
  -webkit-box-orient: vertical;
  height: 36px;      /* 固定高度 = 行高 * 行數 */
  line-height: 1.5;  /* 設定行高 */
}

/* 價格相關 */
.product-price {
  margin-bottom: 16px;
}

.current-price {
  font-size: 20px;
  color: #ff6700;
  font-weight: 600;
  margin-right: 8px;
  transition: color 0.3s ease;
}

.product-card:hover .current-price {
  color: #ff4d00;
}

.original-price {
  font-size: 14px;
  color: #b0b0b0;
  text-decoration: line-through;
}

/* 購買按鈕 */
.product-action {
  text-align: center;
}

.buy-button {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;
  opacity: 0.9;
}

.product-card:hover .buy-button:not(:disabled) {
  opacity: 1;
  transform: translateY(-2px);
}

/* 售完狀態 */
.sold-out .product-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2);
  transition: background-color 0.3s ease;
}

.sold-out:hover .product-image::after {
  background: rgba(0,0,0,0.3);
}

/* RWD */
@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar {
    flex-direction: column;
    gap: 16px;
  }

  .search-box {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>