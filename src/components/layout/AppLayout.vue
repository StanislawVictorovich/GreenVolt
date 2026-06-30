<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">GV</span>
        <div>
          <strong>{{ companyName }}</strong>
          <small>CRM ERP</small>
        </div>
      </div>

      <nav class="nav-list">
        <RouterLink v-for="item in menu" :key="item.to" :to="item.to">
          {{ item.label }}
        </RouterLink>
      </nav>
    </aside>

    <main class="main-area">
      <TopBar />
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import TopBar from './TopBar.vue';

const store = useStore();
const companyName = computed(() => store.state.database.meta.companyName || 'GreenVolt');

const menu = [
  { to: '/', label: 'Панель' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/parts', label: 'Детали / склад' },
  { to: '/components', label: 'Комплектующие' },
  { to: '/component-recipes', label: 'Рецепты комплектующих' },
  { to: '/product-recipes', label: 'Товары на сборку' },
  { to: '/purchases', label: 'Закупки' },
  { to: '/production', label: 'Сборка' },
  { to: '/products', label: 'Готовый товар / продажи' },
  { to: '/repairs', label: 'Сервис / ремонт' },
  { to: '/salary', label: 'Зарплата' },
  { to: '/finance', label: 'Финансы' },
  { to: '/settings', label: 'Настройки / база' }
];
</script>
