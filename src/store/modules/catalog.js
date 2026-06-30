import { createId } from '../../utils/id';

export function createDefaultCatalogState() {
    return {
        parts: [],
        components: [],
        componentRecipes: [],
        productRecipes: []
    };
}

function requireAdmin(rootGetters) {
    if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
}

function upsert(list, entity) {
    const index = list.findIndex((item) => item.id === entity.id);
    if (index >= 0) list.splice(index, 1, entity);
    else list.push(entity);
}

export default {
    namespaced: true,
    state: createDefaultCatalogState,
    getters: {
        partById: (state) => (id) => state.parts.find((item) => item.id === id),
        componentById: (state) => (id) => state.components.find((item) => item.id === id),
        productRecipeById: (state) => (id) => state.productRecipes.find((item) => item.id === id),
        componentRecipeByComponentId: (state) => (componentId) => {
            return state.componentRecipes.find((item) => item.componentId === componentId);
        }
    },
    mutations: {
        RESET(state) {
            Object.assign(state, createDefaultCatalogState());
        },
        REPLACE_CATALOG_STATE(state, payload = {}) {
            Object.assign(state, createDefaultCatalogState(), payload);
        },
        UPSERT_PART(state, part) {
            upsert(state.parts, part);
        },
        DELETE_PART(state, id) {
            state.parts = state.parts.filter((item) => item.id !== id);
        },
        UPSERT_COMPONENT(state, component) {
            upsert(state.components, component);
        },
        DELETE_COMPONENT(state, id) {
            state.components = state.components.filter((item) => item.id !== id);
            state.componentRecipes = state.componentRecipes.filter((item) => item.componentId !== id);
        },
        UPSERT_COMPONENT_RECIPE(state, recipe) {
            upsert(state.componentRecipes, recipe);
        },
        DELETE_COMPONENT_RECIPE(state, id) {
            state.componentRecipes = state.componentRecipes.filter((item) => item.id !== id);
        },
        UPSERT_PRODUCT_RECIPE(state, recipe) {
            upsert(state.productRecipes, recipe);
        },
        DELETE_PRODUCT_RECIPE(state, id) {
            state.productRecipes = state.productRecipes.filter((item) => item.id !== id);
        }
    },
    actions: {
        savePart({ commit, rootGetters }, payload) {
            requireAdmin(rootGetters);
            commit('UPSERT_PART', {
                id: payload.id || createId('part'),
                name: payload.name?.trim() || 'Деталь',
                unit: payload.unit || 'шт',
                comment: payload.comment || ''
            });
        },
        deletePart({ commit, rootGetters }, id) {
            requireAdmin(rootGetters);
            commit('DELETE_PART', id);
        },
        saveComponent({ commit, rootGetters }, payload) {
            requireAdmin(rootGetters);
            commit('UPSERT_COMPONENT', {
                id: payload.id || createId('cmp'),
                name: payload.name?.trim() || 'Комплектующая',
                unit: payload.unit || 'шт',
                comment: payload.comment || ''
            });
        },
        deleteComponent({ commit, rootGetters }, id) {
            requireAdmin(rootGetters);
            commit('DELETE_COMPONENT', id);
        },
        saveComponentRecipe({ commit, rootGetters }, payload) {
            requireAdmin(rootGetters);
            commit('UPSERT_COMPONENT_RECIPE', {
                id: payload.id || createId('crcp'),
                componentId: payload.componentId,
                items: (payload.items || [])
                    .filter((item) => item.partId && Number(item.quantity) > 0)
                    .map((item) => ({ partId: item.partId, quantity: Number(item.quantity) })),
                comment: payload.comment || ''
            });
        },
        deleteComponentRecipe({ commit, rootGetters }, id) {
            requireAdmin(rootGetters);
            commit('DELETE_COMPONENT_RECIPE', id);
        },
        saveProductRecipe({ commit, rootGetters }, payload) {
            requireAdmin(rootGetters);
            commit('UPSERT_PRODUCT_RECIPE', {
                id: payload.id || createId('prcp'),
                name: payload.name?.trim() || 'Устройство',
                sku: payload.sku || '',
                items: (payload.items || [])
                    .filter((item) => item.componentId && Number(item.quantity) > 0)
                    .map((item) => ({ componentId: item.componentId, quantity: Number(item.quantity) })),
                comment: payload.comment || ''
            });
        },
        deleteProductRecipe({ commit, rootGetters }, id) {
            requireAdmin(rootGetters);
            commit('DELETE_PRODUCT_RECIPE', id);
        }
    }
};
