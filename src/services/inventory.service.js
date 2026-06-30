import { roundMoney } from '../utils/id';

function sumBy(items, predicate, mapper) {
    return items.reduce((sum, item) => {
        if (!predicate || predicate(item)) return sum + Number(mapper(item) || 0);
        return sum;
    }, 0);
}

function mapById(items) {
    return new Map(items.map((item) => [item.id, item]));
}

export function getPartPurchasedQuantity(state, partId) {
    return sumBy(
        state.operations.purchases,
        (purchase) => purchase.type === 'PART' && purchase.itemId === partId && purchase.status === 'RECEIVED',
        (purchase) => purchase.quantity
    );
}

export function getPartOrderedQuantity(state, partId) {
    return sumBy(
        state.operations.purchases,
        (purchase) => purchase.type === 'PART' && purchase.itemId === partId && purchase.status === 'ORDERED',
        (purchase) => purchase.quantity
    );
}

export function getPartConsumedQuantity(state, partId) {
    return sumBy(
        state.operations.componentBatches.flatMap((batch) => batch.partsUsed || []),
        (item) => item.partId === partId,
        (item) => item.quantity
    );
}

export function getPartAvailableQuantity(state, partId) {
    return getPartPurchasedQuantity(state, partId) - getPartConsumedQuantity(state, partId);
}

export function getPartAverageCost(state, partId) {
    const purchases = state.operations.purchases.filter(
        (purchase) => purchase.type === 'PART' && purchase.itemId === partId && purchase.status === 'RECEIVED'
    );
    const quantity = sumBy(purchases, null, (purchase) => purchase.quantity);
    const cost = sumBy(purchases, null, (purchase) => purchase.quantity * purchase.unitCost);
    return quantity ? roundMoney(cost / quantity) : 0;
}

export function getComponentPurchasedQuantity(state, componentId) {
    return sumBy(
        state.operations.purchases,
        (purchase) => purchase.type === 'COMPONENT' && purchase.itemId === componentId && purchase.status === 'RECEIVED',
        (purchase) => purchase.quantity
    );
}

export function getComponentOrderedQuantity(state, componentId) {
    return sumBy(
        state.operations.purchases,
        (purchase) => purchase.type === 'COMPONENT' && purchase.itemId === componentId && purchase.status === 'ORDERED',
        (purchase) => purchase.quantity
    );
}

export function getComponentManufacturedQuantity(state, componentId) {
    return sumBy(
        state.operations.componentBatches,
        (batch) => batch.componentId === componentId,
        (batch) => batch.quantity
    );
}

export function getComponentConsumedByProductsQuantity(state, componentId) {
    return sumBy(
        state.operations.productUnits.flatMap((unit) => unit.componentsUsed || []),
        (item) => item.componentId === componentId,
        (item) => item.quantity
    );
}

export function getComponentConsumedByRepairsQuantity(state, componentId) {
    return sumBy(
        state.operations.repairs.flatMap((repair) => repair.componentsUsed || []),
        (item) => item.componentId === componentId,
        (item) => item.quantity
    );
}

export function getComponentInUnsoldProductsQuantity(state, componentId) {
    return sumBy(
        state.operations.productUnits
            .filter((unit) => unit.status !== 'SOLD')
            .flatMap((unit) => unit.componentsUsed || []),
        (item) => item.componentId === componentId,
        (item) => item.quantity
    );
}

export function getComponentAvailableQuantity(state, componentId) {
    return (
        getComponentPurchasedQuantity(state, componentId) +
        getComponentManufacturedQuantity(state, componentId) -
        getComponentConsumedByProductsQuantity(state, componentId) -
        getComponentConsumedByRepairsQuantity(state, componentId)
    );
}

