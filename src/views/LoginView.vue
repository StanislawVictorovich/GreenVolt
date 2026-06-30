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

            <form class="form-grid one" autocomplete="off" @submit.prevent="submit">
                <label>
                    Логин
                    <input
                        v-model.trim="form.username"
                        autocomplete="off"
                        :disabled="isLoading"
                    />
                </label>
                <label>
                    Пароль
                    <input
                        v-model="form.password"
                        type="password"
                        autocomplete="new-password"
                        :disabled="isLoading"
                    />
                </label>

                <AlertMessage :message="error" type="danger" />

                <button class="btn btn-primary" type="submit" :disabled="isLoading">
                    <span v-if="isLoading" class="btn-spinner" aria-hidden="true"></span>
                    {{ isLoading ? 'Входим...' : 'Войти' }}
                </button>

                <div v-if="isLoading" class="login-progress" role="status" aria-live="polite">
                    <span class="login-spinner" aria-hidden="true"></span>
                    <span>Авторизация прошла успешно. Загружаем систему...</span>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';
import AlertMessage from '../components/common/AlertMessage.vue';

const store = useStore();
const form = reactive({ username: '', password: '' });
const error = computed(() => store.state.auth.error);
const isLoading = computed(() => store.state.auth.isLoggingIn);

async function submit() {
    if (isLoading.value) return;
    await store.dispatch('auth/login', { ...form });
}
</script>
