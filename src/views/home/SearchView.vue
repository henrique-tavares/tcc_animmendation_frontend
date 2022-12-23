<template>
  <div class="flex flex-col container w-full self-center items-center">
    <div
      class="w-full flex bg-ani-light-blue/20 rounded-b-2xl shadow-md max-w-[1000px]"
      v-if="!!user"
    >
      <Transition name="fade" mode="out-in">
        <button
          type="button"
          v-if="chosenTab == 'all'"
          class="bg-ani-light-blue text-blue-900 font-semibold md:text-lg w-full rounded-b-2xl h-full px-4 py-2"
        >
          Todos
        </button>
        <button
          type="button"
          v-else
          class="bg-transparent text-blue-900/30 font-semibold md:text-lg w-full rounded-b-2xl h-full px-4 py-2 hover:text-blue-900 transition-all"
          @click="chosenTab = 'all'"
        >
          Todos
        </button>
      </Transition>
      <Transition name="fade" mode="out-in">
        <button
          type="button"
          v-if="chosenTab == 'mylist'"
          class="bg-ani-light-blue text-blue-900 font-semibold md:text-lg w-full rounded-b-2xl h-full px-4 py-2"
        >
          Minha Lista
        </button>
        <button
          type="button"
          v-else
          class="bg-transparent text-blue-900/30 font-semibold md:text-lg w-full rounded-b-2xl h-full px-4 py-2 hover:text-blue-900 transition-all"
          @click="chosenTab = 'mylist'"
        >
          Minha Lista
        </button>
      </Transition>
    </div>

    <div class="w-full flex flex-col self-center items-center gap-10 py-10">
      <div class="max-w-[1000px] flex flex-col items-center w-full gap-6">
        <div class="relative w-full select-none">
          <button
            type="button"
            class="absolute right-0 inset-y-0 pr-2"
            @click="handleFetchWithTitle"
          >
            <div
              class="p-2 bg-transparent active:bg-black/10 transition rounded-full"
            >
              <IconTablerSearch class="w-6 h-6 text-blue-900" />
            </div>
          </button>
          <input
            type="text"
            placeholder="Começe a digitar o Título"
            v-model="titleInput"
            @keypress.enter="handleFetchWithTitle"
            class="w-full py-4 px-6 text-blue-900 placeholder:text-ani-faded-blue bg-ani-cold-white rounded-xl focus:ring-4 md:text-lg shadow-md focus:shadow-lg ring-ani-blue outline-none transition pr-12"
          />
        </div>
        <div
          class="flex flex-col bg-ani-cold-white w-full rounded-xl shadow-md"
        >
          <button
            type="button"
            class="btn btn-primary gap-2 flex items-center no-animation"
            :class="{ 'shadow-md': filtersShow }"
            @click="filtersShow = !filtersShow"
          >
            Filtros
            <IconTablerChevronDown
              class="transition w-5 h-5"
              :class="{ 'rotate-180': filtersShow }"
            />
          </button>
          <Collapse
            :when="filtersShow"
            class="custom-collapse flex flex-col md:grid grid-cols-2 gap-4 w-full max-w-[700px] md:max-w-none !p-4"
          >
            <div class="flex flex-col items-start w-full">
              <span class="text-ani-faded-blue font-medium">Gêneros</span>
              <Multiselect
                mode="tags"
                :close-on-select="false"
                v-model="genres"
                :options="fetchGenres"
                class="w-full custom-multiselect md:!hidden"
              ></Multiselect>
              <Multiselect
                mode="tags"
                :searchable="true"
                :close-on-select="false"
                v-model="genres"
                :options="fetchGenres"
                class="w-full custom-multiselect max-md:!hidden"
              ></Multiselect>
            </div>
            <div class="flex flex-col items-start w-full">
              <span class="text-ani-faded-blue font-medium">Mídia</span>
              <Multiselect
                mode="tags"
                :close-on-select="false"
                v-model="mediaTypes"
                :options="mediaTypesOptions"
                class="w-full custom-multiselect md:!hidden"
              ></Multiselect>
              <Multiselect
                mode="tags"
                :searchable="true"
                :close-on-select="false"
                v-model="mediaTypes"
                :options="mediaTypesOptions"
                class="w-full custom-multiselect max-md:!hidden"
              ></Multiselect>
            </div>
            <div class="flex flex-col items-start w-full">
              <span class="text-ani-faded-blue font-medium">Fonte</span>
              <Multiselect
                mode="tags"
                :close-on-select="false"
                v-model="sources"
                :options="fetchSources"
                class="w-full custom-multiselect md:!hidden"
              ></Multiselect>
              <Multiselect
                mode="tags"
                :searchable="true"
                :close-on-select="false"
                v-model="sources"
                :options="fetchSources"
                class="w-full custom-multiselect max-md:!hidden"
              ></Multiselect>
            </div>
            <div class="flex flex-col items-start w-full">
              <span class="text-ani-faded-blue font-medium">Estúdios</span>
              <Multiselect
                mode="tags"
                :close-on-select="false"
                v-model="studios"
                :options="fetchStudios"
                class="w-full custom-multiselect md:!hidden"
              ></Multiselect>
              <Multiselect
                mode="tags"
                :searchable="true"
                :close-on-select="false"
                v-model="studios"
                :options="fetchStudios"
                class="w-full custom-multiselect max-md:!hidden"
              ></Multiselect>
            </div>
          </Collapse>
        </div>
      </div>
      <Transition name="fade">
        <AnimeGridGeneral
          v-if="chosenTab == 'all'"
          :filters="filters"
          :title="titleInput"
          ref="animeGridGeneral"
        />
        <AnimeGridUser
          v-else-if="chosenTab == 'mylist'"
          :filters="filters"
          :title="titleInput"
          ref="animeGridUser"
        />
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimeGridGeneral from "@/components/search/AnimeGridGeneral.vue";
import AnimeGridUser from "@/components/search/AnimeGridUser.vue";
import {
  AnimeMediaType,
  GetAnimeGenresDocument,
  GetAnimeSourcesDocument,
  GetAnimeStudioDocument,
} from "@/graphql/gen/generated";
import { useUserStore } from "@/stores/user";
import { genresTranslator, sourcesTranslator } from "@/translate/anime";
import { promissifyQueryResult } from "@/utils/apolloQueryWrapper";
import { useLazyQuery } from "@vue/apollo-composable";
import Multiselect from "@vueform/multiselect";
import { capitalize } from "lodash";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { Collapse } from "vue-collapsed";

