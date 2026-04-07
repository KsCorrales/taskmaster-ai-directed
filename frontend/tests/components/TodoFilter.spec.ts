import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import TodoFilter from '~/components/TodoFilter.vue'

const makeStore = (filter = 'all', dispatch = vi.fn()) =>
  createStore({
    modules: {
      todos: {
        namespaced: true,
        state: () => ({ filter }),
        mutations: { SET_FILTER: (state: any, f: string) => { state.filter = f } },
        actions: {},
        getters: {},
      },
    },
    dispatch,
  })

describe('TodoFilter', () => {
  /**
   * All three filter options must always be rendered.
   */
  it('renders All, Active and Completed buttons', () => {
    const wrapper = mount(TodoFilter, { global: { plugins: [makeStore()] } })
    const text = wrapper.text()
    expect(text).toContain('All')
    expect(text).toContain('Active')
    expect(text).toContain('Completed')
  })

  /**
   * The currently active filter must be visually marked so the user knows
   * which filter is applied. We use data-active="true" as the indicator.
   */
  it('marks the active filter button with data-active', () => {
    const wrapper = mount(TodoFilter, { global: { plugins: [makeStore('active')] } })
    const activeBtn = wrapper.find('[data-active="true"]')
    expect(activeBtn.exists()).toBe(true)
    expect(activeBtn.text()).toBe('Active')
  })

  it('marks All as active by default', () => {
    const wrapper = mount(TodoFilter, { global: { plugins: [makeStore('all')] } })
    expect(wrapper.find('[data-active="true"]').text()).toBe('All')
  })

  /**
   * Clicking a filter must commit SET_FILTER with the correct value.
   */
  it('commits SET_FILTER with "active" when Active is clicked', async () => {
    const store = makeStore('all')
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = mount(TodoFilter, { global: { plugins: [store] } })

    await wrapper.find('[data-filter="active"]').trigger('click')

    expect(commitSpy).toHaveBeenCalledWith('todos/SET_FILTER', 'active')
  })

  it('commits SET_FILTER with "completed" when Completed is clicked', async () => {
    const store = makeStore('all')
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = mount(TodoFilter, { global: { plugins: [store] } })

    await wrapper.find('[data-filter="completed"]').trigger('click')

    expect(commitSpy).toHaveBeenCalledWith('todos/SET_FILTER', 'completed')
  })

  it('commits SET_FILTER with "all" when All is clicked', async () => {
    const store = makeStore('active')
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = mount(TodoFilter, { global: { plugins: [store] } })

    await wrapper.find('[data-filter="all"]').trigger('click')

    expect(commitSpy).toHaveBeenCalledWith('todos/SET_FILTER', 'all')
  })

  /**
   * Edge case: clicking the already-active filter must still commit
   * (no-op on state but the click handler must not be swallowed).
   */
  it('still commits when clicking the already-active filter', async () => {
    const store = makeStore('all')
    const commitSpy = vi.spyOn(store, 'commit')
    const wrapper = mount(TodoFilter, { global: { plugins: [store] } })

    await wrapper.find('[data-filter="all"]').trigger('click')

    expect(commitSpy).toHaveBeenCalledWith('todos/SET_FILTER', 'all')
  })
})
