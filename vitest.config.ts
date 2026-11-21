import { defineConfig } from 'vitest/config';

// Pruebas unitarias (lógica, sin navegador): npm test
export default defineConfig({
  test: { include: ['tests/unidad/**/*.test.ts'], environment: 'node' },
});
