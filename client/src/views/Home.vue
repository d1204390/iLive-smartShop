<template>
  <div class="home-container">
    <!-- 主輪播圖 - 改用全屏設計 -->
    <el-carousel height="560px" indicator-position="outside" :interval="5000" class="hero-carousel">
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <div class="banner-content" :style="{ backgroundImage: `url(${banner.image})` }">
          <div class="banner-overlay"></div>
          <div class="banner-text">
            <h1 class="banner-title">{{ banner.title }}</h1>
            <p class="banner-description">{{ banner.description }}</p>
            <el-button type="primary" size="large" class="banner-btn" @click="handleBannerClick(banner)">
              {{ banner.buttonText }}
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <!-- 商品分類導航 - 改用卡片式設計 -->
    <div class="section-container category-section">
      <h2 class="section-title">熱門分類</h2>
      <div class="category-grid">
        <div v-for="category in categories" :key="category.id"
             class="category-card"
             :class="{ 'category-card-hover': hoveredCategory === category.id }"
             @mouseenter="hoveredCategory = category.id"
             @mouseleave="hoveredCategory = null"
             @click="handleCategoryClick(category.value)">
          <el-icon :size="40">
            <component :is="category.icon" />
          </el-icon>
          <h3>{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
        </div>
      </div>
    </div>

    <!-- 特色活動區 - 改用現代卡片設計 -->
    <div class="section-container promotions-section">
      <h2 class="section-title">精選活動</h2>
      <div class="promotions-grid">
        <div v-for="promo in promotions" :key="promo.id" class="promo-card">
          <div class="promo-image">
            <el-image :src="promo.image" fit="cover" />
          </div>
          <div class="promo-content">
            <span class="promo-tag">限時特惠</span>
            <h3>{{ promo.title }}</h3>
            <p>{{ promo.description }}</p>
            <el-button
                type="primary"
                text
                class="promo-btn"
                @click="handlePromoClick(promo)"
            >
              立即選購
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 精選商品 - 改用現代網格設計 -->
    <div class="section-container featured-section">
      <div class="section-header">
        <h2 class="section-title">精選商品</h2>
        <el-button type="primary" text @click="router.push('/products')">
          查看更多
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="products-grid">
        <div v-for="product in products" :key="product._id" class="product-card">
          <div class="product-image">
            <el-image
                :src="product.image || '/api/placeholder/300/300'"
                fit="cover"
            />
            <div class="product-overlay">
              <el-button
                  type="primary"
                  circle
                  class="quick-view-btn"
                  @click.stop="router.push(`/products/${product._id}`)"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                  type="primary"
                  circle
                  class="add-to-cart-btn"
                  :disabled="!hasToken"
                  @click.stop="addToCart(product)"
              >
                <el-icon><ShoppingCart /></el-icon>
              </el-button>

            </div>
          </div>
          <div class="product-info">
            <h3 class="product-title">{{ product.name }}</h3>
            <div class="product-price">
              <template v-if="product.specialPrice">
                <span class="special-price">NT$ {{ formatPrice(product.specialPrice) }}</span>
                <span class="original-price">NT$ {{ formatPrice(product.price) }}</span>
              </template>
              <span v-else class="regular-price">NT$ {{ formatPrice(product.price) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 品牌優勢 - 改用卡片式設計 -->
    <div class="features-section">
      <div class="section-container">
        <h2 class="section-title">為什麼選擇我們</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.id" class="feature-card">
            <el-icon :size="48">
              <component :is="feature.icon" />
            </el-icon>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'
import {
  Monitor,
  Refrigerator,
  WindPower,
  HomeFilled,
  Box,
  ShoppingCart,
  ArrowRight,
  Van,
  Service,
  GoodsFilled,
  RefreshRight,
  View
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
import { computed } from 'vue';

const hasToken = computed(() => {
  return !!localStorage.getItem('token'); // 如果 token 存在，返回 true
});

const store = useStore()
const products = ref([])
const hoveredCategory = ref(null)

// 主輪播圖數據
const banners = ref([
  {
    id: 2,
    title: 'iLive智慧家電',
    description: '打造智能生活新體驗',
    buttonText: '了解更多',
    link: '/about',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MTB8fHNtYXJ0JTIwaG9tZXxlbnwwfHx8fDE2OTA4MDQ0ODd8MA&ixlib=rb-4.0.3&q=80&w=1920'
  },
  {
    id: 1,
    title: '智慧廚房新革命',
    description: '透過智慧科技，讓烹飪變得更簡單',
    buttonText: '立即選購',
    link: 'smart_kitchen',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8Mnx8c21hcnQlMjBraXRjaGVufGVufDB8fHx8MTY5MDgwNDQyOXww&ixlib=rb-4.0.3&q=80&w=1920'
  },
  {
    id: 3,
    title: '限時空調特惠',
    description: '享受舒適宜人的居家環境',
    buttonText: '搶購優惠',
    link: 'smart_climate',
    image: 'https://www.lg.com/content/dam/channel/wcms/ph/images/microsite/lg-article-air-conditioner-temperature/LG-Article-Air-Conditioner-Temperature-01-D.jpg'
  }
])

// 商品分類
const categories = ref([
  {
    id: 1,
    name: '智慧廚房',
    icon: 'Refrigerator',
    description: '打造智能烹飪空間',
    value: 'smart_kitchen'
  },
  {
    id: 2,
    name: '智慧空調',
    icon: 'WindPower',
    description: '智能溫控新體驗',
    value: 'smart_climate'
  },
  {
    id: 3,
    name: '智慧影音',
    icon: 'Monitor',
    description: '極致視聽饗宴',
    value: 'smart_audio'
  },
])

// 促銷活動
const promotions = ref([
  {
    id: 1,
    title: '廚房升級企劃',
    description: '限時優惠，智慧廚電最高折扣50%',
    image: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: 'smart_kitchen'
  },
  {
    id: 2,
    title: '空調精選特惠',
    description: '各類空調商品85折起，再送安裝服務',
    image: 'https://images.pexels.com/photos/6283961/pexels-photo-6283961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    link: 'smart_climate'
  }
])

// 品牌優勢
const features = ref([
  {
    id: 1,
    icon: 'Van',
    title: '免運配送',
    description: '單筆訂單滿 NT$800 即可享免運費'
  },
  {
    id: 2,
    icon: 'Service',
    title: '專業售後',
    description: '優質客服支援，提供售後服務'
  },
  {
    id: 3,
    icon: 'GoodsFilled',
    title: '正品保證',
    description: '100%原廠正品保證，品質有保障'
  },
  {
    id: 4,
    icon: 'RefreshRight',
    title: '輕鬆退換',
    description: '7天鑑賞期，購物無憂退換保證'
  }
])

const fetchProducts = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/products')
    const result = await response.json()
    const allProducts = Array.isArray(result) ? result : (result.data || [])
    products.value = allProducts
        .filter(product => product.isActive && product.stock > 0)
        .slice(0, 4)
  } catch (error) {
    console.error('獲取商品失敗:', error)
    ElMessage.error('獲取商品失敗，請稍後再試')
  }
}

// 格式化價格
const formatPrice = (price) => {
  return price.toLocaleString('zh-TW')
}

const addToCart = (product) => {
  // 檢查是否存在 token
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.warning('請先登入才能加入購物車');
    router.push('/login'); // 導航至登入頁面
    return;
  }

  // 如果存在 token，執行加入購物車操作
  store.dispatch('addToCart', {
    product,
    quantity: 1
  });
  ElMessage.success('已加入購物車');
};


const handleCategoryClick = (categoryValue) => {
  router.push({
    path: '/products',
    query: { category: categoryValue }
  })
}

const handlePromoClick = (promo) => {
  if (!promo.link) return;

  // 如果 link 是以 / 開頭，表示是頁面路徑
  if (promo.link.startsWith('/')) {
    router.push(promo.link);
  } else {
    // 否則導航到產品分類頁
    router.push({
      path: '/products',
      query: { category: promo.link }
    });
  }
};


const handleBannerClick = (banner) => {
  if (!banner.link) return;

  // 如果link是以/開頭，表示是頁面路徑
  if (banner.link.startsWith('/')) {
    router.push(banner.link);
  } else {
    // 否則是產品分類
    router.push({
      path: '/products',
      query: { category: banner.link }
    });
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home-container {
  min-height: 100vh;
}

/* 全局section樣式 */
.section-container {
  max-width: 1200px;
  margin: 80px auto;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 40px;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: var(--el-color-primary);
  margin: 16px auto 0;
  border-radius: 2px;
}

/* 輪播圖樣式 */
.hero-carousel {
  margin: 20px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.banner-content {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.3));
}

.banner-text {
  position: absolute;
  left: 15%;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  z-index: 2;
}

.banner-title {
  font-size: 2.4em;
  font-weight: 700;
  margin-bottom: 20px;
  animation: fadeInUp 1s ease;
}

.banner-description {
  font-size: 1.4em;
  margin-bottom: 30px;
  opacity: 0.9;
  animation: fadeInUp 1s ease 0.2s;
}

.banner-btn {
  font-size: 1.2em;
  padding: 12px 30px;
  animation: fadeInUp 1s ease 0.4s;
}

/* 分類導航 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.category-card {
  background: #fff;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.category-card .el-icon {
  color: var(--el-color-primary);
  margin-bottom: 15px;
}

.category-card h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.category-description {
  color: #666;
  font-size: 14px;
}

/* 促銷活動 */
.promotions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.promo-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.promo-image {
  height: 300px;
}

.promo-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.promo-card:hover .promo-image .el-image {
  transform: scale(1.05);
}

.promo-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: #fff;
}

.promo-tag {
  display: inline-block;
  background: var(--el-color-primary);
  color: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 15px;
}

.promo-content h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.promo-content p {
  opacity: 0.9;
  margin-bottom: 20px;
}

/* 精選商品 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.product-image {
  position: relative;
  height: 220px;
  overflow: hidden;
}

.product-image .el-image {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image .el-image {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.quick-view-btn,
.add-to-cart-btn {
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.product-card:hover .quick-view-btn,
.product-card:hover .add-to-cart-btn {
  transform: translateY(0);
}

.product-info {
  padding: 20px;
}

.product-title {
  font-size: 16px;
  margin-bottom: 10px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.special-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-danger);
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.regular-price {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-color-primary);
}

/* 品牌優勢 */
.features-section {
  background: #f8f9fa;
  padding: 80px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.feature-card {
  background: #fff;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-card .el-icon {
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* 動畫 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* RWD 響應式設計 */
@media (max-width: 1200px) {
  .section-container {
    padding: 0 30px;
  }
}

@media (max-width: 992px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .banner-title {
    font-size: 3em;
  }

  .banner-description {
    font-size: 1.4em;
  }

  .promotions-grid {
    grid-template-columns: 1fr;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .banner-title {
    font-size: 2em;
  }

  .banner-description {
    font-size: 1.2em;
  }

  .products-grid {
    grid-template-columns: 1fr;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>