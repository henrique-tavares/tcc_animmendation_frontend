<template>
  <div class="flex items-center gap-4 justify-between">
    <span class="text-ani-black text-xl md:text-3xl font-semibold text-left">{{
      title
    }}</span>
    <div class="flex items-center gap-3 flex-shrink-0">
      <a
        :href="`https://myanimelist.net/anime/${id}`"
        target="_blank"
        class="self-start hover:ring rounded-lg transition ring-ani-light-blue/50"
      >
        <img :src="MalLogoLarge" alt="" class="w-7 md:w-10 rounded-lg" />
      </a>
      <IconTablerChevronUp
        v-if="!!arrow"
        class="transition w-6 h-6"
        :class="{ 'rotate-180': arrow == 'down' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import MalLogoLarge from "@/assets/img/mal_logo_large.png";

const props = defineProps<{
  id: number;
  title: string;
  arrow?: "down" | "up";
}>();
</script>

<style scoped></style>
