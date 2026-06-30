<template>
    <section>
        <PageHeader title="Финансы и аналитика" description="Продажи, себестоимость, закупки, зарплата и ручные финансовые операции." />

        <div class="metric-grid">
            <div class="metric-card"><span>Выручка</span><strong>{{ money(analytics.salesTotal) }}</strong></div>
            <div class="metric-card"><span>Себестоимость продаж</span><strong>{{ money(analytics.cogsTotal) }}</strong></div>
            <div class="metric-card"><span>Валовая прибыль</span><strong>{{ money(analytics.grossProfit) }}</strong></div>
            <div class="metric-card"><span>Закупки</span><strong>{{ money(analytics.purchaseTotal) }}</strong></div>
            <div class="metric-card"><span>Зарплата</span><strong>{{ money(analytics.salaryTotal) }}</strong></div>
            <div class="metric-card"><span>Баланс</span><strong>{{ money(analytics.balance) }}</strong></div>
        </div>

        <BaseCard v-if="canManage" title="Ручная финансовая операция">
            <form class="form-grid" @submit.prevent="save">
                <label>Дата <input v-model="form.date" type="date" /></label>
                <label>Тип
                    <select v-model="form.type">
                        <option value="INCOME">Доход</option>
                        <option value="EXPENSE">Расход</option>
                    </select>
                </label>
                <label>Категория <input v-model="form.category" /></label>
                <label>Сумма <input v-model.number="form.amount" type="number" min="0" step="0.01" /></label>
                <label class="full">Комментарий <textarea v-model="form.comment" /></label>
                <button class="btn btn-primary full" type="submit">Добавить</button>
            </form>
        </BaseCard>

        <BaseCard title="Финансовые операции">
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
const analytics = computed(() => store.getters.analytics);
const rows = computed(() => store.state.operations.finance);
const form = reactive({ date: today(), type: 'EXPENSE', category: '', amount: 0, comment: '' });
const columns = [
    { key: 'date', label: 'Дата' },
    { key: 'type', label: 'Тип', format: (value) => value === 'INCOME' ? 'Доход' : 'Расход' },
    { key: 'category', label: 'Категория' },
    { key: 'amount', label: 'Сумма', format: money },
    { key: 'comment', label: 'Комментарий' }
];
function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function save() { store.dispatch('operations/addFinance', { ...form }); Object.assign(form, { date: today(), type: 'EXPENSE', category: '', amount: 0, comment: '' }); }
function remove(id) { store.dispatch('operations/deleteFinance', id); }
</script>
