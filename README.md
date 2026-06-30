# GreenVolt CRM ERP — Vue 3 + Vuex + localStorage

Нормальная компонентная версия без монолитного `app.js`.

## Что реализовано

- Vue 3 Single File Components.
- Vuex 4 как единый store.
- Vue Router 4 с разделением экранов.
- localStorage как локальная база данных.
- Первый запуск: создать базу или восстановить из файла.
- Экспорт базы в зашифрованный `.gverp` файл.
- Импорт базы из зашифрованного `.gverp` файла.
- CryptoJS AES для шифрования файла базы.
- Роли и пользователи:
  - `admin / admin` — полный доступ: добавление, редактирование, удаление, продажи, закупки, импорт/экспорт.
  - `user / user` — просмотр и сборка комплектующих/готовых товаров.
- Контакты: продавцы, покупатели, универсальные контакты, поля `field1 ... field10`.
- Детали.
- Комплектующие.
- Рецепты комплектующих из деталей.
- Товары на сборку из комплектующих.
- Закупки деталей и комплектующих.
- Поступление из заказа на склад.
- Изготовление комплектующих из деталей.
- Изготовление готового товара из комплектующих.
- Уникальные серийные номера готового товара.
- Бронь готового товара.
- Продажи.
- Сервис / ремонт по серийному номеру.
- Зарплата.
- Финансы.
- Аналитика.
- Автоматический пересчёт склада:
  - детали в наличии;
  - детали в заказе;
  - расход деталей на изготовление комплектующих;
  - комплектующие в наличии;
  - комплектующие в заказе;
  - комплектующие в непроданном оборудовании;
  - готовый товар в наличии;
  - готовый товар в броне;
  - проданный товар.

## Запуск

```bash
npm install
npm run dev
```

Потом открыть адрес из консоли, обычно:

```text
http://localhost:5173
```

## Сборка

```bash
npm run build
npm run preview
```

## Структура проекта

```text
src/
  App.vue
  main.js
  router/
    index.js
  store/
    index.js
    modules/
      auth.js
      database.js
      contacts.js
      catalog.js
      operations.js
  services/
    backup.service.js
    crypto.service.js
    inventory.service.js
    storage.service.js
  components/
    common/
      AlertMessage.vue
      BaseCard.vue
      EntityTable.vue
      PageHeader.vue
      RecipeItemsEditor.vue
    layout/
      AppLayout.vue
      TopBar.vue
  views/
    DashboardView.vue
    LoginView.vue
    SetupDatabaseView.vue
    ContactsView.vue
    PartsView.vue
    ComponentsView.vue
    ComponentRecipesView.vue
    ProductRecipesView.vue
    PurchasesView.vue
    ProductionView.vue
    ProductsView.vue
    RepairsView.vue
    SalaryView.vue
    FinanceView.vue
    SettingsView.vue
  utils/
    id.js
```

## Основная логика склада

Расчёт склада вынесен в `src/services/inventory.service.js`.

Там считаются:

- остатки деталей;
- детали в заказе;
- средняя цена деталей;
- остатки комплектующих;
- комплектующие в заказе;
- комплектующие в непроданном оборудовании;
- себестоимость комплектующих;
- себестоимость готового товара;
- аналитика по продажам, закупкам, зарплате и финансам.

Это специально не размазано по компонентам, чтобы UI только отображал данные и вызывал Vuex actions.

## Где права доступа

Проверки ролей находятся в:

```text
src/store/modules/auth.js
src/store/modules/contacts.js
src/store/modules/catalog.js
src/store/modules/operations.js
```

Компоненты также скрывают формы редактирования для пользователя `USER`.

## Экспорт и импорт базы

Экспорт/импорт находится в:

```text
src/services/backup.service.js
src/services/crypto.service.js
```

Файл базы шифруется паролем, который вводит пользователь при экспорте. Для восстановления нужен тот же пароль.

## Важно

Это локальная CRM/ERP без backend. Поэтому база живёт в браузере конкретного компьютера. Для переноса на другой компьютер нужно:

1. Зайти в `Настройки / база`.
2. Сделать экспорт `.gverp`.
3. Перенести файл.
4. На другом компьютере при первом запуске выбрать восстановление из файла.
