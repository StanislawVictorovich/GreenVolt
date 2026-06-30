<template>
    <section>
        <PageHeader title="Сервис / ремонт" description="Ремонт проводится по серийному номеру, комплектующие списываются поштучно." />

        <BaseCard v-if="canManage" title="Добавить ремонт">
            <form class="form-grid one" @submit.prevent="save">
                <label>Серийный номер
                    <input v-model="form.serial" list="serials" required />
                    <datalist id="serials">
                        <option v-for="unit in products" :key="unit.id" :value="unit.serial" />
                    </datalist>
                </label>
                <label>Контакт
                    <select v-model="form.contactId">
                        <option value="">Без контакта</option>
                        <option v-for="contact in contacts" :key="contact.id" :value="contact.id">{{ contact.name }}</option>
                    </select>
                </label>
                <div class="form-grid">
                    <label>Дата поступления <input v-model="form.dateIn" type="date" /></label>
                    <label>Дата возврата <input v-model="form.dateOut" type="date" /></label>
                </div>
                <label>Статус
                    <select v-model="form.status">
                        <option value="IN_REPAIR">В ремонте</option>
                        <option value="DONE">Возвращён</option>
                    </select>
                </label>
                <RecipeItemsEditor v-model="form.componentsUsed" :options="components" item-key="componentId" />
                <label>Комментарий <textarea v-model="form.comment" /></label>
                <div class="form-actions">
                    <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить ремонт' }}</button>
                    <button class="btn btn-light" type="button" @click="reset">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <BaseCard title="История ремонтов">
            <EntityTable :rows="rows" :columns="columns">
                <template v-if="canManage" #actions="{ row }">
                    <button class="link-btn" @click="edit(row)">Редактировать</button>
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
import RecipeItemsEditor from '../components/common/RecipeItemsEditor.vue';
import { today } from '../utils/id';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const products = computed(() => store.getters.productRows);
const contacts = computed(() => store.state.contacts.list);
const components = computed(() => store.state.catalog.components);
const emptyForm = () => ({ id: '', serial: '', contactId: '', dateIn: today(), dateOut: '', status: 'IN_REPAIR', componentsUsed: [], comment: '' });
const form = reactive(emptyForm());
const rows = computed(() => store.state.operations.repairs.map((repair) => {
    const contact = store.state.contacts.list.find((item) => item.id === repair.contactId);
    return {
        ...repair,
        contactName: contact?.name || '',
        componentsText: repair.componentsUsed.map((item) => {
            const component = components.value.find((entity) => entity.id === item.componentId);
            return `${component?.name || 'Удалено'} × ${item.quantity}`;
        }).join(', ')
    };
}));
const columns = [
    { key: 'serial', label: 'Серийный' },
    { key: 'contactName', label: 'Контакт' },
    { key: 'dateIn', label: 'Поступил' },
    { key: 'dateOut', label: 'Возврат' },
    { key: 'status', label: 'Статус', format: (value) => value === 'DONE' ? 'Возвращён' : 'В ремонте' },
    { key: 'componentsText', label: 'Расход комплектующих' },
    { key: 'cost', label: 'Себестоимость ремонта', format: money }
];

function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function reset() { Object.assign(form, emptyForm()); }
function edit(row) { Object.assign(form, { ...row, componentsUsed: row.componentsUsed.map((item) => ({ ...item })) }); }
function save() { store.dispatch('operations/saveRepair', { ...form, componentsUsed: form.componentsUsed.map((item) => ({ ...item })) }); reset(); }
</script>
