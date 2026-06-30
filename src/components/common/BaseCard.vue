<template>
  <section class="card">
    <div v-if="title || $slots.actions" class="card-header">
      <div>
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="description" class="muted">{{ description }}</p>
      </div>
      <div class="card-actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' }
});
</script>
