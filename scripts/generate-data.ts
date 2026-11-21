/**
 * Generador de datos sintéticos para Órbita.
 *
 * Todo es inventado: no hay ningún dato real de clientes.
 * Usa una semilla fija, así que cada vez que se ejecuta produce exactamente
 * los mismos archivos (mientras no cambies SEMILLA ni FECHA_CORTE).
 *
 * Uso:  npm run generate-data
 *       FECHA_CORTE=2026-12-01 npm run generate-data   (para mover el "hoy")
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generarDatos, FECHA_CORTE_DEMO, SEMILLA_ORIGINAL } from '../src/lib/generador';

const FECHA_CORTE = process.env.FECHA_CORTE ?? FECHA_CORTE_DEMO; // el "hoy" de la demo
const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
mkdirSync(salida, { recursive: true });

// La generación vive en src/lib/generador.ts (la web la usa para «Generar otra demo al azar»).
const { clientes, productos, ventas, trm, meta, extra } = generarDatos(SEMILLA_ORIGINAL, FECHA_CORTE);
const { azar, entero, trmDe, hoy, iso, DIA, DEMO, perfiles } = extra;
type Venta = (typeof ventas)[number];

const escribir = (nombre: string, datos: unknown) =>
  writeFileSync(join(salida, nombre), JSON.stringify(datos, null, 2) + '\n');

escribir('clientes.json', clientes);
escribir('productos.json', productos);
escribir('ventas.json', ventas);
escribir('trm.json', trm);
escribir('meta.json', meta);

// ---------- Archivos de ejemplo "regados" (public/ejemplos) ----------
// Las ventas de los últimos 60 días, repartidas en tres fuentes con formatos distintos,
// para demostrar en vivo que Órbita une y limpia datos de varias plataformas.
const ejemplos = join(salida, '..', '..', 'public', 'ejemplos');
mkdirSync(ejemplos, { recursive: true });
const csv = (filas: (string | number)[][], sep = ',') =>
  filas
    .map((f) =>
      f
        .map((c) => {
          const s = String(c);
          return s.includes(sep) || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(sep),
    )
    .join('\n') + '\n';
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const clientePorId = new Map(clientes.map((c) => [c.id, c]));
const productoPorId = new Map(productos.map((p) => [p.id, p]));
const internacional = new Set(['Quito', 'Miami', 'San Juan']);
// El Cliente 23 se ubica a mano más abajo, para contar su historia en la demo.
const recientes = ventas.filter((v) => v.fecha > iso(hoy - 60 * DIA) && v.id_cliente !== DEMO);
const comprasDemo = [...new Set(ventas.filter((v) => v.id_cliente === DEMO).map((v) => v.fecha))].sort();
const ultimaDemo = ventas.find((v) => v.id_cliente === DEMO && v.fecha === comprasDemo[comprasDemo.length - 1])!;
const penultimaDemo = ventas.find((v) => v.id_cliente === DEMO && v.fecha === comprasDemo[comprasDemo.length - 2])!;

const filasA: Venta[] = [];
const filasB: Venta[] = [];
const filasExcel: Venta[] = [];
for (const v of recientes) {
  // A = ERP de Colombia, B = sistema de las sedes internacionales.
  const enB = internacional.has(clientePorId.get(v.id_cliente)!.ciudad);
  (enB ? filasB : filasA).push(v);
  // Operaciones vuelve a digitar a mano cerca de un tercio de las ventas (duplicados).
  if (azar() < 0.35) filasExcel.push(v);
}

// Cliente 23 «regado»: su última compra está en el ERP (A) y también digitada a mano en el Excel
// (duplicado); la compra anterior la registró la sede internacional (B). Su nombre se escribe distinto
// en cada fuente: «Cliente 23» (A), «CLI-23» (B) y «CLIENTE 023» (Excel).
filasA.push(ultimaDemo);
filasA.sort((x, y) => x.fecha.localeCompare(y.fecha));
filasB.unshift(penultimaDemo);
const nombreEn = (v: Venta, fuente: 'A' | 'B' | 'X') =>
  v.id_cliente === DEMO ? { A: 'Cliente 23', B: 'CLI-23', X: 'CLIENTE 023' }[fuente] : fuente === 'A' ? clientePorId.get(v.id_cliente)!.nombre : v.id_cliente;

// Plataforma A: separador ";", fechas dd/mm/aaaa, nombres en vez de códigos, coma decimal.
writeFileSync(
  join(ejemplos, 'plataforma-a-erp-colombia.csv'),
  csv(
    [
      ['Fecha', 'Cliente', 'Producto', 'Cant.', 'Valor USD'],
      ...filasA.map((v) => {
        const [a, m, d] = v.fecha.split('-');
        return [`${d}/${m}/${a}`, nombreEn(v, 'A'), productoPorId.get(v.id_producto)!.nombre, v.cantidad, v.valor_usd.toFixed(2).replace('.', ',')];
      }),
    ],
    ';',
  ),
);

// Plataforma B: columnas en inglés, fecha con hora, códigos de cliente y producto.
writeFileSync(
  join(ejemplos, 'plataforma-b-internacional.csv'),
  csv([
    ['date', 'customer_id', 'sku', 'qty', 'amount_usd'],
    ...filasB.map((v) => [`${v.fecha} ${String(entero(8, 17)).padStart(2, '0')}:${String(entero(0, 59)).padStart(2, '0')}`, nombreEn(v, 'B'), v.id_producto, v.cantidad, v.valor_usd.toFixed(2)]),
  ]),
);

// Excel de Operaciones: mayúsculas, fecha "3-oct-2026", valor en pesos con TRM,
// más suciedad típica: una fila repetida, una fila vacía y un cliente sin código.
filasExcel.unshift(ultimaDemo);
const filasOps: (string | number)[][] = filasExcel.map((v) => {
  const [a, m, d] = v.fecha.split('-');
  return [
    `${Number(d)}-${MESES[Number(m) - 1]}-${a}`,
    nombreEn(v, 'X'),
    productoPorId.get(v.id_producto)!.nombre.toUpperCase(),
    v.cantidad,
    `$ ${v.valor_cop.toLocaleString('es-CO')}`,
    trmDe(new Date(`${v.fecha}T00:00:00Z`).getTime()).toFixed(2).replace('.', ','),
  ];
});
filasOps.splice(3, 0, filasOps[2]); // duplicado exacto
filasOps.splice(8, 0, ['', '', '', '', '', '']); // fila vacía
filasOps.push(['10-nov-2026', 'CLIENTE NUEVO', 'PORTÁTIL CORPORATIVO', 2, '$ 11.200.000', '4.290,00']);
writeFileSync(
  join(ejemplos, 'excel-operaciones.csv'),
  csv([['FECHA DE VENTA', 'COD. CLIENTE', 'REFERENCIA', 'UNIDADES', 'VALOR COP', 'TRM DEL DIA'], ...filasOps]),
);

const conteo = perfiles.reduce<Record<string, number>>((acc, p) => ({ ...acc, [p]: (acc[p] ?? 0) + 1 }), {});
console.log(`Datos generados en ${salida}`);
console.log(`  ${clientes.length} clientes ${JSON.stringify(conteo)}`);
console.log(`  ${productos.length} productos, ${ventas.length} ventas, ${trm.length} días de TRM`);
console.log(`  Ejemplos: A=${filasA.length} filas, B=${filasB.length} filas, Excel=${filasOps.length} filas`);
console.log(`  TRM hoy: ${trm[trm.length - 1].valor} | hace 30 días: ${trm[trm.length - 31].valor}`);
