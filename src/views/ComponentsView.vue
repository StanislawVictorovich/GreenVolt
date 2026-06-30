<template>
    <section>
        <PageHeader
            title="Комплектующие"
            description="Здесь комплектующие собираются прямо из деталей: детали списываются со склада, а готовая комплектующая появляется в остатках."
        />

        <AlertMessage :message="message" :type="messageType" />

        <BaseCard v-if="canAssemble" title="Собрать комплектующую из деталей">
            <form class="form-grid one" @submit.prevent="assemble">
                <div class="grid two">
                    <label>Новая комплектующая
                        <input v-model="assembleForm.componentName" :disabled="Boolean(assembleForm.componentId)" placeholder="Например: Контроллер питания" />
                    </label>
                    <label>Или выбрать существующую
                        <select v-model="assembleForm.componentId" @change="clearNewName">
                            <option value="">Новая комплектующая</option>
                            <option v-for="component in components" :key="component.id" :value="component.id">
                                {{ component.name }} — на складе {{ component.available }} {{ component.unit }}
                            </option>
                        </select>
                    </label>
                </div>

                <div class="grid two">
                    <label>Количество комплектующих
                        <input v-model.number="assembleForm.quantity" type="number" min="1" step="1" required />
                    </label>
                    <label>Дата сборки
                        <input v-model="assembleForm.date" type="date" />
                    </label>
                </div>

                <div>
                    <p class="muted small block-caption">Детали на 1 комплектующую</p>
                    <ItemsEditor v-model="assembleForm.items" :options="parts" item-key="partId" />
                </div>

                <label>Комментарий
                    <textarea v-model="assembleForm.comment" />
                </label>

                <div class="form-actions">
                    <button class="btn btn-primary" type="submit">Собрать и списать детали</button>
                    <button class="btn btn-light" type="button" @click="resetAssembleForm">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <div class="grid two">
            <BaseCard title="Склад комплектующих">
                <EntityTable :rows="components" :columns="componentColumns">
                    <template v-if="canManage" #actions="{ row }">
                        <button class="link-btn" @click="edit(row)">Редактировать</button>
                        <button class="link-btn danger" @click="remove(row.id)">Удалить</button>
                    </template>
                </EntityTable>
            </BaseCard>

            <BaseCard title="Доступные детали">
                <EntityTable :rows="partRows" :columns="partColumns" />
            </BaseCard>
        </div>

        <BaseCard v-if="canManage" title="Справочник комплектующих">
            <form class="form-grid" @submit.prevent="save">
                <label>Наименование
                    <input v-model="form.name" required />
                </label>
                <label>Ед. изм.
                    <input v-model="form.unit" />
                </label>
                <label class="full">Комментарий
                    <textarea v-model="form.comment" />
                </label>
                <div class="form-actions full">
                    <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить без сборки' }}</button>
                    <button class="btn btn-light" type="button" @click="reset">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <BaseCard title="История сборки комплектующих">
            <EntityTable :rows="componentBatches" :columns="batchColumns" />
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
import ItemsEditor from '../components/common/ItemsEditor.vue';
import { today } from '../utils/id';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const canAssemble = computed(() => store.getters['auth/canAssemble']);
const message = ref('');
const messageType = ref('info');

const components = computed(() => store.getters.componentStockRows);
const partRows = computed(() => store.getters.partStockRows);
const parts = computed(() => partRows.value.filter((part) => Number(part.available || 0) > 0));

const componentColumns = [
    { key: 'name', label: 'Комплектующая' },
    { key: 'unit', label: 'Ед.' },
    { key: 'available', label: 'В наличии' },
    { key: 'ordered', label: 'В заказе' },
    { key: 'inUnsoldProducts', label: 'В устройствах' },
    { key: 'averageCost', label: 'Средняя цена', format: money }
];

const partColumns = [
    { key: 'name', label: 'Деталь' },
    { key: 'available', label: 'В наличии' },
    { key: 'ordered', label: 'В заказе' },
    { key: 'averageCost', label: 'Средняя цена', format: money }
];

const batchColumns = [
    { key: 'date', label: 'Дата' },
    { key: 'componentName', label: 'Комплектующая' },
    { key: 'quantity', label: 'Кол-во' },
    { key: 'partsText', label: 'Списанные детали' },
    { key: 'unitCost', label: 'Себестоимость/шт', format: money },
    { key: 'totalCost', label: 'Итого', format: money }
];

const emptyForm = () => ({ id: '', name: '', unit: 'шт', comment: '' });
const form = reactive(emptyForm());

const emptyAssembleForm = () => ({
    componentId: '',
    componentName: '',
    unit: 'шт',
    quantity: 1,
    date: today(),
    items: [],
    comment: ''
});
const assembleForm = reactive(emptyAssembleForm());

const componentBatches = computed(() => {
    return store.state.operations.componentBatches.slice().reverse().map((batch) => ({
        ...batch,
        componentName: store.state.catalog.components.find((item) => item.id === batch.componentId)?.name || 'Удалено',
        partsText: (batch.partsUsed || []).map((item) => {
            const part = store.state.catalog.parts.find((partItem) => partItem.id === item.partId);
            return `${part?.name || 'Удалена'} × ${item.quantity}`;
        }).join(', ')
    }));
});

function money(value) {
    return `${Number(value || 0).toFixed(2)} грн`;
}

function showOk(text) {
    message.value = text;
    messageType.value = 'success';
}

function showError(error) {
    message.value = error.message;
    messageType.value = 'danger';
}

function clearNewName() {
    if (assembleForm.componentId) assembleForm.componentName = '';
}

function resetAssembleForm() {
    Object.assign(assembleForm, emptyAssembleForm());
}

function reset() {
    Object.assign(form, emptyForm());
}

function edit(row) {
    Object.assign(form, { id: row.id, name: row.name, unit: row.unit, comment: row.comment });
}

async function assemble() {
    try {
        await store.dispatch('operations/assembleComponentFromParts', {
            ...assembleForm,
            items: assembleForm.items.map((item) => ({ ...item }))
        });
        resetAssembleForm();
        showOk('Комплектующая собрана. Детали списаны, склад пересчитан.');
    } catch (error) {
        showError(error);
    }
}

function save() {
    store.dispatch('catalog/saveComponent', { ...form });
    reset();
}

function remove(id) {
    if (confirm('Удалить комплектующую?')) store.dispatch('catalog/deleteComponent', id);
}
</script>
