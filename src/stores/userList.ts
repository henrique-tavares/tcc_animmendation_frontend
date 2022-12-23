import {
  UserRatingStatus,
  type AnimeAgeClassification,
  type AnimeMediaType,
  type AnimeSeason,
} from "@/graphql/gen/generated";
import { StorageSerializers, useStorage } from "@vueuse/core";
import { defineStore } from "pinia";

export type AnimeReleasedSeason = {
  season: AnimeSeason;
  year: number;
};

export type UserAnimeList = {
  anime: {
    id: number;
    title: string;
    popularity?: number;
    genres?: string[];
    ageClassification?: AnimeAgeClassification;
    releasedSeason?: AnimeReleasedSeason;
    mediaType?: AnimeMediaType;
    source?: string;
    studios?: string[];
  };
  score: number;
  status?: UserRatingStatus;
};

export type GenreCount = Record<string, number>;

export const useUserListStore = defineStore("userList", {
  state: () => ({
    userAnimeList: useStorage<UserAnimeList[] | null>(
      "userAnimeList",
      null,
      sessionStorage,
      {
        serializer: StorageSerializers.object,
      }
    ),
    genreCount: useStorage<GenreCount | null>(
      "genreCount",
      null,
      sessionStorage,
      {
        serializer: StorageSerializers.object,
      }
    ),
  }),
  actions: {
    getUserSeenAnime() {
      return this.userAnimeList?.map((rating) => rating.anime.id);
    },
    getTopAnime({
      amount,
      genres,
      mediaTypes,
      studios,
      sources,
      title,
      offset = 0,
    }: {
      amount: number;
      offset?: number;
      mediaTypes?: AnimeMediaType[];
      genres?: string[];
      studios?: string[];
      sources?: string[];
      title?: string;
    }) {
      if (!this.userAnimeList) {
        return null;
      }

      return this.userAnimeList
        .filter((rating) => {
          if (
            !rating.status ||
            [UserRatingStatus.PlanToWatch, UserRatingStatus.Dropped].includes(
              rating.status
            )
          ) {
            return false;
          }

          if (genres) {
            const animeGenres = new Set(rating.anime.genres);
            const filterGenres = new Set(genres);
            const intersection = new Set(
              [...animeGenres].filter((x) => filterGenres.has(x))
            );

            if (intersection.size == 0) {
              return false;
            }
          }

          if (mediaTypes) {
            if (
              !rating.anime.mediaType ||
              !mediaTypes.includes(rating.anime.mediaType)
            ) {
              return false;
            }
          }

          if (sources) {
            if (
              !rating.anime.source ||
              !sources.includes(rating.anime.source)
            ) {
              return false;
            }
          }

          if (studios) {
            const animeStudios = new Set(rating.anime.studios);
            const filterStudios = new Set(studios);
            const intersection = new Set(
              [...animeStudios].filter((x) => filterStudios.has(x))
            );

            if (intersection.size == 0) {
              return false;
            }
          }

          if (title) {
            if (
              !rating.anime.title.toLowerCase().includes(title.toLowerCase())
            ) {
              return false;
            }
          }

          return true;
        })
        .slice(offset, offset + amount);
    },
    getTop5Genres() {
      if (!this.genreCount) {
        return null;
      }

      return Object.entries(this.genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((genre) => ({ genre: genre[0], count: genre[1] }));
    },

    getTop5Studios() {
      if (!this.userAnimeList) {
        return null;
      }

      const studiosMap = new Map<string, number>();

      this.userAnimeList.forEach((rating) => {
        rating.anime.studios?.forEach((studio) => {
          studiosMap.set(studio, (studiosMap.get(studio) ?? 0) + 1);
        });
      });

      return [...studiosMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((studio) => ({ studio: studio[0], count: studio[1] }));
    },
  },
});
