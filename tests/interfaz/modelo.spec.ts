/** El modelo predictivo se ve en el resumen, en la tabla de clientes, en la ficha y en su evaluación. */
import { expect, test } from '@playwright/test';

test('el resumen muestra indicadores, clientes prioritarios y desempeño del modelo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Ventas confirmadas')).toBeVisible();
  await expect(page.getByText('965')).toBeVisible();
  const tabla = page.locator('section', { hasText: 'Clientes prioritarios para seguimiento' });
  await expect(tabla.getByRole('row')).toHaveCount(7); // encabezado + 6 clientes
  await expect(page.getByText('Desempeño del modelo de IA').first()).toBeVisible();
});

test('la evaluación compara el modelo con la regla base', async ({ page }) => {
  await page.goto('/modelo');
  for (const t of ['Precisión', 'Exhaustividad', 'F1', 'Exactitud']) await expect(page.getByText(t, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Predicción vs. realidad, último mes \(60 clientes\)/)).toBeVisible();
  await expect(page.getByText(/Promedio de 6 meses/).first()).toBeVisible();
  await expect(page.getByText(/igualó o superó a la regla base en \d de 6 meses/)).toBeVisible();
  await page.getByRole('button', { name: 'Ver los 60' }).click();
  await expect(page.locator('section', { hasText: 'Predicción vs. realidad' }).locator('tbody tr')).toHaveCount(60);
});

test('la tabla de clientes se ordena por probabilidad de compra', async ({ page }) => {
  await page.goto('/clientes');
  await page.getByRole('button', { name: /Prob. compra/ }).click();
  const primeras = await page.locator('tbody tr td:nth-child(7)').allInnerTexts();
  const p = primeras.slice(0, 5).map((t) => Number(t.match(/\d+,\d+/)![0].replace(',', '.')));
  expect([...p].sort((a, b) => b - a)).toEqual(p);
});

test('la ficha del Cliente 23 explica el riesgo y la probabilidad de compra', async ({ page }) => {
  await page.goto('/clientes/CLI-023');
  await expect(page.getByText('¿Por qué este cliente está en riesgo?')).toBeVisible();
  await expect(page.getByText(/Probabilidad de compra en los próximos 30 días/)).toBeVisible();
  await expect(page.getByText('US$ 4.800').first()).toBeVisible();
});