export function getComponentAverageCost(state, componentId) {
    const purchases = state.operations.purchases.filter(
        (purchase) => purchase.type === 'COMPONENT' && purchase.itemId === componentId && purchase.status === 'RECEIVED'
    );
    const purchasedQty = sumBy(purchases, null, (purchase) => purchase.quantity);
    const purchasedCost = sumBy(purchases, null, (purchase) => purchase.quantity * purchase.unitCost);

    const batches = state.operations.componentBatches.filter((batch) => batch.componentId === componentId);
    const madeQty = sumBy(batches, null, (batch) => batch.quantity);
    const madeCost = sumBy(batches, null, (batch) => batch.totalCost);

    const quantity = purchasedQty + madeQty;
    const cost = purchasedCost + madeCost;

    return quantity ? roundMoney(cost / quantity) : 0;
}

export function getProductRecipeCost(state, productRecipeId) {
    const recipe = state.catalog.productRecipes.find((item) => item.id === productRecipeId);
    if (!recipe) return 0;

    return roundMoney(
        recipe.items.reduce((total, item) => {
            return total + getComponentAverageCost(state, item.componentId) * Number(item.quantity || 0);
        }, 0)
    );
}

export function getProductCounters(state, productRecipeId) {
    const units = state.operations.productUnits.filter((unit) => unit.productRecipeId === productRecipeId);
    return {
        inStock: units.filter((unit) => unit.status === 'IN_STOCK').length,
        reserved: units.filter((unit) => unit.status === 'RESERVED').length,
        sold: units.filter((unit) => unit.status === 'SOLD').length,
        total: units.length
    };
}

export function buildPartStockRows(state) {
    return state.catalog.parts.map((part) => ({
        ...part,
        available: getPartAvailableQuantity(state, part.id),
        ordered: getPartOrderedQuantity(state, part.id),
        consumed: getPartConsumedQuantity(state, part.id),
        averageCost: getPartAverageCost(state, part.id)
    }));
}

export function buildComponentStockRows(state) {
    return state.catalog.components.map((component) => ({
        ...component,
        available: getComponentAvailableQuantity(state, component.id),
        ordered: getComponentOrderedQuantity(state, component.id),
        inUnsoldProducts: getComponentInUnsoldProductsQuantity(state, component.id),
        averageCost: getComponentAverageCost(state, component.id)
    }));
}

export function buildProductRows(state) {
    const contactsById = mapById(state.contacts.list);

    return state.operations.productUnits.map((unit) => {
        const recipe = state.catalog.productRecipes.find((item) => item.id === unit.productRecipeId);
        const buyer = unit.buyerContactId ? contactsById.get(unit.buyerContactId) : null;

        return {
            ...unit,
            productName: recipe?.name || 'Удалённый товар',
            buyerName: buyer?.name || '',
            profit: unit.status === 'SOLD' ? roundMoney(Number(unit.salePrice || 0) - Number(unit.cost || 0)) : 0
        };
    });
}

export function buildAnalytics(state) {
    const soldProducts = state.operations.productUnits.filter((unit) => unit.status === 'SOLD');
    const salesTotal = sumBy(soldProducts, null, (unit) => unit.salePrice);
    const cogsTotal = sumBy(soldProducts, null, (unit) => unit.cost);
    const purchaseTotal = sumBy(
        state.operations.purchases,
        (purchase) => purchase.status === 'RECEIVED',
        (purchase) => purchase.quantity * purchase.unitCost
    );
    const salaryTotal = sumBy(state.operations.salary, null, (item) => item.amount);
    const manualIncome = sumBy(state.operations.finance, (item) => item.type === 'INCOME', (item) => item.amount);
    const manualExpense = sumBy(state.operations.finance, (item) => item.type === 'EXPENSE', (item) => item.amount);

    return {
        salesTotal: roundMoney(salesTotal),
        cogsTotal: roundMoney(cogsTotal),
        grossProfit: roundMoney(salesTotal - cogsTotal),
        purchaseTotal: roundMoney(purchaseTotal),
        salaryTotal: roundMoney(salaryTotal),
        manualIncome: roundMoney(manualIncome),
        manualExpense: roundMoney(manualExpense),
        balance: roundMoney(salesTotal + manualIncome - purchaseTotal - salaryTotal - manualExpense)
    };
}
