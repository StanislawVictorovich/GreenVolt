import { createId } from '../../utils/id';

export function createDefaultContactsState() {
    return {
        list: []
    };
}

function requireAdmin(rootGetters) {
    if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
}

export default {
    namespaced: true,
    state: createDefaultContactsState,
    getters: {
        byId: (state) => (id) => state.list.find((item) => item.id === id),
        sellers: (state) => state.list.filter((item) => ['SELLER', 'BOTH'].includes(item.type)),
        buyers: (state) => state.list.filter((item) => ['BUYER', 'BOTH'].includes(item.type))
    },
    mutations: {
        RESET(state) {
            Object.assign(state, createDefaultContactsState());
        },
        REPLACE_CONTACTS_STATE(state, payload = {}) {
            Object.assign(state, createDefaultContactsState(), payload);
        },
        ADD_CONTACT(state, contact) {
            state.list.push(contact);
        },
        UPDATE_CONTACT(state, contact) {
            const index = state.list.findIndex((item) => item.id === contact.id);
            if (index >= 0) state.list.splice(index, 1, contact);
        },
        DELETE_CONTACT(state, id) {
            state.list = state.list.filter((item) => item.id !== id);
        }
    },
    actions: {
        saveContact({ commit, rootGetters }, payload) {
            requireAdmin(rootGetters);
            const normalized = {
                id: payload.id || createId('cnt'),
                type: payload.type || 'BOTH',
                name: payload.name?.trim() || 'Без названия',
                phone: payload.phone || '',
                email: payload.email || '',
                field1: payload.field1 || '',
                field2: payload.field2 || '',
                field3: payload.field3 || '',
                field4: payload.field4 || '',
                field5: payload.field5 || '',
                field6: payload.field6 || '',
                field7: payload.field7 || '',
                field8: payload.field8 || '',
                field9: payload.field9 || '',
                field10: payload.field10 || '',
                comment: payload.comment || ''
            };

            commit(payload.id ? 'UPDATE_CONTACT' : 'ADD_CONTACT', normalized);
        },
        deleteContact({ commit, rootGetters }, id) {
            requireAdmin(rootGetters);
            commit('DELETE_CONTACT', id);
        }
    }
};
