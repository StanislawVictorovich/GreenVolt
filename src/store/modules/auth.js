function defaultState() {
    return {
        currentUser: null,
        error: null,
        isLoggingIn: false
    };
}

function wait(milliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
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
        SET_LOGIN_LOADING(state, value) {
            state.isLoggingIn = value;
        },
        LOGOUT(state) {
            state.currentUser = null;
            state.error = null;
            state.isLoggingIn = false;
        }
    },
    actions: {
        async login({ commit, rootState }, credentials) {
            const user = rootState.database.users.find((item) => {
                return item.username === credentials.username && item.password === credentials.password && item.active;
            });

            if (!user) {
                commit('SET_ERROR', 'Неверный логин или пароль.');
                return false;
            }

            commit('SET_ERROR', null);
            commit('SET_LOGIN_LOADING', true);
            await wait(2000);
            commit('SET_USER', {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            });
            commit('SET_LOGIN_LOADING', false);
            return true;
        },
        logout({ commit }) {
            commit('LOGOUT');
        }
    }
};
