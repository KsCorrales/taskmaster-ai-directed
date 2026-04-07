import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import TodoForm from '~/components/TodoForm.vue'

// The component dispatches to the `todos` namespace, so the store needs
// a namespaced todos module. We spy on dispatch after creation.
const makeStore = () => {
  const store = createStore({
    modules: {
      todos: {
        namespaced: true,
        state: () => ({}),
        actions: { addTodo: () => {} },
      },
    },
  })
  vi.spyOn(store, 'dispatch')
  return store
}

describe('TodoForm', () => {
  /**
   * The input must always be visible — it's the primary way to add todos.
   */
  it('renders an input with the correct placeholder', () => {
    const store = makeStore()
    const wrapper = mount(TodoForm, { global: { plugins: [store] } })
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toContain('Create a new todo')
  })

  /**
   * Submitting a non-empty value must dispatch addTodo and clear the input.
   */
  it('dispatches addTodo and clears input on Enter', async () => {
    const store = makeStore()
    const wrapper = mount(TodoForm, { global: { plugins: [store] } })
    const input = wrapper.find('input')

    await input.setValue('Buy milk')
    await input.trigger('keyup.enter')

    expect(store.dispatch).toHaveBeenCalledWith('todos/addTodo', 'Buy milk')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  /**
   * Edge case: pressing Enter on an empty or whitespace-only input must NOT
   * dispatch — we don't want blank todos created.
   */
  it('does not dispatch when input is empty', async () => {
    const store = makeStore()
    const wrapper = mount(TodoForm, { global: { plugins: [store] } })
    await wrapper.find('input').trigger('keyup.enter')
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  it('does not dispatch when input is only whitespace', async () => {
    const store = makeStore()
    const wrapper = mount(TodoForm, { global: { plugins: [store] } })
    await wrapper.find('input').setValue('   ')
    await wrapper.find('input').trigger('keyup.enter')
    expect(store.dispatch).not.toHaveBeenCalled()
  })

  /**
   * Edge case: the input value must be trimmed before dispatch
   * so "  Buy milk  " becomes "Buy milk".
   */
  it('trims whitespace from the input before dispatching', async () => {
    const store = makeStore()
    const wrapper = mount(TodoForm, { global: { plugins: [store] } })
    await wrapper.find('input').setValue('  Buy milk  ')
    await wrapper.find('input').trigger('keyup.enter')
    expect(store.dispatch).toHaveBeenCalledWith('todos/addTodo', 'Buy milk')
  })
})
