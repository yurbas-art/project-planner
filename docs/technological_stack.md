# Технологический стек Project Planner

## Назначение

Project Planner - веб-приложение для управления задачами на Kanban-доске. Пользователь работает с задачами в колонках «Очередь», «В работе», «На проверке» и «Готово», задаёт приоритеты, редактирует карточки и перемещает их с помощью Drag & Drop.

## Архитектура

```text
React/Vite frontend
	|
	| HTTP/JSON, cookie session
	v
Express backend
	|
	| mysql2
	v
```

Frontend не подключается к базе данных напрямую. Все операции с учетными записями и задачами выполняются через backend API.

## Frontend

- React 18.2 - компонентный пользовательский интерфейс.
- Vite - dev-сервер и production-сборка.
- JavaScript с JSX - основной язык frontend-кода.
- CSS - стили компонентов и адаптация интерфейса.
- `react-dnd` и `react-dnd-html5-backend` - Drag & Drop карточек между колонками.
- Fetch API - HTTP-запросы к backend.
- Nginx - раздача production-сборки frontend-контейнера.

Основные frontend-модули:

- `src/App.jsx` - корневое состояние приложения, авторизация и операции с задачами.
- `src/components/auth` - экран входа и регистрации.
- `src/components/header` - заголовок приложения, текущий пользователь и выход.
- `src/components/board` - Kanban-доска, колонки и карточки.
- `src/components/modal` - формы создания, просмотра и редактирования задач.
- `src/api/api.js` - единый HTTP-клиент для auth и task API.

## Backend

- Node.js - среда выполнения серверного JavaScript.
- Express 5 - HTTP-сервер и маршрутизация.
- `cors` - разрешение запросов от frontend с передачей cookie.
- `express-session` - серверная сессия пользователя.
- `bcryptjs` - хеширование и проверка паролей.
- `dotenv` - загрузка настроек из `server/.env`.
- `mysql2` - подключение Node.js к MariaDB/MySQL по протоколу SQL.

Основной серверный файл - `server/server.js`. Подключение к базе данных вынесено в `server/db.js`.

## Контейнеризация

- Docker Engine - запуск изолированных сервисов.
- Docker Compose - оркестрация frontend, API и MariaDB.

Compose включает три сервиса: `frontend`, `api` и `db`. Внутри Docker-сети backend подключается к MariaDB по имени `db` и порту `3306`. С хоста база доступна на порту `3307`, чтобы не конфликтовать с контейнером `DB-labs`.

## База данных

Используется MariaDB. Для локальной установки проекта настроен порт `3307`, поскольку Docker-контейнер `DB-labs` использует порт `3306`.

Основные параметры подключения:

```env
DB_HOST=127.0.0.1
DB_PORT=3307
DB_NAME=project_planner_auth
DB_USER=yurbas_2007
DB_PASSWORD=...
```

SQL-схема находится в `server/schema.sql`.

### Таблица `users`

Хранит учетные записи пользователей:

- `id` - первичный ключ;
- `name` - отображаемое имя;
- `email` - уникальный email;
- `password_hash` - хеш пароля;
- `created_at` - дата создания учетной записи.

### Таблица `tasks`

Хранит задачи пользователя:

- `id` - первичный ключ;
- `user_id` - внешний ключ на `users.id`;
- `title` - название задачи;
- `description` - описание;
- `priority` - `низкий`, `средний` или `высокий`;
- `status` - одна из четырех Kanban-колонок;
- `created_at` и `updated_at` - даты создания и изменения.

При удалении пользователя связанные задачи удаляются благодаря `ON DELETE CASCADE`.

## Аутентификация

Поддерживаются операции регистрации, входа, получения текущего пользователя и выхода из учетной записи.

Пароли не хранятся в открытом виде. Перед сохранением они хешируются с помощью `bcryptjs`.

Идентификатор пользователя хранится в серверной сессии. Cookie сессии имеет флаги `HttpOnly` и `SameSite=Lax`.

## API

### Авторизация

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### Задачи

```text
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
DELETE /api/tasks
```

Маршруты задач используют текущую сессию и работают только с задачами авторизованного пользователя.

## Инфраструктура и запуск

```bash
npm install
npm run dev:full
```

Отдельный запуск:

```bash
npm run server
npm run dev
```

По умолчанию frontend доступен на `http://localhost:5173`, backend - на `http://localhost:3001`, MariaDB - на `127.0.0.1:3307`.

Docker-запуск:

```bash
cp .env.docker.example .env.docker
npm run docker:up
```


## Ограничения текущей версии

- В разработке используется стандартное хранилище сессий Express; для production нужен внешний session store.
- Автоматические unit- и integration-тесты пока не настроены.
- Docker-контейнер `DB-labs` не является частью backend проекта и не изменяется приложением.
- Настройки с секретами находятся в локальном `server/.env`, который исключен из Git.
- Для Docker-запуска требуется Compose plugin или совместимая команда `docker-compose`.

