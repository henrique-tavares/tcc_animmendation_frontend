<template>
  <div class="relative">
    <div
      class="flex flex-col items-center shadow-lg border transition-all rounded-box relative flex-shrink-0 w-64 select-none"
      @mouseenter="hoverVisible = true"
      ref="animeItem"
    >
      <img
        v-if="anime.picture"
        :src="anime.picture"
        :alt="anime.title"
        class="h-[24rem] w-full rounded-box"
      />
      <div
        class="absolute w-full max-h-[50%] h-full bottom-0 rounded-box flex items-end justify-start p-4 bg-gradient-to-t from-black"
      >
        <span class="flex text-white font-medium items-end w-full line-clamp-3">
          {{ anime.title }}
        </span>
      </div>
    </div>
    <Teleport to="main" v-if="hoverVisible">
      <div
        class="flex absolute z-10 group"
        :style="`top: ${animeRect?.top ?? 0}px; left: ${
          animeRect?.left ?? 0
        }px`"
        @mouseleave="handleMouseLeave"
      >
        <div
          class="flex invisible opacity-0 group-hover:visible group-hover:opacity-100 group-hover:scale-110 group-hover:delay-200 flex-col items-center shadow-xl border transition-all rounded-box w-[16rem]"
        >
          <div class="relative overflow-visible w-full select-none">
            <img
              v-if="anime.picture"
              :src="anime.picture"
              :alt="anime.title"
              class="h-[24rem] w-full rounded-box rounded-b-none"
            />
            <AgeClassificationIcon
              v-if="anime.ageClassification"
              :age-classification="anime.ageClassification"
              class="rounded-tl-none rounded-br-none shadow-md absolute top-0 right-0"
            />
            <div
              class="w-full flex justify-center bg-ani-cold-white text-blue-900 border-b font-semibold text-sm"
            >
              {{ handleMediaType(anime.mediaType ?? null) }}
            </div>
          </div>
          <div
            class="bg-white w-full rounded-b-2xl p-2 font-meduim gap-2 flex flex-col"
          >
            <div class="flex items-center justify-evenly gap-2">
              <span
                class="flex rounded-full bg-ani-blue text-blue-200 items-center justify-center text-xs py-0.5 px-3 font-medium"
              >
                Nota: {{ anime.score }}
              </span>
              <span
                class="flex rounded-full bg-ani-light-blue text-blue-900 items-center justify-center text-xs py-0.5 px-3 font-medium"
              >
                Ranque: {{ anime.popularity ?? "N/A" }}
              </span>
            </div>
            <div class="flex flex-col pb-1">
              <span class="text-ani-black line-clamp-3 text-center">
                {{ anime.title }}
              </span>
              <span
                class="text-gray-400 text-sm line-clamp-2 text-center font-japanese"
              >
                {{ anime.alternativeTitles[0] ?? "" }}
              </span>
            </div>
            <div class="flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                class="btn btn-sm w-full btn-outline btn-accent rounded-full gap-2"
                @click="
                  $router.push({
                    name: 'recommendation',
                    params: { animeId: anime.id },
                  })
                "
              >
                Ver Recomendações
                <IconTablerArrowNarrowRight />
              </button>
              <button
                v-if="!animeGroupStore.inGroup(anime.id)"
                type="button"
                class="btn btn-sm w-full btn-outline btn-info rounded-full gap-2"
                :class="{
                  '!bg-transparent !text-info/75 !cursor-not-allowed':
                    animeGroupStore.isFull(),
                }"
                :disabled="animeGroupStore.isFull()"
                @click="
                  handleAddGroupItem({ id: anime.id, title: anime.title })
                "
              >
                Add ao grupo
                <IconTablerPlus />
              </button>
              <button
                v-else
                type="button"
                class="btn btn-sm w-full btn-outline btn-info rounded-full gap-2"
                @click="handleRemoveGroupItem(anime.id)"
              >
                Remover do grupo
                <IconTablerMinus />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { AnimeMediaType } from "@/graphql/gen/generated";
import type { QueryAnime } from "@/graphql/queries/animeQueries";
import { emitter } from "@/providers/emitterProvider";
import { useAnimeGroupStore, type AnimeGroupItem } from "@/stores/animeGroup";
import { mediaTypeTranslator } from "@/translate/anime";
import { computed, onMounted, onUnmounted, ref } from "vue";
import AgeClassificationIcon from "./AgeClassificationIcon.vue";

const props = withDefaults(
  defineProps<{
    anime: QueryAnime;
    groupEnabled?: boolean;
  }>(),
  {
    groupEnabled: false,
  }
);

const animeGroupStore = useAnimeGroupStore();

const hoverVisible = ref(false);
const animeItem = ref<HTMLElement | null>(null);
const animeRect = ref<{ top: number; left: number } | null>(null);

const animeRectIntervaler = ref<number | null>(null);

function handleAddGroupItem(item: AnimeGroupItem) {
  animeGroupStore.addItem(item);

  emitter.emit("add-toast", {
    type: "success",
    message: "Anime adicionado ao grupo",
  });
}

function handleRemoveGroupItem(id: number) {
  animeGroupStore.removeItem(id);

  emitter.emit("add-toast", {
    type: "success",
    message: "Anime removido do grupo",
  });
}

function handleMouseLeave() {
  setTimeout(() => {
    hoverVisible.value = false;
  }, 200);
}

function handleMediaType(mediaType: AnimeMediaType | null) {
  return mediaType ? mediaTypeTranslator(mediaType) : "Desconhecido";
}

onMounted(() => {
  animeRectIntervaler.value = setInterval(() => {
    const rect = animeItem.value!.getBoundingClientRect();
    animeRect.value = {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }, 1000);
});

onUnmounted(() => {
  clearInterval(animeRectIntervaler.value!);
});
</script>

<style scoped></style>
