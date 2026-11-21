/**
 * Modelo predictivo: ¿qué clientes comprarán en los próximos 30 días?
 *
 * Es una regresión logística (el modelo clásico para estimar una probabilidad de sí/no),
 * entrenada en el navegador con el propio historial de ventas:
 *
 * 1. Se toman «fotos» del pasado: cada 15 días se mira cómo estaba cada cliente ese día
 *    (días sin comprar, cuántas veces compra, cuánto, su ritmo…) y si compró en los 30 días siguientes.
 * 2. Con esas fotos el modelo aprende qué combinación de señales anticipa una compra.
 * 3. Validación honesta: se entrena solo con fotos anteriores a hace 30 días y se prueba con la foto
 *    de hace 30 días, cuyo resultado ya se conoce. Se compara con una regla simple
 *    («comprará si compró en los últimos 30 días»).
 * 4. Para predecir hoy, se vuelve a entrenar con todo lo disponible.
 */
import type { Cliente, Producto, Venta } from './types';

const DIA = 86_400_000;
export const VENTANA_DIAS = 30;
const PASO_FOTOS = 15;
const MAX_FOTOS = 12;
const fecha = (s: string) => new Date(`${s}T00:00:00Z`).getTime();

/** Señales (variables) que usa el modelo, con su nombre para la pantalla. */
export const VARIABLES = [
  { id: 'ratio', es: 'Atraso frente a su ritmo (días sin comprar ÷ ciclo)', en: 'Delay vs. their pace (days without buying ÷ cycle)' },
  { id: 'frecuencia', es: 'Número de compras', en: 'Number of purchases' },
  { id: 'monto', es: 'Total comprado (USD)', en: 'Total purchased (USD)' },
  { id: 'recientes', es: 'Compras en los últimos 90 días', en: 'Purchases in the last 90 days' },
  { id: 'cicloCorto', es: 'Ciclo de compra corto', en: 'Short purchase cycle' },
  { id: 'base', es: 'Es base instalada', en: 'Installed base' },
  { id: 'recurrente', es: 'Compra servicios recurrentes', en: 'Buys recurring services' },
] as const;
export type IdVariable = (typeof VARIABLES)[number]['id'];

export type Prioridad = 'alta' | 'media' | 'baja';
export const prioridadDesde = (p: number): Prioridad => (p >= 0.6 ? 'alta' : p >= 0.35 ? 'media' : 'baja');

export interface Prediccion {
  idCliente: string;
  probabilidad: number;
  prioridad: Prioridad;
  /** Cuánto empuja cada señal hacia «sí compra» (+) o «no compra» (−) para este cliente. */
  aportes: { id: IdVariable; valor: number }[];
}

export interface Metricas {
  /** De los que el modelo dijo «comprará», cuántos compraron. */
  precision: number;
  /** De los que compraron, cuántos detectó el modelo. */
  exhaustividad: number;
  f1: number;
  exactitud: number;
  vp: number; // verdaderos positivos
  fp: number; // falsos positivos
  fn: number; // falsos negativos
  vn: number; // verdaderos negativos
}

export interface DetalleValidacion {
  idCliente: string;
  probabilidad: number;
  predijo: boolean;
  regla: boolean;
  compro: boolean;
}

export interface ResultadoModelo {
  entrenado: boolean;
  /** Por qué no se pudo entrenar (pocos datos), si aplica. */
  motivo?: { es: string; en: string };
  predicciones: Map<string, Prediccion>;
  /** Validación en la foto de hace 30 días (resultado ya conocido). */
  validacion: {
    fecha: string;
    modelo: Metricas;
    regla: Metricas;
    detalle: DetalleValidacion[];
    filasEntrenamiento: number;
    tasaCompra: number;
  } | null;
  /** Peso de cada variable en el modelo final (con variables estandarizadas). */
  pesos: { id: IdVariable; peso: number }[];
  filasEntrenamiento: number;
  fotos: number;
}

interface Historial {
  cliente: Cliente;
  dias: number[]; // fechas distintas de compra (ms), ordenadas
  montos: number[]; // monto por fecha
  recurrente: number[]; // fechas con compra de servicio recurrente
}

