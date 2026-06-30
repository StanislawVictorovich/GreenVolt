<template>
    <div class="table-wrap">
        <table class="entity-table">
            <thead>
                <tr>
                    <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
                    <th v-if="$slots.actions" class="actions-column">Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="!rows.length">
                    <td :colspan="columns.length + ($slots.actions ? 1 : 0)" class="empty-cell">
                        Данных пока нет
                    </td>
                </tr>
                <tr v-for="row in rows" :key="row[rowKey]">
                    <td v-for="column in columns" :key="column.key" :class="column.className">
                        <slot :name="`cell-${column.key}`" :row="row">
                            {{ formatCell(row, column) }}
                        </slot>
                    </td>
                    <td v-if="$slots.actions" class="row-actions">
                        <slot name="actions" :row="row" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
defineProps({
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    rowKey: { type: String, default: 'id' }
});

function formatCell(row, column) {
    const value = row[column.key];
    if (column.format) return column.format(value, row);
    return value ?? '';
}
</script>
