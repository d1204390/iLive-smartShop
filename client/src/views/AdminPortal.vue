// client/src/views/AdminPortal.vue
<template>
  <div>
    <!-- 只在非登入頁面顯示管理後台導航欄 -->

    <!-- 主要內容區域 -->
    <router-view></router-view>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()

    const isAuthenticated = computed(() =>
        store.state.auth.token &&
        store.state.auth.user?.role === 'admin'
    )

    // 判斷當前是否為登入頁
    const isLoginPage = computed(() =>
        route.name === 'AdminLogin'
    )

    const handleLogout = () => {
      store.dispatch('logout')
      router.push('/admin/login')
    }

    return {
      isAuthenticated,
      isLoginPage,
      handleLogout
    }
  }
}
</script>