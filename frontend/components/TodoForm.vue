<template>
  <div class="flex items-center gap-4 px-5 py-4 rounded-md shadow-md bg-white dark:bg-dark-card">
    <!-- Empty circle indicator -->
    <div class="w-6 h-6 rounded-full border-2 border-light-border dark:border-dark-border flex-shrink-0" />

    <input
      v-model="content"
      type="text"
      placeholder="Create a new todo..."
      class="flex-1 bg-transparent outline-none text-[18px] font-sans text-light-text dark:text-dark-text placeholder-light-placeholder dark:placeholder-dark-placeholder caret-primary"
      @keyup.enter="submit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const content = ref('')

const submit = () => {
  const trimmed = content.value.trim()
  if (!trimmed) return
  store.dispatch('todos/addTodo', trimmed)
  content.value = ''
}
</script>
