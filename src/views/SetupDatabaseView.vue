<template>
  <div class="center-screen setup-bg">
    <section class="setup-card">
      <p class="eyebrow">Первый запуск</p>
      <h1>Создай локальную базу или восстанови её из файла</h1>
      <p class="muted">
        Данные хранятся в localStorage этого браузера. Для работы на другом компьютере нужно сделать экспорт базы
        в зашифрованный файл и потом восстановить его на другом устройстве.
      </p>

      <div class="setup-grid">
        <BaseCard title="Создать новую базу" description="Будут созданы пользователи admin/admin и user/user.">
          <form class="form-grid one" @submit.prevent="createDatabase">
            <label>
              Название компании
              <input v-model="companyName" placeholder="GreenVolt" />
            </label>
            <button class="btn btn-primary" type="submit">Создать базу</button>
          </form>
        </BaseCard>

        <BaseCard title="Восстановить из файла" description="Поддерживается зашифрованный файл .gverp.">
          <form class="form-grid one" @submit.prevent="restoreDatabase">
            <label>
              Файл базы
              <input type="file" accept=".gverp,.txt" @change="selectFile" />
            </label>
            <label>
              Пароль файла
              <input v-model="password" type="password" />
            </label>
            <AlertMessage :message="message" :type="messageType" />
            <button class="btn btn-light" type="submit">Восстановить</button>
          </form>
        </BaseCard>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import AlertMessage from '../components/common/AlertMessage.vue';
import BaseCard from '../components/common/BaseCard.vue';
import { readBackupFile } from '../services/backup.service';

const store = useStore();
const companyName = ref('GreenVolt');
const password = ref('');
const file = ref(null);
const message = ref('');
const messageType = ref('info');

function createDatabase() {
  store.dispatch('database/createDatabase', companyName.value || 'GreenVolt');
}

function selectFile(event) {
  file.value = event.target.files?.[0] || null;
}

async function restoreDatabase() {
  try {
    if (!file.value) throw new Error('Выбери файл базы.');
    const snapshot = await readBackupFile(file.value, password.value);
    await store.dispatch('restoreDatabase', snapshot);
  } catch (error) {
    message.value = error.message;
    messageType.value = 'danger';
  }
}
</script>
