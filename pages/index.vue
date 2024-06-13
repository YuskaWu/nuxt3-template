<template>
  <div>
    <div class="flex flex-col gap-4">
      <NuxtLink
        to="/custom-usefetch-example"
        class="relative w-fit px-1 after:absolute after:bottom-0 after:left-0 after:h-2 after:w-full after:bg-pink-400 after:mix-blend-color after:transition-colors hover:after:bg-pink-300"
      >
        custom useFetch wrap
      </NuxtLink>
      <NuxtLink
        to="/tanstack-query-example"
        class="relative w-fit px-1 after:absolute after:bottom-0 after:left-0 after:h-2 after:w-full after:bg-pink-400 after:mix-blend-color after:transition-colors hover:after:bg-pink-300"
      >
        custom fetcher with Tanstack Query
      </NuxtLink>
    </div>
  </div>
</template>
