<template>
  <div class="topbar">
    <div>
      <strong>{{ user.name }}</strong>
      <span class="pill">{{ user.role }}</span>
    </div>
    <button class="btn btn-light" @click="logout">Выйти</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const user = computed(() => store.state.auth.currentUser || {});

function logout() {
  store.dispatch('auth/logout');
}
</script>
