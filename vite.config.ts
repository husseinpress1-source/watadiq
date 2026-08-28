import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
      jquery: 'jquery/dist/jquery.min.js',
    },
  },
  server: {
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
});
