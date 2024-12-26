<!-- src/views/NotFound.vue -->
<template>
  <div class="flex-col items-center" style="min-height: calc(100vh - 412px);">
    <div class="h-full flex justify-center items-center">
      <router-link to="/">
        <img
            src="/error404.png"
            alt="404 Error"
            class="cursor-pointer hover:opacity-90 transition-opacity"
            style="width: 500px; max-width: 90vw; display: block; margin: 100px auto;"
        />
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
.h-full {
  height: 100%;
  min-height: calc(100vh - 412px);
}
</style>