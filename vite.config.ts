import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // En GitHub Pages la web vive en /GREEN-SERVICES/ (lo define el flujo de publicación con BASE_URL).
  base: process.env.BASE_URL ?? '/',
  plugins: [react()],
  // Puerto propio de Órbita (no el 5173 por defecto) para no chocar con otros proyectos
  // que usen Vite. Si está ocupado usa el siguiente libre, y abre el navegador solo en la dirección correcta.
  // En las pruebas automáticas (ORBITA_PRUEBAS=1) no se abre el navegador.
  server: { port: 5190, strictPort: false, open: !process.env.ORBITA_PRUEBAS },
  preview: { port: 5190 },
  build: {
    rollupOptions: {
      output: {
        // Librerías en archivos propios: el navegador las guarda y no las vuelve a descargar con cada cambio.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          graficas: ['recharts'],
        },
      },
    },
  },
});
