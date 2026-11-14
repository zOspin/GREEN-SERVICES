/**
 * Punto único de acceso a los datos sintéticos y a los cálculos de la IA.
 * Se calcula una sola vez al cargar la app.
 */
import clientesJson from '../data/clientes.json';
import productosJson from '../data/productos.json';
import ventasJson from '../data/ventas.json';
import trmJson from '../data/trm.json';
import metaJson from '../data/meta.json';
import type { Cliente, Producto, Venta, Trm } from './types';
import {
  analizarClientes,
  backtest,
  generarAlertas,
  pronosticarVentas,
  serieMensual,
  ventasMesActual,
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
export const analisis = analizarClientes(clientes, ventas, productos, trm, HOY);
export const analisisPorId = new Map(analisis.map((a) => [a.cliente.id, a]));
export const alertas = generarAlertas(analisis, HOY);
export const pronostico = pronosticarVentas(ventas, HOY);
export const serie = serieMensual(ventas, HOY);
export const mesActual = ventasMesActual(ventas, HOY);
export const resultadoBacktest = backtest(clientes, ventas, productos, trm, HOY);
export const trmHoy = trm[trm.length - 1];
export const trmVariacion30 = variacionTrm30(trm, HOY);

export const conteoEstados = {
  activo: analisis.filter((a) => a.estado === 'activo').length,
  riesgo: analisis.filter((a) => a.estado === 'riesgo').length,
  frio: analisis.filter((a) => a.estado === 'frio').length,
};

// Pantalla "Ventas y TRM"
import { ventasPorCategoriaMes, ventasContraTrm, correlacion } from './analytics';
export const categoriasMes = ventasPorCategoriaMes(ventas, productos, HOY);
export const serieVentasTrm = ventasContraTrm(ventas, trm, HOY);
export const correlacionVentasTrm = correlacion(
  serieVentasTrm.map((p) => p.trm),
  serieVentasTrm.map((p) => p.usd),
);
