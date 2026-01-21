const STORAGE_KEY = 'mini_erp_store';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || undefined;
  } catch (e) {
    return undefined;
  }
}

const store = new Vuex.Store({
  state: loadState() || {
    users: [
      { login: 'admin', password: 'admin', role: 'ADMIN' },
      { login: 'manager', password: 'manager', role: 'MANAGER' }
    ],
    authUser: null,
    parts: []
  },

  mutations: {
    LOGIN(state, user) {
      state.authUser = user;
    },
    LOGOUT(state) {
      state.authUser = null;
    },
    ADD_PART(state, part) {
      state.parts.push(part);
    },
    REPLACE_STATE(state, newState) {
      Object.keys(state).forEach(k => delete state[k]);
      Object.assign(state, newState);
    }
  }
});

store.subscribe((m, state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});
