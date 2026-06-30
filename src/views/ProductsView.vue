<template>
  <section>
    <PageHeader title="Готовый товар / продажи" description="Серийный учёт товара, бронь и продажа покупателю из контактов." />

    <BaseCard v-if="canManage" title="Продать выбранный товар">
      <form class="form-grid" @submit.prevent="sell">
        <label>Серийный товар
          <select v-model="sellForm.id" required>
            <option value="">Выбрать</option>
            <option v-for="unit in sellableUnits" :key="unit.id" :value="unit.id">
              {{ unit.serial }} — {{ unit.productName }}
            </option>
          </select>
        </label>
        <label>Покупатель
          <select v-model="sellForm.buyerContactId">
            <option value="">Без контакта</option>
            <option v-for="buyer in buyers" :key="buyer.id" :value="buyer.id">{{ buyer.name }}</option>
          </select>
        </label>
        <label>Дата продажи <input v-model="sellForm.dateSold" type="date" /></label>
        <label>Цена продажи <input v-model.number="sellForm.salePrice" type="number" min="0" step="0.01" /></label>
        <div class="form-actions full">
          <button class="btn btn-primary" type="submit">Продать</button>
        </div>
      </form>
    </BaseCard>

    <BaseCard title="Готовый товар">
      <EntityTable :rows="rows" :columns="columns">
        <template v-if="canManage" #actions="{ row }">
          <button v-if="row.status !== 'SOLD'" class="link-btn" @click="reserve(row.id)">
            {{ row.status === 'RESERVED' ? 'Снять бронь' : 'В бронь' }}
          </button>
          <button v-if="row.status !== 'SOLD'" class="link-btn danger" @click="remove(row.id)">Удалить</button>
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
const rows = computed(() => store.getters.productRows);
const buyers = computed(() => store.getters['contacts/buyers']);
const sellableUnits = computed(() => rows.value.filter((item) => item.status !== 'SOLD'));
const sellForm = reactive({ id: '', buyerContactId: '', dateSold: today(), salePrice: 0 });
const columns = [
  { key: 'serial', label: 'Серийный' },
  { key: 'productName', label: 'Товар' },
  { key: 'dateManufactured', label: 'Дата изготовления' },
  { key: 'status', label: 'Статус', format: statusText },
  { key: 'cost', label: 'Себестоимость', format: money },
  { key: 'salePrice', label: 'Продажа', format: money },
  { key: 'profit', label: 'Прибыль', format: money },
  { key: 'buyerName', label: 'Покупатель' }
];

function statusText(value) { return { IN_STOCK: 'В наличии', RESERVED: 'В броне', SOLD: 'Продано' }[value] || value; }
function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function reserve(id) { store.dispatch('operations/reserveProduct', id); }
function sell() { store.dispatch('operations/sellProduct', { ...sellForm }); Object.assign(sellForm, { id: '', buyerContactId: '', dateSold: today(), salePrice: 0 }); }
function remove(id) { if (confirm('Удалить готовый товар? Комплектующие вернутся в остаток, потому что расход считается от списка готовых товаров.')) store.dispatch('operations/deleteProductUnit', id); }
</script>
