import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de interfaz: abren la web en Chromium y la recorren como una persona.
 *   npm run test:e2e
 * La primera vez en un computador nuevo: npx playwright install chromium
 */
export default defineConfig({
  testDir: 'tests/interfaz',
  timeout: 45_000,
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:5199', trace: 'off', locale: 'es-CO' },
  webServer: {
    command: 'npx vite --port 5199 --strictPort',
    env: { ORBITA_PRUEBAS: '1' },
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'computador', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /responsive/ },
    { name: 'celular', use: { ...devices['Pixel 7'] }, testMatch: /responsive/ },
  ],
});
