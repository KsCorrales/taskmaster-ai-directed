# TaskMaster — Backend API

A RESTful JSON API built with **Laravel 13** and **PHP 8.3**, backed by **SQLite**. It exposes a full CRUD interface for managing todo items.

---

## Setup

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# 3. Create the SQLite database and run migrations
php artisan migrate

# 4. Start the development server
php artisan serve
```

The API will be available at `http://127.0.0.1:8000/api`.

---

## Architecture

The backend follows a **Domain-Driven Design (DDD)** structure with three explicit layers between the HTTP request and the database. Each layer has a single, well-defined responsibility.

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Todo/
│   │       └── TodoController.php    ← Layer 1: HTTP in/out
│   ├── Requests/
│   │   └── Todo/
│   │       ├── StoreTodoRequest.php  ← Validation (runs before Layer 1)
│   │       └── UpdateTodoRequest.php
│   └── Traits/
│       └── ApiResponse.php           ← Shared JSON response helpers
├── Services/
│   └── Todo/
│       └── TodoService.php           ← Layer 2: Business logic
└── Models/
    └── Todo.php                      ← Layer 3: Data / Eloquent ORM
```

---

## Request → Response Flow

Every HTTP request travels through the same pipeline before a response is returned.

```
┌──────────────────────────────────────────────────────────────────┐
│                         HTTP Request                             │
│              e.g. POST /api/todos  {"content":"Buy milk"}        │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Laravel Router                             │
│                        routes/api.php                            │
│                                                                  │
│  Matches verb + path → resolves controller action                │
│  e.g. POST /todos  →  TodoController@store                       │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Form Request (Validation)                       │
│           StoreTodoRequest / UpdateTodoRequest                   │
│                                                                  │
│  Runs before the controller receives the request.                │
│  · Declares rules: required, string, boolean, max:255 …          │
│  · UpdateTodoRequest also enforces: at least one field present   │
│                                                                  │
│  ✗ Invalid  →  422 Unprocessable Entity (JSON errors auto)       │
│  ✓ Valid    →  passes validated data down to the controller      │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│             Layer 1 — Controller  (thin)                         │
│              Http/Controllers/Todo/TodoController                │
│                                                                  │
│  Responsibilities:                                               │
│  · Accept the validated request                                  │
│  · Extract only what the service needs (scalar values)           │
│  · Call the appropriate TodoService method                       │
│  · Return a JSON response via the ApiResponse trait              │
│                                                                  │
│  Does NOT contain business logic or database queries.            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│             Layer 2 — Service  (business logic)                  │
│                  Services/Todo/TodoService                       │
│                                                                  │
│  Responsibilities:                                               │
│  · Own all business decisions:                                   │
│      - Default status to false when not provided                 │
│      - Order results newest-first                                │
│      - Apply status filters (active / completed / all)           │
│      - Allow partial updates (only supplied fields change)       │
│  · Framework-agnostic: no Request or Response objects here       │
│  · Calls the Model to read/write data                            │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│             Layer 3 — Model / Eloquent ORM                       │
│                         Models/Todo                              │
│                                                                  │
│  Responsibilities:                                               │
│  · Define the database table mapping (todos)                     │
│  · Declare fillable fields and casts (status → boolean)          │
│  · Execute queries via Eloquent (create, update, delete, get)    │
│                                                                  │
│  Does NOT contain business logic or validation.                  │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │  SQLite Database  │
                   │   todos  table   │
                   └──────────────────┘
```

### Return path

The result travels back up through the same layers:

```
SQLite result
  → Eloquent Model instance / Collection  (Layer 3)
  → TodoService returns it to the Controller  (Layer 2)
  → Controller calls ApiResponse trait helper  (Layer 1)
  → JSON response sent to the client
```

---

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/todos` | List all todos — supports `?filter=all\|active\|completed` |
| POST | `/api/todos` | Create a new todo |
| PUT | `/api/todos/{id}` | Update a todo (partial — at least one field required) |
| DELETE | `/api/todos/{id}` | Delete a todo |

### Todo object

```json
{
  "id": 1,
  "content": "Buy milk",
  "status": false,
  "created_at": "2026-04-07T17:00:00.000000Z",
  "updated_at": "2026-04-07T17:00:00.000000Z"
}
```

`status: false` = active (not done) · `status: true` = completed

---

### GET /api/todos

```bash
# All todos (newest first)
curl http://127.0.0.1:8000/api/todos

# Only active (status = false)
curl http://127.0.0.1:8000/api/todos?filter=active

# Only completed (status = true)
curl http://127.0.0.1:8000/api/todos?filter=completed
```

Response: `200 OK` — plain JSON array `[...]`

---

### POST /api/todos

```bash
curl -X POST http://127.0.0.1:8000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"content": "Buy milk"}'
```

`status` is optional — defaults to `false` when omitted.

Response: `201 Created` — the created todo object

---

### PUT /api/todos/{id}

```bash
# Toggle status only
curl -X PUT http://127.0.0.1:8000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"status": true}'

# Update content and status together
curl -X PUT http://127.0.0.1:8000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"content": "Buy oat milk", "status": true}'
```

At least one of `content` or `status` must be provided — empty body returns `422`.

Response: `200 OK` — the updated todo object

---

### DELETE /api/todos/{id}

```bash
curl -X DELETE http://127.0.0.1:8000/api/todos/1
```

Response: `204 No Content`

---

## Validation rules

| Field | Create (POST) | Update (PUT) |
|---|---|---|
| `content` | required · string · min:1 · max:255 | optional · string · min:1 · max:255 |
| `status` | optional · boolean · default `false` | optional · boolean |
| _(body)_ | — | at least one field required, else `422` |

---

## Error responses

All errors on `/api/*` routes return JSON regardless of the client's `Accept` header.

| Status | Meaning |
|---|---|
| `422 Unprocessable Entity` | Validation failed — body contains an `errors` object |
| `404 Not Found` | Todo with the given ID does not exist |
| `500 Internal Server Error` | Unexpected server error |

**Validation error example:**
```json
{
  "message": "The content field is required.",
  "errors": {
    "content": ["The content field is required."]
  }
}
```

---

## Database

| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER | Auto-increment primary key |
| `content` | VARCHAR(255) | The task description |
| `status` | BOOLEAN | `0` = active · `1` = completed · Default: `0` |
| `created_at` | DATETIME | Set on creation |
| `updated_at` | DATETIME | Updated on every change |

---

## Testing

```bash
# Run all tests
php artisan test

# Run only the Todo API tests
php artisan test --filter=TodoApiTest
```

**30 tests · 89 assertions** — all passing.

| Suite | Cases covered |
|---|---|
| `GET /todos` | Empty list, newest-first ordering, response structure, all filter values, unknown filter fallback |
| `POST /todos` | Happy path, default status, all validation rules (required, empty, non-string, boolean, max length), response structure |
| `PUT /todos/{id}` | Full update, partial content-only, partial status-only, empty body 422, validation, 404 on missing ID, response structure |
| `DELETE /todos/{id}` | 204 + DB removal, 404 on missing ID, 404 on non-numeric ID, 404 on double-delete |
