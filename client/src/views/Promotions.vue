<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Timer } from '@element-plus/icons-vue'

const router = useRouter()

// 優惠活動資料
const promotions = ref([
  {
    id: 1,
    title: '廚房升級企劃',
    description: '限時優惠，智慧廚電最高折扣50%',
    image: 'https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    period: '2024/12/01 - 2024/12/31',
    link: '/products?category=smart_kitchen', // 新增導航連結
    details: [
      '全館廚房家電商品最高五折優惠',
      '單筆消費滿10,000送1,000購物金',
      '指定品牌商品加贈延長保固一年',
      '滿額贈送精美廚房配件組'
    ],
    rules: [
      '活動期間內購買指定商品即可參與',
      '商品售完即止，數量有限',
      '購物金使用期限為3個月',
      '延長保固需於購買後30天內完成登錄',
      '本活動不得與其他優惠同時使用'
    ]
  },
  {
    id: 2,
    title: '空調精選特惠',
    description: '各類空調商品85折起，再送安裝服務',
    image: 'https://images.pexels.com/photos/6283961/pexels-photo-6283961.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    period: '2024/12/01 - 2024/12/31',
    link: '/products?category=smart_climate', // 新增導航連結
    details: [
      '指定空調商品85折起',
      '滿額即贈免費標準安裝',
      '加購智慧控制器享88折優惠',
      '全機延長保固2年'
    ],
    rules: [
      '標準安裝服務僅限於一般住宅',
      '特殊安裝位置需額外計費',
      '商品數量有限，售完為止',
      '本活動不得與其他優惠同時使用'
    ]
  }
])

// 點擊按鈕處理
const handlePromoClick = (promo) => {
  if (promo.link) {
    router.push(promo.link)
  } else {
    console.warn('此活動沒有指定連結')
  }
}
</script>

<template>
  <div class="promotions-page">
    <div class="promotions-list">
      <div v-for="promo in promotions" :key="promo.id" class="promotion-card">
        <div class="promotion-image">
          <el-image :src="promo.image" fit="cover" />
          <div class="promotion-overlay">
            <span class="time-limited">限時特惠</span>
            <el-button
                type="primary"
                size="large"
                class="action-btn"
                @click="handlePromoClick(promo)"
            >
              前往選購
              <el-icon class="el-icon--right"><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="promotion-content">
          <h2>{{ promo.title }}</h2>
          <p>{{ promo.description }}</p>
          <div class="promotion-period">
            <el-icon><Timer /></el-icon>
            <span>活動期間：{{ promo.period }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promotions-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 60px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 頁面標題 */
.page-header {
  background: #fff;
  padding: 40px 0;
  margin-bottom: 40px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

/* 活動卡片 */
.promotion-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 活動圖片 */
.promotion-image {
  position: relative;
  height: 400px;
}

.promotion-image .el-image {
  width: 100%;
  height: 100%;
}

.promotion-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.promotion-image:hover .promotion-overlay {
  opacity: 1;
}

.time-limited {
  color: #fff;
  background: #ff6700;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
}

.action-btn {
  font-size: 18px;
  padding: 12px 30px;
}

/* 活動內容 */
.promotion-content {
  padding: 40px;
}

.promotion-info h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 15px;
}

.description {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.promotion-details,
.promotion-rules {
  margin-bottom: 30px;
}

.promotion-details h3,
.promotion-rules h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

.promotion-details ul,
.promotion-rules ul {
  list-style: none;
  padding-left: 0;
}

.promotion-details li,
.promotion-rules li {
  position: relative;
  padding-left: 20px;
  margin-bottom: 10px;
  color: #666;
  line-height: 1.6;
}

.promotion-details li::before,
.promotion-rules li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--el-color-primary);
}

.promotion-period {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #666;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* 相關商品 */
.related-products {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #eee;
}

.related-products h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #eee;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-info {
  padding: 15px;
}

.product-info h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.special-price {
  color: #ff6700;
  font-weight: bold;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  font-size: 14px;
}

/* RWD */
@media (max-width: 768px) {
  .promotion-image {
    height: 300px;
  }

  .promotion-content {
    padding: 20px;
  }

  .promotion-info h2 {
    font-size: 24px;
  }

  .description {
    font-size: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .promotion-image {
    height: 200px;
  }

  .page-header {
    padding: 30px 0;
  }

  .page-header h1 {
    font-size: 28px;
  }
}
</style>