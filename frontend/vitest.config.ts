import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
// In the test environment @vitejs/plugin-vue v6 tries to resolve absolute
// src paths (e.g. "/icon-check.svg") as filesystem URLs which fails on
// Windows. Disabling transformAssetUrls keeps them as literal strings.
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls: false } })],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    environmentOptions: {
      jsdom: {
        // Without a base URL jsdom resolves /icon-check.svg → file:///icon-check.svg
        // and Node.js rejects that path. With an http base URL it becomes
        // http://localhost/icon-check.svg which jsdom skips (no external fetching).
        url: 'http://localhost/',
      },
    },
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.'),
    },
  },
})
