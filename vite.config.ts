import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

/** Production assets always load from apex — avoids split HTML/asset cache between www and bare domain. */
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? 'https://watadiq.com/' : '/',
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'newsletter-api',
      configureServer(server) {
        server.middlewares.use('/api/newsletter', (req, res) => {
          if (req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      jquery: 'jquery/dist/jquery.min.js',
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // WATAD Pass identity API (local dev — production uses api.<domain>)
      '/identity-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/identity-api/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['jquery', 'gsap', 'lodash', 'moment'],
  },
}));
