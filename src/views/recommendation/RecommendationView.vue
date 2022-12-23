<template>
  <div
    v-if="ready && !anime"
    class="container w-full flex-grow flex items-center justify-center self-center"
  >
    <h1 class="text-4xl font-medium">Anime não encontrado</h1>
  </div>
  <div
    v-else-if="ready && anime"
    class="container py-20 flex flex-col gap-10 self-center"
  >
    <AnimeDetails :anime="anime" />
    <div class="w-full flex flex-col shadow-lg rounded-2xl">
      <div class="w-full flex bg-ani-light-blue/20 rounded-t-2xl shadow-md">
        <Transition name="fade" mode="out-in">
          <button
            type="button"
            v-if="chosenTab == 'recommended'"
            class="bg-ani-light-blue text-blue-900 font-semibold md:text-lg w-full rounded-t-2xl h-full px-4 py-2"
          >
            Recomendados
          </button>
          <button
            type="button"
            v-else
            class="bg-transparent text-blue-900/30 font-semibold md:text-lg w-full rounded-t-2xl h-full px-4 py-2 hover:text-blue-900 transition-all"
            @click="chosenTab = 'recommended'"
          >
            Recomendados
          </button>
        </Transition>
        <Transition name="fade" mode="out-in">
          <button
            type="button"
            v-if="chosenTab == 'related'"
            class="bg-ani-light-blue text-blue-900 font-semibold md:text-lg w-full rounded-t-2xl h-full px-4 py-2"
          >
            Relacionados
          </button>
          <button
            type="button"
            v-else
            class="bg-transparent text-blue-900/30 font-semibold md:text-lg w-full rounded-t-2xl h-full px-4 py-2 hover:text-blue-900 transition-all"
            @click="chosenTab = 'related'"
          >
            Relacionados
          </button>
        </Transition>
      </div>
      <Transition name="fade">
        <RecommendationList
          v-if="chosenTab == 'recommended'"
          :anime-ids="animeId"
        />
        <RelatedList v-else-if="chosenTab == 'related'" :anime-id="animeId" />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeDetails from "@/components/recommendation/AnimeDetails.vue";
import RecommendationList from "@/components/recommendation/RecommendationList.vue";
import RelatedList from "@/components/recommendation/RelatedList.vue";
import { GetAnimeByIdDocument, type Anime } from "@/graphql/gen/generated";
import { emitterKey } from "@/providers/emitterProvider";
import { promissifyQueryResult } from "@/utils/apolloQueryWrapper";
import { useLazyQuery } from "@vue/apollo-composable";
import { inject, onMounted, ref } from "vue";

const props = defineProps<{
  animeId: number;
}>();

const emitter = inject(emitterKey)!;

const chosenTab = ref<"recommended" | "related">("recommended");

const anime = ref<Anime | null>(null);

const ready = ref(false);

async function fetchAnime() {
  const { getAnimeById: animeQuery } = await promissifyQueryResult(
    useLazyQuery(GetAnimeByIdDocument, {
      id: props.animeId,
    })
  );

  anime.value = animeQuery;
}

async function fetchRelated() {}

onMounted(async () => {
  try {
    emitter.emit("loading-modal", true);
    await fetchAnime();
    ready.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    emitter.emit("loading-modal", false);
  }
});
</script>

<style scoped>
.vignette::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, transparent 50%, #00000075 150%);
  border-radius: 1rem;
}
</style>
