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

const makeStore = (dispatch = vi.fn()) => createStore({ dispatch })

describe('TodoItem', () => {
  /**
   * The todo content must always be rendered so the user can read their tasks.
   */
  it('renders the todo content', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ content: 'Buy milk' }) },
      global: { plugins: [makeStore()] },
    })
    expect(wrapper.text()).toContain('Buy milk')
  })

  /**
   * Completed todos must be visually distinct — strikethrough text is
   * the standard indicator. We check for the data attribute / class.
   */
  it('applies completed styling when status is true', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ status: true }) },
      global: { plugins: [makeStore()] },
    })
    expect(wrapper.find('[data-completed="true"]').exists()).toBe(true)
  })

  it('does not apply completed styling when status is false', () => {
    const wrapper = mount(TodoItem, {
      props: { todo: makeTodo({ status: false }) },
      global: { plugins: [makeStore()] },
    })
    expect(wrapper.find('[data-completed="true"]').exists()).toBe(false)
  })

  /**
   * Clicking the toggle (checkbox) must dispatch toggleTodo with the full todo.
   */
  it('dispatches toggleTodo when the toggle button is clicked', async () => {
    const dispatch = vi.fn()
    const todo = makeTodo()
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [makeStore(dispatch)] },
    })
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    expect(dispatch).toHaveBeenCalledWith('todos/toggleTodo', todo)
  })

  /**
   * Clicking delete must dispatch removeTodo with the todo's id.
   */
  it('dispatches removeTodo when the delete button is clicked', async () => {
    const dispatch = vi.fn()
    const todo = makeTodo({ id: 42 })
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [makeStore(dispatch)] },
    })
    await wrapper.find('[data-testid="delete"]').trigger('click')
    expect(dispatch).toHaveBeenCalledWith('todos/removeTodo', 42)
  })

  /**
   * Edge case: double-clicking toggle must not dispatch twice simultaneously —
   * each click is an independent toggle action, both should fire.
   */
  it('dispatches toggleTodo on each individual click', async () => {
    const dispatch = vi.fn()
    const todo = makeTodo()
    const wrapper = mount(TodoItem, {
      props: { todo },
      global: { plugins: [makeStore(dispatch)] },
    })
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    await wrapper.find('[data-testid="toggle"]').trigger('click')
    expect(dispatch).toHaveBeenCalledTimes(2)
  })
})
