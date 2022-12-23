<template>
  <section class="min-h-screen w-full flex flex-col">
    <Header
      :back-button="true"
      @login="login"
      @logout="logout"
      class="shadow-lg"
    />

    <slot></slot>
  </section>
</template>

<script setup lang="ts">
import Header from "@/components/home/Header.vue";
import { useUserStore } from "@/stores/user";
import { useUserListStore } from "@/stores/userList";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const { user, token, guest } = storeToRefs(useUserStore());
const { userAnimeList } = storeToRefs(useUserListStore());
const router = useRouter();

function login() {
  guest.value = false;
  router.push({
    name: "login",
  });
}

function logout() {
  user.value = null;
  userAnimeList.value = null;
  token.value = null;

  router.push({
    name: "login",
  });
}
</script>

<style scoped></style>
