# GreenVolt CRM ERP — Vue 3 + Vuex + localStorage

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

```text
http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

## Import|Export DataBase

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
