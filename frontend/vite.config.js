import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: '3.86.177.144',  // 修改为 EC2 IP
    open: true
  }
});