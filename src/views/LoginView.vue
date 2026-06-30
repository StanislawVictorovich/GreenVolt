<template>
  <div class="center-screen auth-bg">
    <section class="auth-card">
      <div class="brand large">
        <span class="brand-mark">GV</span>
        <div>
          <strong>GreenVolt CRM ERP</strong>
          <small>Вход в систему</small>
        </div>
      </div>

      <form class="form-grid one" @submit.prevent="submit">
        <label>
          Логин
          <input v-model="form.username" autocomplete="username" />
        </label>
        <label>
          Пароль
          <input v-model="form.password" type="password" autocomplete="current-password" />
        </label>
        <AlertMessage :message="error" type="danger" />
        <button class="btn btn-primary" type="submit">Войти</button>
      </form>

      <p class="muted small">
        По умолчанию: <b>admin/admin</b> или <b>user/user</b>.
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';
import AlertMessage from '../components/common/AlertMessage.vue';

const store = useStore();
const form = reactive({ username: 'admin', password: 'admin' });
const error = computed(() => store.state.auth.error);

function submit() {
  store.dispatch('auth/login', form);
}
</script>
