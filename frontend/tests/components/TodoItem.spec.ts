import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import TodoItem from '~/components/TodoItem.vue'

const makeTodo = (overrides = {}) => ({
  id: 1,
  content: 'Test todo',
  status: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const makeStore = () => {
  const store = createStore({
    modules: {
      todos: {
        namespaced: true,
        state: () => ({}),
        actions: {
          toggleTodo: () => {},
          removeTodo: () => {},
        },
      },
    },
  })
  vi.spyOn(store, 'dispatch')
  return store
}

describe('TodoItem', () => {
  /**
   * The todo content must always be rendered so the user can read their tasks.
   */
  it('renders the todo content', () => {
    const store = makeStore()
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ content: 'Buy milk' }) },
      global: { plugins: [store] },
    })
    expect(wrapper.text()).toContain('Buy milk')
  })

  /**
   * Completed todos must be visually distinct — strikethrough text is
   * the standard indicator. We check for the data attribute.
   */
  it('applies completed styling when status is true', () => {
    const store = makeStore()
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ status: true }) },
      global: { plugins: [store] },
    })
    expect(wrapper.find('[data-completed="true"]').exists()).toBe(true)
  })

  it('does not apply completed styling when status is false', () => {
    const store = makeStore()
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ status: false }) },
      global: { plugins: [store] },
    })
    expect(wrapper.find('[data-completed="true"]').exists()).toBe(false)
  })

  /**
   * Clicking the toggle (checkbox) must dispatch toggleTodo with the full todo.
   */
  it('dispatches toggleTodo when the toggle button is clicked', async () => {
    const store = makeStore()
    const todo = makeTodo()
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [store] },
    })
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    expect(store.dispatch).toHaveBeenCalledWith('todos/toggleTodo', todo)
  })

  /**
   * Clicking delete must dispatch removeTodo with the todo's id.
   */
  it('dispatches removeTodo when the delete button is clicked', async () => {
    const store = makeStore()
    const todo = makeTodo({ id: 42 })
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [store] },
    })
    await wrapper.find('[data-testid="delete"]').trigger('click')
    expect(store.dispatch).toHaveBeenCalledWith('todos/removeTodo', 42)
  })

  /**
   * Edge case: each click is an independent toggle action — both should fire.
   */
  it('dispatches toggleTodo on each individual click', async () => {
    const store = makeStore()
    const todo = makeTodo()
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [store] },
    })
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    expect(store.dispatch).toHaveBeenCalledTimes(2)
  })
})
