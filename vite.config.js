import react from '@vitejs/plugin-react';

import { defineConfig } from 'vite';

export default defineConfig({
  base: '/watertoy/',
  plugins: [
    react(),
  ],
  assetsInclude: ['**/*.gltf', '**/*.hdr'],
  server: {
    port: 8080,
    host: true,
  },
});
