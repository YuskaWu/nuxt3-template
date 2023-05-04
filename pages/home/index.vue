<template>
  <HelloWorld />
  <h1 :class="$style.home_header">hello~</h1>
</template>

<script setup lang="ts">
import { ref } from '#imports'
import HelloWorld from '@/components/HelloWorld.vue'
import { useApi } from '@/composables/useApi'
import sayHello from '@/utils/say-hello'

const names = [1, 2]
const count = ref(1)
const test = useApi()
const test2 = sayHello()
</script>

<style module>
.home_header {
  border: 1px solid red;
  animation: rainbow 40s linear infinite;
}

@keyframes rainbow {
  0% {
    color: #00a98e;
  }

  1.25% {
    color: #00a996;
  }

  2.5% {
    color: #00a99f;
  }

  3.75% {
    color: #00a9a7;
  }

  5% {
    color: #00a9b0;
  }

  6.25% {
    color: #00a9b8;
  }

  7.5% {
    color: #00a9c0;
  }

  8.75% {
    color: #00a8c7;
  }

  10% {
    color: #00a8cf;
  }

  11.25% {
    color: #00a7d5;
  }

  12.5% {
    color: #00a6dc;
  }

  13.75% {
    color: #00a6e2;
  }

  15% {
    color: #00a4e7;
  }

  16.25% {
    color: #00a3ec;
  }

  17.5% {
    color: #00a2f1;
  }

  18.75% {
    color: #00a0f4;
  }

  20% {
    color: #009ff7;
  }

  21.25% {
    color: #009dfa;
  }

  22.5% {
    color: #009bfc;
  }

  23.75% {
    color: #0098fd;
  }

  25% {
    color: #0096fd;
  }

  26.25% {
    color: #0093fd;
  }

  27.5% {
    color: #2e90fc;
  }

  28.75% {
    color: #4d8dfa;
  }

  30% {
    color: #638af8;
  }

  31.25% {
    color: #7587f5;
  }

  32.5% {
    color: #8583f1;
  }

  33.75% {
    color: #9280ed;
  }

  35% {
    color: #9f7ce9;
  }

  36.25% {
    color: #aa78e3;
  }

  37.5% {
    color: #b574dd;
  }

  38.75% {
    color: #be71d7;
  }

  40% {
    color: #c76dd1;
  }

  41.25% {
    color: #cf69c9;
  }

  42.5% {
    color: #d566c2;
  }

  43.75% {
    color: #dc63ba;
  }

  45% {
    color: #e160b3;
  }

  46.25% {
    color: #e65eab;
  }

  47.5% {
    color: #e95ca2;
  }

  48.75% {
    color: #ed5a9a;
  }

  50% {
    color: #ef5992;
  }

  51.25% {
    color: #f15989;
  }

  52.5% {
    color: #f25981;
  }

  53.75% {
    color: #f25a79;
  }

  55% {
    color: #f25c71;
  }

  56.25% {
    color: #f15e69;
  }

  57.5% {
    color: #ef6061;
  }

  58.75% {
    color: #ed635a;
  }

  60% {
    color: #eb6552;
  }

  61.25% {
    color: #e8694b;
  }

  62.5% {
    color: #e46c44;
  }

  63.75% {
    color: #e06f3d;
  }

  65% {
    color: #db7336;
  }

  66.25% {
    color: #d77630;
  }

  67.5% {
    color: #d17a2a;
  }

  68.75% {
    color: #cc7d24;
  }

  70% {
    color: #c6811e;
  }

  71.25% {
    color: #bf8418;
  }

  72.5% {
    color: #b98713;
  }

  73.75% {
    color: #b28a0f;
  }

  75% {
    color: #ab8d0c;
  }

  76.25% {
    color: #a3900b;
  }

  77.5% {
    color: #9c920d;
  }

  78.75% {
    color: #949510;
  }

  80% {
    color: #8b9715;
  }

  81.25% {
    color: #83991b;
  }

  82.5% {
    color: #7a9b21;
  }

  83.75% {
    color: #719d27;
  }

  85% {
    color: #679e2e;
  }

  86.25% {
    color: #5da035;
  }

  87.5% {
    color: #51a13c;
  }

  88.75% {
    color: #44a244;
  }

  90% {
    color: #34a44b;
  }

  91.25% {
    color: #1ba553;
  }

  92.5% {
    color: #00a65b;
  }

  93.75% {
    color: #00a663;
  }

  95% {
    color: #00a76c;
  }

  96.25% {
    color: #00a874;
  }

  97.5% {
    color: #00a87d;
  }

  98.75% {
    color: #00a985;
  }

  to {
    color: #00a98e;
  }
}
</style>
