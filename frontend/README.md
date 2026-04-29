# TaskMaster — Frontend

A **Nuxt 3** todo application that consumes the Laravel backend API through a built-in server proxy layer. Supports light/dark themes, responsive layout, and full CRUD with real-time filtering.

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

> **Prerequisite:** The Laravel backend must be running at `http://127.0.0.1:8000` before starting the frontend. See `backend/README.md` for setup instructions.

---

## Architecture

The frontend uses a strict separation of concerns across four layers.

```
pages/
  index.vue               ← Entry point: composes components, triggers initial fetch

components/
  TodoForm.vue            ← Input field to create a new task
  TodoItem.vue            ← Single task row: toggle, delete, completed styling
  TodoList.vue            ← Renders filtered list, footer (count, clear completed)
  TodoFilter.vue          ← All / Active / Completed tab switcher

store/
  todos.ts                ← Vuex module: state, mutations, getters, actions
  index.ts                ← Store root (registers todos module)

utils/
  todos.ts                ← Domain API functions: getTodos, createTodo, updateTodo, deleteTodo

server/api/todos/
  index.get.ts            ← Proxies GET  /api/todos  → Laravel
  index.post.ts           ← Proxies POST /api/todos  → Laravel
  [id].put.ts             ← Proxies PUT  /api/todos/{id}  → Laravel
  [id].delete.ts          ← Proxies DELETE /api/todos/{id}  → Laravel

plugins/
  vuex.ts                 ← Registers Vuex store with the Nuxt app
```

---

## Request → Response Flow

The browser **never talks to Laravel directly**. Every API call goes through the Nuxt Nitro server proxy.

```
┌──────────────────────────────────────────────────────────────────┐
│                        User Interaction                          │
│          e.g. user types a task and presses Enter                │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Vue Component (thin)                           │
│                     components/TodoForm                          │
│                                                                  │
│  · Reads local input state                                       │
│  · Dispatches Vuex action: store.dispatch('todos/addTodo')       │
│  · No API calls — no business logic                              │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Vuex Store — Action                            │
│                      store/todos.ts                              │
│                                                                  │
│  · Receives the action payload (e.g. task content)               │
│  · Calls the domain util function                                │
│  · On success: commits mutation to update state                  │
│  · On error: commits SET_ERROR, resets SET_LOADING               │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Domain Utils (API client)                      │
│                      utils/todos.ts                              │
│                                                                  │
│  · Named functions: getTodos(), createTodo(), updateTodo()…      │
│  · Uses $fetch against the Nuxt proxy (/api/todos)               │
│  · Never references the Laravel URL                              │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│               Nuxt Server Proxy (Nitro)                          │
│                  server/api/todos/                               │
│                                                                  │
│  · Receives the request from the browser                         │
│  · Reads the Laravel base URL from server-side runtimeConfig     │
│  · Forwards the request to Laravel with $fetch                   │
│  · The backend URL never appears in client-side code             │
└─────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
                   ┌──────────────────────┐
                   │   Laravel Backend     │
                   │  127.0.0.1:8000/api  │
                   └──────────────────────┘
```

### Return path

```
Laravel response
  → Nuxt proxy returns JSON to the browser
  → $fetch in utils/todos.ts resolves
  → Vuex action commits mutation (ADD_TODO, UPDATE_TODO, etc.)
  → Vuex getters recompute (filteredTodos, activeCount, hasCompleted)
  → Vue reactivity re-renders affected components
```

---

## State Management (Vuex)

> **Note on the choice of Vuex.** For a new Nuxt 3 / Vue 3 project today I would recommend **Pinia**: it is the officially recommended store for Vue 3, has a smaller and simpler API (no mutations boilerplate), better TypeScript inference out of the box, first-class Nuxt integration, and an actively maintained DevTools experience. Vuex is in maintenance mode. **Vuex was used here because the assessment explicitly required it** — outside of that constraint, Pinia would be the default pick.

```
state
  items: Todo[]         — full list from the API, newest first
  filter: string        — 'all' | 'active' | 'completed'
  loading: boolean      — true while fetchTodos is in flight
  error: string | null  — set when any action fails

getters
  filteredTodos         — items filtered by current filter value
  activeCount           — count of items where status = false
  hasCompleted          — true if any item has status = true

mutations (synchronous)
  SET_TODOS             — replaces the full list
  ADD_TODO              — prepends a new todo (newest first)
  UPDATE_TODO           — replaces the matching item in place
  REMOVE_TODO           — filters out the item by id
  SET_FILTER            — updates the active filter
  SET_LOADING           — sets the loading flag
  SET_ERROR             — stores or clears the error message

actions (async, call utils then commit mutations)
  fetchTodos            — load all todos from the API
  addTodo(content)      — create and prepend a new todo
  toggleTodo(todo)      — flip status, update in place
  removeTodo(id)        — delete and remove from list
  clearCompleted        — delete all completed todos in parallel
```

---

## Environment

| Variable | Description | Default |
|---|---|---|
| `API_BASE` | Laravel backend URL (server-side only) | `http://127.0.0.1:8000/api` |

---

## Design

Matches the provided design mockups from the `/design` folder.

- **Font:** Josefin Sans (400, 700) via Google Fonts
- **Themes:** Light and dark — toggle with the moon/sun icon in the header
- **Responsive:** Mobile (375px) and desktop (1440px)
- **Styling:** Tailwind CSS with custom color tokens from `style-guide.md`
- **Background:** Hero image switches between `bg-desktop-light.jpg` and `bg-desktop-dark.jpg`

---

## Features

| Feature | Implementation |
|---|---|
| Add task | `TodoForm` → Enter key → `addTodo` action |
| Mark completed | `TodoItem` toggle button → `toggleTodo` action |
| Delete task | `TodoItem` × button → `removeTodo` action |
| Filter tasks | `TodoFilter` tabs → `setFilter` action → backend re-fetch → `filteredTodos` getter |
| Clear completed | Footer button → `clearCompleted` action |
| Items left count | `activeCount` getter |
| Light/dark toggle | `isDark` ref on `index.vue` → adds/removes `dark` class on `<html>` |

---

## Testing

```bash
# Run all tests once
npm test

# Run in watch mode
npm run test:watch
```

**62 tests — all passing.**

| Suite | File | Cases |
|---|---|---|
| Store mutations | `tests/store/todos.spec.ts` | SET_TODOS, ADD_TODO, UPDATE_TODO, REMOVE_TODO, SET_FILTER, SET_LOADING, SET_ERROR + edge cases |
| Store getters | `tests/store/todos.spec.ts` | filteredTodos (all/active/completed), activeCount (0 and N), hasCompleted |
| Store actions | `tests/store/todos.spec.ts` | fetchTodos success/error, addTodo, toggleTodo, removeTodo, clearCompleted, setFilter |
| Utils | `tests/utils/todos.spec.ts` | getTodos (filter param, no param, error), createTodo, updateTodo, deleteTodo |
| TodoForm | `tests/components/TodoForm.spec.ts` | Render, dispatch on Enter, empty guard, whitespace guard, trim |
| TodoItem | `tests/components/TodoItem.spec.ts` | Render, completed styling, toggle dispatch, delete dispatch, double-click |
| TodoList | `tests/components/TodoList.spec.ts` | Empty state, item count, singular/plural, clear completed visibility, loading, error |
| TodoFilter | `tests/components/TodoFilter.spec.ts` | Render all options, active marker, all three setFilter dispatches, re-click active |
