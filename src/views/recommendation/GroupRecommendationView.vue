<template>
  <div
    v-if="ready && !animes"
    class="container w-full flex-grow flex items-center justify-center self-center"
  >
    <h1 class="text-4xl font-medium">Animes não encontrados</h1>
  </div>
  <div
    v-else-if="ready && animes"
    class="container py-20 flex flex-col gap-10 self-center"
  >
    <div class="border divide-y flex flex-col rounded-box shadow-md">
      <div v-for="anime in animes" :key="anime.id">
        <button
          type="button"
          @click="anime.isExpanded = !anime.isExpanded"
          class="w-full"
        >
          <AnimeDetailsHeader
            :id="anime.id"
            :title="anime.title"
            :arrow="anime.isExpanded ? 'up' : 'down'"
            class="p-4"
          />
        </button>
        <Collapse :when="anime.isExpanded" class="custom-collapse">
          <AnimeDetails
            :anime="anime"
            :include-header="false"
            class="rounded-none shadow-none ring-0"
          />
        </Collapse>
      </div>
    </div>
    <div class="w-full flex flex-col shadow-lg rounded-2xl">
      <div
        class="w-full bg-ani-blue text-white py-3 rounded-t-2xl flex shadow-md justify-center md:text-lg font-medium"
      >
        Recomendações
      </div>
      <RecommendationList :anime-ids="animes.map((anime) => anime.id)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeDetails from "@/components/recommendation/AnimeDetails.vue";
import AnimeDetailsHeader from "@/components/recommendation/AnimeDetailsHeader.vue";
import RecommendationList from "@/components/recommendation/RecommendationList.vue";
import RelatedList from "@/components/recommendation/RelatedList.vue";
import {
  GetAnimeByIdDocument,
  ListAnimeByIdDocument,
  TopAnimeMethod,
  type Anime,
} from "@/graphql/gen/generated";
import type {
  ExtendedQueryAnime,
  QueryAnime,
} from "@/graphql/queries/animeQueries";
import { emitterKey } from "@/providers/emitterProvider";
import { useAnimeGroupStore } from "@/stores/animeGroup";
import { promissifyQueryResult } from "@/utils/apolloQueryWrapper";
import { useLazyQuery } from "@vue/apollo-composable";
import { storeToRefs } from "pinia";
import { inject, onMounted, ref } from "vue";
import { Collapse } from "vue-collapsed";

const emitter = inject(emitterKey)!;

const { animeGroup } = storeToRefs(useAnimeGroupStore());

type ExtendedQueryAnimeCollapsable = ExtendedQueryAnime & {
  isExpanded: boolean;
};

const animes = ref<ExtendedQueryAnimeCollapsable[] | null>(null);
const animesShow = ref<Record<number, boolean>>({});

const ready = ref(false);

async function fetchAnimes() {
  const { listAnimeById: animeQuery } = await promissifyQueryResult(
    useLazyQuery(ListAnimeByIdDocument, {
      ids: animeGroup.value.map((item) => item.id),
      method: TopAnimeMethod.Popularity,
    })
  );

  animes.value = animeQuery.map((anime) => ({
    ...anime,
    isExpanded: false,
  }));
}

function toggleAnime(id: number) {
  animesShow.value[id] = !animesShow.value[id];
}

onMounted(async () => {
  try {
    emitter.emit("loading-modal", true);
    await fetchAnimes();
    ready.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    emitter.emit("loading-modal", false);
  }
});
</script>

<style scoped>
.custom-collapse {
  transition: height 300ms cubic-bezier(0.3, 0, 0.6, 1);
}
</style>
