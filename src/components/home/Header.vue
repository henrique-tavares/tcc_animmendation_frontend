<template>
  <div class="w-full bg-ani-blue flex flex-row justify-center p-4">
    <div class="flex flex-col w-full container">
      <div class="flex flex-row w-full justify-between items-center">
        <div class="flex flex-row gap-4 items-center">
          <button type="button" @click="$router.back()">
            <IconTablerArrowLeft
              v-if="props.backButton"
              class="text-white w-6 md:w-10 h-6 md:h-10 mt-1"
            />
          </button>
          <RouterLink to="/">
            <h1 class="text-3xl md:text-5xl font-fredoka-one text-white">
              animmendation
            </h1>
          </RouterLink>
        </div>
        <button type="button" class="lg:hidden" @click="expanded = !expanded">
          <IconTablerMenu2 class="w-6 h-6 text-white" />
        </button>
        <div class="max-lg:hidden flex flex-row gap-5 items-center">
          <Transition name="fade" mode="out-in">
            <div
              v-if="animeGroupStore.animeGroup.length"
              class="dropdown dropdown-end"
            >
              <label
                role="button"
                tabindex="0"
                class="btn btn-secondary rounded-full font-medium"
              >
                <div class="flex gap-2 items-center">
                  Ver grupo
                  <span
                    class="badge bg-ani-cold-white text-blue-900 border-0"
                    >{{ animeGroupStore.animeGroup.length }}</span
                  >
                </div>
              </label>
              <TransitionGroup
                name="toast"
                tag="ul"
                class="bg-ani-light-blue shadow-md divide-y dropdown-content rounded-box mt-2 max-w-xl w-max"
                tabindex="0"
                mode="out-in"
              >
                <li
                  v-for="anime in animeGroupStore.animeGroup"
                  :key="anime.id"
                  class="flex gap-3 p-3 w-full items-center border-secondary-content"
                >
                  <IconTablerX
                    role="button"
                    class="w-6 h-6 flex flex-shrink-0"
                    @click="animeGroupStore.removeItem(anime.id)"
                  />
                  <span class="font-medium">
                    {{ anime.title }}
                  </span>
                </li>
                <button
                  class="w-full hover:bg-secondary-focus rounded-b-2xl border-secondary-content p-2 flex items-center justify-center font-medium gap-2"
                  @click="
                    $router.push({
                      name: 'groupRecommendation',
                    })
                  "
                  key="rec"
                >
                  Ver Recomendações
                  <IconTablerArrowNarrowRight class="w-5 h-5" />
                </button>
              </TransitionGroup>
            </div>
          </Transition>
          <a :href="user?.malUrl ?? '#'" class="group" target="_blank">
            <div
              class="flex flex-row items-center rounded-full bg-ani-light-blue gap-4 pl-4 hover:ring-4 hover:ring-ani-light-blue/50 transition"
            >
              <span
                class="md:text-lg text-secondary-content font-medium underline-offset-2"
              >
                {{ user?.username ?? "Visitante" }}
              </span>
              <UserIcon :image-url="user?.imageUrl ?? null" />
            </div>
          </a>
          <button v-if="user" type="button" @click="emit('logout')">
            <IconTablerLogout class="text-white w-10 h-10" />
          </button>
          <button v-else type="button" @click="emit('login')">
            <IconTablerLogin class="text-white w-10 h-10" />
          </button>
        </div>
      </div>
      <Collapse
        :when="expanded"
        class="custom-collapse lg:hidden max-h-48 md:max-h-16"
      >
        <div
          class="flex flex-col md:flex-row gap-5 items-center justify-center p-4 pb-0"
        >
          <Transition name="fade" mode="out-in">
            <div
              v-if="animeGroupStore.animeGroup.length"
              class="dropdown max-md:w-full flex justify-center"
            >
              <label
                role="button"
                tabindex="0"
                class="btn btn-secondary rounded-full font-medium mx-auto"
              >
                <div class="flex gap-2 items-center">
                  Ver grupo
                  <span class="badge bg-ani-cold-white text-blue-900 border-0">
                    {{ animeGroupStore.animeGroup.length }}
                  </span>
                </div>
              </label>
              <TransitionGroup
                name="toast"
                tag="ul"
                class="bg-ani-light-blue shadow-md divide-y dropdown-content top-12 rounded-box mt-2 max-md:w-full w-max"
                tabindex="0"
                mode="out-in"
              >
                <li
                  v-for="anime in animeGroupStore.animeGroup"
                  :key="anime.id"
                  class="flex gap-3 p-3 w-full items-center border-secondary-content"
                >
                  <IconTablerX
                    role="button"
                    class="w-6 h-6 flex flex-shrink-0"
                    @click="animeGroupStore.removeItem(anime.id)"
                  />
                  <span class="font-medium">
                    {{ anime.title }}
                  </span>
                </li>
                <button
                  class="w-full hover:bg-secondary-focus rounded-b-2xl border-secondary-content p-2 flex items-center justify-center font-medium gap-2"
                  @click="
                    $router.push({
                      name: 'groupRecommendation',
                    })
                  "
                >
                  Ver Recomendações
                  <IconTablerArrowNarrowRight class="w-5 h-5" />
                </button>
              </TransitionGroup>
            </div>
          </Transition>
          <a :href="user?.malUrl ?? '#'" class="group" target="_blank">
            <div
              class="flex flex-row items-center rounded-full bg-ani-light-blue gap-4 pl-4 hover:ring-4 hover:ring-ani-light-blue/50 transition"
            >
              <span
                class="text-base text-secondary-content font-medium underline-offset-2"
              >
                {{ user?.username ?? "Visitante" }}
              </span>
              <UserIcon class="" :image-url="user?.imageUrl ?? null" />
            </div>
          </a>
          <button v-if="user" type="button" @click="emit('logout')">
            <IconTablerLogout class="text-white w-10 h-10" />
          </button>
          <button v-else type="button" @click="emit('login')">
            <IconTablerLogin class="text-white w-10 h-10" />
          </button>
        </div>
      </Collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

import UserIcon from "@/components/home/UserIcon.vue";
import { useAnimeGroupStore } from "@/stores/animeGroup";
import { ref } from "vue";
import { Collapse } from "vue-collapsed";

const expanded = ref(false);

const props = withDefaults(
  defineProps<{
    backButton: boolean;
  }>(),
  {
    backButton: false,
  }
);

const emit = defineEmits<{
  (e: "logout"): void;
  (e: "login"): void;
}>();

const animeGroupStore = useAnimeGroupStore();

const userStore = useUserStore();
const { user } = storeToRefs(userStore);
</script>

<style scoped>
.custom-collapse {
  transition: height 300ms cubic-bezier(0.3, 0, 0.6, 1);
}
</style>
