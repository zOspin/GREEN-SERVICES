/**
 * Modo de datos de la web:
 * - «demo»: datos inventados (src/data/), con la historia del Cliente 23. Es el modo por defecto.
 * - «real»: datos reales de Green Services (src/data/real/). Mientras estén vacíos, todo aparece en cero.
 *
 * Se guarda en el navegador. Cambiar de modo recarga la página, porque los datos se leen una sola vez al cargar.
 */
import { guardarPreferencia, leerPreferencia } from './preferencias';

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

export function cambiarModo(m: Modo, opciones: { presentar?: boolean } = {}) {
  if (m === MODO && !opciones.presentar) return;
  guardarPreferencia(CLAVE, m);
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
