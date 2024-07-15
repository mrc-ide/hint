import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    maxConcurrency: 4,
    setupFiles: [
      './src/tests/setup.ts'
    ],
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/unit",
      include: ["src/app"]
    },
    environmentOptions: {
      jsdom: {
        url: "http://localhost"
      }
    }
  },
  plugins: [vue()],
});
