// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',       // Allow access from outside (LAN or public IP)
    port: 5173,            // Default Vite port
    hmr: {
      protocol: 'ws',      // WebSocket for hot reload
      host: '116.203.203.86',  // Your public IP or domain
      port: 5173,
    },
    proxy: {
      '/api': {
        target: 'https://116.203.203.86',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
