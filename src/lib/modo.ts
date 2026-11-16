/**
 * Modo de datos de la web:
 * - «demo»: datos inventados (src/data/), con la historia del Cliente 23. Es el modo por defecto.
 * - «real»: datos reales de Green Services (src/data/real/). Mientras estén vacíos, todo aparece en cero.
 *
 * Se guarda en el navegador. Cambiar de modo recarga la página, porque los datos se leen una sola vez al cargar.
 */
import { guardarPreferencia, leerPreferencia } from './preferencias';
import { SEMILLA_ORIGINAL } from './generador';
import type { Cliente, Producto, Trm, Venta } from './types';

export type Modo = 'demo' | 'real';
const CLAVE = 'orbita-modo';
/** Al cambiar a demo para presentar: se inicia la presentación justo después de recargar. */
const CLAVE_PRESENTAR = 'orbita-presentar';

function modoInicial(): Modo {
  // También se puede abrir con ?modo=demo o ?modo=real en la dirección.
  try {
    const p = new URLSearchParams(window.location.search).get('modo');
    if (p === 'demo' || p === 'real') {
      guardarPreferencia(CLAVE, p);
      return p;
    }
  } catch {
    /* sin window (por ejemplo, en scripts) */
  }
  try {
    return leerPreferencia<Modo>(CLAVE, ['demo', 'real'], 'demo');
  } catch {
    return 'demo';
  }
}

export const MODO: Modo = modoInicial();

const CLAVE_SEMILLA = 'orbita-semilla';
const CLAVE_REALES = 'orbita-datos-reales';

function quitar(clave: string) {
  try {
    localStorage.removeItem(clave);
  } catch {
    /* sin almacenamiento */
  }
}

// ---------- Demo al azar ----------

/** Semilla de la demo actual. La original (2026) es la del guion; otra semilla = otra demo al azar. */
export const SEMILLA: number = (() => {
  try {
    const n = Number(localStorage.getItem(CLAVE_SEMILLA));
    return Number.isInteger(n) && n > 0 ? n : SEMILLA_ORIGINAL;
  } catch {
    return SEMILLA_ORIGINAL;
  }
})();
export const esDemoOriginal = SEMILLA === SEMILLA_ORIGINAL;

/** Genera una demo nueva con datos al azar (otra semilla) y recarga la página. */
export function nuevaDemoAlAzar() {
  let n = SEMILLA;
  while (n === SEMILLA || n === SEMILLA_ORIGINAL) n = 1 + Math.floor(Math.random() * 99_999);
  guardarPreferencia(CLAVE_SEMILLA, String(n));
  guardarPreferencia(CLAVE, 'demo');
  window.location.assign(import.meta.env.BASE_URL);
}

/** Vuelve a la demo original (la del guion) y recarga la página. */
export function volverADemoOriginal() {
  quitar(CLAVE_SEMILLA);
  guardarPreferencia(CLAVE, 'demo');
  window.location.assign(import.meta.env.BASE_URL);
}

// ---------- Datos reales guardados en este navegador ----------

export interface DatosReales {
  clientes: Cliente[];
  productos: Producto[];
  ventas: Venta[];
  trm: Trm[];
  meta: { fecha_corte: string | null; fecha_inicio: string | null; meses_historia: number; guardado: string; archivos: string[] };
}

/** Datos reales que se subieron en el Centro de datos (solo existen en este navegador). */
export function leerDatosReales(): DatosReales | null {
  try {
    const t = localStorage.getItem(CLAVE_REALES);
    if (!t) return null;
    const d = JSON.parse(t) as DatosReales;
    return Array.isArray(d.ventas) && Array.isArray(d.clientes) ? d : null;
  } catch {
    return null;
  }
}

/** Guarda los datos reales en el navegador y recarga en modo Real. Devuelve false si no hay espacio. */
export function guardarDatosReales(d: DatosReales): boolean {
  try {
    localStorage.setItem(CLAVE_REALES, JSON.stringify(d));
  } catch {
    return false;
  }
  guardarPreferencia(CLAVE, 'real');
  window.location.assign(import.meta.env.BASE_URL);
  return true;
}

/** Borra los datos reales de este navegador: el modo Real vuelve a quedar en cero. */
export function borrarDatosReales() {
  quitar(CLAVE_REALES);
  window.location.reload();
}

export function cambiarModo(m: Modo, opciones: { presentar?: boolean } = {}) {
  if (m === MODO && !opciones.presentar) return;
  guardarPreferencia(CLAVE, m);
  // La presentación sigue el guion, que usa la demo original.
  if (opciones.presentar) quitar(CLAVE_SEMILLA);
  try {
    if (opciones.presentar) sessionStorage.setItem(CLAVE_PRESENTAR, '1');
  } catch {
    /* sin almacenamiento */
  }
  // Vuelve al inicio sin el parámetro ?modo= para que no se imponga otra vez.
  window.location.assign(import.meta.env.BASE_URL);
}

/** ¿Hay que iniciar la presentación apenas carga la página? (se consulta una sola vez) */
export function tomarPresentacionPendiente(): boolean {
  try {
    const v = sessionStorage.getItem(CLAVE_PRESENTAR) === '1';
    sessionStorage.removeItem(CLAVE_PRESENTAR);
    return v;
  } catch {
    return false;
  }
}
