<template>
  <section>
    <PageHeader title="Зарплата" description="Простая таблица выплат работникам." />

    <BaseCard v-if="canManage" title="Добавить выплату">
      <form class="form-grid" @submit.prevent="save">
        <label>Дата <input v-model="form.date" type="date" /></label>
        <label>Працівник / сотрудник <input v-model="form.employeeName" required /></label>
        <label>Сумма <input v-model.number="form.amount" type="number" min="0" step="0.01" /></label>
        <label class="full">Комментарий <textarea v-model="form.comment" /></label>
        <button class="btn btn-primary full" type="submit">Добавить</button>
      </form>
    </BaseCard>

    <BaseCard title="Выплаты">
      <EntityTable :rows="rows" :columns="columns">
        <template v-if="canManage" #actions="{ row }">
          <button class="link-btn danger" @click="remove(row.id)">Удалить</button>
        </template>
      </EntityTable>
    </BaseCard>
  </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { today } from '../utils/id';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const rows = computed(() => store.state.operations.salary);
const form = reactive({ date: today(), employeeName: '', amount: 0, comment: '' });
const columns = [
  { key: 'date', label: 'Дата' },
  { key: 'employeeName', label: 'Сотрудник' },
  { key: 'amount', label: 'Сумма', format: money },
  { key: 'comment', label: 'Комментарий' }
];
function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function save() { store.dispatch('operations/addSalary', { ...form }); Object.assign(form, { date: today(), employeeName: '', amount: 0, comment: '' }); }
function remove(id) { store.dispatch('operations/deleteSalary', id); }
</script>
