import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    host: true, // 添加这行以允许局域网访问
    open: true  // 添加这行以自动打开浏览器
  }
});