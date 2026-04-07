import type { Module } from 'vuex'
import type { Todo } from '~/utils/todos'
import { getTodos, createTodo, updateTodo, deleteTodo } from '~/utils/todos'

export interface TodoState {
  items: Todo[]
  filter: 'all' | 'active' | 'completed'
  loading: boolean
  error: string | null
}

export const todosModule: Module<TodoState, any> = {
  namespaced: true,

  state: (): TodoState => ({
    items: [],
    filter: 'all',
    loading: false,
    error: null,
  }),

  mutations: {
    SET_TODOS(state, todos: Todo[]) {
      state.items = todos
    },

    ADD_TODO(state, todo: Todo) {
      // Prepend so the newest item appears first, matching backend order
      state.items.unshift(todo)
    },

    UPDATE_TODO(state, updated: Todo) {
      const index = state.items.findIndex(t => t.id === updated.id)
      if (index !== -1) {
        state.items.splice(index, 1, updated)
      }
    },

    REMOVE_TODO(state, id: number) {
      state.items = state.items.filter(t => t.id !== id)
    },

    SET_FILTER(state, filter: TodoState['filter']) {
      state.filter = filter
    },

    SET_LOADING(state, loading: boolean) {
      state.loading = loading
    },

    SET_ERROR(state, error: string | null) {
      state.error = error
    },
  },

  getters: {
    filteredTodos(state): Todo[] {
      if (state.filter === 'active') return state.items.filter(t => !t.status)
      if (state.filter === 'completed') return state.items.filter(t => t.status)
      return state.items
    },

    activeCount(state): number {
      return state.items.filter(t => !t.status).length
    },

    hasCompleted(state): boolean {
      return state.items.some(t => t.status)
    },
  },

  actions: {
    async fetchTodos({ commit, state }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      try {
        const filter = state.filter !== 'all' ? state.filter : undefined
        const todos = await getTodos(filter)
        commit('SET_TODOS', todos)
      } catch (err: any) {
        commit('SET_ERROR', err?.message ?? 'Failed to load todos')
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async setFilter({ commit, dispatch }, filter: TodoState['filter']) {
      commit('SET_FILTER', filter)
      await dispatch('fetchTodos')
    },

    async addTodo({ commit }, content: string) {
      const todo = await createTodo(content)
      commit('ADD_TODO', todo)
    },

    async toggleTodo({ commit }, todo: Todo) {
      const updated = await updateTodo(todo.id, { status: !todo.status })
      commit('UPDATE_TODO', updated)
    },

    async removeTodo({ commit }, id: number) {
      await deleteTodo(id)
      commit('REMOVE_TODO', id)
    },

    async clearCompleted({ state, dispatch }) {
      const completed = state.items.filter(t => t.status)
      await Promise.all(completed.map(t => dispatch('removeTodo', t.id)))
    },
  },
}
