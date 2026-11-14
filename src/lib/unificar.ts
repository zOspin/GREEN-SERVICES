/**
 * Unificación de datos "regados".
 *
 * Cada plataforma exporta las ventas a su manera: columnas con otros nombres,
 * fechas en otro formato, valores en pesos o en dólares, clientes por nombre o por código.
 * Este módulo traduce todo a un formato común, quita duplicados y reporta lo que no pudo leer.
 */
import type { Cliente, Producto, Trm } from './types';

export type CampoComun = 'fecha' | 'cliente' | 'producto' | 'cantidad' | 'valor_usd' | 'valor_cop' | 'trm';

/** Sinónimos conocidos para cada campo (sin tildes, en minúscula). */
const SINONIMOS: Record<CampoComun, string[]> = {
  fecha: ['fecha', 'date', 'fecha de venta', 'fecha venta', 'fecha factura', 'dia'],
  cliente: ['cliente', 'id cliente', 'id_cliente', 'cod cliente', 'codigo cliente', 'customer', 'customer id', 'customer_id', 'nit'],
  producto: ['producto', 'id producto', 'id_producto', 'sku', 'referencia', 'item', 'product'],
  cantidad: ['cantidad', 'cant', 'qty', 'quantity', 'unidades'],
  valor_usd: ['valor usd', 'valor_usd', 'amount usd', 'amount_usd', 'total usd', 'usd'],
  valor_cop: ['valor cop', 'valor_cop', 'total cop', 'cop', 'valor pesos'],
  trm: ['trm', 'trm del dia', 'tasa', 'tasa de cambio'],
};

export const NOMBRE_CAMPO: Record<CampoComun, { es: string; en: string }> = {
  fecha: { es: 'Fecha', en: 'Date' },
  cliente: { es: 'Cliente', en: 'Client' },
  producto: { es: 'Producto', en: 'Product' },
  cantidad: { es: 'Cantidad', en: 'Quantity' },
  valor_usd: { es: 'Valor USD', en: 'USD amount' },
  valor_cop: { es: 'Valor COP', en: 'COP amount' },
  trm: { es: 'TRM', en: 'Exchange rate' },
};

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[._\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Relaciona cada columna del archivo con un campo común (o con nada). */
export function reconocerColumnas(columnas: string[]): Record<string, CampoComun | null> {
  const mapa: Record<string, CampoComun | null> = {};
  for (const col of columnas) {
    const n = normalizar(col);
    const campo = (Object.keys(SINONIMOS) as CampoComun[]).find((c) => SINONIMOS[c].some((s) => normalizar(s) === n));
    mapa[col] = campo ?? null;
  }
  return mapa;
}

const MESES: Record<string, number> = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, sept: 9, oct: 10, nov: 11, dic: 12 };
const dos = (n: number) => String(n).padStart(2, '0');

/** Convierte fechas en varios formatos a "aaaa-mm-dd". */
export function leerFecha(valor: unknown): string | null {
  if (valor instanceof Date && !isNaN(valor.getTime())) return valor.toISOString().slice(0, 10);
  if (typeof valor === 'number' && valor > 20000 && valor < 80000) {
    // Número de serie de Excel (días desde 1899-12-30)
    return new Date(Date.UTC(1899, 11, 30) + valor * 86_400_000).toISOString().slice(0, 10);
  }
  const s = String(valor ?? '').trim().toLowerCase();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); // 2026-10-03 o 2026-10-03 14:20
  if (m) return `${m[1]}-${dos(+m[2])}-${dos(+m[3])}`;
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // 03/10/2026 (día/mes/año, formato colombiano)
  if (m) return `${m[3]}-${dos(+m[2])}-${dos(+m[1])}`;
  m = s.match(/^(\d{1,2})[-\s]([a-z]{3,4})\.?[-\s](\d{4})$/); // 3-oct-2026
  if (m && MESES[m[2]]) return `${m[3]}-${dos(MESES[m[2]])}-${dos(+m[1])}`;
  return null;
}

/**
 * Convierte "1.234,56", "1,234.56", "$ 4.500.000" o 1234.56 en número.
 * Regla: el último separador que aparece es el decimal si le siguen 1 o 2 dígitos.
 */
export function leerNumero(valor: unknown): number | null {
  if (typeof valor === 'number') return valor;
  let s = String(valor ?? '').replace(/[^\d.,-]/g, '');
  if (!s) return null;
  const ultimo = Math.max(s.lastIndexOf('.'), s.lastIndexOf(','));
  if (ultimo >= 0 && s.length - ultimo - 1 <= 2) {
    s = s.slice(0, ultimo).replace(/[.,]/g, '') + '.' + s.slice(ultimo + 1);
  } else {
    s = s.replace(/[.,]/g, '');
  }
  const n = Number(s);
  return isNaN(n) ? null : n;
}

export interface VentaUnificada {
  fecha: string;
  id_cliente: string;
  id_producto: string;
  cantidad: number;
  valor_usd: number;
  origen: string;
}

export interface Problema {
  origen: string;
  fila: number;
  motivo: { es: string; en: string };
}

export interface ResultadoArchivo {
  nombre: string;
  filasLeidas: number;
  columnas: Record<string, CampoComun | null>;
  esVentas: boolean;
  validas: number;
  vacias: number;
}

export interface ResultadoUnion {
  archivos: ResultadoArchivo[];
  ventas: VentaUnificada[];
  duplicados: number;
  problemas: Problema[];
  coincidenConBase: number;
}

