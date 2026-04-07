// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  experimental: {
    appManifest: false,
  },

  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;700&display=swap',
        },
        { rel: 'icon', type: 'image/png', href: '/favicon-32x32.png' },
      ],
      title: 'TaskMaster — Todo App',
    },
  },

  runtimeConfig: {
    // Server-only: Laravel backend base URL — never exposed to browser
    apiBase: process.env.API_BASE || 'http://127.0.0.1:8000/api',
    public: {
      // Nothing from the backend URL should leak to the client
    },
  },
})
