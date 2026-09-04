import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/gruuuu/' : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
            if (id.includes('lucide-react')) return 'icons-vendor';
            if (id.includes('three') || id.includes('@types/three')) return 'three-vendor';
            // Bibliothèques lourdes réservées à des vues rares (lazy) : chunks dédiés,
            // chargés uniquement quand la vue qui les utilise est ouverte.
            if (id.includes('node_modules/docx/')) return 'docx-vendor';
            if (id.includes('node_modules/leaflet')) return 'leaflet-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/gruuuu/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gruuuu\/api/, '/api'),
      },
    },
  },
});

