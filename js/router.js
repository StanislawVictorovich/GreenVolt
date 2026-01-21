(function () {
  // Здесь только “карта” маршрутов. Компоненты создаются в app.js.
  window.RouteDefs = [
    { path: '/login', name: 'login', componentKey: 'LoginView', meta: { public: true } },

    { path: '/', redirect: '/dashboard' },
    { path: '/dashboard', name: 'dashboard', componentKey: 'DashboardView', meta: { perm: 'view' } },
    { path: '/inventory', name: 'inventory', componentKey: 'InventoryView', meta: { perm: 'inventory' } },
    { path: '/items', name: 'items', componentKey: 'ItemsView', meta: { perm: 'items' } },
    { path: '/contacts', name: 'contacts', componentKey: 'ContactsView', meta: { perm: 'contacts' } },
    { path: '/recipes', name: 'recipes', componentKey: 'RecipesView', meta: { perm: 'recipes' } },

    { path: '/purchases', name: 'purchases', componentKey: 'PurchasesView', meta: { perm: 'docs' } },
    { path: '/production', name: 'production', componentKey: 'ProductionView', meta: { perm: 'docs' } },
    { path: '/sales', name: 'sales', componentKey: 'SalesView', meta: { perm: 'docs' } },

    { path: '/users', name: 'users', componentKey: 'UsersView', meta: { perm: 'users' } },
    { path: '/settings', name: 'settings', componentKey: 'SettingsView', meta: { perm: 'export_import' } },

    { path: '*', redirect: '/dashboard' }
  ];
})();
