/**
 * Convierte el resultado del Centro de datos (archivos reales ya unidos y limpios)
 * en los datos que usa el modo Real. No inventa nada: solo usa lo que vino en los archivos.
 */
import type { ResultadoUnion } from './unificar';
import type { DatosReales } from './modo';
import type { Trm } from './types';

const DIA = 86_400_000;
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const ms = (f: string) => new Date(`${f}T00:00:00Z`).getTime();

/** Columnas de la plantilla: obligatorias primero, opcionales después. */
export const COLUMNAS_PLANTILLA = [
  { columna: 'fecha', obligatoria: true, es: 'Fecha de la venta (dd/mm/aaaa o aaaa-mm-dd)', en: 'Sale date (dd/mm/yyyy or yyyy-mm-dd)' },
  { columna: 'cliente', obligatoria: true, es: 'Código o nombre anonimizado del cliente (ej. «Cliente 23»)', en: 'Client code or anonymized name (e.g. "Client 23")' },
  { columna: 'producto', obligatoria: true, es: 'Producto o servicio vendido', en: 'Product or service sold' },
  { columna: 'valor_usd', obligatoria: true, es: 'Valor en dólares (o usa valor_cop + trm)', en: 'Amount in US dollars (or use valor_cop + trm)' },
  { columna: 'cantidad', obligatoria: false, es: 'Unidades (si no viene, se toma 1)', en: 'Units (defaults to 1)' },
  { columna: 'valor_cop', obligatoria: false, es: 'Valor en pesos', en: 'Amount in Colombian pesos' },
  { columna: 'trm', obligatoria: false, es: 'TRM del día de la venta', en: 'Exchange rate on the sale date' },
  { columna: 'categoria', obligatoria: false, es: 'Categoría del producto (Redes, Nube…)', en: 'Product category (Networking, Cloud…)' },
  { columna: 'tipo', obligatoria: false, es: '«producto» o «servicio recurrente» (licencias, suscripciones)', en: '"producto" or "servicio recurrente" (licenses, subscriptions)' },
  { columna: 'sector', obligatoria: false, es: 'Sector del cliente (salud, educación…)', en: 'Client sector (healthcare, education…)' },
  { columna: 'ciudad', obligatoria: false, es: 'Ciudad del cliente', en: 'Client city' },
] as const;

/** TRM diaria continua: rellena los días sin dato con el último valor conocido. */
function trmDiaria(puntos: Trm[], desde: string, hasta: string): Trm[] {
  if (!puntos.length) return [];
  const porFecha = new Map(puntos.map((p) => [p.fecha, p.valor]));
  const salida: Trm[] = [];
  let ultimo = puntos[0].valor;
  for (let t = ms(desde); t <= ms(hasta); t += DIA) {
    const f = iso(t);
    ultimo = porFecha.get(f) ?? ultimo;
    salida.push({ fecha: f, valor: ultimo });
  }
  return salida;
}

export function armarDatosReales(u: ResultadoUnion, archivos: string[]): DatosReales {
  const ventas = u.ventas.map((v, i) => ({
    id: `VR-${String(i + 1).padStart(6, '0')}`,
    fecha: v.fecha,
    id_cliente: v.id_cliente,
    id_producto: v.id_producto,
    cantidad: v.cantidad,
    valor_usd: v.valor_usd,
    valor_cop: v.valor_cop,
  }));
  const fechas = ventas.map((v) => v.fecha).sort();
  const inicio = fechas[0] ?? null;
  // «Hoy» de los datos reales = la fecha de la última venta (el día de la exportación).
  const corte = fechas[fechas.length - 1] ?? null;
  const meses = inicio && corte ? Math.max(1, Math.round((ms(corte) - ms(inicio)) / (30.44 * DIA))) : 0;
  return {
    clientes: u.clientesNuevos,
    productos: u.productosNuevos,
    ventas,
    trm: inicio && corte ? trmDiaria(u.trmLeida, inicio, corte) : [],
    meta: { fecha_corte: corte, fecha_inicio: inicio, meses_historia: meses, guardado: new Date().toISOString(), archivos },
  };
}
