import { createId, normalizeNumber, roundMoney, today } from '../../utils/id';
import {
  getComponentAvailableQuantity,
  getComponentAverageCost,
  getPartAvailableQuantity,
  getPartAverageCost,
  getProductRecipeCost
} from '../../services/inventory.service';

export function createDefaultOperationsState() {
  return {
    purchases: [],
    componentBatches: [],
    productUnits: [],
    repairs: [],
    salary: [],
    finance: []
  };
}

function requireAdmin(rootGetters) {
  if (!rootGetters['auth/canManage']) throw new Error('Недостаточно прав.');
}

function requireAssembler(rootGetters) {
  if (!rootGetters['auth/canAssemble']) throw new Error('Недостаточно прав.');
}

function assertPositiveQuantity(quantity, message = 'Количество должно быть больше нуля.') {
  if (normalizeNumber(quantity) <= 0) throw new Error(message);
}

export default {
  namespaced: true,
  state: createDefaultOperationsState,
  mutations: {
    RESET(state) {
      Object.assign(state, createDefaultOperationsState());
    },
    REPLACE_OPERATIONS_STATE(state, payload = {}) {
      Object.assign(state, createDefaultOperationsState(), payload);
    },
    ADD_PURCHASE(state, purchase) {
      state.purchases.push(purchase);
    },
    UPDATE_PURCHASE(state, purchase) {
      const index = state.purchases.findIndex((item) => item.id === purchase.id);
      if (index >= 0) state.purchases.splice(index, 1, purchase);
    },
    DELETE_PURCHASE(state, id) {
      state.purchases = state.purchases.filter((item) => item.id !== id);
    },
    ADD_COMPONENT_BATCH(state, batch) {
      state.componentBatches.push(batch);
    },
    ADD_PRODUCT_UNIT(state, unit) {
      state.productUnits.push(unit);
    },
    UPDATE_PRODUCT_UNIT(state, unit) {
      const index = state.productUnits.findIndex((item) => item.id === unit.id);
      if (index >= 0) state.productUnits.splice(index, 1, unit);
    },
    DELETE_PRODUCT_UNIT(state, id) {
      state.productUnits = state.productUnits.filter((item) => item.id !== id);
    },
    ADD_REPAIR(state, repair) {
      state.repairs.push(repair);
    },
    UPDATE_REPAIR(state, repair) {
      const index = state.repairs.findIndex((item) => item.id === repair.id);
      if (index >= 0) state.repairs.splice(index, 1, repair);
    },
    ADD_SALARY(state, salary) {
      state.salary.push(salary);
    },
    DELETE_SALARY(state, id) {
      state.salary = state.salary.filter((item) => item.id !== id);
    },
    ADD_FINANCE(state, finance) {
      state.finance.push(finance);
    },
    DELETE_FINANCE(state, id) {
      state.finance = state.finance.filter((item) => item.id !== id);
    }
  },
  actions: {
    savePurchase({ commit, rootGetters }, payload) {
      requireAdmin(rootGetters);
      assertPositiveQuantity(payload.quantity);

      const purchase = {
        id: payload.id || createId('pur'),
        date: payload.date || today(),
        type: payload.type || 'COMPONENT',
        itemId: payload.itemId,
        quantity: normalizeNumber(payload.quantity),
        unitCost: normalizeNumber(payload.unitCost),
        contactId: payload.contactId || '',
        status: payload.status || 'RECEIVED',
        comment: payload.comment || ''
      };

      commit(payload.id ? 'UPDATE_PURCHASE' : 'ADD_PURCHASE', purchase);
    },
    confirmPurchase({ commit, state, rootGetters }, id) {
      requireAdmin(rootGetters);
      const purchase = state.purchases.find((item) => item.id === id);
      if (!purchase) throw new Error('Закупка не найдена.');
      commit('UPDATE_PURCHASE', { ...purchase, status: 'RECEIVED' });
    },
    deletePurchase({ commit, rootGetters }, id) {
      requireAdmin(rootGetters);
      commit('DELETE_PURCHASE', id);
    },
    assembleComponent({ commit, rootState, rootGetters }, payload) {
      requireAssembler(rootGetters);
      const quantity = normalizeNumber(payload.quantity);
      assertPositiveQuantity(quantity);

      const recipe = rootState.catalog.componentRecipes.find((item) => item.componentId === payload.componentId);
      if (!recipe || !recipe.items.length) throw new Error('Для комплектующей не создан рецепт.');

      const partsUsed = recipe.items.map((item) => ({
        partId: item.partId,
        quantity: normalizeNumber(item.quantity) * quantity
      }));

      for (const item of partsUsed) {
        const available = getPartAvailableQuantity(rootState, item.partId);
        if (available < item.quantity) throw new Error('Недостаточно деталей для сборки комплектующей.');
      }

      const totalCost = roundMoney(
        partsUsed.reduce((total, item) => total + getPartAverageCost(rootState, item.partId) * item.quantity, 0)
      );

      commit('ADD_COMPONENT_BATCH', {
        id: createId('cbt'),
        date: payload.date || today(),
        componentId: payload.componentId,
        quantity,
        partsUsed,
        unitCost: quantity ? roundMoney(totalCost / quantity) : 0,
        totalCost,
        comment: payload.comment || ''
      });
    },
    assembleProduct({ commit, rootState, rootGetters }, payload) {
      requireAssembler(rootGetters);
      const recipe = rootState.catalog.productRecipes.find((item) => item.id === payload.productRecipeId);
      if (!recipe || !recipe.items.length) throw new Error('Для товара не создан список комплектующих.');

      const serial = (payload.serial || '').trim();
      if (!serial) throw new Error('Укажи уникальный серийный номер.');
      const exists = rootState.operations.productUnits.some((item) => item.serial === serial);
      if (exists) throw new Error('Такой серийный номер уже есть.');

      const componentsUsed = recipe.items.map((item) => ({
        componentId: item.componentId,
        quantity: normalizeNumber(item.quantity)
      }));

      for (const item of componentsUsed) {
        const available = getComponentAvailableQuantity(rootState, item.componentId);
        if (available < item.quantity) throw new Error('Недостаточно комплектующих для сборки товара.');
      }

      const cost = getProductRecipeCost(rootState, recipe.id);

      commit('ADD_PRODUCT_UNIT', {
        id: createId('unit'),
        serial,
        productRecipeId: recipe.id,
        dateManufactured: payload.dateManufactured || today(),
        dateSold: '',
        buyerContactId: '',
        salePrice: 0,
        cost,
        status: 'IN_STOCK',
        componentsUsed,
        comment: payload.comment || ''
      });
    },
    reserveProduct({ commit, state, rootGetters }, id) {
      requireAdmin(rootGetters);
      const unit = state.productUnits.find((item) => item.id === id);
      if (!unit || unit.status === 'SOLD') return;
      commit('UPDATE_PRODUCT_UNIT', { ...unit, status: unit.status === 'RESERVED' ? 'IN_STOCK' : 'RESERVED' });
    },
    sellProduct({ commit, state, rootGetters }, payload) {
      requireAdmin(rootGetters);
      const unit = state.productUnits.find((item) => item.id === payload.id);
      if (!unit) throw new Error('Товар не найден.');
      if (unit.status === 'SOLD') throw new Error('Товар уже продан.');

      commit('UPDATE_PRODUCT_UNIT', {
        ...unit,
        status: 'SOLD',
        dateSold: payload.dateSold || today(),
        buyerContactId: payload.buyerContactId || '',
        salePrice: normalizeNumber(payload.salePrice)
      });
    },
    deleteProductUnit({ commit, rootGetters }, id) {
      requireAdmin(rootGetters);
      commit('DELETE_PRODUCT_UNIT', id);
    },
    saveRepair({ commit, rootState, rootGetters }, payload) {
      requireAdmin(rootGetters);
      const componentsUsed = (payload.componentsUsed || [])
        .filter((item) => item.componentId && normalizeNumber(item.quantity) > 0)
        .map((item) => ({ componentId: item.componentId, quantity: normalizeNumber(item.quantity) }));

      for (const item of componentsUsed) {
        const available = getComponentAvailableQuantity(rootState, item.componentId);
        if (available < item.quantity) throw new Error('Недостаточно комплектующих для ремонта.');
      }

      const repair = {
        id: payload.id || createId('rep'),
        serial: payload.serial || '',
        contactId: payload.contactId || '',
        dateIn: payload.dateIn || today(),
        dateOut: payload.dateOut || '',
        status: payload.status || 'IN_REPAIR',
        componentsUsed,
        cost: roundMoney(
          componentsUsed.reduce((total, item) => total + getComponentAverageCost(rootState, item.componentId) * item.quantity, 0)
        ),
        comment: payload.comment || ''
      };

      commit(payload.id ? 'UPDATE_REPAIR' : 'ADD_REPAIR', repair);
    },
    addSalary({ commit, rootGetters }, payload) {
      requireAdmin(rootGetters);
      commit('ADD_SALARY', {
        id: createId('sal'),
        date: payload.date || today(),
        employeeName: payload.employeeName || '',
        amount: normalizeNumber(payload.amount),
        comment: payload.comment || ''
      });
    },
    deleteSalary({ commit, rootGetters }, id) {
      requireAdmin(rootGetters);
      commit('DELETE_SALARY', id);
    },
    addFinance({ commit, rootGetters }, payload) {
      requireAdmin(rootGetters);
      commit('ADD_FINANCE', {
        id: createId('fin'),
        date: payload.date || today(),
        type: payload.type || 'EXPENSE',
        category: payload.category || '',
        amount: normalizeNumber(payload.amount),
        comment: payload.comment || ''
      });
    },
    deleteFinance({ commit, rootGetters }, id) {
      requireAdmin(rootGetters);
      commit('DELETE_FINANCE', id);
    }
  }
};
