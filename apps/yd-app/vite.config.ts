import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@yd/libs': fileURLToPath(new URL('../../packages/yd-libs/src', import.meta.url)),
      '@yd/hooks': fileURLToPath(new URL('../../packages/yd-hooks/src', import.meta.url))
    }
  }
});
