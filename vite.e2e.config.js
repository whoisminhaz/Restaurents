import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'mock-firebase-plugin',
      enforce: 'pre',
      resolveId(source) {
        if (
          source.includes('config/firebase') ||
          source.startsWith('firebase/app') ||
          source.startsWith('firebase/auth') ||
          source.startsWith('firebase/firestore') ||
          source.startsWith('firebase/storage') ||
          source.startsWith('firebase/app-check')
        ) {
          return path.resolve(__dirname, 'tests/e2e/mock-firebase.js');
        }
        return null;
      }
    },
    {
      name: 'spa-fallback-plugin',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url.split('?')[0];
          if (
            url === '/' ||
            url.startsWith('/book') ||
            url.startsWith('/order') ||
            url.startsWith('/checkout') ||
            url.startsWith('/login') ||
            url.startsWith('/dashboard')
          ) {
            req.url = '/app.html';
          }
          next();
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: 'app.html'
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
