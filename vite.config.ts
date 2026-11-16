import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Puerto propio de Órbita Pulse (no el 5173 por defecto) para no chocar con otros proyectos
  // que usen Vite. Si está ocupado usa el siguiente libre, y abre el navegador solo en la dirección correcta.
  server: { port: 5190, strictPort: false, open: true },
  preview: { port: 5190 },
});