function prepararHistoriales(clientes: Cliente[], ventas: Venta[], productos: Producto[]): Historial[] {
  const recurrentes = new Set(productos.filter((p) => p.tipo === 'servicio recurrente').map((p) => p.id));
  const porCliente = new Map<string, Map<number, { monto: number; rec: boolean }>>();
  for (const v of ventas) {
    const t = fecha(v.fecha);
    const m = porCliente.get(v.id_cliente) ?? new Map();
    const d = m.get(t) ?? { monto: 0, rec: false };
    d.monto += v.valor_usd;
    d.rec ||= recurrentes.has(v.id_producto);
    m.set(t, d);
    porCliente.set(v.id_cliente, m);
  }
  return clientes.map((cliente) => {
    const m = porCliente.get(cliente.id) ?? new Map();
    const dias = [...m.keys()].sort((a, b) => a - b);
    return { cliente, dias, montos: dias.map((d) => m.get(d)!.monto), recurrente: dias.filter((d) => m.get(d)!.rec) };
  });
}

/** Ciclo mediano general (para clientes con pocas compras). */
function cicloGeneral(hs: Historial[], hasta: number): number {
  const ciclos: number[] = [];
  for (const h of hs) {
    const d = h.dias.filter((x) => x <= hasta);
    if (d.length >= 3) ciclos.push((d[d.length - 1] - d[0]) / DIA / (d.length - 1));
  }
  ciclos.sort((a, b) => a - b);
  return ciclos.length ? Math.max(7, ciclos[Math.floor(ciclos.length / 2)]) : 30;
}

/** Variables de un cliente vistas en la fecha `t` (solo con compras hasta ese día). */
function variablesEn(h: Historial, t: number, ciclo0: number): number[] | null {
  let n = 0;
  while (n < h.dias.length && h.dias[n] <= t) n++;
  if (!n) return null; // aún no era cliente
  const ultima = h.dias[n - 1];
  const recencia = (t - ultima) / DIA;
  const ciclo = n >= 3 ? Math.max(7, (ultima - h.dias[0]) / DIA / (n - 1)) : ciclo0;
  let monto = 0;
  for (let i = 0; i < n; i++) monto += h.montos[i];
  let recientes = 0;
  for (let i = 0; i < n; i++) if (h.dias[i] > t - 90 * DIA) recientes++;
  const recurrente = h.recurrente.some((d) => d <= t) ? 1 : 0;
  return [
    Math.min(recencia / ciclo, 6),
    Math.log1p(n),
    Math.log1p(monto / 1000),
    recientes,
    Math.max(0, 1 - ciclo / 90),
    h.cliente.es_base_instalada ? 1 : 0,
    recurrente,
  ];
}

const comproEntre = (h: Historial, desde: number, hasta: number) => h.dias.some((d) => d > desde && d <= hasta);

interface Fila {
  x: number[];
  y: number;
}

function filasEntrenamiento(hs: Historial[], hastaEtiqueta: number): { filas: Fila[]; fotos: number } {
  const filas: Fila[] = [];
  let fotos = 0;
  // La última foto de entrenamiento debe tener su resultado completo antes de `hastaEtiqueta`.
  for (let k = 0; k < MAX_FOTOS; k++) {
    const t = hastaEtiqueta - VENTANA_DIAS * DIA - k * PASO_FOTOS * DIA;
    const c0 = cicloGeneral(hs, t);
    let alguna = false;
    for (const h of hs) {
      const x = variablesEn(h, t, c0);
      if (!x) continue;
      alguna = true;
      filas.push({ x, y: comproEntre(h, t, t + VENTANA_DIAS * DIA) ? 1 : 0 });
    }
    if (alguna) fotos++;
  }
  return { filas, fotos };
}

interface Modelo {
  medias: number[];
  desv: number[];
  w: number[];
  b: number;
}

const sigmoide = (z: number) => 1 / (1 + Math.exp(-z));

