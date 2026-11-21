/**
 * Recorrido por dispositivo (Windows, tabletas, Android, iPhone): cada pantalla abre sin errores,
 * sin textos rotos, sin desplazamiento horizontal y con la navegación y los controles al alcance.
 */
import { expect, test } from '@playwright/test';
import { abrirSinTextosRotos, RUTAS, vigilarErrores } from './ayuda';

test('todas las pantallas abren bien y caben en el ancho', async ({ page }) => {
  const errores = vigilarErrores(page);
  for (const ruta of RUTAS) {
    await abrirSinTextosRotos(page, ruta);
    await page.waitForLoadState('networkidle');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde, `desplazamiento horizontal en ${ruta}`).toBeLessThanOrEqual(1);
  }
  expect(errores).toEqual([]);
});

test('la navegación, el idioma y el tema están al alcance sin desplazarse', async ({ page }, info) => {
  await page.goto('/');
  const alto = page.viewportSize()!.height;
  for (const nombre of ['English', 'Español']) {
    const caja = await page.getByRole('button', { name: nombre }).boundingBox();
    expect(caja && caja.y >= 0 && caja.y + caja.height <= alto, `${nombre} visible`).toBe(true);
  }
  const menuMovil = page.getByRole('button', { name: 'Abrir menú' });
  if (await menuMovil.isVisible()) {
    await menuMovil.click();
    await page.locator('#menu-movil').getByRole('link', { name: 'Evaluación del modelo' }).click();
  } else {
    await page.locator('aside').getByRole('link', { name: 'Evaluación del modelo' }).click();
  }
  await expect(page).toHaveURL(/\/modelo$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Evaluación del modelo');
  info.annotations.push({ type: 'pantalla', description: `${page.viewportSize()!.width}×${alto}` });
});

test('los botones táctiles tienen un tamaño cómodo (≥ 24 px)', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'solo en pantallas táctiles');
  await page.goto('/');
  const pequenos = await page.evaluate(() =>
    [...document.querySelectorAll('header button, header a, main button')]
      .filter((e) => (e as HTMLElement).offsetParent !== null)
      .map((e) => ({ t: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 30), r: e.getBoundingClientRect() }))
      .filter((x) => x.r.width < 24 || x.r.height < 24)
      .map((x) => `${x.t} (${Math.round(x.r.width)}×${Math.round(x.r.height)})`),
  );
  expect(pequenos).toEqual([]);
});

test('la ficha del Cliente 23 y el Centro de datos funcionan', async ({ page }) => {
  await page.goto('/clientes/CLI-023');
  await expect(page.getByText('¿Por qué este cliente está en riesgo?')).toBeVisible();
  await page.goto('/datos?demo=1');
  await expect(page.getByText('Así llegó el Cliente 23: regado y repetido')).toBeVisible();
});
