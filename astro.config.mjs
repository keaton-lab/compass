import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { fileURLToPath } from 'node:url';

const runtimeMode = process.env.COMPASS_RUNTIME_MODE === 'static' ? 'static' : 'server';
const srcDir = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  output: runtimeMode,
  adapter: runtimeMode === 'server' ? node({ mode: 'standalone' }) : undefined,
  outDir: runtimeMode === 'static' ? './dist/client' : './dist',
  build: runtimeMode === 'server'
    ? {
        client: './client',
        server: './server',
        assets: 'assets',
      }
    : {
        assets: 'assets',
      },
  integrations: [react()],
  vite: {
    resolve: {
      alias: {
        '@': srcDir,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  preview: {
    port: 3000,
    host: true,
  },
});
