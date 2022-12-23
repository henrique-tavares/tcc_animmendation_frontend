<template>
  <div
    class="shadow-lg flex flex-col gap-6 p-10 pt-6 w-full rounded-2xl ring ring-ani-faded-blue/10"
  >
    <template v-if="includeHeader">
      <AnimeDetailsHeader :id="anime.id" :title="anime.title" />
      <hr class="border-ani-faded-blue/25" />
    </template>
    <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
      <div
        class="w-64 h-96 flex flex-shrink-0 rounded-2xl relative"
        :class="{ vignette: !!anime.picture }"
      >
        <img
          v-if="anime.picture"
          :src="anime.picture"
          alt=""
          class="rounded-2xl ring-black/10 relative"
        />
        <div
          v-else
          class="w-full bg-gray-400 rounded-2xl flex items-center justify-center"
        >
          <IconTablerCameraOff class="text-white w-16 h-16" />
        </div>
      </div>
      <div class="flex flex-col w-full gap-6">
        <div
          class="shadow-md rounded-2xl font-medium flex flex-col divide-y divide-ani-faded-blue/25 text-blue-900 bg-ani-cold-white w-full md:text-lg"
        >
          <span class="py-3 px-6">Nota: {{ anime.score }}</span>
          <span class="py-3 px-6">Ranque: {{ formattedAnime.popularity }}</span>
          <span class="py-3 px-6">Mídia: {{ formattedAnime.mediaType }}</span>
          <span class="py-3 px-6">Gêneros: {{ formattedAnime.genres }}</span>
          <span class="py-3 px-6"
            >Estúdio(s): {{ formattedAnime.studios }}</span
          >
          <span class="py-3 px-6">
            Estreou em: {{ formattedAnime.releasedSeason }}
          </span>
          <span class="py-3 px-6">
            Classificação de idade: {{ formattedAnime.ageClassification }}
          </span>
          <span class="py-3 px-6">Status: {{ formattedAnime.status }}</span>
        </div>
      </div>
    </div>
    <hr class="border-ani-faded-blue/25" />
    <Transition name="fade" mode="out-in">
      <div v-if="synopsisLoading" class="flex justify-center">
        <Loading />
      </div>
      <div v-else-if="animeSynopsis" class="flex flex-col gap-4">
        <Transition name="fade" mode="out-in">
          <p v-if="!seeOriginalSynopsis" class="text-justify">
            {{ animeSynopsis.translated }}
          </p>
          <p v-else class="text-justify">{{ animeSynopsis.original }}</p>
        </Transition>
        <div class="flex self-end items-center gap-4">
          <span>
            Traduzido por
            <a href="https://libretranslate.com/" class="link">
              LibreTranslate
            </a>
          </span>
          <label class="cursor-pointer flex items-center gap-2">
            <span class=""> Ver original </span>
            <input
              type="checkbox"
              class="checkbox checkbox-accent"
              v-model="seeOriginalSynopsis"
            />
          </label>
        </div>
      </div>
      <div v-else>
        <span>Sem informações de sinopse disponíveis</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Anime } from "@/graphql/gen/generated";
import { emitterKey } from "@/providers/emitterProvider";
import {
  ageTranslator,
  genresTranslator,
  mediaTypeTranslator,
  releasedSeasonTranslator,
  sourcesTranslator,
  statusTranslator,
} from "@/translate/anime";
import { translatorApi } from "@/translate/api";
import { computed, inject, onMounted, ref } from "vue";
import Loading from "../Loading.vue";
import AnimeDetailsHeader from "./AnimeDetailsHeader.vue";

const props = withDefaults(
  defineProps<{
    anime: Anime;
    includeHeader?: boolean;
  }>(),
  {
    includeHeader: true,
  }
);

const formattedAnime = computed(
  (): Record<
    keyof Pick<
      Anime,
      | "ageClassification"
      | "alternativeTitles"
      | "genres"
      | "mediaType"
      | "popularity"
      | "releasedSeason"
      | "source"
      | "status"
      | "studios"
    >,
    string
  > => {
    return {
      ageClassification: props.anime.ageClassification
        ? ageTranslator(props.anime.ageClassification)
        : "Desconhecido",
      alternativeTitles: props.anime.alternativeTitles.join(", "),
      genres: props.anime.genres
        ? props.anime.genres.map((genre) => genresTranslator(genre)).join(", ")
        : "Desconhecido",
      mediaType: props.anime.mediaType
        ? mediaTypeTranslator(props.anime.mediaType)
        : "Desconhecido",
      popularity: props.anime.popularity?.toString() ?? "N/A",
      releasedSeason: props.anime.releasedSeason
        ? releasedSeasonTranslator(props.anime.releasedSeason)
        : "Desconhecido",
      source: props.anime.source
        ? sourcesTranslator(props.anime.source)
        : "Desconhecido",
      status: statusTranslator(props.anime.status),
      studios: props.anime.studios
        ? props.anime.studios.join(", ")
        : "Desconhecido",
    };
  }
);

const animeSynopsis = ref<{ original: string; translated: string } | null>(
  null
);
const seeOriginalSynopsis = ref(false);
const synopsisLoading = ref(false);

onMounted(async () => {
  try {
    synopsisLoading.value = true;
    if (props.anime.synopsis) {
      const translated = await translatorApi.translate(
        "en",
        "pt",
        props.anime.synopsis
      );
      animeSynopsis.value = {
        original: props.anime.synopsis,
        translated,
      };
    }
  } catch (error) {
    console.error(error);
  } finally {
    synopsisLoading.value = false;
  }
});
</script>

<style scoped></style>
