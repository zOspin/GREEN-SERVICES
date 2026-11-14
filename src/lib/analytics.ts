/**
 * Lógica de "IA" de Órbita Pulse.
 *
 * Es deliberadamente simple y explicable: no hay cajas negras.
 * La idea es la misma de la panadería del barrio: si un vecino compra pan
 * cada 3 días y lleva 10 sin aparecer, la dueña nota que algo pasó.
 * Aquí hacemos eso con cada cliente, usando su propio ritmo de compra.
 */
import type { Cliente, Producto, Venta, Trm } from './types';
import { categoria as cat, producto as prod, sector as sec } from './catalogo';
import { UMBRALES, type Umbrales } from '../config/umbrales';

/** Texto en los dos idiomas de la interfaz. */
export interface Bi {
  es: string;
  en: string;
}
const dec = (n: number, i: 'es' | 'en') => (i === 'es' ? n.toFixed(1).replace('.', ',') : n.toFixed(1));

export const DIA = 86_400_000;

// Los umbrales de estado (1,2× / 2× / 180 días) viven en src/config/umbrales.ts y se pueden
// cambiar en vivo desde la pantalla Configuración; por eso las funciones los reciben como parámetro.
// Compras mínimas para calcular el ciclo propio del cliente.
export const MIN_COMPRAS_CICLO = 3;
// Si el dólar sube más de esto en 30 días, los clientes tienden a aplazar compras en USD.
export const UMBRAL_SUBIDA_TRM = 0.05;

export type Estado = 'activo' | 'riesgo' | 'frio';

export interface AnalisisCliente {
  cliente: Cliente;
  ventas: Venta[]; // ventas del cliente, ordenadas por fecha
  ultimaCompra: Date | null;
  recencia: number; // R: días desde la última compra
  frecuencia: number; // F: número de compras (días distintos con compra)
  montoUsd: number; // M: total comprado en USD
  montoCop: number;
  ciclo: number; // promedio de días entre compras
  cicloEstimado: boolean; // true si el cliente tiene muy pocas compras y usamos el ciclo general
  proximaCompra: Date | null;
  ratio: number;
  puntaje: number; // riesgo 0–100
  estado: Estado;
  ultimaCategoria: string | null;
  categoriaPrincipal: string | null;
  productoRecomendado: RecomendacionProducto | null;
  recomendacion: Bi;
}

/** Análisis de un cliente antes de calcular su recomendación. */
type Parcial = Omit<AnalisisCliente, 'recomendacion' | 'productoRecomendado'>;

const diasEntre = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DIA);
const fecha = (s: string) => new Date(`${s}T00:00:00Z`);

/** Variación porcentual de la TRM en los últimos 30 días antes de `hoy`. */
export function variacionTrm30(trm: Trm[], hoy: Date): number {
  const hasta = trm.filter((t) => fecha(t.fecha) <= hoy);
  if (hasta.length < 31) return 0;
  const actual = hasta[hasta.length - 1].valor;
  const antes = hasta[hasta.length - 31].valor;
  return (actual - antes) / antes;
}

/**
 * Convierte el ratio (recencia / ciclo) en un puntaje de 0 a 100.
 *  - ratio 0 → 1          : 0 a 30 puntos (va al día)
 *  - ratio 1 → inactivo   : 30 a 80 puntos (se está atrasando)
 *  - ratio > inactivo     : 80 a 100 puntos (muy atrasado)
 */
function puntajeDesdeRatio(ratio: number, u: Umbrales): number {
  if (ratio <= 1) return ratio * 30;
  if (ratio <= u.inactivo) return 30 + ((ratio - 1) / Math.max(0.01, u.inactivo - 1)) * 50;
  return Math.min(100, 80 + (ratio - u.inactivo) * 10);
}

export function estadoDesde(ratio: number, recencia: number, u: Umbrales = UMBRALES): Estado {
  if (ratio > u.inactivo || recencia > u.diasMaximosSinComprar) return 'frio';
  if (ratio > u.riesgo) return 'riesgo';
  return 'activo';
}

// ---------------------------------------------------------------------------
// Recomendación de producto
// ---------------------------------------------------------------------------

