// Configuração do Vite: alias, proxy de dev e divisão de chunks.

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: false },
      '/uploads': { target: 'http://localhost:3000', changeOrigin: false },
    },
  },

  build: {
    target: 'es2022',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          const afterModules = id.split('node_modules/')[1] ?? '';
          const segments = afterModules.split('/');
          const pkg = afterModules.startsWith('@') ? segments.slice(0, 2).join('/') : (segments[0] ?? '');

          if (pkg === 'motion' || pkg === 'framer-motion' || pkg.startsWith('motion-')) return 'motion';

          if (pkg === 'react' || pkg === 'react-dom' || pkg === 'scheduler') return 'react';

          if (pkg === 'react-router' || pkg.startsWith('@tanstack/')) return 'router';
          return 'vendor';
        },
      },
    },
  },
});
