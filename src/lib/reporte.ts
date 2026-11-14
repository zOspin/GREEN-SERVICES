/**
 * Reporte automático del mes: reemplaza la consolidación manual en Excel.
 * Compara cómo estaban los clientes al cierre del mes contra el cierre del mes anterior.
 */
import { analizarClientes, generarAlertas, sumarMeses, ventasPorMes, DIA, type AnalisisCliente } from './analytics';
import { clientes, productos, trm, ventas, HOY } from './datos';


/** Último día del mes (a medianoche UTC). */
const finDeMes = (clave: string) => new Date(new Date(`${sumarMeses(clave, 1)}-01T00:00:00Z`).getTime() - DIA);

const trmAl = (d: Date) => {
  const iso = d.toISOString().slice(0, 10);
  const lista = trm.filter((t) => t.fecha <= iso);
  return lista[lista.length - 1]?.valor ?? 0;
};

export interface ReporteMes {
  clave: string;
  usd: number;
  cop: number;
  variacion: number; // vs. mes anterior en USD
  numVentas: number;
  clientesCompradores: number;
  trmInicio: number;
  trmFin: number;
  variacionTrm: number;
  pasaronARiesgo: AnalisisCliente[];
  pasaronAFrio: AnalisisCliente[];
  recuperados: AnalisisCliente[];
  estados: { activo: number; riesgo: number; frio: number };
  topClientes: { nombre: string; id: string; usd: number }[];
  topCategorias: { categoria: string; usd: number }[];
  prioridades: AnalisisCliente[];
}

/** Meses cerrados disponibles para el reporte (más reciente primero). */
export function mesesDisponibles(n = 6): string[] {
  const actual = HOY.toISOString().slice(0, 7);
  return Array.from({ length: n }, (_, i) => sumarMeses(actual, -(i + 1)));
}

export function generarReporte(clave: string): ReporteMes {
  const fin = finDeMes(clave);
  const finAnterior = finDeMes(sumarMeses(clave, -1));
  const porMes = ventasPorMes(ventas);
  const actual = porMes.get(clave) ?? { usd: 0, cop: 0 };
  const anterior = porMes.get(sumarMeses(clave, -1)) ?? { usd: 0, cop: 0 };
  const delMes = ventas.filter((v) => v.fecha.startsWith(clave));

  const antes = new Map(analizarClientes(clientes, ventas, productos, trm, finAnterior).map((a) => [a.cliente.id, a]));
  const ahora = analizarClientes(clientes, ventas, productos, trm, fin);
  const cambio = (de: string, a: string) => ahora.filter((x) => x.estado === a && antes.get(x.cliente.id)?.estado === de);

  const porCliente = new Map<string, number>();
  for (const v of delMes) porCliente.set(v.id_cliente, (porCliente.get(v.id_cliente) ?? 0) + v.valor_usd);
  const catDe = new Map(productos.map((p) => [p.id, p.categoria]));
  const porCategoria = new Map<string, number>();
  for (const v of delMes) porCategoria.set(catDe.get(v.id_producto)!, (porCategoria.get(catDe.get(v.id_producto)!) ?? 0) + v.valor_usd);

  const trmInicio = trmAl(finAnterior);
  const trmFin = trmAl(fin);

  return {
    clave,
    usd: actual.usd,
    cop: actual.cop,
    variacion: anterior.usd ? (actual.usd - anterior.usd) / anterior.usd : 0,
    numVentas: delMes.length,
    clientesCompradores: porCliente.size,
    trmInicio,
    trmFin,
    variacionTrm: trmInicio ? (trmFin - trmInicio) / trmInicio : 0,
    pasaronARiesgo: cambio('activo', 'riesgo'),
    pasaronAFrio: [...cambio('activo', 'frio'), ...cambio('riesgo', 'frio')],
    recuperados: [...cambio('riesgo', 'activo'), ...cambio('frio', 'activo')],
    estados: {
      activo: ahora.filter((a) => a.estado === 'activo').length,
      riesgo: ahora.filter((a) => a.estado === 'riesgo').length,
      frio: ahora.filter((a) => a.estado === 'frio').length,
    },
    topClientes: [...porCliente.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, usd]) => ({ id, usd, nombre: clientes.find((c) => c.id === id)!.nombre })),
    topCategorias: [...porCategoria.entries()].map(([categoria, usd]) => ({ categoria, usd })).sort((a, b) => b.usd - a.usd),
    prioridades: generarAlertas(ahora, fin)
      .filter((x) => x.tipo !== 'recompra')
      .slice(0, 3)
      .map((x) => x.analisis),
  };
}

