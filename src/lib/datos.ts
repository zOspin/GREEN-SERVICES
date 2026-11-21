/**
 * Punto único de acceso a los datos (Demo o Real, ver src/lib/modo.ts) y a los cálculos de la IA.
 *
 * - Lo que NO depende de los umbrales (ventas, TRM, pronóstico) se calcula una vez al cargar.
 * - Lo que SÍ depende (estados, alertas, backtest) se calcula con `calcularDatos(umbrales)`;
 *   las pantallas lo leen con el hook `useDatos()` (src/lib/umbrales.tsx), así se actualiza
 *   en vivo cuando se cambian los umbrales en la pantalla Configuración.
 */
import clientesOriginal from '../data/clientes.json';
import productosOriginal from '../data/productos.json';
import ventasOriginal from '../data/ventas.json';
import trmOriginal from '../data/trm.json';
import metaOriginal from '../data/meta.json';
import clientesReal from '../data/real/clientes.json';
import productosReal from '../data/real/productos.json';
import ventasReal from '../data/real/ventas.json';
import trmReal from '../data/real/trm.json';
import metaReal from '../data/real/meta.json';
import { esDemoOriginal, leerDatosReales, MODO, SEMILLA } from './modo';
import { generarDatos } from './generador';
import { entrenarModelo, validarVariosMeses, type ValidacionMeses } from './modelo';
import type { Cliente, Producto, Venta, Trm } from './types';
import type { Umbrales } from '../config/umbrales';
import {
  analizarClientes,
  backtest,
  correlacion,
  generarAlertas,
  pronosticarVentas,
  serieMensual,
  valorEnRiesgo,
  ventasContraTrm,
  ventasMesActual,
  ventasPorCategoriaMes,
  variacionTrm30,
} from './analytics';

export { MODO, SEMILLA, esDemoOriginal };
const real = MODO === 'real';

type Meta = { fecha_corte: string | null; fecha_inicio: string | null; meses_historia: number };
interface Conjunto {
  clientes: Cliente[];
  productos: Producto[];
  ventas: Venta[];
  trm: Trm[];
  meta: Meta;
}

/**
 * Qué datos usa la web:
 * - Demo original: los archivos de src/data/ (los del guion).
 * - Demo al azar: se generan en el navegador con otra semilla (mismo generador).
 * - Real: lo que se subió en el Centro de datos (guardado en este navegador) o, si no hay, src/data/real/ (vacío).
 */
function elegirConjunto(): Conjunto {
  if (real) {
    const guardados = leerDatosReales();
    if (guardados) return guardados;
    return { clientes: clientesReal, productos: productosReal, ventas: ventasReal, trm: trmReal, meta: metaReal } as Conjunto;
  }
  if (esDemoOriginal) {
    return { clientes: clientesOriginal, productos: productosOriginal, ventas: ventasOriginal, trm: trmOriginal, meta: metaOriginal } as Conjunto;
  }
  return generarDatos(SEMILLA) as Conjunto;
}
const conjunto = elegirConjunto();

export const clientes = conjunto.clientes;
export const productos = conjunto.productos;
export const ventas = conjunto.ventas;
export const trm = conjunto.trm;

/** Fecha de hoy (UTC, sin hora) en formato AAAA-MM-DD. */
const hoyIso = new Date().toISOString().slice(0, 10);
const metaBase = conjunto.meta;
export const meta = {
  ...metaBase,
  // En modo Real sin fecha de corte, «hoy» es la fecha actual.
  fecha_corte: metaBase.fecha_corte ?? hoyIso,
  fecha_inicio: metaBase.fecha_inicio ?? ventas[0]?.fecha ?? hoyIso,
};

/** ¿Hay datos para analizar? En modo Real queda en falso hasta que se carguen los datos de Green Services. */
export const hayDatos = ventas.length > 0;

/** "Hoy" de los datos: la fecha de corte (en la demo, la de los datos sintéticos). */
export const HOY = new Date(`${meta.fecha_corte}T00:00:00Z`);

export const productoPorId = new Map(productos.map((p) => [p.id, p]));
export const clientePorId = new Map(clientes.map((c) => [c.id, c]));
export const pronostico = pronosticarVentas(ventas, HOY);
export const serie = serieMensual(ventas, HOY);
export const mesActual = ventasMesActual(ventas, HOY);
/** Sin TRM (modo Real vacío) se usa un valor 0 para que las pantallas muestren cero en vez de fallar. */
const TRM_VACIA: Trm = { fecha: meta.fecha_corte, valor: 0 };
export const trmHoy = trm[trm.length - 1] ?? TRM_VACIA;
export const trmVariacion30 = variacionTrm30(trm, HOY);
/** TRM de hace 30 días (para mostrar el efecto del dólar en pesos). */
export const trmHace30 = trm[Math.max(0, trm.length - 31)] ?? TRM_VACIA;

// Panel financiero
export const categoriasMes = ventasPorCategoriaMes(ventas, productos, HOY);
export const serieVentasTrm = ventasContraTrm(ventas, trm, HOY);
export const correlacionVentasTrm = correlacion(
  serieVentasTrm.map((p) => p.trm),
  serieVentasTrm.map((p) => p.usd),
);

/**
 * Modelo predictivo (regresión logística) entrenado con el historial: probabilidad de compra
 * en los próximos 30 días por cliente, y su validación. No depende de los umbrales.
 */
export const modelo = entrenarModelo(clientes, ventas, productos, HOY);

/** Validación del modelo en 6 meses: se calcula la primera vez que se pide (cuesta ~0,5 s) y se guarda. */
let validacionMesesGuardada: ValidacionMeses | null | undefined;
export function validacionMeses(): ValidacionMeses | null {
  if (validacionMesesGuardada === undefined) validacionMesesGuardada = validarVariosMeses(clientes, ventas, productos, HOY, 6);
  return validacionMesesGuardada;
}

/** Cliente protagonista de la historia de la demo. */
export const CLIENTE_DEMO = 'CLI-023';

/** Todo lo que cambia si cambian los umbrales. */
export function calcularDatos(u: Umbrales) {
  const analisis = analizarClientes(clientes, ventas, productos, trm, HOY, u);
  return {
    analisis,
    analisisPorId: new Map(analisis.map((a) => [a.cliente.id, a])),
    alertas: generarAlertas(analisis, HOY),
    conteoEstados: {
      activo: analisis.filter((a) => a.estado === 'activo').length,
      riesgo: analisis.filter((a) => a.estado === 'riesgo').length,
      frio: analisis.filter((a) => a.estado === 'frio').length,
    },
    // Dinero al año que representan los clientes en riesgo y los inactivos recuperables
    enRiesgo: valorEnRiesgo(analisis, HOY),
    resultadoBacktest: backtest(clientes, ventas, productos, trm, HOY, 60, u),
  };
}
export type Datos = ReturnType<typeof calcularDatos>;
