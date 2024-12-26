<template>
  <div class="terms-container">
    <el-card class="terms-card">
      <div class="terms-header">
        <h1>iLive 電商平台用戶協議</h1>
        <p class="version">版本號：v20241221</p>
      </div>

      <div class="terms-content">
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item title="一、總則" name="1">
            <p>1.1 本協議是您與iLive電商平台（以下簡稱"iLive"）之間就iLive平台服務等相關事宜所訂立的契約。</p>
            <p>1.2 您應當在使用iLive服務之前認真閱讀全部協議內容。如您對協議有任何疑問，可向iLive客服諮詢。</p>
          </el-collapse-item>

          <el-collapse-item title="二、服務內容" name="2">
            <p>2.1 iLive向您提供包括但不限於以下服務：</p>
            <el-tag type="info" class="service-tag" v-for="service in services" :key="service">
              {{ service }}
            </el-tag>
          </el-collapse-item>

          <el-collapse-item title="三、用戶責任" name="3">
            <p>3.1 您應當遵守中華民國相關法律法規。</p>
            <p>3.2 您應當妥善保管帳號和密碼，不得將帳號轉讓或出借於他人使用。</p>
          </el-collapse-item>

          <el-collapse-item title="四、其他" name="4">
            <p>4.1 本協議的最終解釋權歸iLive所有。</p>
            <p>4.2 本協議適用中華民國法律。</p>
          </el-collapse-item>

          <el-collapse-item title="五、聯繫方式" name="5">
            <p>如您對本協議有任何疑問，可通過以下方式聯繫我們：</p>
            <div class="contact-info">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="電子郵件">
                  <el-link type="primary" href="mailto:support@ilive.com">support@ilive.com</el-link>
                </el-descriptions-item>
                <el-descriptions-item label="客服電話">
                  0800-000-000
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div class="terms-footer">
        <el-checkbox v-model="agreementChecked">
          我已閱讀並同意上述用戶協議
        </el-checkbox>
        <el-button
            type="primary"
            :disabled="!agreementChecked"
            @click="confirmTerms"
        >
          確認
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeNames = ref(['1'])
const agreementChecked = ref(false)

const services = [
  '商品瀏覽',
  '商品搜索',
  '商品購買',
  '訂單管理',
  '帳戶管理',
  '客戶服務'
]

const confirmTerms = () => {
  if (agreementChecked.value) {
    ElMessage.success('已成功同意用戶協議')
    router.go(-1) // 返回上一頁
  } else {
    ElMessage.warning('請先閱讀並同意用戶協議')
  }
}

</script>

<style scoped>
.terms-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.terms-card {
  width: 100%;
  max-width: 1200px;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-header {
  text-align: center;
  margin-bottom: 20px;
}

.terms-header h1 {
  color: var(--el-color-primary);
  margin-bottom: 10px;
}

.version {
  color: #999;
  font-size: 0.9rem;
}

.terms-content {
  margin-bottom: 20px;
}

.service-tag {
  margin: 5px;
}

.terms-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color);
}

.contact-info {
  margin-top: 10px;
}
</style>