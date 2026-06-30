<template>
  <section>
    <PageHeader title="Закупки" description="Закупка деталей и комплектующих: дата, стоимость, количество, наименование, контакт." />

    <BaseCard v-if="canManage" title="Добавить закупку">
      <form class="form-grid" @submit.prevent="save">
        <label>Дата <input v-model="form.date" type="date" required /></label>
        <label>Тип
          <select v-model="form.type">
            <option value="PART">Деталь</option>
            <option value="COMPONENT">Комплектующая</option>
          </select>
        </label>
        <label>Наименование
          <select v-model="form.itemId" required>
            <option value="">Выбрать</option>
            <option v-for="item in itemOptions" :key="item.id" :value="item.id">{{ item.name }}</option>
          </select>
        </label>
        <label>Контакт
          <select v-model="form.contactId">
            <option value="">Без контакта</option>
            <option v-for="contact in sellers" :key="contact.id" :value="contact.id">{{ contact.name }}</option>
          </select>
        </label>
        <label>Количество <input v-model.number="form.quantity" type="number" min="0" step="0.01" required /></label>
        <label>Цена за единицу <input v-model.number="form.unitCost" type="number" min="0" step="0.01" /></label>
        <label>Статус
          <select v-model="form.status">
            <option value="ORDERED">В заказе</option>
            <option value="RECEIVED">Поступило</option>
          </select>
        </label>
        <label class="full">Комментарий <textarea v-model="form.comment" /></label>
        <div class="form-actions full">
          <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить' }}</button>
          <button class="btn btn-light" type="button" @click="reset">Очистить</button>
        </div>
      </form>
    </BaseCard>

    <BaseCard title="История закупок">
      <EntityTable :rows="rows" :columns="columns">
        <template v-if="canManage" #actions="{ row }">
          <button v-if="row.status === 'ORDERED'" class="link-btn" @click="confirmPurchase(row.id)">Принять на склад</button>
          <button class="link-btn" @click="edit(row)">Редактировать</button>
          <button class="link-btn danger" @click="remove(row.id)">Удалить</button>
        </template>
      </EntityTable>
    </BaseCard>
  </section>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { useStore } from 'vuex';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { today } from '../utils/id';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const sellers = computed(() => store.getters['contacts/sellers']);
const itemOptions = computed(() => form.type === 'PART' ? store.state.catalog.parts : store.state.catalog.components);
const emptyForm = () => ({ id: '', date: today(), type: 'COMPONENT', itemId: '', quantity: 1, unitCost: 0, contactId: '', status: 'RECEIVED', comment: '' });
const form = reactive(emptyForm());

watch(() => form.type, () => { form.itemId = ''; });

const rows = computed(() => {
  return store.state.operations.purchases.map((purchase) => {
    const source = purchase.type === 'PART' ? store.state.catalog.parts : store.state.catalog.components;
    const item = source.find((entity) => entity.id === purchase.itemId);
    const contact = store.state.contacts.list.find((entity) => entity.id === purchase.contactId);
    return {
      ...purchase,
      typeText: purchase.type === 'PART' ? 'Деталь' : 'Комплектующая',
      itemName: item?.name || 'Удалено',
      contactName: contact?.name || '',
      total: Number(purchase.quantity || 0) * Number(purchase.unitCost || 0)
    };
  });
});

const columns = [
  { key: 'date', label: 'Дата' },
  { key: 'status', label: 'Статус', format: (value) => value === 'ORDERED' ? 'В заказе' : 'Поступило' },
  { key: 'typeText', label: 'Тип' },
  { key: 'itemName', label: 'Наименование' },
  { key: 'quantity', label: 'Кол-во' },
  { key: 'unitCost', label: 'Цена', format: money },
  { key: 'total', label: 'Сумма', format: money },
  { key: 'contactName', label: 'Контакт' }
];

function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function reset() { Object.assign(form, emptyForm()); }
function edit(row) { Object.assign(form, row); }
function save() { store.dispatch('operations/savePurchase', { ...form }); reset(); }
function confirmPurchase(id) { store.dispatch('operations/confirmPurchase', id); }
function remove(id) { if (confirm('Удалить закупку?')) store.dispatch('operations/deletePurchase', id); }
</script>
