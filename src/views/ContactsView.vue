<template>
    <section>
        <PageHeader title="Контакты" description="Продавцы, покупатели и универсальные контакты с 10 свободными полями." />

        <BaseCard v-if="canManage" title="Добавить / изменить контакт">
            <form class="form-grid" @submit.prevent="save">
                <label>Тип
                    <select v-model="form.type">
                        <option value="SELLER">Продавец</option>
                        <option value="BUYER">Покупатель</option>
                        <option value="BOTH">Продавец и покупатель</option>
                    </select>
                </label>
                <label>Название / имя <input v-model="form.name" required /></label>
                <label>Телефон <input v-model="form.phone" /></label>
                <label>Email <input v-model="form.email" type="email" /></label>
                <label v-for="index in 10" :key="index">Поле {{ index }} <input v-model="form[`field${index}`]" /></label>
                <label class="full">Комментарий <textarea v-model="form.comment" /></label>
                <div class="form-actions full">
                    <button class="btn btn-primary" type="submit">{{ form.id ? 'Сохранить' : 'Добавить' }}</button>
                    <button class="btn btn-light" type="button" @click="reset">Очистить</button>
                </div>
            </form>
        </BaseCard>

        <BaseCard title="База контактов">
            <EntityTable :rows="contacts" :columns="columns">
                <template v-if="canManage" #actions="{ row }">
                    <button class="link-btn" @click="edit(row)">Редактировать</button>
                    <button class="link-btn danger" @click="remove(row.id)">Удалить</button>
                </template>
            </EntityTable>
        </BaseCard>
    </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useStore } from 'vuex';
import BaseCard from '../components/common/BaseCard.vue';
import EntityTable from '../components/common/EntityTable.vue';
import PageHeader from '../components/common/PageHeader.vue';

const store = useStore();
const contacts = computed(() => store.state.contacts.list);
const canManage = computed(() => store.getters['auth/canManage']);
const columns = [
    { key: 'type', label: 'Тип', format: (value) => ({ SELLER: 'Продавец', BUYER: 'Покупатель', BOTH: 'Оба' }[value] || value) },
    { key: 'name', label: 'Контакт' },
    { key: 'phone', label: 'Телефон' },
    { key: 'email', label: 'Email' },
    { key: 'field1', label: 'Поле 1' },
    { key: 'field2', label: 'Поле 2' }
];

const emptyForm = () => ({
    id: '', type: 'BOTH', name: '', phone: '', email: '', field1: '', field2: '', field3: '', field4: '', field5: '', field6: '', field7: '', field8: '', field9: '', field10: '', comment: ''
});
const form = reactive(emptyForm());

function reset() {
    Object.assign(form, emptyForm());
}

function edit(row) {
    Object.assign(form, row);
}

function save() {
    store.dispatch('contacts/saveContact', { ...form });
    reset();
}

function remove(id) {
    if (confirm('Удалить контакт?')) store.dispatch('contacts/deleteContact', id);
}
</script>
