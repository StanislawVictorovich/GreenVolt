import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import ContactsView from '../views/ContactsView.vue';
import PartsView from '../views/PartsView.vue';
import ComponentsView from '../views/ComponentsView.vue';
import DevicesView from '../views/DevicesView.vue';
import PurchasesView from '../views/PurchasesView.vue';
import ProductsView from '../views/ProductsView.vue';
import RepairsView from '../views/RepairsView.vue';
import SalaryView from '../views/SalaryView.vue';
import FinanceView from '../views/FinanceView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/contacts', name: 'contacts', component: ContactsView },
    { path: '/parts', name: 'parts', component: PartsView },
    { path: '/components', name: 'components', component: ComponentsView },
    { path: '/devices', name: 'devices', component: DevicesView },
    { path: '/purchases', name: 'purchases', component: PurchasesView },
    { path: '/products', name: 'products', component: ProductsView },
    { path: '/repairs', name: 'repairs', component: RepairsView },
    { path: '/salary', name: 'salary', component: SalaryView },
    { path: '/finance', name: 'finance', component: FinanceView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/:pathMatch(.*)*', redirect: '/' }
];

export default createRouter({
    history: createWebHashHistory(),
    routes
});
