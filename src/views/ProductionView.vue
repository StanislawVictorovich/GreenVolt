<template>
  <section>
    <PageHeader title="Сборка" description="Пользователь USER может только собирать комплектующие и готовые товары. Админ тоже может." />

    <AlertMessage :message="message" :type="messageType" />

    <div class="grid two">
      <BaseCard title="Изготовить комплектующие из деталей">
        <form class="form-grid one" @submit.prevent="assembleComponent">
          <label>Комплектующая
            <select v-model="componentForm.componentId" required>
              <option value="">Выбрать</option>
              <option v-for="component in componentsWithRecipe" :key="component.id" :value="component.id">{{ component.name }}</option>
            </select>
          </label>
          <label>Количество <input v-model.number="componentForm.quantity" type="number" min="1" step="1" required /></label>
          <label>Дата <input v-model="componentForm.date" type="date" /></label>
          <label>Комментарий <textarea v-model="componentForm.comment" /></label>
          <button class="btn btn-primary" type="submit">Собрать комплектующие</button>
        </form>
      </BaseCard>

      <BaseCard title="Изготовить готовый товар из комплектующих">
        <form class="form-grid one" @submit.prevent="assembleProduct">
          <label>Товар
            <select v-model="productForm.productRecipeId" required>
              <option value="">Выбрать</option>
              <option v-for="recipe in productRecipes" :key="recipe.id" :value="recipe.id">{{ recipe.name }}</option>
            </select>
          </label>
          <label>Уникальный серийный номер <input v-model="productForm.serial" required /></label>
          <label>Дата изготовления <input v-model="productForm.dateManufactured" type="date" /></label>
          <label>Комментарий <textarea v-model="productForm.comment" /></label>
          <button class="btn btn-primary" type="submit">Собрать товар</button>
        </form>
      </BaseCard>
    </div>

    <div class="grid two">
      <BaseCard title="Последние партии комплектующих">
        <EntityTable :rows="componentBatches" :columns="batchColumns" />
      </BaseCard>
      <BaseCard title="Последние собранные товары">
        <EntityTable :rows="productRows" :columns="productColumns" />
      </BaseCard>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import AlertMessage from '../components/common/AlertMessage.vue';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';
import { today } from '../utils/id';

const store = useStore();
const message = ref('');
const messageType = ref('info');

const componentForm = reactive({ componentId: '', quantity: 1, date: today(), comment: '' });
const productForm = reactive({ productRecipeId: '', serial: '', dateManufactured: today(), comment: '' });

const productRecipes = computed(() => store.state.catalog.productRecipes);
const componentsWithRecipe = computed(() => {
  const recipeComponentIds = store.state.catalog.componentRecipes.map((recipe) => recipe.componentId);
  return store.state.catalog.components.filter((component) => recipeComponentIds.includes(component.id));
});

const componentBatches = computed(() => store.state.operations.componentBatches.slice().reverse().map((batch) => ({
  ...batch,
  componentName: store.state.catalog.components.find((item) => item.id === batch.componentId)?.name || 'Удалено'
})));

const productRows = computed(() => store.getters.productRows.slice().reverse());
const batchColumns = [
  { key: 'date', label: 'Дата' },
  { key: 'componentName', label: 'Комплектующая' },
  { key: 'quantity', label: 'Кол-во' },
  { key: 'unitCost', label: 'Себестоимость/шт', format: money },
  { key: 'totalCost', label: 'Итого', format: money }
];
const productColumns = [
  { key: 'dateManufactured', label: 'Дата' },
  { key: 'serial', label: 'Серийный' },
  { key: 'productName', label: 'Товар' },
  { key: 'cost', label: 'Себестоимость', format: money },
  { key: 'status', label: 'Статус' }
];

function money(value) { return `${Number(value || 0).toFixed(2)} грн`; }
function showOk(text) { message.value = text; messageType.value = 'success'; }
function showError(error) { message.value = error.message; messageType.value = 'danger'; }

async function assembleComponent() {
  try {
    await store.dispatch('operations/assembleComponent', { ...componentForm });
    Object.assign(componentForm, { componentId: '', quantity: 1, date: today(), comment: '' });
    showOk('Комплектующие собраны, склад пересчитан.');
  } catch (error) { showError(error); }
}

async function assembleProduct() {
  try {
    await store.dispatch('operations/assembleProduct', { ...productForm });
    Object.assign(productForm, { productRecipeId: '', serial: '', dateManufactured: today(), comment: '' });
    showOk('Готовый товар собран, комплектующие списаны.');
  } catch (error) { showError(error); }
}
</script>
