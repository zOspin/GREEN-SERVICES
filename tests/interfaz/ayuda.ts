import { expect, type Page } from '@playwright/test';

export const RUTAS = ['/', '/datos', '/radar', '/alertas', '/clientes', '/clientes/CLI-023', '/ventas', '/predicciones', '/modelo', '/reporte', '/reto', '/configuracion', '/privacidad', '/cierre'];

/** Junta los errores de la página (JavaScript y consola). */
export function vigilarErrores(page: Page) {
  const errores: string[] = [];
  page.on('pageerror', (e) => errores.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  return errores;
}

/** Abre una ruta y revisa que no haya textos rotos (NaN, undefined…). */
export async function abrirSinTextosRotos(page: Page, ruta: string) {
  await page.goto(ruta);
  await expect(page.locator('main')).toBeVisible();
  const texto = await page.locator('body').innerText();
  expect(texto, `texto roto en ${ruta}`).not.toMatch(/\bNaN\b|\bundefined\b|Infinity/);
}

/** Cambia el modo de datos desde el menú (recarga la página). */
export async function elegirModo(page: Page, modo: 'Demo' | 'Real') {
  await page.locator('aside').getByRole('button', { name: modo, exact: true }).click();
  await page.waitForLoadState('networkidle');
}
