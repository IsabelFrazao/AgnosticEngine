import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@agnostic/engine-core': path.resolve(
        __dirname,
        '../../packages/engine-core/src/index.ts',
      ),
      '@agnostic/data-access': path.resolve(
        __dirname,
        '../../packages/data-access/src/index.ts',
      ),
    },
  },
  test: {
    environment: 'node',
  },
});
