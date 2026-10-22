import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    server: 'src/main/server.ts',
  },
  outDir: 'dist',
  format: ['cjs'],
  target: 'node22',
  platform: 'node',
  sourcemap: true,
  clean: true,
  splitting: false,
});
