<template>
    <section>
        <PageHeader
            title="Устройства"
            description="Здесь устройство создаётся из готовых комплектующих: комплектующие списываются со склада, а устройство добавляется как серийная единица."
        />

        <AlertMessage :message="message" :type="messageType" />

        <BaseCard v-if="canAssemble" title="Создать устройство из комплектующих">
            <form class="form-grid one" @submit.prevent="assembleDevice">
                <div class="grid two">
                    <label>Название устройства
                        <input v-model="form.deviceName" placeholder="Например: GreenVolt Controller X1" required />
                    </label>
                    <label>SKU / код
                        <input v-model="form.sku" />
                    </label>
                </div>

                <div class="grid two">
                    <label>Уникальный серийный номер
                        <input v-model="form.serial" required />
                    </label>
                    <label>Дата изготовления
                        <input v-model="form.dateManufactured" type="date" />
                    </label>
                </div>

                <div>
                    <p class="muted small block-caption">Комплектующие для одного устройства</p>
                    <ItemsEditor v-model="form.componentsUsed" :options="availableComponents" item-key="componentId" />
                </div>

                <label>Комментарий
                    <textarea v-model="form.comment" />
                </label>

                <div class="form-actions">
                    <button class="btn btn-primary" type="submit">Создать устройство и списать комплектующие</button>
                    <button class="btn btn-light" type="button" @click="resetForm">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <div class="grid two">
            <BaseCard title="Склад комплектующих">
                <EntityTable :rows="componentRows" :columns="componentColumns" />
            </BaseCard>

            <BaseCard title="Модели устройств">
                <EntityTable :rows="deviceModels" :columns="modelColumns" />
            </BaseCard>
        </div>

        <BaseCard title="Серийные устройства">
            <EntityTable :rows="deviceRows" :columns="deviceColumns">
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

const emptyForm = () => ({
    deviceName: '',
    sku: '',
    serial: '',
    dateManufactured: today(),
    componentsUsed: [],
    comment: ''
});
const form = reactive(emptyForm());

const componentRows = computed(() => store.getters.componentStockRows);
const availableComponents = computed(() => componentRows.value.filter((component) => Number(component.available || 0) > 0));
const deviceRows = computed(() => store.getters.productRows.slice().reverse());

const deviceModels = computed(() => {
    return store.state.catalog.productRecipes.map((model) => ({
        ...model,
        ...store.getters.productCounters(model.id),
        componentsText: model.items.map((item) => {
            const component = store.state.catalog.components.find((componentItem) => componentItem.id === item.componentId);
            return `${component?.name || 'Удалена'} × ${item.quantity}`;
        }).join(', ')
    }));
});

const componentColumns = [
    { key: 'name', label: 'Комплектующая' },
    { key: 'available', label: 'В наличии' },
    { key: 'ordered', label: 'В заказе' },
    { key: 'inUnsoldProducts', label: 'В устройствах' },
    { key: 'averageCost', label: 'Средняя цена', format: money }
];

const modelColumns = [
    { key: 'name', label: 'Устройство' },
    { key: 'sku', label: 'SKU' },
    { key: 'componentsText', label: 'Комплектующие' },
    { key: 'inStock', label: 'В наличии' },
    { key: 'reserved', label: 'В броне' },
    { key: 'sold', label: 'Продано' }
];

const deviceColumns = [
    { key: 'serial', label: 'Серийный' },
    { key: 'productName', label: 'Устройство' },
    { key: 'dateManufactured', label: 'Дата изготовления' },
    { key: 'status', label: 'Статус', format: statusText },
    { key: 'cost', label: 'Себестоимость', format: money },
    { key: 'comment', label: 'Комментарий' }
];

function statusText(value) {
    return { IN_STOCK: 'В наличии', RESERVED: 'В броне', SOLD: 'Продано' }[value] || value;
}

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

function resetForm() {
    Object.assign(form, emptyForm());
}

async function assembleDevice() {
    try {
        await store.dispatch('operations/assembleDevice', {
            ...form,
            componentsUsed: form.componentsUsed.map((item) => ({ ...item }))
        });
        resetForm();
        showOk('Устройство создано. Комплектующие списаны, склад пересчитан.');
    } catch (error) {
        showError(error);
    }
}

function reserve(id) {
    store.dispatch('operations/reserveProduct', id);
}

function remove(id) {
    if (confirm('Удалить устройство? Комплектующие вернутся в остаток, потому что расход считается от списка серийных устройств.')) {
        store.dispatch('operations/deleteProductUnit', id);
    }
}
</script>
