import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Puerto propio de Órbita Pulse (no el 5173 por defecto) para no chocar con otros proyectos
  // que usen Vite en el mismo computador. Abre el navegador solo al correr `npm run dev`.
  server: { port: 5180, strictPort: true, open: true },
  preview: { port: 5180 },
});