const filtersShow = ref(false);
const titleInput = ref("");
const chosenTab = ref<"all" | "mylist">("all");

const { user } = storeToRefs(useUserStore());

const animeGridGeneral = ref<InstanceType<typeof AnimeGridGeneral> | null>(
  null
);
const animeGridUser = ref<InstanceType<typeof AnimeGridUser> | null>(null);

const genres = ref<string[]>([]);
const mediaTypes = ref<AnimeMediaType[]>([]);
const sources = ref<string[]>([]);
const studios = ref<string[]>([]);

const filters = computed(() => ({
  genres: genres.value,
  mediaTypes: mediaTypes.value,
  sources: sources.value,
  studios: studios.value,
}));

const mediaTypesOptions: Record<AnimeMediaType, string> = {
  TV: "TV",
  MOVIE: "Filme",
  OVA: "OVA",
  ONA: "ONA",
  SPECIAL: "Especial",
};

async function fetchGenres() {
  const { getAnimeGenres: genres } = await promissifyQueryResult(
    useLazyQuery(GetAnimeGenresDocument)
  );

  return genres.reduce(
    (acc, { genre }) => ({
      ...acc,
      [genre]: genresTranslator(genre),
    }),
    {} as Record<string, string>
  );
}

async function fetchSources() {
  const { getAnimeSources: sources } = await promissifyQueryResult(
    useLazyQuery(GetAnimeSourcesDocument)
  );

  return sources.reduce(
    (acc, { source }) => ({
      ...acc,
      [source]: capitalize(sourcesTranslator(source)),
    }),
    {} as Record<string, string>
  );
}

async function fetchStudios() {
  const { getAnimeStudios: studios } = await promissifyQueryResult(
    useLazyQuery(GetAnimeStudioDocument)
  );

  return studios.map(({ studio }) => studio);
}

async function handleFetchWithTitle() {
  if (!titleInput.value) {
    chosenTab.value == "all"
      ? await animeGridGeneral.value!.fetchInitialAnimes()
      : await animeGridUser.value!.fetchInitialAnimes();
  }

  if (titleInput.value.length < 3) {
    return;
  }

  chosenTab.value == "all"
    ? await animeGridGeneral.value!.fetchInitialAnimes(titleInput.value)
    : await animeGridUser.value!.fetchInitialAnimes(titleInput.value);
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style src="vue3-perfect-scrollbar/dist/vue3-perfect-scrollbar.css" />

<style scoped>
.custom-collapse {
  transition: height 300ms cubic-bezier(0.3, 0, 0.6, 1);
}
.custom-multiselect {
  --ms-border-color: #97a8d150;
  --ms-tag-bg: #1d4ed8;
  --ms-tag-color: #f5f5f5;
  --ms-ring-color: #38bdf850;
  --ms-radius: 0.75rem;
  --ms-py: 0.75rem;
  --ms-px: 1rem;
  --ms-dropdown-radius: 0.75rem;
  --ms-option-bg-pointed: #eff4ff;
  --ms-option-py: 0.75rem;
  --ms-option-px: 1rem;
}
</style>
