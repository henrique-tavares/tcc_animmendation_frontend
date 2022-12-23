<template>
  <div
    class="grid grid-cols-[repeat(auto-fill,_192px)] gap-6 justify-center justify-items-center items-center w-full pb-72 md:hidden"
    ref="animesContainerMobile"
  >
    <AnimeItemMobile v-for="(anime, i) in animesData" :anime="anime" :key="i" />
  </div>
  <div
    class="grid grid-cols-[repeat(auto-fill,_256px)] gap-6 justify-center justify-items-center items-center w-full pb-72 max-md:hidden"
    ref="animesContainer"
  >
    <AnimeItem v-for="(anime, i) in animesData" :anime="anime" :key="i" />
  </div>
</template>

<script setup lang="ts">
import {
  GetTopAnimeDocument,
  TopAnimeMethod,
  type AnimeMediaType,
} from "@/graphql/gen/generated";
import type { QueryAnime } from "@/graphql/queries/animeQueries";
import { emitterKey } from "@/providers/emitterProvider";
import { promissifyQueryResult } from "@/utils/apolloQueryWrapper";
import { useLazyQuery } from "@vue/apollo-composable";
import { inject, onMounted, onUnmounted, ref, watch } from "vue";
import AnimeItem from "../anime/AnimeItem.vue";
import AnimeItemMobile from "../anime/AnimeItemMobile.vue";

const props = defineProps<{
  filters: {
    genres: string[];
    mediaTypes: AnimeMediaType[];
    sources: string[];
    studios: string[];
  };
  title: string;
}>();

defineExpose({
  fetchInitialAnimes,
});

const emitter = inject(emitterKey)!;

const animesContainer = ref<HTMLElement | null>(null);
const animesContainerMobile = ref<HTMLElement | null>(null);
const loadingNextPage = ref(false);
const animesData = ref<QueryAnime[]>([]);
const offset = ref<number | null>(null);

watch(
  () => props.filters,
  async () => {
    await fetchInitialAnimes();
  }
);

async function fetchInitialAnimes(title?: string) {
  try {
    emitter.emit("loading-modal", true);
    offset.value = null;
    const { getTopAnime: animes } = await promissifyQueryResult(
      useLazyQuery(GetTopAnimeDocument, {
        method: TopAnimeMethod.Popularity,
        amount: 50,
        genres: props.filters.genres.length ? props.filters.genres : undefined,
        mediaTypes: props.filters.mediaTypes.length
          ? props.filters.mediaTypes
          : undefined,
        sources: props.filters.sources.length
          ? props.filters.sources
          : undefined,
        studios: props.filters.studios.length
          ? props.filters.studios
          : undefined,
        title,
      })
    );

    animesData.value = animes.map((anime) => ({
      id: anime.id,
      alternativeTitles: anime.alternativeTitles,
      score: anime.score,
      title: anime.title,
      ageClassification: anime.ageClassification,
      genres: anime.genres,
      mediaType: anime.mediaType,
      picture: anime.picture,
      popularity: anime.popularity,
      rank: anime.rank,
    }));
  } catch (error) {
    console.error(error);
  } finally {
    emitter.emit("loading-modal", false);
  }
}

async function loadAnime(title?: string) {
  try {
    emitter.emit("loading-modal", true);
    loadingNextPage.value = true;
    offset.value! += 50;

    const { getTopAnime: animes } = await promissifyQueryResult(
      useLazyQuery(GetTopAnimeDocument, {
        method: TopAnimeMethod.Popularity,
        amount: 50,
        offset: offset.value,
        genres: props.filters.genres.length ? props.filters.genres : undefined,
        mediaTypes: props.filters.mediaTypes.length
          ? props.filters.mediaTypes
          : undefined,
        sources: props.filters.sources.length
          ? props.filters.sources
          : undefined,
        studios: props.filters.studios.length
          ? props.filters.studios
          : undefined,
        title,
      })
    );

    animesData.value.push(
      ...animes.map((anime) => ({
        id: anime.id,
        alternativeTitles: anime.alternativeTitles,
        score: anime.score,
        title: anime.title,
        ageClassification: anime.ageClassification,
        genres: anime.genres,
        mediaType: anime.mediaType,
        picture: anime.picture,
        popularity: anime.popularity,
        rank: anime.rank,
      }))
    );
  } catch (error) {
    console.error(error);
  } finally {
    emitter.emit("loading-modal", false);
    loadingNextPage.value = false;
  }
}

function handleScroll() {
  if (!animesContainer.value || !animesContainerMobile.value) {
    return;
  }

  if (loadingNextPage.value) {
    return;
  }

  const containerBottom = Math.max(
    animesContainer.value.getBoundingClientRect().bottom - 200,
    animesContainerMobile.value.getBoundingClientRect().bottom - 200
  );

  if (containerBottom >= window.innerHeight) {
    return;
  }

  loadAnime(props.title.length >= 3 ? props.title : undefined);
}

onMounted(async () => {
  await fetchInitialAnimes();

  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped></style>
