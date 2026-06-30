<template>
    <SetupDatabase v-if="!isDatabaseReady" />
    <LoginView v-else-if="!isAuthenticated" />
    <AppLayout v-else />
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import AppLayout from './components/layout/AppLayout.vue';
import LoginView from './views/LoginView.vue';
import SetupDatabase from './views/SetupDatabaseView.vue';

const store = useStore();
const isDatabaseReady = computed(() => store.state.database.initialized);
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
</script>
