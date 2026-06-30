<template>
  <section>
    <PageHeader title="Настройки / база" description="Импорт, экспорт, восстановление зашифрованной базы и управление пользователями." />

    <div class="grid two">
      <BaseCard title="Экспорт базы" description="JSON базы будет зашифрован и сохранён в файл .gverp.">
        <form class="form-grid one" @submit.prevent="exportDatabase">
          <label>Пароль файла <input v-model="exportPassword" type="password" required /></label>
          <button class="btn btn-primary" type="submit">Скачать зашифрованную базу</button>
        </form>
      </BaseCard>

      <BaseCard title="Импорт базы" description="Восстановит данные из зашифрованного файла. Текущая база будет заменена.">
        <form class="form-grid one" @submit.prevent="importDatabase">
          <label>Файл <input type="file" accept=".gverp,.txt" @change="selectFile" /></label>
          <label>Пароль файла <input v-model="importPassword" type="password" required /></label>
          <button class="btn btn-light" type="submit">Восстановить из файла</button>
        </form>
      </BaseCard>
    </div>

    <AlertMessage :message="message" :type="messageType" />

    <BaseCard v-if="canManage" title="Пользователи">
      <form class="form-grid" @submit.prevent="saveUser">
        <label>Логин <input v-model="userForm.username" required /></label>
        <label>Пароль <input v-model="userForm.password" required /></label>
        <label>Имя <input v-model="userForm.name" required /></label>
        <label>Роль
          <select v-model="userForm.role">
            <option value="ADMIN">ADMIN — полный доступ</option>
            <option value="USER">USER — только просмотр и сборка</option>
          </select>
        </label>
        <button class="btn btn-primary full" type="submit">Добавить пользователя</button>
      </form>

      <EntityTable :rows="users" :columns="userColumns">
        <template #actions="{ row }">
          <button class="link-btn danger" :disabled="row.username === 'admin'" @click="deleteUser(row.id)">Удалить</button>
        </template>
      </EntityTable>
    </BaseCard>

    <BaseCard v-if="canManage" title="Опасная зона">
      <button class="btn btn-danger" @click="clearDatabase">Удалить локальную базу из браузера</button>
    </BaseCard>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import AlertMessage from '../components/common/AlertMessage.vue';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { downloadEncryptedBackup, readBackupFile } from '../services/backup.service';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const users = computed(() => store.state.database.users);
const exportPassword = ref('');
const importPassword = ref('');
const importFile = ref(null);
const message = ref('');
const messageType = ref('info');
const userForm = reactive({ username: '', password: '', name: '', role: 'USER' });
const userColumns = [
  { key: 'username', label: 'Логин' },
  { key: 'name', label: 'Имя' },
  { key: 'role', label: 'Роль' },
  { key: 'active', label: 'Активен', format: (value) => value ? 'Да' : 'Нет' }
];

function show(text, type = 'info') { message.value = text; messageType.value = type; }
function selectFile(event) { importFile.value = event.target.files?.[0] || null; }
function exportDatabase() {
  try {
    downloadEncryptedBackup(store.getters.snapshot, exportPassword.value);
    show('База экспортирована в зашифрованный файл.', 'success');
  } catch (error) { show(error.message, 'danger'); }
}
async function importDatabase() {
  try {
    if (!importFile.value) throw new Error('Выбери файл базы.');
    if (!confirm('Текущая база будет заменена. Продолжить?')) return;
    const snapshot = await readBackupFile(importFile.value, importPassword.value);
    await store.dispatch('restoreDatabase', snapshot);
    show('База восстановлена из файла.', 'success');
  } catch (error) { show(error.message, 'danger'); }
}
function saveUser() {
  store.dispatch('database/addUser', { ...userForm });
  Object.assign(userForm, { username: '', password: '', name: '', role: 'USER' });
}
function deleteUser(id) {
  if (confirm('Удалить пользователя?')) store.dispatch('database/deleteUser', id);
}
function clearDatabase() {
  if (confirm('Удалить локальную базу? Сначала сделай экспорт, если данные нужны.')) store.dispatch('clearDatabase');
}
</script>
