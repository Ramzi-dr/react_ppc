import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 80,     // expose 80
    strictPort: true,
    hmr: {
      protocol: 'wss',
      host: 'nuance.innolabswiss.ch',
      port: 443,  // HMR over 443
    },
    allowedHosts: ['nuance.innolabswiss.ch'],
    proxy: {
      '/api': {
        target: 'https://116.203.203.86:4443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  preview: {
    port: 80,
    host: '0.0.0.0',
  },
});




// // vite.config.js
// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: '0.0.0.0',       // Allow external access
//     port: 5173,            // Dev server port
//     hmr: {
//       protocol: 'ws',
//       host: 'nuance.innolabswiss.ch', // your subdomain
//       port: 5173,
//     },
//     allowedHosts: [
//       'nuance.innolabswiss.ch',
//     ],
//     proxy: {
//       '/api': {
//         target: 'https://116.203.203.86:4443',
//         changeOrigin: true,
//         secure: false,
//         rewrite: (path) => path.replace(/^\/api/, ''),
//       },
//     },
//   },
// });

