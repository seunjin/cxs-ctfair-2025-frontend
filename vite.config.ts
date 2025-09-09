import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.cxsctfair.com',
        changeOrigin: true,
      },
      '/admin': {
        target: 'https://api.cxsctfair.com',
        changeOrigin: true,
      },
    },
  },
});