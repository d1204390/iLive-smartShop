<template>
  <div class="privacy-container">
    <el-card class="privacy-card">
      <div class="privacy-header">
        <h1>iLive 電商平台隱私政策</h1>
        <p class="version">版本號：v20241221</p>
        <p>我們的隱私政策已於2024年12月更新。</p>
      </div>

      <div class="privacy-content">
        <el-collapse v-model="activeNames" accordion>
          <el-collapse-item title="引言" name="1">
            <p>iLive帳號是由iLive電商平台及其關聯公司（以下簡稱"iLive"或"我們"）為您提供的一項帳號註冊、登入和管理服務。</p>
            <p>我們非常重視您的隱私。本隱私政策是針對iLive電商平台帳號做出的隱私方面的陳述與承諾，屬於《iLive隱私政策》的重要組成部分。本隱私政策規定我們如何收集、使用、披露、處理和存儲您使用我們的服務時提供給我們的資訊。本隱私政策下"個人資訊"指透過資訊本身或透過關聯其他資訊後能夠辨識特定個人的資料。我們將嚴格遵守本隱私政策來使用這些資訊。</p>
          </el-collapse-item>

          <el-collapse-item title="我們收集哪些資訊以及如何使用資訊" name="2">
            <h3>（一）您須授權我們收集和使用您個人資訊的情形</h3>

            <h4>1、提供帳號基礎功能</h4>
            <p>（1）註冊或登錄</p>
            <p>您在註冊時需要向我們提供手機號碼或信箱地址作為您的iLive帳號名稱。同時，您還可以為您的iLive帳號設定密碼。您的帳號和密碼會將被加密儲存在伺服器，建議您妥善保管好您的密碼資訊，謹防您的帳號被他人盜用。</p>

            <p>（2）完善帳號資訊</p>
            <p>您在使用iLive提供的各類服務過程中，您可以透過電話、電子信箱和收貨地址等基礎資訊，來獲得更好的服務與體驗，如不提供也不會影響iLive帳號的基本功能。</p>

            <h4>2、保障註冊、登入安全所必須的功能</h4>
            <p>為提高您使用我們的產品與/或服務時系統的安全性，更準確地預防釣魚網站欺詐和保護帳戶安全，我們還會透過、郵件驗證碼來驗證您的身份。為此我們需要收集您的郵件資訊。</p>
          </el-collapse-item>
          <el-collapse-item title="與第三方共用您的個人資訊" name="3">
            <p>為保證向您提供本隱私政策目的所述的服務，我們可能會向合作夥伴等第三方共享必要的個人資訊，包括：</p>
            <el-tag type="info" class="service-tag" v-for="item in thirdPartySharing" :key="item">
              {{ item }}
            </el-tag>
          </el-collapse-item>

          <el-collapse-item title="保留政策" name="4">
            <p>我們基於本隱私政策中所述的資訊收集的目的所必需的期間，或者遵守適用的相關法律要求保留個人資訊。個人資訊在完成收集目的，或在我們確認您的刪除或註銷申請後，或我們終止運營相應產品或服務後，我們將停止保留，並做刪除或匿名化處理。</p>
          </el-collapse-item>

          <el-collapse-item title="您的權利" name="5">
            <p>您可以透過以下方式管理您的個人資訊:</p>
            <el-tag type="success" class="service-tag" v-for="right in userRights" :key="right">
              {{ right }}
            </el-tag>
          </el-collapse-item>

          <el-collapse-item title="聯繫我們" name="6">
            <p>如果您對本隱私政策有任何意見或問題，或者您對我們收集、使用或披露您的個人資訊有任何問題，請透過以下方式聯繫我們:</p>
            <div class="contact-info">
              <el-descriptions :column="1" border>
                <el-descriptions-item label="電子郵件">
                  <el-link type="primary" href="mailto:support@ilive.com">support@ilive.com</el-link>
                </el-descriptions-item>
                <el-descriptions-item label="客服電話">
                  0800-000-000
                </el-descriptions-item>
                <el-descriptions-item label="聯繫地址">
                  台中市西屯區文華路100號<br>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-collapse-item>
          <el-checkbox v-model="agreementChecked">
            我已閱讀並同意上述隱私政策
          </el-checkbox>
          <el-button
              type="primary"
              :disabled="!agreementChecked"
              @click="confirmPrivacy"
          >
            確認
          </el-button>        </el-collapse>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {ElMessage} from "element-plus";
import router from "../router/index.js";

const activeNames = ref(['1'])
const agreementChecked = ref(false);

const thirdPartySharing = [
  '物流配送服務商',
  '支付服務商'
]

const userRights = [
  '登入您的iLive帳號，查看和更改帳號安全資訊、個人資訊等',
  '隨時登入或登出您的iLive帳戶'
]

const confirmPrivacy = () => {
  if (agreementChecked.value) {
    ElMessage.success('已成功同意隱私政策')
    router.go(-1) // 返回上一頁
  } else {
    ElMessage.warning('請先閱讀並同意隱私政策')
  }
}

</script>

<style scoped>
.privacy-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.privacy-card {
  width: 100%;
  max-width: 1200px;
  max-height: 80vh;
  overflow-y: auto;
}

.privacy-header {
  text-align: center;
  margin-bottom: 20px;
}

.privacy-header h1 {
  color: var(--el-color-primary);
  margin-bottom: 10px;
}

.version {
  color: #999;
  font-size: 0.9rem;
}

.privacy-content {
  margin-bottom: 20px;
}

.service-tag {
  margin: 5px;
}

.contact-info {
  margin-top: 10px;
}
</style>