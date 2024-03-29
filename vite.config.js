// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  // Use an environment variable for the base URL. If it's not set, default to '/'.
  base: process.env.BASE_URL || '/',  build: {
    outDir: 'dist'
  }
});
