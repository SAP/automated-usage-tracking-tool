import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: '../coverage',
      exclude: [...configDefaults.exclude, '**/*.test.ts', '**/*.dataTest.ts'],
    },
  },
})
