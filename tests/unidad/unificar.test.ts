/** Pruebas del Centro de datos: leer fechas y números, reconocer columnas, unir y quitar duplicados. */
import { describe, expect, it } from 'vitest';
import { leerFecha, leerNumero, reconocerColumnas, unirArchivos } from '../../src/lib/unificar';
import { clientes, productos, trm, ventas } from './demo';

describe('leerFecha', () => {
  it.each([
    ['2026-10-03', '2026-10-03'],
    ['2026-10-03 14:20', '2026-10-03'],
    ['03/10/2026', '2026-10-03'], // día/mes/año (formato colombiano)
    ['3-oct-2026', '2026-10-03'],
    ['3 sept 2026', '2026-09-03'],
  ])('entiende «%s»', (entrada, esperado) => expect(leerFecha(entrada)).toBe(esperado));

  it('entiende el número de serie de Excel', () => expect(leerFecha(46298)).toBe('2026-10-03'));
  it('devuelve null si no es una fecha', () => expect(leerFecha('mañana')).toBeNull());
});

describe('leerNumero', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['1,234.56', 1234.56],
    ['$ 4.500.000', 4500000],
    ['405,89', 405.89],
    [1234.5, 1234.5],
  ])('convierte «%s»', (entrada, esperado) => expect(leerNumero(entrada)).toBeCloseTo(esperado));
  it('devuelve null si no hay número', () => expect(leerNumero('—')).toBeNull());
});

describe('reconocerColumnas', () => {
  it('traduce sinónimos en español e inglés', () => {
    expect(reconocerColumnas(['FECHA DE VENTA', 'customer_id', 'SKU', 'Cant.', 'Valor COP', 'TRM del día'])).toEqual({
      'FECHA DE VENTA': 'fecha',
      customer_id: 'cliente',
      SKU: 'producto',
      'Cant.': 'cantidad',
      'Valor COP': 'valor_cop',
      'TRM del día': 'trm',
    });
  });
});

describe('unirArchivos (demo)', () => {
  const ctx = { clientes, productos, trm, ventasBase: ventas };
  const v = ventas.find((x) => x.id_cliente === 'CLI-023')!;
  const p = productos.find((x) => x.id === v.id_producto)!;
  const [a, m, d] = v.fecha.split('-');

  it('reconoce al mismo cliente escrito de tres formas y quita el duplicado', () => {
    const r = unirArchivos(
      [
        { nombre: 'erp.csv', filas: [{ Fecha: `${d}/${m}/${a}`, Cliente: 'Cliente 23', Producto: p.nombre, 'Cant.': v.cantidad, 'Valor USD': String(v.valor_usd).replace('.', ',') }] },
        { nombre: 'excel.csv', filas: [{ 'FECHA DE VENTA': v.fecha, 'COD. CLIENTE': 'CLIENTE 023', REFERENCIA: p.nombre.toUpperCase(), UNIDADES: v.cantidad, 'VALOR USD': v.valor_usd }] },
        { nombre: 'b.csv', filas: [{ date: v.fecha, customer_id: 'CLI-23', sku: p.id, qty: v.cantidad, amount_usd: v.valor_usd }] },
      ],
      ctx,
    );
    expect(r.problemas).toEqual([]);
    expect(r.duplicados).toBe(2);
    expect(r.ventas).toHaveLength(1);
    expect(r.ventas[0].id_cliente).toBe('CLI-023');
    expect(r.coincidenConBase).toBe(1);
  });

  it('marca filas sin cliente conocido como problema (en la demo no se crean clientes)', () => {
    const r = unirArchivos([{ nombre: 'x.csv', filas: [{ fecha: v.fecha, cliente: 'Empresa Nueva', producto: p.nombre, valor_usd: 10 }] }], ctx);
    expect(r.ventas).toHaveLength(0);
    expect(r.problemas).toHaveLength(1);
  });

  it('cuenta las filas vacías', () => {
    const r = unirArchivos([{ nombre: 'x.csv', filas: [{ fecha: '', cliente: '', producto: '', valor_usd: '' }] }], ctx);
    expect(r.archivos[0].vacias).toBe(1);
  });
});

describe('unirArchivos (modo Real: crea clientes y productos)', () => {
  const filas = [
    { fecha: '2026-01-10', cliente: 'Empresa A', producto: 'Licencia X', categoria: 'Software', tipo: 'servicio recurrente', valor_cop: '4.000.000', trm: '4.000' },
    { fecha: '2026-02-10', cliente: 'empresa a', producto: 'Licencia X', valor_usd: '1000' },
    { fecha: '2026-02-11', cliente: 'Empresa B', producto: 'Servidor', valor_usd: '5000', sector: 'salud' },
  ];
  const r = unirArchivos([{ nombre: 'real.csv', filas }], { clientes: [], productos: [], trm: [], ventasBase: [], crearNuevos: true });

  it('crea un cliente por nombre (sin importar mayúsculas)', () => {
    expect(r.clientesNuevos.map((c) => c.nombre)).toEqual(['Empresa A', 'Empresa B']);
    expect(r.clientesNuevos[1].sector).toBe('salud');
  });
  it('crea los productos con su categoría y tipo', () => {
    const lic = r.productosNuevos.find((x) => x.nombre === 'Licencia X')!;
    expect(lic.categoria).toBe('Software');
    expect(lic.tipo).toBe('servicio recurrente');
  });
  it('convierte pesos a dólares con la TRM de la fila y guarda la TRM', () => {
    expect(r.ventas[0].valor_usd).toBe(1000);
    expect(r.trmLeida).toEqual([{ fecha: '2026-01-10', valor: 4000 }]);
  });
  it('sin TRM no inventa pesos (quedan en 0)', () => {
    expect(r.ventas.find((x) => x.fecha === '2026-02-11')!.valor_cop).toBe(0);
  });
});
