import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/mini-games-story-1/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts', // Test files are not application logic.
        'src/test/**', // Test setup helpers are not application logic.
        'src/main.ts', // This file only bootstraps the application.
        'src/vite-env.d.ts', // This file contains type declarations only.
        'src/api/types.ts', // This file contains interfaces only.
        'src/auth/firebase.ts', // This file initializes the Firebase SDK with static config.
      ],
      thresholds: {
        statements: 80,
      },
    },
  },
});
