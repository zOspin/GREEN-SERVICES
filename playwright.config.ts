import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de interfaz: abren la web en Chromium y la recorren como una persona.
 *   npm run test:e2e
 * La primera vez en un computador nuevo: npx playwright install chromium
 *
 * Perfiles de dispositivo (emulados: tamaño de pantalla, escala, pantalla táctil e identificación del navegador).
 * Los iPhone se emulan con el motor de Chrome; Safari real no está incluido.
 */
const chromium = (d: (typeof devices)[string]) => ({ ...d, browserName: 'chromium' as const, defaultBrowserType: 'chromium' as const });

/** Pantallas de Windows: el alto descuenta la barra del navegador y la de tareas. */
const windows = (ancho: number, alto: number, escala = 1) => ({
  ...devices['Desktop Chrome'],
  viewport: { width: ancho, height: alto },
  deviceScaleFactor: escala,
  userAgent: devices['Desktop Edge'].userAgent,
});

const DISPOSITIVOS = /dispositivos/;

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
    // Pruebas funcionales completas
    { name: 'computador', use: windows(1440, 900), testIgnore: [/responsive/, DISPOSITIVOS] },
    { name: 'celular', use: chromium(devices['Pixel 7']), testMatch: /responsive/ },
    // Recorrido por dispositivo
    { name: 'windows-1920x1080-125%', use: windows(1536, 730, 1.25), testMatch: DISPOSITIVOS },
    { name: 'windows-1366x768', use: windows(1366, 657), testMatch: DISPOSITIVOS },
    { name: 'monitor-1920x1080', use: windows(1920, 969), testMatch: DISPOSITIVOS },
    { name: 'ipad-vertical', use: chromium(devices['iPad (gen 7)']), testMatch: DISPOSITIVOS },
    { name: 'ipad-horizontal', use: chromium(devices['iPad (gen 7) landscape']), testMatch: DISPOSITIVOS },
    { name: 'android-pixel-7', use: chromium(devices['Pixel 7']), testMatch: DISPOSITIVOS },
    { name: 'android-galaxy-s8', use: chromium(devices['Galaxy S8']), testMatch: DISPOSITIVOS },
    { name: 'iphone-13', use: chromium(devices['iPhone 13']), testMatch: DISPOSITIVOS },
    { name: 'iphone-se', use: chromium(devices['iPhone SE']), testMatch: DISPOSITIVOS },
  ],
});
