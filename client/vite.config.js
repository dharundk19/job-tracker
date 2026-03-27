/**
 * VERCEL DEPLOYMENT CONFIGURATION
 * Note: Vercel automatically deploys Vite projects. 
 * VITE_API_URL must be set in Vercel's Environment Variables panel.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});