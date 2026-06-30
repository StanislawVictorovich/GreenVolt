<template>
    <section>
        <PageHeader
            title="Панель управления"
            eyebrow="Товарооборот"
            description="Сводка по закупкам, складу, производству, продажам и финансам."
        />

        <div class="metric-grid">
            <div class="metric-card"><span>Деталей</span><strong>{{ partsCount }}</strong></div>
            <div class="metric-card"><span>Комплектующих</span><strong>{{ componentsCount }}</strong></div>
            <div class="metric-card"><span>Готовых устройств</span><strong>{{ productStats.inStock }}</strong></div>
            <div class="metric-card"><span>Продано</span><strong>{{ productStats.sold }}</strong></div>
            <div class="metric-card"><span>Выручка</span><strong>{{ money(analytics.salesTotal) }}</strong></div>
            <div class="metric-card"><span>Валовая прибыль</span><strong>{{ money(analytics.grossProfit) }}</strong></div>
        </div>

        <div class="grid two">
            <BaseCard title="Срез по комплектующим" description="В наличии, в заказе, в непроданных устройствах.">
                <EntityTable :rows="componentRows" :columns="componentColumns" />
            </BaseCard>
            <BaseCard title="Срез по устройствам" description="В наличии, в броне, продано.">
                <EntityTable :rows="productRecipeRows" :columns="productColumns" />
            </BaseCard>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';

const store = useStore();
const analytics = computed(() => store.getters.analytics);
const componentRows = computed(() => store.getters.componentStockRows);
const partsCount = computed(() => store.state.catalog.parts.length);
const componentsCount = computed(() => store.state.catalog.components.length);
const productStats = computed(() => {
    const rows = store.state.operations.productUnits;
    return {
        inStock: rows.filter((item) => item.status === 'IN_STOCK').length,
        sold: rows.filter((item) => item.status === 'SOLD').length
    };
});

const productRecipeRows = computed(() => {
    return store.state.catalog.productRecipes.map((recipe) => ({
        ...recipe,
        ...store.getters.productCounters(recipe.id)
    }));
});

const componentColumns = [
    { key: 'name', label: 'Наименование' },
    { key: 'available', label: 'В наличии' },
    { key: 'ordered', label: 'В заказе' },
    { key: 'inUnsoldProducts', label: 'В устройствах' },
    { key: 'averageCost', label: 'Средняя цена', format: money }
];

const productColumns = [
    { key: 'name', label: 'Устройство' },
    { key: 'inStock', label: 'В наличии' },
    { key: 'reserved', label: 'В броне' },
    { key: 'sold', label: 'Продано' }
];

function money(value) {
    return `${Number(value || 0).toFixed(2)} грн`;
}
</script>
