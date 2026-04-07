import { createStore } from 'vuex'
import { todosModule } from './todos'

export const store = createStore({
  modules: {
    todos: todosModule,
  },
})
