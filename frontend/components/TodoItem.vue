<template>
  <div
    class="group flex items-center gap-4 px-5 py-4 border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-card last:border-b-0"
  >
    <!-- Toggle checkbox -->
    <button
      data-testid="toggle"
      class="w-6 h-6 rounded-full border-2 border-light-border dark:border-dark-border flex-shrink-0 flex items-center justify-center transition-colors"
      :class="todo.status ? 'bg-gradient-to-br from-[hsl(192,100%,67%)] to-[hsl(280,87%,65%)] border-transparent' : 'hover:border-primary'"
      :aria-label="todo.status ? 'Mark as active' : 'Mark as completed'"
      @click="toggle"
    >
      <img v-if="todo.status" src="/icon-check.svg" alt="" class="w-3 h-3" />
    </button>

    <!-- Content -->
    <span
      :data-completed="todo.status"
      class="flex-1 text-[18px] font-sans transition-colors"
      :class="todo.status
        ? 'line-through text-light-placeholder dark:text-dark-muted'
        : 'text-light-text dark:text-dark-text'"
    >
      {{ todo.content }}
    </span>

    <!-- Delete button: always visible on mobile, hover-only on desktop -->
    <button
      data-testid="delete"
      class="flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      aria-label="Delete todo"
      @click="remove"
    >
      <img src="/icon-cross.svg" alt="" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex'
import type { Todo } from '~/utils/todos'

const props = defineProps<{ todo: Todo }>()
const store = useStore()

const toggle = () => store.dispatch('todos/toggleTodo', props.todo)
const remove = () => store.dispatch('todos/removeTodo', props.todo.id)
</script>
