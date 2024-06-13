<script setup lang="ts">
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, watch } from '#imports'
import RecipeCard from '@/components/RecipeCard.vue'
import useApi from '~/composables/useApi/tanstack-query-fetcher'

const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const queryClient = useQueryClient()

watch(keyword, () => {
  page.value = 1
})

function nextPage() {
  if (page.value >= totalPages.value) {
    return
  }
  page.value += 1
}

function prePage() {
  if (page.value <= 1) {
    return
  }
  page.value -= 1
}

const offset = computed(() => {
  return (page.value - 1) * pageSize.value
})

const totalPages = computed(() => {
  return Math.ceil((data.value?.totalResults ?? 0) / pageSize.value)
})

const { isFetching, isError, data, error, suspense } = useQuery({
  placeholderData: keepPreviousData,
  queryKey: ['searchRecipes', keyword, offset, pageSize],
  queryFn: () => useApi('searchRecipes', { query: { query: keyword, offset, number: pageSize } })
})

await suspense()
</script>

<template>
  <div class="space-y-4">
    <div class="space-x-4">
      <label>
        keyword:
        <input
          v-model.lazy="keyword"
          class=" border-2 border-solid border-gray-400 p-1"
        >
      </label>
      <button
        class="ml-auto rounded-sm bg-slate-200 p-2"
        @click="queryClient.invalidateQueries({ queryKey: ['searchRecipes'] })"
      >
        invalidate query
      </button>
    </div>

    <div
      v-if="isError"
      class=" bg-red-200 p-4"
    >
      {{ error?.message }}
    </div>
    <div
      v-else
      class="grid gap-4"
    >
      <div class="flex items-center gap-4">
        <div>{{ page }} / {{ totalPages }}</div>
        <button
          class="rounded-sm bg-slate-200 px-2 py-1"
          @click="prePage"
        >
          ←
        </button>
        <button
          class="rounded-sm bg-slate-200 px-2 py-1"
          @click="nextPage"
        >
          →
        </button>
        <svg
          v-show="isFetching"
          class="-ml-1 mr-3 size-5 animate-spin text-gray-700"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>

      <div class="flex flex-wrap gap-4">
        <RecipeCard
          v-for="recipe in data?.results"
          :key="recipe.id"
          :title="recipe.title"
          :image="recipe.image"
        />
      </div>
    </div>
  </div>
</template>
