<template>
  <main class="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors">
    <!-- Hero background -->
    <div
      class="w-full h-[200px] md:h-[300px] bg-cover bg-center"
      :style="{ backgroundImage: `url(${heroBg})` }"
    />

    <!-- Content container — overlaps the hero -->
    <div class="max-w-[540px] mx-auto px-6 -mt-[130px] md:-mt-[185px] pb-16">

      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl md:text-4xl font-bold tracking-[0.4em] text-white uppercase">
          Todo
        </h1>
        <button
          class="text-white"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <img :src="isDark ? '/icon-sun.svg' : '/icon-moon.svg'" :alt="isDark ? 'Sun' : 'Moon'" class="w-6 h-6" />
        </button>
      </div>

      <!-- New todo input -->
      <TodoForm class="mb-4" />

      <!-- List -->
      <TodoList />

      <!-- Mobile-only filter card -->
      <div class="md:hidden mt-4 bg-white dark:bg-dark-card rounded-md shadow-md px-5 py-4 flex justify-center">
        <TodoFilter />
      </div>

    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const heroBg = computed(() =>
  isDark.value ? '/bg-desktop-dark.jpg' : '/bg-desktop-light.jpg'
)

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
onMounted(() => {
  store.dispatch('todos/fetchTodos')
})
</script>
