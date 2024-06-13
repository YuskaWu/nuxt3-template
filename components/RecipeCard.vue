<script lang="ts" setup>
defineProps<{ title: string, image: string }>()
</script>

<template>
  <div class="size-64 space-y-4 rounded-md border-2 border-solid border-gray-400 p-4 transition-all hover:border-gray-600 hover:shadow-md hover:shadow-black">
    <h2 class="line-clamp-2 h-12 font-bold  text-gray-700">
      {{ title }}
    </h2>
    <img :src="image">
  </div>
</template>
