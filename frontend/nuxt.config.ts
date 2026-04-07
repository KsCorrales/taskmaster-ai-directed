// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  runtimeConfig: {
    // Server-only: Laravel backend base URL — never exposed to browser
    apiBase: process.env.API_BASE || 'http://127.0.0.1:8000/api',
    public: {
      // Nothing from the backend URL should leak to the client
    },
  },
})
