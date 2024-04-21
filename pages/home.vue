<template>
  <div>
    <HelloWorld />
    <h1 :class="$style.home_header">hello~</h1>
    <NuxtLink to="/profile">go to profile page</NuxtLink><br />
    <NuxtLink to="/home/news">go to news page</NuxtLink>
    <NuxtPage />
    <div>shit</div>
  </div>
</template>

<script setup lang="ts">
// import { definePageMeta } from '#imports'
import HelloWorld from '@/components/HelloWorld.vue'

// definePageMeta({
//   redirect: '/home/news'
// })
</script>

<style module>
.home_header {
  border: 1px solid red;
}
</style>
