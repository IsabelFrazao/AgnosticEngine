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
      '@agnostic/metadata-schema': path.resolve(
        __dirname,
        '../../packages/metadata-schema/src/index.ts',
      ),
    },
  },
  test: {
    environment: 'node',
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
      '../../packages/metadata-schema/src/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
  },
});
