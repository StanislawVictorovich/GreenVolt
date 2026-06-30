function defaultState() {
  return {
    currentUser: null,
    error: null
  };
}

export default {
  namespaced: true,
  state: defaultState,
  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    currentRole: (state) => state.currentUser?.role || null,
    isAdmin: (state) => state.currentUser?.role === 'ADMIN',
    canAssemble: (state) => ['ADMIN', 'USER'].includes(state.currentUser?.role),
    canManage: (state) => state.currentUser?.role === 'ADMIN'
  },
  mutations: {
    SET_USER(state, user) {
      state.currentUser = user;
      state.error = null;
    },
    SET_ERROR(state, message) {
      state.error = message;
    },
    LOGOUT(state) {
      state.currentUser = null;
      state.error = null;
    }
  },
  actions: {
    login({ commit, rootState }, credentials) {
      const user = rootState.database.users.find((item) => {
        return item.username === credentials.username && item.password === credentials.password && item.active;
      });

      if (!user) {
        commit('SET_ERROR', 'Неверный логин или пароль.');
        return false;
      }

      commit('SET_USER', {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      });
      return true;
    },
    logout({ commit }) {
      commit('LOGOUT');
    }
  }
};