interface Contexto {
  clientes: Cliente[];
  productos: Producto[];
  trm: Trm[];
  ventasBase: { fecha: string; id_cliente: string; id_producto: string; cantidad: number; valor_usd: number }[];
}

/** Une varios archivos de ventas en una sola tabla limpia. */
export function unirArchivos(entradas: { nombre: string; filas: Record<string, unknown>[] }[], ctx: Contexto): ResultadoUnion {
  // Diccionarios para traducir nombres y códigos a los identificadores oficiales.
  const clientePorClave = new Map<string, string>();
  for (const c of ctx.clientes) {
    clientePorClave.set(normalizar(c.id), c.id);
    clientePorClave.set(normalizar(c.nombre), c.id);
    clientePorClave.set(String(Number(c.id.slice(4))), c.id); // "7" → CLI-007
  }
  const productoPorClave = new Map<string, string>();
  for (const p of ctx.productos) {
    productoPorClave.set(normalizar(p.id), p.id);
    productoPorClave.set(normalizar(p.nombre), p.id);
  }
  const trmPorFecha = new Map(ctx.trm.map((t) => [t.fecha, t.valor]));

  const clave = (v: { fecha: string; id_cliente: string; id_producto: string; cantidad: number }) =>
    `${v.fecha}|${v.id_cliente}|${v.id_producto}|${v.cantidad}`;
  const base = new Set(ctx.ventasBase.map((v) => `${clave(v)}|${Math.round(v.valor_usd)}`));

  const archivos: ResultadoArchivo[] = [];
  const problemas: Problema[] = [];
  const vistas = new Map<string, VentaUnificada[]>();
  let duplicados = 0;

  for (const { nombre, filas } of entradas) {
    const columnas = reconocerColumnas(filas.length ? Object.keys(filas[0]) : []);
    const colDe = (campo: CampoComun) => Object.keys(columnas).find((k) => columnas[k] === campo);
    const campos = new Set(Object.values(columnas));
    const esVentas = campos.has('fecha') && campos.has('cliente') && campos.has('producto') && (campos.has('valor_usd') || campos.has('valor_cop'));
    const resumen: ResultadoArchivo = { nombre, filasLeidas: filas.length, columnas, esVentas, validas: 0, vacias: 0 };
    archivos.push(resumen);
    if (!esVentas) continue;

    filas.forEach((f, i) => {
      const fila = i + 2; // +1 por el encabezado y +1 porque las filas se cuentan desde 1
      const valores = Object.values(f).map((x) => String(x ?? '').trim());
      if (valores.every((x) => !x)) {
        resumen.vacias++;
        return;
      }
      const fecha = leerFecha(f[colDe('fecha')!]);
      const id_cliente = clientePorClave.get(normalizar(String(f[colDe('cliente')!] ?? '')));
      const id_producto = productoPorClave.get(normalizar(String(f[colDe('producto')!] ?? '')));
      const cantidad = colDe('cantidad') ? (leerNumero(f[colDe('cantidad')!]) ?? 1) : 1;
      const v = (campo: CampoComun) => String(f[colDe(campo)!] ?? '');
      if (!fecha) return problemas.push({ origen: nombre, fila, motivo: { es: `Fecha no reconocida: «${v('fecha')}»`, en: `Unrecognized date: "${v('fecha')}"` } });
      if (!id_cliente) return problemas.push({ origen: nombre, fila, motivo: { es: `Cliente sin código conocido: «${v('cliente')}»`, en: `Client without a known code: "${v('cliente')}"` } });
      if (!id_producto) return problemas.push({ origen: nombre, fila, motivo: { es: `Producto no reconocido: «${v('producto')}»`, en: `Unrecognized product: "${v('producto')}"` } });

      // Valor en USD: directo, o convertido desde pesos con la TRM de la fila (o la del día).
      let valor_usd = colDe('valor_usd') ? leerNumero(f[colDe('valor_usd')!]) : null;
      if (valor_usd === null && colDe('valor_cop')) {
        const cop = leerNumero(f[colDe('valor_cop')!]);
        const tasa = (colDe('trm') ? leerNumero(f[colDe('trm')!]) : null) ?? trmPorFecha.get(fecha) ?? null;
        if (cop !== null && tasa) valor_usd = Math.round((cop / tasa) * 100) / 100;
      }
      if (valor_usd === null) return problemas.push({ origen: nombre, fila, motivo: { es: 'Sin valor de venta', en: 'Missing sale amount' } });

      const venta: VentaUnificada = { fecha, id_cliente, id_producto, cantidad, valor_usd, origen: nombre };
      resumen.validas++;
      // Duplicado: misma fecha, cliente, producto y cantidad, y valor casi igual (±1 %),
      // aunque venga de otra plataforma (el valor en pesos convertido puede variar unos centavos).
      const iguales = vistas.get(clave(venta)) ?? [];
      if (iguales.some((o) => Math.abs(o.valor_usd - venta.valor_usd) <= o.valor_usd * 0.01)) duplicados++;
      else vistas.set(clave(venta), [...iguales, venta]);
    });
  }

  const ventas = [...vistas.values()].flat().sort((a, b) => a.fecha.localeCompare(b.fecha));
  return {
    archivos,
    ventas,
    duplicados,
    problemas,
    coincidenConBase: ventas.filter((v) => base.has(`${clave(v)}|${Math.round(v.valor_usd)}`)).length,
  };
}
