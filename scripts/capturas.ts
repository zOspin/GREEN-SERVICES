/**
 * Capturas de Órbita para las diapositivas 10, 11 y 12.
 *
 * Uso:  npm run capturas
 * Resultado (1920×1080, en español): presentacion/capturas/ en modo oscuro y presentacion/capturas/claro/ en modo claro
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

// 2. Abrir un navegador invisible en 1920×1080 y español, una vez por tema:
//    oscuro → presentacion/capturas/ (lo que piden las diapositivas) · claro → presentacion/capturas/claro/
const navegador = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errores: string[] = [];

for (const tema of ['dark', 'light'] as const) {
  const carpeta = tema === 'dark' ? salida : join(salida, 'claro');
  mkdirSync(carpeta, { recursive: true });
  const contexto = await navegador.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, colorScheme: tema });
  await contexto.addInitScript((t) => {
    localStorage.setItem('orbita-tema', t);
    localStorage.setItem('orbita-modo', 'demo');
    localStorage.removeItem('orbita-semilla');
    localStorage.setItem('orbita-idioma', 'es');
  }, tema);
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => errores.push(e.message));

  const capturar = async (nombre: string, ruta: string, preparar?: (p: Page) => Promise<void>) => {
    await pagina.goto(base + ruta, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.fonts.ready);
    if (preparar) await preparar(pagina);
    await pagina.waitForTimeout(1200); // deja terminar las animaciones de las gráficas
    await pagina.screenshot({ path: join(carpeta, nombre), animations: 'disabled' });
    console.log(`  ✓ ${tema === 'dark' ? 'oscuro' : 'claro'}/${nombre}`);
  };

  console.log(`Guardando capturas (${tema === 'dark' ? 'modo oscuro' : 'modo claro'}) en ${carpeta}`);
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
  await contexto.close();
}

await navegador.close();
await servidor.close();
if (errores.length) {
  console.error('Errores en la página:', errores);
  process.exit(1);
}
console.log('Listo.');
