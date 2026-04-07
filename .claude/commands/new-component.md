# New Frontend Component

Use this skill whenever creating a new Nuxt component, page, composable, or feature on the client side.

## Workflow

Follow these steps **in order**. Do not skip or reorder them.

---

### Step 0 — Analyze & Ask (MANDATORY before any code)
- Read the README.md client-side section to confirm all requirements and context
- Identify what state, props, events, and API interactions are involved
- Check existing components, composables, and utils for anything reusable — do not duplicate
- **Ask the user any clarifying questions before proceeding** — ambiguity must be resolved here

---

### Step 1 — Write tests first (TDD)
- Create a test file under `tests/` using Vitest + `@vue/test-utils`
- Cover: render, user interactions, edge cases, and any fetch/API logic
- Comment each test explaining **why** that case matters
- Include edge cases: empty state, loading state, error state, boundary inputs
- Do **not** implement logic yet — tests should fail at this point
- Commit: `Add tests for <ComponentName>`

---

### Step 2 — Nuxt server proxy route
- Create the appropriate server route under `server/api/todos/`
- Use the correct filename convention for the HTTP verb:
  - `index.get.ts` → GET
  - `index.post.ts` → POST
  - `[id].put.ts` → PUT
  - `[id].delete.ts` → DELETE
- The proxy forwards to the Laravel backend URL from `useRuntimeConfig().apiBase`
- The browser **never** talks to Laravel directly — all calls go through the Nuxt proxy
- Assess whether the route needs any server-side auth or header injection
- Commit: `Add Nuxt server proxy routes for <feature>`

---

### Step 3 — Domain utils (API client layer)
- Create or update `utils/todos.ts` (or the relevant domain file)
- Expose named functions: `getTodos()`, `createTodo()`, `updateTodo()`, `deleteTodo()`
- All functions use `$fetch` or `useFetch` against the **Nuxt proxy** (`/api/todos`), never against Laravel directly
- No raw fetch calls inside components or the store — always go through these utils
- Commit: `Add todo API utils`

---

### Step 4 — Design analysis (MANDATORY)
- Open and study the images in the `/design` folder that match the feature being built
- Match the design exactly: layout, spacing, colors, typography, interactions
- Use **Tailwind CSS** for styling
- Font: Josefin Sans (from Google Fonts) — weights 400 and 700
- Colors are defined in `style-guide.md` — use them as Tailwind config values or CSS variables
- Support both **light** and **dark** themes
- Responsive: mobile (375px) and desktop (1440px)
- Commit: `Add <ComponentName> component with design`

---

### Step 5 — Vuex store
- State lives in the Vuex store (`store/todos.ts`) — never in local component state for shared data
- Define: `state`, `mutations`, `actions`, `getters`
- Actions call the domain utils (Step 3), then commit mutations
- Getters derive filtered lists (all, active, completed) from state
- Commit: `Add Vuex store for <feature>`

---

### Step 6 — Component implementation
- Place components under `components/` following the agreed structure
- Components are thin: they read from the store, dispatch actions, render the design
- No direct API calls inside components — always dispatch to the store
- No business logic inside components — that belongs in utils or the store
- Commit: `Implement <ComponentName>`

---

### Step 7 — Verify all tests pass
- Run: `npm run test`
- Every test must pass — 100%, no exceptions
- If a test reveals a missing edge case, add it to the test file AND fix the implementation
- Commit only after green: `Fix <issue> — all tests passing`

---

## Architecture reference

```
frontend/
├── server/
│   └── api/
│       └── todos/
│           ├── index.get.ts       ← GET  /api/todos  →  Laravel
│           ├── index.post.ts      ← POST /api/todos  →  Laravel
│           ├── [id].put.ts        ← PUT  /api/todos/{id}  →  Laravel
│           └── [id].delete.ts     ← DELETE /api/todos/{id}  →  Laravel
├── pages/
│   └── index.vue                  ← Home page (composes components)
├── components/
│   ├── TodoList.vue               ← Renders the list
│   ├── TodoItem.vue               ← Single todo row (toggle + delete)
│   ├── TodoForm.vue               ← Add new task input
│   └── TodoFilter.vue             ← All / Active / Completed tabs
├── store/
│   └── todos.ts                   ← Vuex store
├── composables/
│   └── useTodos.ts                ← Calls Nuxt proxy, used by store actions
├── utils/
│   └── todos.ts                   ← Domain API functions (getTodos, createTodo…)
└── tests/
    └── *.spec.ts                  ← Vitest + @vue/test-utils
```

## API proxy flow

```
Component
  → dispatch Vuex action
    → utils/todos.ts ($fetch → /api/todos on Nuxt server)
      → server/api/todos/*.ts (Nuxt proxy)
        → Laravel API (http://127.0.0.1:8000/api/todos)
```

## Todo Domain — Canonical structure

| Field | Type | Notes |
|---|---|---|
| `id` | number | PK from Laravel |
| `content` | string | Task text, max 255 chars |
| `status` | boolean | `false` = active · `true` = completed |
| `created_at` | string | ISO timestamp |
| `updated_at` | string | ISO timestamp |

## Design rules
- Always inspect `/design` folder images before writing any markup
- Use `style-guide.md` for exact color values
- Use Tailwind CSS — no inline styles, no separate CSS files unless necessary
- Josefin Sans font, 400 and 700 weights
- Light and dark theme support
- Mobile-first, responsive at 375px and 1440px

## Commit rules
- One commit per step — never batch multiple steps
- Commit message: concise imperative sentence (e.g. `Add Vitest tests for TodoItem`)
- Never sign commits as Claude Code

## Anti-patterns to avoid
- No raw `fetch()` or `axios` in components or store
- No API URLs hardcoded — always use `useRuntimeConfig().public.apiBase`
- No business logic in components
- No shared state in local `ref()` — use the Vuex store
- No duplicated fetch logic — extend `utils/todos.ts`, don't copy it

## $ARGUMENTS
The component or feature to implement: **$ARGUMENTS**
