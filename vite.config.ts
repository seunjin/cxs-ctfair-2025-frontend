import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';
// import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
  // plugins: [react(), tailwindcss(), svgr(), basicSsl()],
  plugins: [react(), tailwindcss(), svgr()],
  server: {
    host: true,
    // https: true,
    proxy: {
      '/api': {
        target: 'https://api.cxsctfair.com',
        changeOrigin: true,
      },
    },
  },
});
