var STORAGE_KEY = 'mini_erp_store';

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch (e) {
    return null;
  }
}

var store = new Vuex.Store({
  state: loadState() || {
    users: [
      { login: 'admin', password: 'admin', role: 'ADMIN' },
      { login: 'manager', password: 'manager', role: 'MANAGER' }
    ],
    authUser: null,
    parts: []
  },
  mutations: {
    LOGIN: function (state, user) {
      state.authUser = user;
    },
    LOGOUT: function (state) {
      state.authUser = null;
    },
    ADD_PART: function (state, part) {
      state.parts.push(part);
    },
    REPLACE_STATE: function (state, newState) {
      for (var k in state) {
        delete state[k];
      }
      for (var k2 in newState) {
        state[k2] = newState[k2];
      }
    }
  }
});

store.subscribe(function (mutation, state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
});
