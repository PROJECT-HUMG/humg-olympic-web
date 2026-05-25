import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/v1': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (p) => p.replace(/^\/api\/v1/, ''),
        }
      }
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (/\/(react|react-dom|react-router-dom)\//.test(id)) return 'vendor-react';
              if (/\/(@mantine\/core|@mantine\/hooks|framer-motion|lucide-react)\//.test(id)) return 'vendor-ui';
              if (/\/@blocknote\//.test(id)) return 'vendor-editor';
              if (/\/react-pdf\//.test(id)) return 'vendor-pdf';
              if (/\/(katex|rehype-katex|remark-math)\//.test(id)) return 'vendor-math';
              if (/\/(react-markdown|remark-gfm)\//.test(id)) return 'vendor-markdown';
            }
          },
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': `${import.meta.dirname}/src`,
      }
    }
  };
});