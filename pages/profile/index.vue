<template>
  <div>
    <button @click="id++">change id</button>
    <ul>
      <li v-for="profile in data?.results" :key="profile.id.value">
        {{ profile.email }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { definePageMeta, ref } from '#imports'
import useApi from '@/composables/useApi'
// import { navigateTo } from '@typed-router'

definePageMeta({
  layout: 'orange'
})

// navigateTo('/home')

const id = ref(1)
// Since we already define API type in "composables/useApi/types.ts", TypeScript now will
// prompt available API name for the first argument, and it will also lint the type of
// second argument to match API type.
const { data } = await useApi('getFakeUserProfile', {
  lazy: true,
  pathParams: { id }
})

await useApi('updateProfile', { payload: { name: '', age: 1 } })
</script>
