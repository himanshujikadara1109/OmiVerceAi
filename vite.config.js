import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from "path";

export default defineConfig({
  plugins: [react() ,tailwindcss()],
  base: "/",
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")  // <- now @ points to src/
    }
  }
});
