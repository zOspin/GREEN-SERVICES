/**
 * Punto único de acceso a los datos sintéticos y a los cálculos de la IA.
 *
 * - Lo que NO depende de los umbrales (ventas, TRM, pronóstico) se calcula una vez al cargar.
 * - Lo que SÍ depende (estados, alertas, backtest) se calcula con `calcularDatos(umbrales)`;
 *   las pantallas lo leen con el hook `useDatos()` (src/lib/umbrales.tsx), así se actualiza
 *   en vivo cuando se cambian los umbrales en la pantalla Configuración.
 */
import clientesJson from '../data/clientes.json';
import productosJson from '../data/productos.json';
import ventasJson from '../data/ventas.json';
import trmJson from '../data/trm.json';
import metaJson from '../data/meta.json';
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

export const clientes = clientesJson as Cliente[];
export const productos = productosJson as Producto[];
export const ventas = ventasJson as Venta[];
export const trm = trmJson as Trm[];
export const meta = metaJson;

/** "Hoy" de la demo: la fecha de corte de los datos sintéticos. */
export const HOY = new Date(`${meta.fecha_corte}T00:00:00Z`);

export const productoPorId = new Map(productos.map((p) => [p.id, p]));
export const pronostico = pronosticarVentas(ventas, HOY);
export const serie = serieMensual(ventas, HOY);
export const mesActual = ventasMesActual(ventas, HOY);
export const trmHoy = trm[trm.length - 1];
export const trmVariacion30 = variacionTrm30(trm, HOY);
/** TRM de hace 30 días (para mostrar el efecto del dólar en pesos). */
export const trmHace30 = trm[Math.max(0, trm.length - 31)];

// Panel financiero
export const categoriasMes = ventasPorCategoriaMes(ventas, productos, HOY);
export const serieVentasTrm = ventasContraTrm(ventas, trm, HOY);
export const correlacionVentasTrm = correlacion(
  serieVentasTrm.map((p) => p.trm),
  serieVentasTrm.map((p) => p.usd),
);

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
