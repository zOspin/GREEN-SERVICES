/**
 * Capturas de Órbita Pulse para las diapositivas 10, 11 y 12.
 *
 * Uso:  npm run capturas
 * Resultado: presentacion/capturas/ (1920×1080, tema claro con el estilo del reto, en español)
 *   - resumen-general.png   → vista general (indicadores, prioritarios y desempeño del modelo)
 *   - evaluacion-modelo.png → validación del modelo predictivo
 *   - centro-datos.png      → diapositiva 10 (Centro de datos)
 *   - radar-clientes.png    → diapositiva 11 (Radar de clientes)
 *   - ficha-cliente-23.png  → diapositiva 11 (detalle del Cliente 23, opcional)
 *   - panel-financiero.png  → diapositiva 12 (Panel financiero)
 *
 * La primera vez en un computador nuevo hay que descargar el navegador:  npx playwright install chromium
 */
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { chromium, type Page } from 'playwright';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const salida = join(raiz, 'presentacion', 'capturas');
mkdirSync(salida, { recursive: true });

// Sin abrir el navegador del sistema al levantar el servidor
process.env.ORBITA_PRUEBAS = '1';

// 1. Levantar la web (un servidor temporal solo para las capturas)
const servidor = await createServer({ root: raiz, logLevel: 'error', server: { port: 5199 } });
await servidor.listen();
const base = servidor.resolvedUrls?.local[0]?.replace(/\/$/, '') ?? 'http://localhost:5199';

// 2. Abrir un navegador invisible en 1920×1080, tema claro y español
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: 'light' });
await contexto.addInitScript(() => {
  localStorage.setItem('orbita-tema', 'light');
  localStorage.setItem('orbita-modo', 'demo');
  localStorage.removeItem('orbita-semilla');
  localStorage.setItem('orbita-idioma', 'es');
});
const pagina = await contexto.newPage();
const errores: string[] = [];
pagina.on('pageerror', (e) => errores.push(e.message));

async function capturar(nombre: string, ruta: string, preparar?: (p: Page) => Promise<void>) {
  await pagina.goto(base + ruta, { waitUntil: 'networkidle' });
  await pagina.evaluate(() => document.fonts.ready);
  if (preparar) await preparar(pagina);
  await pagina.waitForTimeout(1200); // deja terminar las animaciones de las gráficas
  const archivo = join(salida, nombre);
  await pagina.screenshot({ path: archivo, animations: 'disabled' });
  console.log(`  ✓ ${nombre}`);
}

console.log(`Guardando capturas en ${salida}`);
await capturar('resumen-general.png', '/');
await capturar('evaluacion-modelo.png', '/modelo');
await capturar('centro-datos.png', '/datos?demo=1&cliente=CLI-023', async (p) => {
  // Mostrar la unión y limpieza y, debajo, cómo llegó el Cliente 23
  await p.locator('#seguimiento-cliente').waitFor();
  await p.getByRole('heading', { name: /3\. Unión y limpieza/ }).evaluate((h) => {
    const y = h.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo(0, y);
  });
});
await capturar('radar-clientes.png', '/radar?destacar=CLI-023');
await capturar('ficha-cliente-23.png', '/clientes/CLI-023');
await capturar('panel-financiero.png', '/ventas?cliente=CLI-023');

await navegador.close();
await servidor.close();
if (errores.length) {
  console.error('Errores en la página:', errores);
  process.exit(1);
}
console.log('Listo.');