export interface RecomendacionProducto {
  producto: Producto;
  tipo: 'renovacion' | 'venta-cruzada' | 'popular';
  motivo: Bi; // explicación en lenguaje simple de por qué se recomienda
  /** Valor estimado de la oportunidad en USD: lo que este cliente suele pagar por ese producto
   *  (renovación) o lo que se paga en promedio por él (venta cruzada). */
  valorEstimado: number;
}

/**
 * Elige qué producto ofrecerle a un cliente con tres reglas, en este orden:
 *  1. Renovación: si tiene un servicio recurrente (licencia, soporte, suscripción)
 *     y ya pasó el tiempo en que normalmente lo vuelve a comprar.
 *  2. Venta cruzada: "clientes del mismo sector que compraron X también compraron Y".
 *  3. Lo más vendido en su sector, si no hay suficiente información.
 */
function elegirProducto(
  a: Parcial,
  todos: Parcial[],
  productoPorId: Map<string, Producto>,
): Omit<RecomendacionProducto, 'valorEstimado'> | null {
  if (!a.ventas.length) return null;
  const hoyCliente = a.ultimaCompra ? a.ultimaCompra.getTime() + a.recencia * DIA : Date.now();

  // 1. Renovación de servicios recurrentes vencidos
  const porProducto = new Map<string, string[]>();
  for (const v of a.ventas) {
    const lista = porProducto.get(v.id_producto) ?? [];
    if (!lista.includes(v.fecha)) lista.push(v.fecha);
    porProducto.set(v.id_producto, lista);
  }
  let mejorRenovacion: { p: Producto; atraso: number; dias: number; cada: number } | null = null;
  for (const [id, fechas] of porProducto) {
    const p = productoPorId.get(id);
    // Solo servicios recurrentes que ya compró al menos 2 veces (hay un patrón de renovación).
    if (!p || p.tipo !== 'servicio recurrente' || fechas.length < 2) continue;
    fechas.sort();
    // Cada cuánto lo renueva: su propio intervalo entre compras de ese servicio.
    const cada = Math.max(a.ciclo, cicloPromedio(fechas));
    const dias = Math.round((hoyCliente - fecha(fechas[fechas.length - 1]).getTime()) / DIA);
    const atraso = dias / cada;
    // Vencido, pero no hace tanto (máximo 3 veces su intervalo: si pasó más, probablemente
    // ya no usa ese servicio). Si hay varios, el que venció más recientemente.
    if (atraso > 1 && atraso <= 3 && (!mejorRenovacion || atraso < mejorRenovacion.atraso)) {
      mejorRenovacion = { p, atraso, dias, cada: Math.round(cada) };
    }
  }
  if (mejorRenovacion) {
    const { p, dias, cada } = mejorRenovacion;
    return {
      producto: p,
      tipo: 'renovacion',
      motivo: {
        es: `Es un servicio recurrente que suele renovar cada ${cada} días y lleva ${dias} sin renovarlo: ya le toca.`,
        en: `It's a recurring service they usually renew every ${cada} days, and it's been ${dias} days since the last renewal: it's due.`,
      },
    };
  }

  // 2. Venta cruzada: su producto más comprado (X) y lo que compraron otros clientes con X (Y)
  const compradosPorMi = new Set(a.ventas.map((v) => v.id_producto));
  const conteoMio = new Map<string, number>();
  for (const v of a.ventas) conteoMio.set(v.id_producto, (conteoMio.get(v.id_producto) ?? 0) + 1);
  const x = [...conteoMio.entries()].sort((m, n) => n[1] - m[1])[0][0];
  const productosDe = (o: Parcial) => new Set(o.ventas.map((v) => v.id_producto));

  for (const [grupo, otros] of [
    [
      { es: `clientes de ${a.cliente.sector}`, en: `${sec(a.cliente.sector, 'en')} clients` },
      todos.filter((o) => o.cliente.id !== a.cliente.id && o.cliente.sector === a.cliente.sector),
    ],
    [{ es: 'clientes', en: 'clients' }, todos.filter((o) => o.cliente.id !== a.cliente.id)],
  ] as const) {
    const conX = otros.filter((o) => productosDe(o).has(x));
    if (conX.length < 2) continue;
    const conteoY = new Map<string, number>();
    for (const o of conX) for (const id of productosDe(o)) if (!compradosPorMi.has(id)) conteoY.set(id, (conteoY.get(id) ?? 0) + 1);
    const top = [...conteoY.entries()].sort((m, n) => n[1] - m[1])[0];
    if (top && top[1] >= 2) {
      const y = productoPorId.get(top[0])!;
      return {
        producto: y,
        tipo: 'venta-cruzada',
        motivo: {
          es: `${top[1]} de ${conX.length} ${grupo.es} que compraron ${productoPorId.get(x)?.nombre} también compraron ${y.nombre}, y este cliente aún no lo tiene.`,
          en: `${top[1]} of ${conX.length} ${grupo.en} who bought ${prod(productoPorId.get(x)?.nombre ?? '', 'en')} also bought ${prod(y.nombre, 'en')}, and this client doesn't have it yet.`,
        },
      };
    }
  }

  // 3. Lo más vendido en su sector que aún no tiene
  const conteoSector = new Map<string, number>();
  for (const o of todos) {
    if (o.cliente.sector !== a.cliente.sector) continue;
    for (const v of o.ventas) if (!compradosPorMi.has(v.id_producto)) conteoSector.set(v.id_producto, (conteoSector.get(v.id_producto) ?? 0) + 1);
  }
  const masVendido = [...conteoSector.entries()].sort((m, n) => n[1] - m[1])[0];
  if (!masVendido) return null;
  const p = productoPorId.get(masVendido[0])!;
  return {
    producto: p,
    tipo: 'popular',
    motivo: {
      es: `Es uno de los productos más vendidos en el sector ${a.cliente.sector} y este cliente aún no lo tiene.`,
      en: `It's one of the best sellers in the ${sec(a.cliente.sector, 'en')} sector, and this client doesn't have it yet.`,
    },
  };
}

