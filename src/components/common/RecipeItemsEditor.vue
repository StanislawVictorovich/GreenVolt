<template>
  <div class="recipe-editor">
    <div v-for="(item, index) in localItems" :key="index" class="recipe-row">
      <select v-model="item[itemKey]">
        <option value="">Выбрать</option>
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.name }}
        </option>
      </select>
      <input v-model.number="item.quantity" type="number" min="0" step="0.01" placeholder="Количество" />
      <button type="button" class="btn btn-light" @click="removeItem(index)">Удалить</button>
    </div>
    <button type="button" class="btn btn-light" @click="addItem">+ Добавить позицию</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  itemKey: { type: String, required: true }
});
const emit = defineEmits(['update:modelValue']);

const localItems = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

function addItem() {
  localItems.value = [...localItems.value, { [props.itemKey]: '', quantity: 1 }];
}

function removeItem(index) {
  localItems.value = localItems.value.filter((_, itemIndex) => itemIndex !== index);
}
</script>
