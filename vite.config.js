import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const allowedHosts = ['127.0.0.1', 'localhost', 'test.shuziwenbo.cn'];

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/shanhai-digital-services/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts,
  },
});