/** Regresión logística con descenso de gradiente y una pequeña regularización (determinista). */
export function entrenarLogistica(filas: Fila[], iteraciones = 600, tasa = 0.3, l2 = 0.01): Modelo {
  const m = filas[0].x.length;
  const medias = Array(m).fill(0);
  const desv = Array(m).fill(0);
  for (const f of filas) f.x.forEach((v, j) => (medias[j] += v / filas.length));
  for (const f of filas) f.x.forEach((v, j) => (desv[j] += (v - medias[j]) ** 2 / filas.length));
  for (let j = 0; j < m; j++) desv[j] = Math.sqrt(desv[j]) || 1;
  const X = filas.map((f) => f.x.map((v, j) => (v - medias[j]) / desv[j]));
  const w = Array(m).fill(0);
  let b = 0;
  for (let it = 0; it < iteraciones; it++) {
    const gw = Array(m).fill(0);
    let gb = 0;
    for (let i = 0; i < X.length; i++) {
      const e = sigmoide(b + X[i].reduce((s, v, j) => s + v * w[j], 0)) - filas[i].y;
      gb += e;
      for (let j = 0; j < m; j++) gw[j] += e * X[i][j];
    }
    b -= (tasa * gb) / X.length;
    for (let j = 0; j < m; j++) w[j] -= tasa * (gw[j] / X.length + l2 * w[j]);
  }
  return { medias, desv, w, b };
}

function predecir(mod: Modelo, x: number[]) {
  const z = x.map((v, j) => (v - mod.medias[j]) / mod.desv[j]);
  const aportes = z.map((v, j) => ({ id: VARIABLES[j].id, valor: v * mod.w[j] }));
  return { p: sigmoide(mod.b + aportes.reduce((s, a) => s + a.valor, 0)), aportes };
}

export function metricas(pares: { predijo: boolean; compro: boolean }[]): Metricas {
  let vp = 0,
    fp = 0,
    fn = 0,
    vn = 0;
  for (const { predijo, compro } of pares) {
    if (predijo && compro) vp++;
    else if (predijo) fp++;
    else if (compro) fn++;
    else vn++;
  }
  const precision = vp + fp ? vp / (vp + fp) : 0;
  const exhaustividad = vp + fn ? vp / (vp + fn) : 0;
  const f1 = precision + exhaustividad ? (2 * precision * exhaustividad) / (precision + exhaustividad) : 0;
  const total = vp + fp + fn + vn;
  return { precision, exhaustividad, f1, exactitud: total ? (vp + vn) / total : 0, vp, fp, fn, vn };
}

const VACIO = (motivo: ResultadoModelo['motivo']): ResultadoModelo => ({
  entrenado: false,
  motivo,
  predicciones: new Map(),
  validacion: null,
  pesos: [],
  filasEntrenamiento: 0,
  fotos: 0,
});

/** Mínimo de filas (cliente × foto) y de casos de cada clase para entrenar algo confiable. */
const MIN_FILAS = 40;
const MIN_CLASE = 5;

const suficiente = (filas: Fila[]) => {
  const pos = filas.filter((f) => f.y).length;
  return filas.length >= MIN_FILAS && pos >= MIN_CLASE && filas.length - pos >= MIN_CLASE;
};

type Validacion = NonNullable<ResultadoModelo['validacion']>;

/**
 * Valida el modelo con «hoy» = T: lo entrena solo con fotos cuyo resultado se conocía antes de T − 30 días,
 * predice en T − 30 y compara con lo que pasó entre T − 30 y T (y con la regla base).
 */
function validarEn(hs: Historial[], T: number): Validacion | null {
  const tPrueba = T - VENTANA_DIAS * DIA;
  const ent = filasEntrenamiento(hs, tPrueba);
  if (!suficiente(ent.filas)) return null;
  const mod = entrenarLogistica(ent.filas);
  const c0 = cicloGeneral(hs, tPrueba);
  const detalle: DetalleValidacion[] = [];
  for (const h of hs) {
    const x = variablesEn(h, tPrueba, c0);
    if (!x) continue;
    const { p } = predecir(mod, x);
    detalle.push({
      idCliente: h.cliente.id,
      probabilidad: p,
      predijo: p >= 0.5,
      regla: comproEntre(h, tPrueba - VENTANA_DIAS * DIA, tPrueba),
      compro: comproEntre(h, tPrueba, T),
    });
  }
  if (!detalle.length) return null;
  return {
    fecha: new Date(tPrueba).toISOString().slice(0, 10),
    modelo: metricas(detalle),
    regla: metricas(detalle.map((d) => ({ predijo: d.regla, compro: d.compro }))),
    detalle: detalle.sort((a, b) => b.probabilidad - a.probabilidad),
    filasEntrenamiento: ent.filas.length,
    tasaCompra: detalle.filter((d) => d.compro).length / detalle.length,
  };
}

