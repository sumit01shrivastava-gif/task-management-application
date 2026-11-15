import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // three.js + R3F are lazy-loaded with the 3D canvas, never on first paint.
    chunkSizeWarningLimit: 1400,
  },
});
