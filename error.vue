<script setup lang="ts">
import type { NuxtError } from '#app'
import { clearError } from '#imports'

defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <NuxtLayout>
    <div class="rounded-md border border-red-300 bg-red-50 p-4 text-red-600">
      <h1 class=" mb-4 text-xl font-bold">
        Oops! Something went wrong.
      </h1>
      <h3 class="text-lg font-bold">
        {{ error.statusCode }}
      </h3>
      <p>{{ error.message }}</p>
      <p
        v-if="error.data"
        class=" pt-2 text-sm"
      >
        {{ error.data }}
      </p>
      <div class="mt-4 flex">
        <button
          class=" ml-auto rounded-sm bg-red-100 p-2 hover:bg-red-200"
          @click="handleError"
        >
          Clear errors
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>
