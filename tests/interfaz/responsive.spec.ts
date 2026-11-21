/** En celular: sin desplazamiento horizontal y con el menú desplegable. */
import { expect, test } from '@playwright/test';
import { RUTAS } from './ayuda';

for (const ruta of RUTAS) {
  test(`${ruta} cabe en el ancho del celular`, async ({ page }) => {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(desborde).toBeLessThanOrEqual(1);
  });
}

test('el menú del celular se abre y navega', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.locator('#menu-movil').getByRole('link', { name: 'Evaluación del modelo' }).click();
  await expect(page).toHaveURL(/\/modelo$/);
});

test('el idioma y el tema se cambian desde el encabezado del celular', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Artificial Intelligence');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('en un celular pequeño (360 px) tampoco hay desplazamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const ruta of ['/', '/modelo', '/clientes', '/datos']) {
    await page.goto(ruta);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), ruta).toBeLessThanOrEqual(1);
  }
});