export function recomendarProducto(
  a: Parcial,
  todos: Parcial[],
  productoPorId: Map<string, Producto>,
): RecomendacionProducto | null {
  const rec = elegirProducto(a, todos, productoPorId);
  if (!rec) return null;
  // Valor de una compra de ese producto (sumando las líneas del mismo día).
  const promedioPorCompra = (ventas: Venta[]) => {
    const porDia = new Map<string, number>();
    for (const v of ventas) if (v.id_producto === rec.producto.id) porDia.set(`${v.id_cliente}|${v.fecha}`, (porDia.get(`${v.id_cliente}|${v.fecha}`) ?? 0) + v.valor_usd);
    const valores = [...porDia.values()];
    return valores.length ? valores.reduce((s, x) => s + x, 0) / valores.length : 0;
  };
  const propio = promedioPorCompra(a.ventas);
  const general = promedioPorCompra(todos.flatMap((o) => o.ventas));
  const valorEstimado = Math.round(rec.tipo === 'renovacion' && propio ? propio : general || rec.producto.precio_usd);
  return { ...rec, valorEstimado };
}

const diaMes = (d: Date, i: 'es' | 'en') =>
  d.toLocaleDateString(i === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', timeZone: 'UTC' });

/** Texto de recomendación, armado con plantillas en español e inglés. */
function recomendar(a: Parcial, rec: RecomendacionProducto | null, subidaTrm: number): Bi {
  return { es: recomendarEn(a, rec, subidaTrm, 'es'), en: recomendarEn(a, rec, subidaTrm, 'en') };
}

function recomendarEn(a: Parcial, rec: RecomendacionProducto | null, subidaTrm: number, i: 'es' | 'en'): string {
  const es = i === 'es';
  if (!a.ultimaCompra) return es ? 'Aún no tiene compras registradas. Agenda una visita de presentación.' : 'No purchases yet. Schedule an introductory visit.';
  const ultima = a.ultimaCategoria ? cat(a.ultimaCategoria, i) : es ? 'sus productos' : 'their products';
  const nombre = rec ? prod(rec.producto.nombre, i) : '';
  const oferta = !rec
    ? es ? 'una propuesta a su medida' : 'a tailored proposal'
    : rec.tipo === 'renovacion'
      ? es ? `la renovación de ${nombre}` : `a renewal of ${nombre}`
      : nombre;
  const ciclo = Math.round(a.ciclo);
  const partes: string[] = [];

  if (a.estado === 'activo') {
    partes.push(
      es ? `Va al día: compra cada ${ciclo} días y lleva ${a.recencia} sin comprar.` : `On track: buys every ${ciclo} days and last bought ${a.recencia} days ago.`,
      a.proximaCompra
        ? es
          ? `Su próxima compra estimada es el ${diaMes(a.proximaCompra, i)}. Prepárale una propuesta de ${oferta} unos días antes.`
          : `Next estimated purchase: ${diaMes(a.proximaCompra, i)}. Prepare a proposal for ${oferta} a few days before.`
        : '',
    );
  } else if (a.estado === 'riesgo') {
    partes.push(
      es
        ? `Compra cada ${ciclo} días y lleva ${a.recencia} sin comprar. Su última compra fue ${ultima}.`
        : `Buys every ${ciclo} days and hasn't bought in ${a.recencia}. Last purchase: ${ultima}.`,
      es ? `Llámalo esta semana y ofrécele ${oferta}.` : `Call them this week and offer ${oferta}.`,
    );
  } else {
    partes.push(
      es
        ? `Lleva ${a.recencia} días sin comprar, cuando su ritmo normal era de ${ciclo} días. Su última compra fue ${ultima}.`
        : `No purchases in ${a.recencia} days, when they used to buy every ${ciclo}. Last purchase: ${ultima}.`,
      es
        ? `Haz una llamada de reactivación: pregunta qué cambió y ofrécele ${oferta}.`
        : `Make a win-back call: ask what changed and offer ${oferta}.`,
    );
  }
  if (a.cliente.es_base_instalada && a.estado !== 'activo') {
    partes.push(
      es
        ? 'Es base instalada: revisa vencimientos de garantías y licencias como motivo de contacto.'
        : 'Installed base: check warranty and license expirations as a reason to reach out.',
    );
  }
  if (subidaTrm > UMBRAL_SUBIDA_TRM && a.estado !== 'activo') {
    partes.push(
      es
        ? `El dólar subió ${dec(subidaTrm * 100, i)} % en 30 días: considera precio fijo en pesos o pago diferido.`
        : `The dollar rose ${dec(subidaTrm * 100, i)}% in 30 days: consider a fixed price in pesos or deferred payment.`,
    );
  }
  return partes.filter(Boolean).join(' ');
}

/**
 * Analiza todos los clientes tal como se veían en la fecha `hoy`.
 * Solo usa las ventas anteriores o iguales a esa fecha, así podemos
 * reutilizar la misma función para el backtest.
 */
export function analizarClientes(
  clientes: Cliente[],
  ventas: Venta[],
  productos: Producto[],
  trm: Trm[],
  hoy: Date,
  u: Umbrales = UMBRALES,
): AnalisisCliente[] {
  const catDe = new Map(productos.map((p) => [p.id, p.categoria]));
  const subidaTrm = variacionTrm30(trm, hoy);
  const visibles = ventas.filter((v) => fecha(v.fecha) <= hoy);

  const porCliente = new Map<string, Venta[]>();
  for (const v of visibles) {
    const lista = porCliente.get(v.id_cliente) ?? [];
    lista.push(v);
    porCliente.set(v.id_cliente, lista);
  }

  // Ciclo general (mediana de los ciclos) para clientes con una sola compra.
  const ciclosIndividuales: number[] = [];
  for (const lista of porCliente.values()) {
    const dias = [...new Set(lista.map((v) => v.fecha))].sort();
    if (dias.length >= MIN_COMPRAS_CICLO) ciclosIndividuales.push(cicloPromedio(dias));
  }
  ciclosIndividuales.sort((a, b) => a - b);
  const cicloGeneral = ciclosIndividuales.length ? ciclosIndividuales[Math.floor(ciclosIndividuales.length / 2)] : 45;

  const parciales = clientes.map((cliente): Parcial => {
    const lista = (porCliente.get(cliente.id) ?? []).sort((a, b) => a.fecha.localeCompare(b.fecha));
    const dias = [...new Set(lista.map((v) => v.fecha))].sort();
    const ultimaCompra = dias.length ? fecha(dias[dias.length - 1]) : null;

    // RFM
    const recencia = ultimaCompra ? diasEntre(ultimaCompra, hoy) : 9999;
    const frecuencia = dias.length;
    const montoUsd = lista.reduce((s, v) => s + v.valor_usd, 0);
    const montoCop = lista.reduce((s, v) => s + v.valor_cop, 0);

    // Ciclo de recompra: promedio de días entre compras consecutivas.
    // Con menos de 3 compras el ritmo no es confiable (dos compras seguidas darían
    // un ciclo de 1 día), así que usamos el ciclo general. Nunca menos de 7 días.
    const cicloEstimado = dias.length < MIN_COMPRAS_CICLO;
    const ciclo = Math.max(7, cicloEstimado ? cicloGeneral : cicloPromedio(dias));

    // Próxima compra estimada = última compra + ciclo.
    const proximaCompra = ultimaCompra ? new Date(ultimaCompra.getTime() + Math.round(ciclo) * DIA) : null;

    // Riesgo: qué tanto supera la recencia al ciclo normal del cliente.
    const ratio = recencia / ciclo;
    let puntaje = puntajeDesdeRatio(ratio, u);
    // Ajuste por TRM: si el dólar subió fuerte, los clientes que ya se están
    // acercando a su fecha de compra tienen más probabilidad de aplazarla.
    if (subidaTrm > UMBRAL_SUBIDA_TRM && ratio > 0.8) puntaje += 5;
    if (recencia > u.diasMaximosSinComprar) puntaje = Math.max(puntaje, 90);
    puntaje = Math.round(Math.min(100, Math.max(0, puntaje)));

    const estado = ultimaCompra ? estadoDesde(ratio, recencia, u) : 'frio';

    const ultimaCategoria = lista.length ? (catDe.get(lista[lista.length - 1].id_producto) ?? null) : null;
    const conteoCat = new Map<string, number>();
    for (const v of lista) {
      const c = catDe.get(v.id_producto) ?? '';
      conteoCat.set(c, (conteoCat.get(c) ?? 0) + v.valor_usd);
    }
    const categoriaPrincipal = [...conteoCat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const base = {
      cliente,
      ventas: lista,
      ultimaCompra,
      recencia,
      frecuencia,
      montoUsd,
      montoCop,
      ciclo,
      cicloEstimado,
      proximaCompra,
      ratio,
      puntaje,
      estado,
      ultimaCategoria,
      categoriaPrincipal,
    };
    return base;
  });

  // Segunda pasada: la recomendación compara cada cliente con los demás.
  const productoPorId = new Map(productos.map((p) => [p.id, p]));
  return parciales.map((p) => {
    const rec = recomendarProducto(p, parciales, productoPorId);
    return { ...p, productoRecomendado: rec, recomendacion: recomendar(p, rec, subidaTrm) };
  });
}

function cicloPromedio(diasOrdenados: string[]): number {
  if (diasOrdenados.length < 2) return 0;
  const primero = fecha(diasOrdenados[0]);
  const ultimo = fecha(diasOrdenados[diasOrdenados.length - 1]);
  return diasEntre(primero, ultimo) / (diasOrdenados.length - 1);
}

// ---------------------------------------------------------------------------
// Valor en riesgo: cuánto dinero al año representan los clientes que se están yendo
// ---------------------------------------------------------------------------

/**
 * Compra anual promedio de un cliente = lo que ha comprado ÷ meses como cliente × 12.
 * Los meses se cuentan desde su primera compra hasta `hoy` (mínimo 3, para no exagerar
 * a los clientes nuevos).
 */
export function valorAnual(a: AnalisisCliente, hoy: Date): number {
  const primera = a.ventas[0] ? fecha(a.ventas[0].fecha) : hoy;
  const meses = Math.max(3, (hoy.getTime() - primera.getTime()) / (30.44 * DIA));
  return (a.montoUsd / meses) * 12;
}

export function valorEnRiesgo(analisis: AnalisisCliente[], hoy: Date) {
  const sumar = (estado: Estado) =>
    analisis.filter((a) => a.estado === estado).reduce((s, a) => s + valorAnual(a, hoy), 0);
  // Inactivos recuperables: menos de un año sin comprar.
  const friosRecuperables = analisis
    .filter((a) => a.estado === 'frio' && a.recencia <= 365)
    .reduce((s, a) => s + valorAnual(a, hoy), 0);
  return { riesgo: sumar('riesgo'), friosRecuperables, total: sumar('riesgo') + friosRecuperables };
}

// ---------------------------------------------------------------------------
// Alertas: a quién contactar esta semana
// ---------------------------------------------------------------------------

export type TipoAlerta = 'riesgo' | 'frio' | 'recompra';

export interface Alerta {
  id: string;
  analisis: AnalisisCliente;
  tipo: TipoAlerta;
  prioridad: number; // 0–100, mayor = más urgente
  motivo: Bi;
}

/**
 * Prioridad = riesgo del cliente, ponderado por cuánto vale para la empresa.
 * Un cliente grande en riesgo pesa más que uno pequeño en riesgo.
 */
export function generarAlertas(analisis: AnalisisCliente[], hoy: Date): Alerta[] {
  const maxMonto = Math.max(1, ...analisis.map((a) => a.montoUsd));
  const alertas: Alerta[] = [];

  for (const a of analisis) {
    if (!a.ultimaCompra) continue;
    const peso = 0.6 + 0.4 * Math.sqrt(a.montoUsd / maxMonto);
    const ciclo = Math.round(a.ciclo);

    if (a.estado === 'riesgo') {
      alertas.push({
        id: a.cliente.id,
        analisis: a,
        tipo: 'riesgo',
        prioridad: Math.round(a.puntaje * peso),
        motivo: {
          es: `Compra cada ${ciclo} días y lleva ${a.recencia} sin comprar (${dec(a.ratio, 'es')} veces su ciclo).`,
          en: `Buys every ${ciclo} days and hasn't bought in ${a.recencia} (${dec(a.ratio, 'en')}× their cycle).`,
        },
      });
    } else if (a.estado === 'frio' && a.recencia <= 365) {
      // Inactivos recuperables: dejaron de comprar hace menos de un año.
      alertas.push({
        id: a.cliente.id,
        analisis: a,
        tipo: 'frio',
        prioridad: Math.round(a.puntaje * peso * 0.75),
        motivo: {
          es: `Lleva ${a.recencia} días sin comprar; su ritmo normal era de ${ciclo} días. Aún es recuperable.`,
          en: `No purchases in ${a.recencia} days; they used to buy every ${ciclo}. Still recoverable.`,
        },
      });
    } else if (a.estado === 'activo' && a.proximaCompra && !a.cicloEstimado) {
      // Proactivo: clientes al día cuya próxima compra cae en los próximos 7 días.
      const faltan = Math.round((a.proximaCompra.getTime() - hoy.getTime()) / DIA);
      if (faltan >= 0 && faltan <= 7) {
        alertas.push({
          id: a.cliente.id,
          analisis: a,
          tipo: 'recompra',
          prioridad: Math.round(30 * peso),
          motivo: {
            es: `Su próxima compra estimada es ${faltan === 0 ? 'hoy' : `en ${faltan} días`}. Buen momento para enviarle una propuesta.`,
            en: `Next estimated purchase ${faltan === 0 ? 'is today' : `in ${faltan} days`}. A good time to send a proposal.`,
          },
        });
      }
    }
  }
  return alertas.sort((x, y) => y.prioridad - x.prioridad);
}

// ---------------------------------------------------------------------------
// Ventas mensuales y pronóstico
// ---------------------------------------------------------------------------

export interface PuntoMensual {
  clave: string; // "2026-10"
  etiqueta: string; // "oct 26"
  usd: number | null;
  cop: number | null;
  pronostico: number | null;
}

export const claveMes = (d: Date) => d.toISOString().slice(0, 7);
export function etiquetaMes(clave: string): string {
  const d = new Date(`${clave}-01T00:00:00Z`);
  return d
    .toLocaleDateString('es-CO', { month: 'short', year: '2-digit', timeZone: 'UTC' })
    .replace('.', '')
    .replace(' de ', ' ');
}
export function sumarMeses(clave: string, n: number): string {
  const d = new Date(`${clave}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return claveMes(d);
}

export function ventasPorMes(ventas: Venta[]): Map<string, { usd: number; cop: number }> {
  const m = new Map<string, { usd: number; cop: number }>();
  for (const v of ventas) {
    const k = v.fecha.slice(0, 7);
    const actual = m.get(k) ?? { usd: 0, cop: 0 };
    actual.usd += v.valor_usd;
    actual.cop += v.valor_cop;
    m.set(k, actual);
  }
  return m;
}

export interface Pronostico {
  mes: string; // clave del mes pronosticado
  valor: number;
  promedio3: number;
  tendencia: number; // cambio promedio por mes en los últimos 3 meses
  ultimos3: { clave: string; usd: number }[];
}

/**
 * Pronóstico del mes siguiente:
 *   promedio móvil de los últimos 3 meses cerrados + tendencia mensual.
 * La tendencia es cuánto cambiaron las ventas, en promedio, de un mes al otro
 * dentro de esos 3 meses.
 */
export function pronosticarVentas(ventas: Venta[], hoy: Date): Pronostico {
  const porMes = ventasPorMes(ventas.filter((v) => fecha(v.fecha) <= hoy));
  const mesActual = claveMes(hoy); // el mes en curso aún no está cerrado
  const claves = [-3, -2, -1].map((n) => sumarMeses(mesActual, n));
  const ultimos3 = claves.map((clave) => ({ clave, usd: porMes.get(clave)?.usd ?? 0 }));
  const promedio3 = ultimos3.reduce((s, x) => s + x.usd, 0) / 3;
  const tendencia = (ultimos3[2].usd - ultimos3[0].usd) / 2;
  return {
    mes: mesActual,
    valor: Math.max(0, promedio3 + tendencia),
    promedio3,
    tendencia,
    ultimos3,
  };
}

/** Serie de 12 meses cerrados + el mes en curso con su pronóstico. */
export function serieMensual(ventas: Venta[], hoy: Date): PuntoMensual[] {
  const porMes = ventasPorMes(ventas.filter((v) => fecha(v.fecha) <= hoy));
  const mesActual = claveMes(hoy);
  const pron = pronosticarVentas(ventas, hoy);
  const serie: PuntoMensual[] = [];
  for (let n = -12; n <= -1; n++) {
    const clave = sumarMeses(mesActual, n);
    const v = porMes.get(clave);
    serie.push({
      clave,
      etiqueta: etiquetaMes(clave),
      usd: v ? Math.round(v.usd) : 0,
      cop: v ? Math.round(v.cop) : 0,
      pronostico: null,
    });
  }
  // La línea punteada arranca en el último mes real para que se vea continua.
  serie[serie.length - 1].pronostico = serie[serie.length - 1].usd;
  serie.push({
    clave: mesActual,
    etiqueta: `${etiquetaMes(mesActual)}*`,
    usd: null,
    cop: null,
    pronostico: Math.round(pron.valor),
  });
  return serie;
}

/** Ventas del mes en curso vs. el mismo número de días del mes anterior. */
export function ventasMesActual(ventas: Venta[], hoy: Date) {
  const dia = hoy.getUTCDate();
  const actual = claveMes(hoy);
  const anterior = sumarMeses(actual, -1);
  let usd = 0, cop = 0, usdAnt = 0, copAnt = 0;
  for (const v of ventas) {
    const d = Number(v.fecha.slice(8, 10));
    if (d > dia) continue;
    if (v.fecha.startsWith(actual)) { usd += v.valor_usd; cop += v.valor_cop; }
    else if (v.fecha.startsWith(anterior)) { usdAnt += v.valor_usd; copAnt += v.valor_cop; }
  }
  return {
    usd,
    cop,
    variacionUsd: usdAnt ? (usd - usdAnt) / usdAnt : 0,
    variacionCop: copAnt ? (cop - copAnt) / copAnt : 0,
    dia,
  };
}

// ---------------------------------------------------------------------------
// Validación: backtest
// ---------------------------------------------------------------------------

export interface ResultadoBacktest {
  fechaCorte: Date;
  ventanaDias: number;
  marcados: number; // clientes que la IA marcó en riesgo en la fecha de corte
  aciertos: number; // de esos, cuántos efectivamente no compraron en la ventana
  porcentaje: number;
  detalle: { analisis: AnalisisCliente; compro: boolean }[];
}

/**
 * Backtest: "viajamos al pasado".
 * 1. Cortamos la historia 60 días antes de hoy (la IA no ve nada posterior).
 * 2. Vemos qué clientes la IA habría marcado en riesgo ese día
 *    (estado "en riesgo" o "inactivo", sin contar los perdidos hace más de 180 días).
 * 3. Revisamos los 60 días siguientes: si de verdad no compraron, la IA acertó.
 */
export function backtest(
  clientes: Cliente[],
  ventas: Venta[],
  productos: Producto[],
  trm: Trm[],
  hoy: Date,
  ventanaDias = 60,
  u: Umbrales = UMBRALES,
): ResultadoBacktest {
  const fechaCorte = new Date(hoy.getTime() - ventanaDias * DIA);
  const pasado = analizarClientes(clientes, ventas, productos, trm, fechaCorte, u);
  const marcados = pasado.filter((a) => a.ultimaCompra && a.estado !== 'activo' && a.recencia <= u.diasMaximosSinComprar);

  const compraronDespues = new Set(
    ventas.filter((v) => fecha(v.fecha) > fechaCorte && fecha(v.fecha) <= hoy).map((v) => v.id_cliente),
  );
  const detalle = marcados.map((a) => ({ analisis: a, compro: compraronDespues.has(a.cliente.id) }));
  const aciertos = detalle.filter((d) => !d.compro).length;
  return {
    fechaCorte,
    ventanaDias,
    marcados: marcados.length,
    aciertos,
    porcentaje: marcados.length ? aciertos / marcados.length : 0,
    detalle,
  };
}

// ---------------------------------------------------------------------------
// Ventas por categoría y ventas contra TRM (pantalla "Ventas y TRM")
// ---------------------------------------------------------------------------

/** Claves de los 12 meses cerrados antes del mes de `hoy`. */
export function ultimos12Meses(hoy: Date): string[] {
  const actual = claveMes(hoy);
  return Array.from({ length: 12 }, (_, i) => sumarMeses(actual, i - 12));
}

/** Ventas en USD por mes y por categoría (una fila por mes, una columna por categoría). */
export function ventasPorCategoriaMes(ventas: Venta[], productos: Producto[], hoy: Date) {
  const catDe = new Map(productos.map((p) => [p.id, p.categoria]));
  const categorias = [...new Set(productos.map((p) => p.categoria))];
  const meses = ultimos12Meses(hoy);
  const filas = meses.map((clave) => {
    const fila: Record<string, string | number> = { clave, etiqueta: etiquetaMes(clave) };
    for (const c of categorias) fila[c] = 0;
    return fila;
  });
  const indice = new Map(meses.map((m, i) => [m, i]));
  const totales = new Map(categorias.map((c) => [c, 0]));
  for (const v of ventas) {
    const i = indice.get(v.fecha.slice(0, 7));
    if (i === undefined) continue;
    const c = catDe.get(v.id_producto)!;
    filas[i][c] = Math.round((filas[i][c] as number) + v.valor_usd);
    totales.set(c, (totales.get(c) ?? 0) + v.valor_usd);
  }
  const ranking = [...totales.entries()].map(([categoria, usd]) => ({ categoria, usd: Math.round(usd) })).sort((a, b) => b.usd - a.usd);
  return { categorias, filas, ranking };
}

export interface PuntoVentasTrm {
  clave: string;
  etiqueta: string;
  usd: number;
  cop: number;
  trm: number; // TRM promedio del mes
}

/** Ventas mensuales (USD y COP) junto a la TRM promedio de cada mes. */
export function ventasContraTrm(ventas: Venta[], trm: Trm[], hoy: Date): PuntoVentasTrm[] {
  const porMes = ventasPorMes(ventas);
  return ultimos12Meses(hoy).map((clave) => {
    const valores = trm.filter((t) => t.fecha.startsWith(clave)).map((t) => t.valor);
    return {
      clave,
      etiqueta: etiquetaMes(clave),
      usd: Math.round(porMes.get(clave)?.usd ?? 0),
      cop: Math.round(porMes.get(clave)?.cop ?? 0),
      trm: valores.length ? Math.round(valores.reduce((s, x) => s + x, 0) / valores.length) : 0,
    };
  });
}

/**
 * Correlación de Pearson entre dos series: un número entre -1 y 1.
 * Cerca de 1: suben juntas. Cerca de -1: cuando una sube la otra baja. Cerca de 0: no hay relación clara.
 */
export function correlacion(x: number[], y: number[]): number {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}
