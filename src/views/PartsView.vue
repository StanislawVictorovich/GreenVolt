<template>
  <section>
    <PageHeader title="Детали / склад" description="Справочник деталей и автоматический складской остаток." />

    <BaseCard v-if="canManage" title="Деталь">
      <form class="form-grid" @submit.prevent="save">
        <label>Наименование <input v-model="form.name" required /></label>
        <label>Ед. изм. <input v-model="form.unit" /></label>
        <label class="full">Комментарий <textarea v-model="form.comment" /></label>
        <div class="form-actions full">
          <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить' }}</button>
          <button class="btn btn-light" type="button" @click="reset">Очистить</button>
        </div>
      </form>
    </BaseCard>

    <BaseCard title="Склад деталей">
      <EntityTable :rows="rows" :columns="columns">
        <template v-if="canManage" #actions="{ row }">
          <button class="link-btn" @click="edit(row)">Редактировать</button>
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

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const rows = computed(() => store.getters.partStockRows);
const columns = [
  { key: 'name', label: 'Деталь' },
  { key: 'unit', label: 'Ед.' },
  { key: 'available', label: 'В наличии' },
  { key: 'ordered', label: 'В заказе' },
  { key: 'consumed', label: 'Потрачено на комплектующие' },
  { key: 'averageCost', label: 'Средняя цена', format: money }
];
const emptyForm = () => ({ id: '', name: '', unit: 'шт', comment: '' });
const form = reactive(emptyForm());

function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function reset() { Object.assign(form, emptyForm()); }
function edit(row) { Object.assign(form, { id: row.id, name: row.name, unit: row.unit, comment: row.comment }); }
function save() { store.dispatch('catalog/savePart', { ...form }); reset(); }
function remove(id) { if (confirm('Удалить деталь?')) store.dispatch('catalog/deletePart', id); }
</script>
