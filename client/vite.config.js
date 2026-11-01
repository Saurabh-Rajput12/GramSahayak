// Vite configuration file with React plugin and backend API proxy
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configure development server and API proxying
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
