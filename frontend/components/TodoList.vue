<template>
  <div>
    <!-- Loading -->
    <div
      v-if="loading"
      data-testid="loading"
      class="rounded-t-md bg-white dark:bg-dark-card px-5 py-6 text-center text-light-muted dark:text-dark-muted shadow-md"
    >
      Loading...
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      data-testid="error"
      class="rounded-t-md bg-white dark:bg-dark-card px-5 py-6 text-center text-red-400 shadow-md"
    >
      {{ error }}
    </div>

    <!-- List -->
    <template v-else>
      <div class="rounded-t-md shadow-md overflow-hidden">
        <!-- Empty state -->
        <div
          v-if="filteredTodos.length === 0"
          data-testid="empty-state"
          class="bg-white dark:bg-dark-card px-5 py-6 text-center text-light-muted dark:text-dark-muted"
        >
          No todos here!
        </div>

        <!-- Todo items -->
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo="todo"
          data-testid="todo-item"
        />
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between px-5 py-4 bg-white dark:bg-dark-card rounded-b-md shadow-md text-sm text-light-muted dark:text-dark-muted">
        <!-- Item count -->
        <span>{{ activeCount }} {{ activeCount === 1 ? 'item' : 'items' }} left</span>

        <!-- Filters — desktop only (mobile gets its own card) -->
        <div class="hidden md:block">
          <TodoFilter />
        </div>

        <!-- Clear completed -->
        <button
          v-if="hasCompleted"
          data-testid="clear-completed"
          class="hover:text-light-text dark:hover:text-dark-text-hover transition-colors"
          @click="clearCompleted"
        >
          Clear Completed
        </button>
        <!-- Spacer when no completed todos -->
        <span v-else class="invisible">Clear Completed</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const loading = computed(() => store.state.todos.loading)
const error = computed(() => store.state.todos.error)
const filteredTodos = computed(() => store.getters['todos/filteredTodos'])
const activeCount = computed(() => store.getters['todos/activeCount'])
const hasCompleted = computed(() => store.getters['todos/hasCompleted'])

const clearCompleted = () => store.dispatch('todos/clearCompleted')
</script>
