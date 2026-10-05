import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'mysql://mis_gastos:mis_gastos@localhost:3306/mis_gastos',
    },
  },
});
