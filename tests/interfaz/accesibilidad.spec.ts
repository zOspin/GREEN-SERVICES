/** Accesibilidad (axe-core, normas WCAG 2.1 A y AA): contraste, etiquetas, roles y navegación con teclado. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { RUTAS } from './ayuda';

for (const tema of ['light', 'dark'] as const) {
  test.describe(`tema ${tema === 'light' ? 'claro' : 'oscuro'}`, () => {
    for (const ruta of RUTAS) {
      test(`${ruta} cumple WCAG AA`, async ({ page }) => {
        await page.addInitScript((t) => localStorage.setItem('orbita-tema', t), tema);
        await page.goto(ruta);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(300);
        const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        const resumen = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} → ${(n.any[0]?.message ?? '').slice(0, 120)}`).join(' | ')}`);
        expect(resumen, `problemas de accesibilidad en ${ruta}`).toEqual([]);
      });
    }
  });
}
