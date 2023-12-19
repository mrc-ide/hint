import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [
      './src/tests/setup.ts'
    ],
    environmentOptions: {
      url: 'http://localhost'
    },
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      exclude: [
        '/node_modules/',
        './tests/mocks.ts',
        './tests/testHelpers.ts',
        './tests/.*/helpers.ts',
      ],
    },
  },
  plugins: [vue()],
  define: {
    "process.env": {
      "NODE_ENV": "development"
    },
  },
  build: {
    target: "ESNext",
    outDir: "public",
    lib: {
      entry: "src/app/index.ts",
      name: "app",
    },
    rollupOptions: {
      output: {
        entryFileNames: "js/app.js",
        chunkFileNames: "js/[name].chunk.js",
        assetFileNames: "css/app.css"
      }
    }
  }
})
