import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Puerto propio de Órbita (no el 5173 por defecto) para no chocar con otros proyectos
  // que usen Vite. Si está ocupado usa el siguiente libre, y abre el navegador solo en la dirección correcta.
  // En las pruebas automáticas (ORBITA_PRUEBAS=1) no se abre el navegador.
  server: { port: 5190, strictPort: false, open: !process.env.ORBITA_PRUEBAS },
  preview: { port: 5190 },
});
