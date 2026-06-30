<template>
    <section>
        <PageHeader title="Товары на сборку" description="Шаблоны готовых изделий: какие комплектующие нужны для сборки товара." />

        <BaseCard v-if="canManage" title="Товар / рецепт сборки">
            <form class="form-grid one" @submit.prevent="save">
                <label>Наименование товара <input v-model="form.name" required /></label>
                <label>SKU / код <input v-model="form.sku" /></label>
                <RecipeItemsEditor v-model="form.items" :options="components" item-key="componentId" />
                <label>Комментарий <textarea v-model="form.comment" /></label>
                <div class="form-actions">
                    <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить' }}</button>
                    <button class="btn btn-light" type="button" @click="reset">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <BaseCard title="Общий список товаров">
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
import RecipeItemsEditor from '../components/common/RecipeItemsEditor.vue';

const store = useStore();
const canManage = computed(() => store.getters['auth/canManage']);
const components = computed(() => store.state.catalog.components);
const columns = [
    { key: 'name', label: 'Товар' },
    { key: 'sku', label: 'SKU' },
    { key: 'itemsText', label: 'Комплектующие' },
    { key: 'inStock', label: 'В наличии' },
    { key: 'reserved', label: 'В броне' },
    { key: 'sold', label: 'Продано' }
];
const emptyForm = () => ({ id: '', name: '', sku: '', items: [], comment: '' });
const form = reactive(emptyForm());

const rows = computed(() => {
    return store.state.catalog.productRecipes.map((recipe) => {
        const counters = store.getters.productCounters(recipe.id);
        return {
            ...recipe,
            ...counters,
            itemsText: recipe.items.map((item) => {
                const component = components.value.find((componentItem) => componentItem.id === item.componentId);
                return `${component?.name || 'Удалена'} × ${item.quantity}`;
            }).join(', ')
        };
    });
});

function reset() { Object.assign(form, emptyForm()); }
function edit(row) { Object.assign(form, { ...row, items: row.items.map((item) => ({ ...item })) }); }
function save() { store.dispatch('catalog/saveProductRecipe', { ...form, items: form.items.map((item) => ({ ...item })) }); reset(); }
function remove(id) { if (confirm('Удалить товар/рецепт?')) store.dispatch('catalog/deleteProductRecipe', id); }
</script>
