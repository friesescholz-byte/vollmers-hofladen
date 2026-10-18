import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { apiPlugin } from './api-plugin.js';

export default defineConfig({
  plugins: [react(), apiPlugin()],
  server: {
    allowedHosts: true,
    host: true,
    port: 5173
  }
});
