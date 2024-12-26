<template>
  <div class="cart-container">
    <el-card class="cart-card">
      <template #header>
        <div class="card-header">
          <h2>購物車</h2>
        </div>
      </template>

      <div v-if="cart.length" class="cart-content">
        <!-- 運費說明 -->
        <el-alert
            type="info"
            :closable="false"
            show-icon
        >
          <template #title>
            <span class="alert-title">運費說明</span>
          </template>
          <template #default>
            <p>訂單金額超過NT$800元（含），即可享有免運費服務。</p>
            <p>未達免運標準時，收取運輸費用NT$100。</p>
            <p>（此運輸費如於收貨後辦理退貨，將不予退回）</p>
          </template>
        </el-alert>

        <!-- 購物車商品列表 -->
        <div class="cart-items">
          <el-card
              v-for="item in cart"
              :key="item.product._id"
              class="cart-item"
              shadow="hover"
          >
            <div class="item-content">
              <div class="item-info">
                <h3>{{ item.product.name }}</h3>
                <div class="price-info">
                  <template v-if="item.product.specialPrice">
                    <span class="special-price">NT$ {{ item.product.specialPrice.toLocaleString() }}</span>
                    <span class="original-price">NT$ {{ item.product.price.toLocaleString() }}</span>
                  </template>
                  <span v-else class="regular-price">NT$ {{ item.product.price.toLocaleString() }}</span>
                </div>
              </div>

              <div class="item-actions">
                <div class="quantity-control">
                  <el-input-number
                      v-model="item.quantity"
                      :min="1"
                      :max="item.product.stock"
                      :step="1"
                      size="small"
                      @change="(value) => updateQuantity(item.product._id, value)"
                      controls-position="right"
                  />
                </div>
              </div>
            </div>

            <div class="item-footer">
              <div class="subtotal">
                小計: NT$ {{ calculateItemTotal(item).toLocaleString() }}
              </div>
              <el-button
                  type="danger"
                  link
                  @click="removeFromCart(item.product._id)"
              >
                刪除
              </el-button>
            </div>
          </el-card>
        </div>

        <!-- 結帳資訊 -->
        <el-card class="checkout-info" shadow="never">
          <div class="price-breakdown">
            <div class="price-row">
              <span>商品小計</span>
              <span>NT$ {{ subtotal.toLocaleString() }}</span>
            </div>
            <div class="price-row">
              <div class="shipping-info">
                <span>運費</span>
                <el-tag size="small" type="info" effect="plain">
                  {{ subtotal >= 800 ? '(免運費)' : '(未達免運門檻NT$800)' }}
                </el-tag>
              </div>
              <span>NT$ {{ shippingFee.toLocaleString() }}</span>
            </div>
            <div class="price-row total">
              <span>訂單總計</span>
              <span class="total-amount">NT$ {{ totalAmount.toLocaleString() }}</span>
            </div>
          </div>

          <el-button
              type="primary"
              class="checkout-button"
              :disabled="!cart.length"
              @click="goToCheckout"
          >
            前往結帳
          </el-button>
        </el-card>
      </div>

      <!-- 購物車空時顯示 -->
      <el-empty v-else description="購物車是空的">
        <router-link to="/products?from=cart">
          <el-button type="primary">繼續購物</el-button>
        </router-link>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const store = useStore()
const router = useRouter()

const cart = computed(() => store.state.cart)

// 計算單項商品總額
const calculateItemTotal = (item) => {
  const price = item.product.specialPrice || item.product.price
  return price * item.quantity
}

// 計算商品小計
const subtotal = computed(() => {
  return cart.value.reduce((sum, item) => {
    return sum + calculateItemTotal(item)
  }, 0)
})

// 計算運費
const shippingFee = computed(() => {
  return subtotal.value >= 800 ? 0 : 100
})

// 計算總金額（含運費）
const totalAmount = computed(() => {
  return subtotal.value + shippingFee.value
})

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) return

  try {
    // 檢查新數量是否在有效範圍內
    const cartItem = cart.value.find(item => item.product._id === productId)
    if (!cartItem) return

    if (newQuantity > cartItem.product.stock) {
      ElMessage.warning(`超過商品庫存上限 ${cartItem.product.stock} 件`)
      // 重置為原始數量
      cartItem.quantity = Math.min(cartItem.quantity, cartItem.product.stock)
      return
    }

    await store.dispatch('updateCartQuantity', {
      productId,
      quantity: newQuantity
    })
  } catch (error) {
    ElMessage.error(error.message || '更新數量失敗')
  }
}

const removeFromCart = async (productId) => {
  try {
    await ElMessageBox.confirm(
        '確定要移除此商品？',
        '刪除確認',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )
    store.dispatch('removeFromCart', productId)
  } catch {
    // 用戶取消刪除
  }
}

const goToCheckout = () => {
  router.push('/checkout')
}
</script>

<style scoped>
.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cart-card {
  margin-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alert-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  transition: all 0.3s ease;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.quantity-control :deep(.el-input-number) {
  width: 120px;
}


.item-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.item-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.price-info {
  margin-top: 8px;
}

.special-price {
  color: var(--el-color-danger);
  font-size: 18px;
  font-weight: 600;
  margin-right: 8px;
}

.original-price {
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

.regular-price {
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.subtotal {
  font-size: 16px;
  font-weight: 500;
}

.checkout-info {
  background-color: var(--el-bg-color-page);
}

.price-breakdown {
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.shipping-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
  font-size: 18px;
  font-weight: 600;
}

.total-amount {
  color: var(--el-color-primary);
}

.checkout-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .cart-container {
    padding: 12px;
  }

  .item-content {
    flex-direction: column;
    gap: 16px;
  }

  .item-actions {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>