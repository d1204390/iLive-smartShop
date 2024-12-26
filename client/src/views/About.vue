<template>
  <div class="about-page">
    <!-- 頁面橫幅 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">打造智慧溫馨的家</h1>
        <p class="hero-subtitle">讓科技為生活增添溫度</p>
      </div>
    </div>

    <!-- 我們的故事 -->
    <div class="section">
      <div class="container">
        <h2 class="section-title">我們的故事</h2>
        <div class="story-content">
          <div class="story-text">
            <p>iLive智慧家電成立於2020年，秉持「科技，為生活帶來溫度」的理念，致力於將創新科技與日常生活完美結合。我們深信，科技不僅能提升生活效率，更能為每個家庭創造更多溫馨互動的時光。</p>
            <p>從智慧廚房到智能空調，從居家安防到影音娛樂，我們不斷創新，只為讓每個家庭都能享受科技帶來的便利與溫暖。</p>
          </div>
          <div class="story-image">
            <el-image src="https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" />
          </div>
        </div>
      </div>
    </div>

    <!-- 核心價值 -->
    <div class="section values-section">
      <div class="container">
        <h2 class="section-title">核心價值</h2>
        <div class="values-grid">
          <div class="value-card" v-for="value in values" :key="value.id">
            <el-icon :size="48" class="value-icon">
              <component :is="value.icon" />
            </el-icon>
            <h3>{{ value.title }}</h3>
            <p>{{ value.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 我們的承諾 -->
    <div class="section promise-section">
      <div class="container">
        <h2 class="section-title">我們的承諾</h2>
        <div class="promise-grid">
          <div class="promise-card" v-for="promise in promises" :key="promise.id">
            <div class="promise-content">
              <h3>{{ promise.title }}</h3>
              <p>{{ promise.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 聯絡資訊 -->
    <div class="section contact-section">
      <div class="container">
        <h2 class="section-title">聯絡我們</h2>
        <div class="contact-content">
          <div class="contact-info">
            <div class="info-item" v-for="info in contactInfo" :key="info.id">
              <el-icon :size="24">
                <component :is="info.icon" />
              </el-icon>
              <span>{{ info.text }}</span>
            </div>
          </div>
          <div class="service-hours">
            <h3>服務時間</h3>
            <p>週一至週五：09:00 - 18:00</p>
            <p>週六：10:00 - 17:00</p>
            <p>週日與國定假日休息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

// 核心價值數據
const values = [
  {
    id: 1,
    icon: 'Connection',
    title: '創新科技',
    description: '持續創新，將最新科技應用於生活中，創造智能家居新體驗'
  },
  {
    id: 2,
    icon: 'Sunrise',
    title: '溫馨服務',
    description: '以真誠的心提供溫馨的服務，讓每位顧客感受到家的溫度'
  },
  {
    id: 3,
    icon: 'Star',
    title: '品質保證',
    description: '嚴選優質產品，確保每項商品都能為您的家庭帶來最佳體驗'
  },
  {
    id: 4,
    icon: 'TrendCharts',
    title: '永續發展',
    description: '注重環保節能，為地球永續發展盡一份心力'
  }
]

// 承諾數據
const promises = [
  {
    id: 1,
    title: '品質保證',
    description: '所有商品皆經過嚴格品質把關，提供原廠保固服務'
  },
  {
    id: 2,
    title: '專業安裝',
    description: '專業團隊提供安裝及教學服務，讓您安心使用'
  },
  {
    id: 3,
    title: '售後服務',
    description: '完善的售後服務體系，解決您的使用疑慮'
  },
  {
    id: 4,
    title: '持續創新',
    description: '不斷引進新科技，為您的生活增添更多便利'
  }
]

// 聯絡資訊
const contactInfo = [
  {
    id: 1,
    icon: 'Location',
    text: '台中市西屯區文華路100號'
  },
  {
    id: 2,
    icon: 'Phone',
    text: '(02) 1234-5678'
  },
  {
    id: 3,
    icon: 'Message',
    text: 'service@ilive.com'
  }
]
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background-color: #fff;
}

/* 橫幅區域 */
.hero-section {
  height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
  url('https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fff;
}

.hero-content {
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  animation: fadeInUp 1s ease;
}

.hero-subtitle {
  font-size: 24px;
  opacity: 0.9;
  animation: fadeInUp 1s ease 0.2s;
}

/* 通用區塊樣式 */
.section {
  padding: 80px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 50px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 60px;
  height: 4px;
  background: var(--el-color-primary);
  margin: 20px auto 0;
  border-radius: 2px;
}

/* 故事區塊 */
.story-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: center;
}

.story-text {
  font-size: 16px;
  line-height: 1.8;
  color: #666;
}

.story-text p {
  margin-bottom: 20px;
}

.story-image {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 核心價值 */
.values-section {
  background-color: #f8f9fa;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.value-card {
  background: #fff;
  padding: 40px 20px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.value-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.value-icon {
  color: var(--el-color-primary);
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.value-card p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 承諾區塊 */
.promise-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

.promise-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.promise-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.promise-content {
  padding: 30px 20px;
  text-align: center;
}

.promise-content h3 {
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.promise-content p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 聯絡資訊 */
.contact-section {
  background-color: #f8f9fa;
}

.contact-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
  color: #666;
}

.service-hours {
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.service-hours h3 {
  font-size: 20px;
  margin-bottom: 20px;
  color: #333;
}

.service-hours p {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
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
  .container {
    padding: 0 30px;
  }
}

@media (max-width: 992px) {
  .values-grid,
  .promise-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .story-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .contact-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 36px;
  }

  .hero-subtitle {
    font-size: 20px;
  }

  .section {
    padding: 60px 0;
  }
}

@media (max-width: 576px) {
  .values-grid,
  .promise-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 28px;
  }
}
</style>