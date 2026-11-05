
<script setup>
import PublicHeader from '../components/public/PublicHeader.vue'
import PublicFooter from '../components/public/PublicFooter.vue'
</script>

<template>
  <div class="public-layout">
    <PublicHeader />

    <main>
      <RouterView />
    </main>

    <PublicFooter />
  </div>
</template>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
