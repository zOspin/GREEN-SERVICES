/** Pruebas del generador de la demo: la original no cambia y la demo al azar sí. */
import { describe, expect, it } from 'vitest';
import { generarDatos, SEMILLA_ORIGINAL } from '../../src/lib/generador';
import { clientes, ventas } from './demo';
import { armarDatosReales } from '../../src/lib/datosReales';
import { unirArchivos } from '../../src/lib/unificar';

describe('generarDatos', () => {
  it('la semilla original produce exactamente los datos guardados', () => {
    const d = generarDatos(SEMILLA_ORIGINAL);
    expect(d.clientes).toEqual(clientes);
    expect(d.ventas).toEqual(ventas);
  });
  it('otra semilla produce otras ventas, pero el Cliente 23 sigue igual', () => {
    const d = generarDatos(99);
    expect(d.ventas.length).not.toBe(ventas.length);
    const c23 = (vs: typeof ventas) => vs.filter((v) => v.id_cliente === 'CLI-023').map((v) => [v.fecha, v.id_producto, v.valor_usd]);
    expect(c23(d.ventas)).toEqual(c23(ventas));
  });
});

describe('armarDatosReales', () => {
  it('usa la última venta como «hoy» y rellena la TRM día a día', () => {
    const u = unirArchivos(
      [{ nombre: 'r.csv', filas: [
        { fecha: '2026-01-01', cliente: 'A', producto: 'P', valor_usd: 100, trm: 4000 },
        { fecha: '2026-01-04', cliente: 'A', producto: 'P', valor_usd: 100, trm: 4100 },
      ] }],
      { clientes: [], productos: [], trm: [], ventasBase: [], crearNuevos: true },
    );
    const d = armarDatosReales(u, ['r.csv']);
    expect(d.meta.fecha_corte).toBe('2026-01-04');
    expect(d.trm.map((t) => t.valor)).toEqual([4000, 4000, 4000, 4100]);
  });
});
