import { createStore } from 'vuex';
import auth from './modules/auth';
import catalog, { createDefaultCatalogState } from './modules/catalog';
import contacts, { createDefaultContactsState } from './modules/contacts';
import database, { createDefaultDatabaseState } from './modules/database';
import operations, { createDefaultOperationsState } from './modules/operations';
import { clearLocalDatabase, loadLocalDatabase, saveLocalDatabase } from '../services/storage.service';
import {
  buildAnalytics,
  buildComponentStockRows,
  buildPartStockRows,
  buildProductRows,
  getProductCounters
} from '../services/inventory.service';

const persistentModules = ['database', 'contacts', 'catalog', 'operations'];

export function createSnapshot(state) {
  return {
    version: 2,
    database: {
      initialized: state.database.initialized,
      version: state.database.version,
      meta: state.database.meta,
      users: state.database.users
    },
    contacts: state.contacts,
    catalog: state.catalog,
    operations: state.operations
  };
}

function persistencePlugin(store) {
  store.subscribe((mutation, state) => {
    const moduleName = mutation.type.split('/')[0];
    if (!persistentModules.includes(moduleName)) return;
    if (!state.database.initialized) return;

    state.database.meta.updatedAt = new Date().toISOString();
    saveLocalDatabase(createSnapshot(state));
  });
}

const store = createStore({
  modules: {
    auth,
    database,
    contacts,
    catalog,
    operations
  },
  plugins: [persistencePlugin],
  getters: {
    snapshot: (state) => createSnapshot(state),
    partStockRows: (state) => buildPartStockRows(state),
    componentStockRows: (state) => buildComponentStockRows(state),
    productRows: (state) => buildProductRows(state),
    analytics: (state) => buildAnalytics(state),
    productCounters: (state) => (productRecipeId) => getProductCounters(state, productRecipeId)
  },
  mutations: {
    RESTORE_DATABASE(state, snapshot) {
      const safeSnapshot = snapshot || {};

      Object.assign(state.database, createDefaultDatabaseState(), safeSnapshot.database || {});
      Object.assign(state.contacts, createDefaultContactsState(), safeSnapshot.contacts || {});
      Object.assign(state.catalog, createDefaultCatalogState(), safeSnapshot.catalog || {});
      Object.assign(state.operations, createDefaultOperationsState(), safeSnapshot.operations || {});

      state.database.initialized = true;
      state.database.version = 2;
      state.database.meta = {
        companyName: state.database.meta?.companyName || 'GreenVolt',
        createdAt: state.database.meta?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },
    CLEAR_DATABASE(state) {
      Object.assign(state.database, createDefaultDatabaseState());
      Object.assign(state.contacts, createDefaultContactsState());
      Object.assign(state.catalog, createDefaultCatalogState());
      Object.assign(state.operations, createDefaultOperationsState());
      state.auth.currentUser = null;
      clearLocalDatabase();
    }
  },
  actions: {
    bootstrap({ commit }) {
      const snapshot = loadLocalDatabase();
      if (snapshot) commit('RESTORE_DATABASE', snapshot);
    },
    restoreDatabase({ commit, state }, snapshot) {
      commit('RESTORE_DATABASE', snapshot);
      saveLocalDatabase(createSnapshot(state));
    },
    clearDatabase({ commit }) {
      commit('CLEAR_DATABASE');
    }
  }
});

export default store;
