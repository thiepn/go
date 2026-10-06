import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/go/',
  plugins: [react()],
  preview: {
    // Production static hosting does not add a localhost CORS
    // variant. Keeping preview CORS off lets service-worker
    // precache requests match later page asset requests exactly.
    cors: false,
  },
});
