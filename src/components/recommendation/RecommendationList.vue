<template>
  <div class="w-full flex flex-col">
    <div
      v-if="ready && !recommendedAnimesData.length"
      class="p-4 flex items-center justify-center"
    >
      <span class="md:text-lg font-medium text-ani-black">
        {{
          typeof animeIds == "object"
            ? "Não há recomendações para esse anime ainda"
            : "Não há recomendações para esses animes ainda"
        }}
      </span>
    </div>
    <div v-else class="flex flex-col divide-y" ref="scrollContainer">
      <div
        v-for="(anime, i) in recommendedAnimesData"
        :key="i"
        class="border-ani-faded-blue/25"
      >
        <div class="flex flex-col md:flex-row items-center p-4 gap-4">
          <div
            class="h-40 w-28 flex flex-shrink-0 rounded-2xl relative"
            :class="{ vignette: !!anime.picture }"
          >
            <img
              v-if="anime.picture"
              :src="anime.picture"
              alt=""
              class="w-full h-full ring-black/10 relative rounded-md shadow-md"
            />
            <div
              v-else
              class="w-full bg-gray-400 rounded-2xl flex items-center justify-center"
            >
              <IconTablerCameraOff class="text-white w-16 h-16" />
            </div>
          </div>
          <div
            class="flex flex-col md:flex-row w-full justify-between gap-4 self-stretch"
          >
            <div class="flex flex-col items-start justify-between self-stretch">
              <div class="flex items-center max-md:self-center">
                <span class="md:text-lg font-medium">
                  {{ anime.title }}
                </span>
              </div>
              <div class="flex flex-col">
                <span>
                  Mídia: {{ formatMediaType(anime.mediaType ?? undefined) }}
                </span>
                <span>Nota: {{ anime.score }}</span>
                <span>
                  Ranque: {{ formatPopularity(anime.popularity ?? undefined) }}
                </span>
                <span>
                  Gêneros: {{ formatGenres(anime.genres ?? undefined) }}
                </span>
              </div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AnimeMediaType,
  GetAnimeRecommendationsDocument,
  GetGroupRecomendationsDocument,
} from "@/graphql/gen/generated";
import type { QueryAnime } from "@/graphql/queries/animeQueries";
import { emitterKey } from "@/providers/emitterProvider";
import { useAnimeGroupStore, type AnimeGroupItem } from "@/stores/animeGroup";
import { useUserListStore } from "@/stores/userList";
import { genresTranslator, mediaTypeTranslator } from "@/translate/anime";
import { promissifyQueryResult } from "@/utils/apolloQueryWrapper";
import { useLazyQuery } from "@vue/apollo-composable";
import { inject, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  animeIds: number | number[];
}>();

const userListStore = useUserListStore();
const animeGroupStore = useAnimeGroupStore();

const emitter = inject(emitterKey)!;

const recommendedOffset = ref(0);
const recommendedAnimesData = ref<QueryAnime[]>([]);
const ready = ref(false);

const scrollContainer = ref<HTMLElement | null>(null);
const loadingAnime = ref(false);

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

async function fetchRecommended() {
  const { getAnimeRecommendations: animes } = await promissifyQueryResult(
    useLazyQuery(GetAnimeRecommendationsDocument, {
      id: props.animeIds as number,
      amount: 50,
      offset: recommendedOffset.value,
      excludedAnimeIds: userListStore.getUserSeenAnime() ?? [],
    })
  );

  recommendedAnimesData.value.push(...animes.map(({ anime }) => anime));
  recommendedOffset.value += 50;
}

async function fetchGroupRecommended() {
  const { getGroupRecommendations: animes } = await promissifyQueryResult(
    useLazyQuery(GetGroupRecomendationsDocument, {
      animeIds: props.animeIds as number[],
      amount: 50,
      offset: recommendedOffset.value,
      excludedAnimeIds: userListStore.getUserSeenAnime() ?? [],
    })
  );

  recommendedAnimesData.value.push(...animes.map(({ anime }) => anime));
  recommendedOffset.value += 50;
}

async function delegateRecommend() {
  if (typeof props.animeIds == "object") {
    await fetchGroupRecommended();
  } else {
    await fetchRecommended();
  }
}

function formatMediaType(mediaType?: AnimeMediaType) {
  return mediaType ? mediaTypeTranslator(mediaType) : "Desconhecido";
}

function formatPopularity(popularity?: number) {
  return popularity?.toString() ?? "N/A";
}

function formatGenres(genres?: string[]) {
  return (
    genres?.map((genre) => genresTranslator(genre)).join(", ") ?? "Desconhecido"
  );
}

async function handleScroll() {
  if (!scrollContainer.value) {
    return;
  }

  if (
    scrollContainer.value.getBoundingClientRect().bottom < window.innerHeight &&
    !loadingAnime.value
  ) {
    try {
      emitter.emit("loading-modal", true);
      loadingAnime.value = true;
      await delegateRecommend();
    } catch (error) {
      console.error(error);
    } finally {
      emitter.emit("loading-modal", false);
      loadingAnime.value = false;
    }
  }
}

onMounted(async () => {
  try {
    emitter.emit("loading-modal", true);
    await delegateRecommend();
    window.addEventListener("scroll", handleScroll);
    ready.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    emitter.emit("loading-modal", false);
  }
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped></style>
