<template>
  <section>
    <PageHeader title="Рецепты комплектующих" description="Какие детали нужны для изготовления одной комплектующей." />

    <BaseCard v-if="canManage" title="Рецепт комплектующей">
      <form class="form-grid one" @submit.prevent="save">
        <label>Комплектующая
          <select v-model="form.componentId" required>
            <option value="">Выбрать</option>
            <option v-for="component in components" :key="component.id" :value="component.id">{{ component.name }}</option>
          </select>
        </label>
        <RecipeItemsEditor v-model="form.items" :options="parts" item-key="partId" />
        <label>Комментарий <textarea v-model="form.comment" /></label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить' }}</button>
          <button class="btn btn-light" type="button" @click="reset">Очистить</button>
        </div>
      </form>
    </BaseCard>

    <BaseCard title="Список рецептов">
      <EntityTable :rows="rows" :columns="columns">
        <template #cell-itemsText="{ row }">
          <span>{{ row.itemsText }}</span>
        </template>
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
const parts = computed(() => store.state.catalog.parts);
const columns = [
  { key: 'componentName', label: 'Комплектующая' },
  { key: 'itemsText', label: 'Детали на 1 шт.' },
  { key: 'comment', label: 'Комментарий' }
];
const emptyForm = () => ({ id: '', componentId: '', items: [], comment: '' });
const form = reactive(emptyForm());

const rows = computed(() => {
  return store.state.catalog.componentRecipes.map((recipe) => ({
    ...recipe,
    componentName: components.value.find((item) => item.id === recipe.componentId)?.name || 'Удалена',
    itemsText: recipe.items.map((item) => {
      const part = parts.value.find((partItem) => partItem.id === item.partId);
      return `${part?.name || 'Удалена'} × ${item.quantity}`;
    }).join(', ')
  }));
});

function reset() { Object.assign(form, emptyForm()); }
function edit(row) { Object.assign(form, { ...row, items: row.items.map((item) => ({ ...item })) }); }
function save() { store.dispatch('catalog/saveComponentRecipe', { ...form, items: form.items.map((item) => ({ ...item })) }); reset(); }
function remove(id) { if (confirm('Удалить рецепт?')) store.dispatch('catalog/deleteComponentRecipe', id); }
</script>
