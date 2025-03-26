import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['axios'] // Pre-bundle axios
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true // Helps with module interop
    },
    rollupOptions: {
      external: []
    }
  }
});