/** Centro de datos: une los archivos de ejemplo, modo Real vacío, carga de datos reales y demo al azar. */
import { expect, test } from '@playwright/test';
import { generarDatos } from '../../src/lib/generador';
import { abrirSinTextosRotos, elegirModo, RUTAS, vigilarErrores } from './ayuda';

test('une los 3 archivos de ejemplo y sigue al Cliente 23', async ({ page }) => {
  await page.goto('/datos?demo=1');
  await expect(page.getByText('Así llegó el Cliente 23: regado y repetido')).toBeVisible();
  await expect(page.locator('section', { hasText: '3. Unión y limpieza' }).getByText('Duplicados quitados')).toBeVisible();
});

test('modo Real sin datos: todo en cero y sin datos inventados', async ({ page }) => {
  const errores = vigilarErrores(page);
  await page.goto('/?modo=real');
  await expect(page.getByText('Modo Real: todavía no hay datos de Green Services')).toBeVisible();
  for (const ruta of RUTAS) await abrirSinTextosRotos(page, ruta);
  await page.goto('/datos');
  await expect(page.getByRole('button', { name: /archivos de ejemplo/ })).toHaveCount(0);
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar plantilla' }).click();
  expect((await descarga).suggestedFilename()).toBe('plantilla-orbita-pulse.csv');
  expect(errores).toEqual([]);
});

test('modo Real: subir un archivo, usarlo y borrarlo', async ({ page }) => {
  // Archivo de prueba armado con datos inventados (la demo con otros nombres).
  const d = generarDatos(7);
  const prod = new Map(d.productos.map((p) => [p.id, p]));
  const filas = ['Fecha;Cliente;Producto;Categoria;Cant.;Valor USD;TRM'];
  for (const v of d.ventas) {
    const [a, m, dia] = v.fecha.split('-');
    filas.push([`${dia}/${m}/${a}`, `Empresa ${v.id_cliente.slice(4)}`, prod.get(v.id_producto)!.nombre, prod.get(v.id_producto)!.categoria, v.cantidad, String(v.valor_usd).replace('.', ','), (v.valor_cop / v.valor_usd).toFixed(2).replace('.', ',')].join(';'));
  }
  await page.goto('/?modo=real');
  await page.goto('/datos');
  // Lista de clientes: los 60 de las ventas y uno más que nunca ha comprado.
  const lista = ['Cliente;Sector;Ciudad;Base instalada', ...d.clientes.map((c) => `Empresa ${c.id.slice(4)};${c.sector};${c.ciudad};${c.es_base_instalada ? 'Sí' : 'No'}`), 'Empresa 999;salud;Medellín;No'];
  await page.setInputFiles('input[type=file]', [
    { name: 'ventas-prueba.csv', mimeType: 'text/csv', buffer: Buffer.from(filas.join('\n')) },
    { name: 'clientes-prueba.csv', mimeType: 'text/csv', buffer: Buffer.from(lista.join('\n')) },
  ]);
  await expect(page.getByText(/Se crearán 61 clientes/)).toBeVisible();
  await expect(page.getByText('lista de clientes: 61 clientes')).toBeVisible();
  await page.getByRole('button', { name: 'Usar estos datos en modo Real' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[role=note]').first()).toContainText('datos de Green Services');
  // Todas las pantallas funcionan con los datos subidos (incluido un cliente sin compras).
  for (const ruta of RUTAS.filter((r) => !r.includes('CLI-023') && r !== '/cierre')) await abrirSinTextosRotos(page, ruta);
  await page.goto('/clientes');
  await page.getByPlaceholder(/Buscar/).fill('Empresa 999');
  await page.getByRole('link', { name: /Empresa 999/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Empresa 999');
  await page.goto('/modelo');
  await expect(page.getByText(/Predicción vs. realidad/)).toBeVisible();
  await page.goto('/datos');
  page.once('dialog', (dl) => dl.accept());
  await page.getByRole('button', { name: 'Borrar datos reales' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[role=note]').first()).toContainText('sin datos todavía');
});

test('demo al azar: cambia los datos y se puede volver a la original', async ({ page }) => {
  await page.goto('/?modo=demo');
  await page.locator('aside').getByRole('button', { name: /otra demo al azar/ }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[role=note]').first()).toContainText('datos al azar');
  await abrirSinTextosRotos(page, '/clientes/CLI-023');
  await page.getByRole('button', { name: 'volver a la original' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('[role=note]').first()).toContainText('Demo con datos de prueba');
});

test('la demo en vivo recorre los 5 pasos (y desde modo Real cambia a Demo)', async ({ page }) => {
  await page.goto('/');
  await elegirModo(page, 'Real');
  await page.locator('aside').getByRole('button', { name: /Iniciar demo en vivo/ }).click();
  await expect(page).toHaveURL(/\/datos\?demo=1/);
  // Espera a que aparezca la barra de la presentación antes de usar las flechas.
  await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
  for (const ruta of [/\/radar/, /\/clientes\/CLI-023/, /\/ventas/, /\/cierre/]) {
    await page.keyboard.press('ArrowRight');
    await expect(page).toHaveURL(ruta);
  }
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Llamar hoy al Cliente 23');
});
