import { fileURLToPath } from 'node:url';

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const src = (dir: string) => fileURLToPath(new URL(`./src/${dir}`, import.meta.url));

export default defineConfig({
  plugins: [swc.vite()],
  resolve: {
    alias: {
      '@application': src('application'),
      '@infra': src('infra'),
      '@kernel': src('kernel'),
      '@main': src('main'),
      '@shared': src('shared'),
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    globalSetup: ['tests/setup/globalSetup.ts'],
    setupFiles: ['tests/setup/env.ts'],
    testTimeout: 20_000,
    hookTimeout: 120_000,
  },
});
