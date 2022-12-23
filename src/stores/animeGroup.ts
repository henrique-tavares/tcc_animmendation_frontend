import { useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export type AnimeGroupItem = {
  id: number;
  title: string;
};

export const useAnimeGroupStore = defineStore("animeGroup", {
  state: () => ({
    animeGroup: useStorage(
      "animeGroup",
      [] as AnimeGroupItem[],
      sessionStorage
    ),
  }),
  actions: {
    addItem(item: AnimeGroupItem) {
      if (this.animeGroup.length >= 10) {
        return false;
      }

      this.animeGroup.push(item);
      return true;
    },
    isFull() {
      return this.animeGroup.length >= 10;
    },
    removeItem(id: number) {
      this.animeGroup = this.animeGroup.filter((item) => item.id != id);
    },
    inGroup(id: number) {
      return !!this.animeGroup.find((animeItem) => animeItem.id == id);
    },
    clear() {
      this.animeGroup = [];
    },
  },
});
