/** Todas las pantallas abren sin errores, en los dos idiomas y en los dos temas. */
import { expect, test } from '@playwright/test';
import { abrirSinTextosRotos, RUTAS, vigilarErrores } from './ayuda';

test.describe('todas las pantallas (demo)', () => {
  for (const ruta of RUTAS) {
    test(`abre ${ruta} sin errores`, async ({ page }) => {
      const errores = vigilarErrores(page);
      await abrirSinTextosRotos(page, ruta);
      expect(errores).toEqual([]);
    });
  }
});

test('el tema claro es el predeterminado y el oscuro se recuerda', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('cambia a inglés y vuelve a español', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Artificial Intelligence');
  await page.getByRole('button', { name: 'Español' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Inteligencia Artificial');
});

test('el menú lleva a cada sección', async ({ page }) => {
  await page.goto('/');
  for (const [texto, ruta] of [['Centro de datos', '/datos'], ['Clientes', '/clientes'], ['Evaluación del modelo', '/modelo'], ['Resumen general', '/']] as const) {
    await page.locator('aside').getByRole('link', { name: texto, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${ruta}$`));
  }
});

test('idioma y tema se ven arriba sin desplazarse, incluso en un portátil pequeño', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/');
  for (const nombre of ['English', 'Español', 'Modo claro', 'Modo oscuro']) {
    const caja = await page.getByRole('button', { name: nombre }).boundingBox();
    expect(caja && caja.y + caja.height <= 768, nombre).toBe(true);
  }
});
