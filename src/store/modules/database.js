import { createId } from '../../utils/id';

export function createDefaultUsers() {
  return [
    {
      id: createId('usr'),
      username: 'admin',
      password: 'admin',
      name: 'Administrator',
      role: 'ADMIN',
      active: true
    },
    {
      id: createId('usr'),
      username: 'user',
      password: 'user',
      name: 'Assembler User',
      role: 'USER',
      active: true
    }
  ];
}

export function createDefaultDatabaseState() {
  return {
    initialized: false,
    version: 2,
    meta: {
      companyName: 'GreenVolt',
      createdAt: null,
      updatedAt: null
    },
    users: createDefaultUsers()
  };
}

export default {
  namespaced: true,
  state: createDefaultDatabaseState,
  mutations: {
    INIT_DATABASE(state, companyName = 'GreenVolt') {
      state.initialized = true;
      state.version = 2;
      state.meta = {
        companyName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      state.users = createDefaultUsers();
    },
    TOUCH(state) {
      state.meta.updatedAt = new Date().toISOString();
    },
    ADD_USER(state, user) {
      state.users.push(user);
    },
    UPDATE_USER(state, user) {
      const index = state.users.findIndex((item) => item.id === user.id);
      if (index >= 0) state.users.splice(index, 1, user);
    },
    DELETE_USER(state, id) {
      state.users = state.users.filter((item) => item.id !== id);
    },
    REPLACE_DATABASE_STATE(state, payload) {
      state.initialized = payload.initialized ?? true;
      state.version = payload.version || 2;
      state.meta = payload.meta || { companyName: 'GreenVolt', createdAt: null, updatedAt: null };
      state.users = payload.users?.length ? payload.users : createDefaultUsers();
    }
  },
  actions: {
    createDatabase({ commit }, companyName) {
      commit('database/INIT_DATABASE', companyName, { root: true });
      commit('contacts/RESET', null, { root: true });
      commit('catalog/RESET', null, { root: true });
      commit('operations/RESET', null, { root: true });
      commit('database/TOUCH', null, { root: true });
    },
    addUser({ commit, rootGetters }, payload) {
      if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
      commit('ADD_USER', { ...payload, id: createId('usr'), active: true });
    },
    updateUser({ commit, rootGetters }, user) {
      if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
      commit('UPDATE_USER', user);
    },
    deleteUser({ commit, rootGetters }, id) {
      if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
      commit('DELETE_USER', id);
    }
  }
};
