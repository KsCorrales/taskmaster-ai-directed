import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStore } from 'vuex'
import { todosModule, type TodoState } from '~/store/todos'

// Must be at top level — vi.mock is hoisted by Vitest before any imports
vi.mock('~/utils/todos', () => ({
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeTodo = (overrides = {}) => ({
  id: 1,
  content: 'Test todo',
  status: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeStore = () => createStore({ modules: { todos: todosModule } })

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

describe('Vuex todos store — state', () => {
  it('starts with empty list, no filter, not loading, no error', () => {
    const store = makeStore()
    expect(store.state.todos.items).toEqual([])
    expect(store.state.todos.filter).toBe('all')
    expect(store.state.todos.loading).toBe(false)
    expect(store.state.todos.error).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

describe('Vuex todos store — mutations', () => {
  it('SET_TODOS replaces the entire list', () => {
    const store = makeStore()
    const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })]
    store.commit('todos/SET_TODOS', todos)
    expect(store.state.todos.items).toEqual(todos)
  })

  it('ADD_TODO prepends the new todo so newest appears first', () => {
    const store = makeStore()
    const first = makeTodo({ id: 1, content: 'First' })
    const second = makeTodo({ id: 2, content: 'Second' })
    store.commit('todos/ADD_TODO', first)
    store.commit('todos/ADD_TODO', second)
    // Newest (second) should be at index 0
    expect(store.state.todos.items[0].id).toBe(2)
  })

  it('UPDATE_TODO replaces the matching item in place', () => {
    const store = makeStore()
    const original = makeTodo({ id: 1, content: 'Old', status: false })
    store.commit('todos/SET_TODOS', [original])
    store.commit('todos/UPDATE_TODO', { ...original, status: true })
    expect(store.state.todos.items[0].status).toBe(true)
  })

  /**
   * Edge case: updating a non-existent ID should not crash or
   * add a phantom item to the list.
   */
  it('UPDATE_TODO with unknown id does not modify the list', () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [makeTodo({ id: 1 })])
    store.commit('todos/UPDATE_TODO', makeTodo({ id: 999, content: 'Ghost' }))
    expect(store.state.todos.items).toHaveLength(1)
    expect(store.state.todos.items[0].id).toBe(1)
  })

  it('REMOVE_TODO removes the item with the matching id', () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [makeTodo({ id: 1 }), makeTodo({ id: 2 })])
    store.commit('todos/REMOVE_TODO', 1)
    expect(store.state.todos.items).toHaveLength(1)
    expect(store.state.todos.items[0].id).toBe(2)
  })

  /**
   * Edge case: removing a non-existent ID should be a safe no-op.
   */
  it('REMOVE_TODO with unknown id is a no-op', () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [makeTodo({ id: 1 })])
    store.commit('todos/REMOVE_TODO', 999)
    expect(store.state.todos.items).toHaveLength(1)
  })

  it('SET_FILTER updates the active filter', () => {
    const store = makeStore()
    store.commit('todos/SET_FILTER', 'active')
    expect(store.state.todos.filter).toBe('active')
  })

  it('SET_LOADING sets the loading flag', () => {
    const store = makeStore()
    store.commit('todos/SET_LOADING', true)
    expect(store.state.todos.loading).toBe(true)
  })

  it('SET_ERROR stores an error message', () => {
    const store = makeStore()
    store.commit('todos/SET_ERROR', 'Something went wrong')
    expect(store.state.todos.error).toBe('Something went wrong')
    store.commit('todos/SET_ERROR', null)
    expect(store.state.todos.error).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Getters
// ---------------------------------------------------------------------------

describe('Vuex todos store — getters', () => {
  const setup = () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [
      makeTodo({ id: 1, status: false }),
      makeTodo({ id: 2, status: true }),
      makeTodo({ id: 3, status: false }),
    ])
    return store
  }

  it('filteredTodos returns all items when filter is "all"', () => {
    const store = setup()
    store.commit('todos/SET_FILTER', 'all')
    expect(store.getters['todos/filteredTodos']).toHaveLength(3)
  })

  it('filteredTodos returns only active items when filter is "active"', () => {
    const store = setup()
    store.commit('todos/SET_FILTER', 'active')
    const result = store.getters['todos/filteredTodos']
    expect(result).toHaveLength(2)
    expect(result.every((t: any) => t.status === false)).toBe(true)
  })

  it('filteredTodos returns only completed items when filter is "completed"', () => {
    const store = setup()
    store.commit('todos/SET_FILTER', 'completed')
    const result = store.getters['todos/filteredTodos']
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe(true)
  })

  /**
   * Edge case: activeCount must exclude completed items — used in "X items left" display.
   */
  it('activeCount returns the number of incomplete todos', () => {
    const store = setup()
    expect(store.getters['todos/activeCount']).toBe(2)
  })

  it('activeCount is 0 when all todos are completed', () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [
      makeTodo({ id: 1, status: true }),
      makeTodo({ id: 2, status: true }),
    ])
    expect(store.getters['todos/activeCount']).toBe(0)
  })

  it('hasCompleted is true when at least one todo is completed', () => {
    const store = setup()
    expect(store.getters['todos/hasCompleted']).toBe(true)
  })

  it('hasCompleted is false when no todos are completed', () => {
    const store = makeStore()
    store.commit('todos/SET_TODOS', [makeTodo({ status: false })])
    expect(store.getters['todos/hasCompleted']).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

describe('Vuex todos store — actions', () => {

  beforeEach(() => { vi.clearAllMocks() })

  it('fetchTodos commits SET_TODOS on success', async () => {
    const { getTodos } = await import('~/utils/todos')
    const todos = [makeTodo()]
    vi.mocked(getTodos).mockResolvedValue(todos)

    const store = makeStore()
    await store.dispatch('todos/fetchTodos')

    expect(store.state.todos.items).toEqual(todos)
    expect(store.state.todos.loading).toBe(false)
    expect(store.state.todos.error).toBeNull()
  })

  /**
   * Edge case: if the API call fails, loading must be reset to false
   * and the error must be stored — never leave the UI in a forever-loading state.
   */
  it('fetchTodos commits SET_ERROR and clears loading on failure', async () => {
    const { getTodos } = await import('~/utils/todos')
    vi.mocked(getTodos).mockRejectedValue(new Error('Network error'))

    const store = makeStore()
    await store.dispatch('todos/fetchTodos')

    expect(store.state.todos.loading).toBe(false)
    expect(store.state.todos.error).toBe('Network error')
  })

  it('addTodo commits ADD_TODO on success', async () => {
    const { createTodo } = await import('~/utils/todos')
    const newTodo = makeTodo({ id: 99, content: 'New task' })
    vi.mocked(createTodo).mockResolvedValue(newTodo)

    const store = makeStore()
    await store.dispatch('todos/addTodo', 'New task')

    expect(store.state.todos.items[0]).toEqual(newTodo)
  })

  it('toggleTodo commits UPDATE_TODO with flipped status', async () => {
    const { updateTodo } = await import('~/utils/todos')
    const todo = makeTodo({ id: 1, status: false })
    vi.mocked(updateTodo).mockResolvedValue({ ...todo, status: true })

    const store = makeStore()
    store.commit('todos/SET_TODOS', [todo])
    await store.dispatch('todos/toggleTodo', todo)

    expect(store.state.todos.items[0].status).toBe(true)
  })

  it('removeTodo commits REMOVE_TODO on success', async () => {
    const { deleteTodo } = await import('~/utils/todos')
    vi.mocked(deleteTodo).mockResolvedValue(undefined)

    const store = makeStore()
    store.commit('todos/SET_TODOS', [makeTodo({ id: 1 })])
    await store.dispatch('todos/removeTodo', 1)

    expect(store.state.todos.items).toHaveLength(0)
  })

  /**
   * setFilter commits the new filter then re-fetches from the backend
   * so the displayed list reflects the backend filter result.
   */
  it('setFilter commits SET_FILTER and re-fetches todos', async () => {
    const { getTodos } = await import('~/utils/todos')
    const filtered = [makeTodo({ id: 5, status: false })]
    vi.mocked(getTodos).mockResolvedValue(filtered)

    const store = makeStore()
    await store.dispatch('todos/setFilter', 'active')

    expect(store.state.todos.filter).toBe('active')
    expect(store.state.todos.items).toEqual(filtered)
  })

  /**
   * Edge case: clearCompleted must remove all completed todos in one operation
   * without needing individual DELETE calls — it dispatches removeTodo per item.
   */
  it('clearCompleted removes all completed todos', async () => {
    const { deleteTodo } = await import('~/utils/todos')
    vi.mocked(deleteTodo).mockResolvedValue(undefined)

    const store = makeStore()
    store.commit('todos/SET_TODOS', [
      makeTodo({ id: 1, status: true }),
      makeTodo({ id: 2, status: false }),
      makeTodo({ id: 3, status: true }),
    ])
    await store.dispatch('todos/clearCompleted')

    expect(store.state.todos.items).toHaveLength(1)
    expect(store.state.todos.items[0].id).toBe(2)
  })
})
