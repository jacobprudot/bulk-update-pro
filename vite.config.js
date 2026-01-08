import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Importante: usar paths relativos para Monday.com CDN
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined // Evitar code splitting excesivo
      }
    }
  }
});