export interface VentanaValidacion {
  /** Fecha en que se hizo la predicción (los 30 días siguientes son el resultado). */
  fecha: string;
  clientes: number;
  modelo: Metricas;
  regla: Metricas;
}

export interface ValidacionMeses {
  ventanas: VentanaValidacion[];
  /** Promedio de las ventanas (precisión, exhaustividad, F1 y exactitud) y suma de la matriz de aciertos. */
  promedio: { modelo: Metricas; regla: Metricas };
  /** En cuántas ventanas el F1 del modelo fue mayor o igual que el de la regla base. */
  ganaModelo: number;
}

function promediar(ms: Metricas[]): Metricas {
  const prom = (k: keyof Metricas) => ms.reduce((s, m) => s + m[k], 0) / ms.length;
  const suma = (k: keyof Metricas) => ms.reduce((s, m) => s + m[k], 0);
  return { precision: prom('precision'), exhaustividad: prom('exhaustividad'), f1: prom('f1'), exactitud: prom('exactitud'), vp: suma('vp'), fp: suma('fp'), fn: suma('fn'), vn: suma('vn') };
}

/**
 * Validación en varios meses (validación «hacia atrás» o walk-forward): repite la validación con «hoy»
 * en distintas fechas, una cada 30 días, para no depender de un solo mes bueno o malo.
 * Es más costosa (un entrenamiento por ventana), así que se calcula solo cuando se muestra.
 */
export function validarVariosMeses(clientes: Cliente[], ventas: Venta[], productos: Producto[], hoy: Date, meses = 6): ValidacionMeses | null {
  const hs = prepararHistoriales(clientes, ventas, productos);
  const ventanas: VentanaValidacion[] = [];
  for (let k = 0; k < meses; k++) {
    const v = validarEn(hs, hoy.getTime() - k * VENTANA_DIAS * DIA);
    if (v) ventanas.push({ fecha: v.fecha, clientes: v.detalle.length, modelo: v.modelo, regla: v.regla });
  }
  if (!ventanas.length) return null;
  return {
    ventanas,
    promedio: { modelo: promediar(ventanas.map((v) => v.modelo)), regla: promediar(ventanas.map((v) => v.regla)) },
    ganaModelo: ventanas.filter((v) => v.modelo.f1 >= v.regla.f1).length,
  };
}

export function entrenarModelo(clientes: Cliente[], ventas: Venta[], productos: Producto[], hoy: Date): ResultadoModelo {
  const hs = prepararHistoriales(clientes, ventas, productos);
  const T = hoy.getTime();
  const pocos = { es: 'Hacen falta más datos: al menos unos meses de ventas y varios clientes.', en: 'More data is needed: at least a few months of sales and several clients.' };

  // 1) Validación: entrenar con lo anterior a hace 30 días y probar en la foto de hace 30 días.
  const validacion = validarEn(hs, T);

  // 2) Modelo final: entrenar con todo lo que ya tiene resultado y predecir hoy.
  const fin = filasEntrenamiento(hs, T);
  if (!suficiente(fin.filas)) return { ...VACIO(pocos), validacion };
  const mod = entrenarLogistica(fin.filas);
  const c0 = cicloGeneral(hs, T);
  const predicciones = new Map<string, Prediccion>();
  for (const h of hs) {
    const x = variablesEn(h, T, c0);
    if (!x) continue;
    const { p, aportes } = predecir(mod, x);
    predicciones.set(h.cliente.id, { idCliente: h.cliente.id, probabilidad: p, prioridad: prioridadDesde(p), aportes });
  }
  return {
    entrenado: true,
    predicciones,
    validacion,
    pesos: VARIABLES.map((v, j) => ({ id: v.id, peso: mod.w[j] })),
    filasEntrenamiento: fin.filas.length,
    fotos: fin.fotos,
  };
}
