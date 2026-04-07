import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import TodoList from '~/components/TodoList.vue'

const makeTodo = (overrides = {}) => ({
  id: 1,
  content: 'Test todo',
  status: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeStore = ({
  items = [],
  filter = 'all',
  loading = false,
  error = null,
  activeCount = 0,
  hasCompleted = false,
  filteredTodos = items,
  dispatch = vi.fn(),
} = {}) =>
  createStore({
    modules: {
      todos: {
        namespaced: true,
        state: () => ({ items, filter, loading, error }),
        getters: {
          filteredTodos: () => filteredTodos,
          activeCount: () => activeCount,
          hasCompleted: () => hasCompleted,
        },
        actions: { clearCompleted: dispatch },
        mutations: { SET_FILTER: vi.fn() },
      },
    },
    dispatch,
  })

describe('TodoList', () => {
  /**
   * When there are no todos, the list must render an empty state message
   * rather than a blank space — the user should understand the list is empty.
   */
  it('shows empty state when there are no filtered todos', () => {
    const store = makeStore({ filteredTodos: [] })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  /**
   * Each todo in the filtered list must render as a TodoItem.
   */
  it('renders a TodoItem for each filtered todo', () => {
    const todos = [makeTodo({ id: 1 }), makeTodo({ id: 2 })]
    const store = makeStore({ filteredTodos: todos, activeCount: 2 })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.findAll('[data-testid="todo-item"]')).toHaveLength(2)
  })

  /**
   * The "X items left" counter must reflect the activeCount getter — not the
   * total list length, so completed items are excluded.
   */
  it('shows the correct active item count', () => {
    const store = makeStore({
      filteredTodos: [makeTodo({ status: false })],
      activeCount: 1,
    })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.text()).toContain('1 item')
  })

  /**
   * Edge case: "1 item left" vs "2 items left" — singular vs plural matters.
   */
  it('uses singular "item" when count is 1', () => {
    const store = makeStore({ filteredTodos: [], activeCount: 1 })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.text()).toMatch(/1 item left/)
  })

  it('uses plural "items" when count is not 1', () => {
    const store = makeStore({ filteredTodos: [], activeCount: 3 })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.text()).toMatch(/3 items left/)
  })

  /**
   * "Clear Completed" must only appear when there are completed todos —
   * showing it when there's nothing to clear would be confusing.
   */
  it('shows Clear Completed button only when hasCompleted is true', () => {
    const store = makeStore({ hasCompleted: true })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.find('[data-testid="clear-completed"]').exists()).toBe(true)
  })

  it('hides Clear Completed button when hasCompleted is false', () => {
    const store = makeStore({ hasCompleted: false })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.find('[data-testid="clear-completed"]').exists()).toBe(false)
  })

  /**
   * Clicking Clear Completed must dispatch the clearCompleted action.
   */
  it('dispatches clearCompleted when button is clicked', async () => {
    const dispatch = vi.fn()
    const store = makeStore({ hasCompleted: true, dispatch })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    await wrapper.find('[data-testid="clear-completed"]').trigger('click')
    expect(dispatch).toHaveBeenCalled()
  })

  /**
   * Loading state: while todos are being fetched, show a loading indicator.
   */
  it('shows loading indicator while loading is true', () => {
    const store = makeStore({ loading: true })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.find('[data-testid="loading"]').exists()).toBe(true)
  })

  /**
   * Error state: if fetchTodos failed, display the error so the user knows.
   */
  it('shows error message when error is set', () => {
    const store = makeStore({ error: 'Failed to load' })
    const wrapper = mount(TodoList, { global: { plugins: [store] } })
    expect(wrapper.find('[data-testid="error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Failed to load')
  })
})
