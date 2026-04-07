# New REST API Endpoint

Use this skill whenever creating a new Laravel REST API endpoint in the backend.

## Workflow

Follow these steps **in order**. Do not skip or reorder them.

### Step 0 — Analyze & Ask (MANDATORY before any code)
- Read the requirement carefully
- Identify what data is input/output, what can go wrong, and what edge cases exist
- Check existing code for anything reusable (traits, base classes, services, response helpers)
- **Ask the user any clarifying questions before proceeding** — ambiguity should be resolved here, not mid-implementation

### Step 1 — Write the tests first (TDD)
- Create a Feature test in `tests/Feature/`
- Cover: happy path, validation errors, not-found, unauthorized (if applicable), and edge cases
- Add a comment for each test method explaining **why** that case matters
- Do **not** implement logic yet — tests should fail at this point

### Step 2 — Register the route
- Add the route in `routes/api.php`
- Use the correct HTTP verb (GET=read, POST=create, PUT/PATCH=update, DELETE=delete)
- Assess whether the route needs authentication middleware (`auth:sanctum`, etc.)
- Group with existing route groups if applicable; avoid duplicating middleware declarations

### Step 3 — Controller (Domain-Driven Design)
- Place the controller under `app/Http/Controllers/{Domain}/` (e.g., `Todo/TodoController.php`)
- The controller is thin: validate input → call service → return response
- Use a Form Request class for validation (`app/Http/Requests/{Domain}/`)
- Use a shared API response helper/trait if one exists; create one if this is the first endpoint

### Step 4 — Service layer
- Place business logic in `app/Services/{Domain}/` (e.g., `Todo/TodoService.php`)
- The service is framework-agnostic: no Request objects, no Response objects inside it
- If multiple endpoints share logic, extract it into the service rather than duplicating in controllers

### Step 5 — Verify coverage
- Run the tests: `php artisan test --filter=<TestClass>`
- Every assertion in every test must pass
- If a test reveals a missing edge case, add it to the test **and** fix the implementation

## Commit rules
- Commit after **each step** — one commit per step, not one big commit at the end
- Commit message format: concise imperative sentence describing that step (e.g. `Add feature tests for GET /todos`)
- Never batch multiple steps into a single commit

## Anti-patterns to avoid
- No business logic in controllers
- No duplicated validation rules — use Form Requests
- No raw `response()->json()` scattered everywhere — use a shared response helper
- No fat models — models are for relationships and scopes only

## Todo Domain — Canonical Structure

When working on anything in the `Todo` domain, respect this structure:

### Database (`todos` table)
| Column | Type | Notes |
|---|---|---|
| `id` | integer | auto-increment PK |
| `content` | string | required, the task text |
| `status` | boolean | default `false` (active/incomplete); `true` = completed |
| `created_at` / `updated_at` | timestamps | standard Laravel timestamps |

### Rules
- `status` defaults to `false` on creation — never require it from the client
- `GET /todos` returns results **newest first** (`ORDER BY created_at DESC`)
- `GET /todos` accepts an optional `?filter=` query param: `all` (default), `active` (status=false), `completed` (status=true) — filtering happens on the backend
- Routes are **public** (no auth middleware) unless explicitly requested
- Response format: plain array `[]` or plain object `{}` — only wrap in `{ "data": ... }` when extra metadata (pagination, counts, etc.) must be returned alongside

### Domain file locations
- Model: `app/Models/Todo.php`
- Controller: `app/Http/Controllers/Todo/TodoController.php`
- Form Requests: `app/Http/Requests/Todo/`
- Service: `app/Services/Todo/TodoService.php`
- Tests: `tests/Feature/Todo/`

## $ARGUMENTS
The endpoint or feature to implement: **$ARGUMENTS**
