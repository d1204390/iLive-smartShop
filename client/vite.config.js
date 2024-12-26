import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // 加載對應模式的環境變數
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL, // 使用環境變數作為目標地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''), // 可選：如果後端不需要 '/api' 前綴，則移除
        },
      },
    },
  }
})
