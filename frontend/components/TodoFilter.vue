<template>
  <div class="flex items-center gap-4">
    <button
      v-for="option in filters"
      :key="option.value"
      :data-filter="option.value"
      :data-active="currentFilter === option.value"
      class="font-sans font-bold text-sm transition-colors"
      :class="currentFilter === option.value
        ? 'text-primary'
        : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text-hover'"
      @click="setFilter(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const filters = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

const currentFilter = computed(() => store.state.todos.filter)

const setFilter = (value: string) => {
  store.commit('todos/SET_FILTER', value)
}
</script>
