/**
 * Formatos de moneda, números, fechas y porcentajes.
 * Siguen el idioma elegido: español (es-CO: 1.234,5 · 14 de nov de 2026) o inglés (en-US: 1,234.5 · Nov 14, 2026).
 */
type Idioma = 'es' | 'en';
let idioma: Idioma = 'es';
const LOCALE: Record<Idioma, string> = { es: 'es-CO', en: 'en-US' };

/** Lo llama IdiomaProvider cuando cambia el idioma. */
export function fijarIdioma(i: Idioma) {
  idioma = i;
}
export const idiomaActual = () => idioma;
export const localeActual = () => LOCALE[idioma];

const numero = (n: number, decimales = 0) =>
  new Intl.NumberFormat(LOCALE[idioma], { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(n);

export const fmtNum = (n: number) => numero(n);
export const fmtUsd = (n: number) => `US$ ${numero(n)}`;
export const fmtCop = (n: number) => (idioma === 'es' ? `$ ${numero(n)}` : `COP ${numero(n)}`);
export const fmtTrm = (n: number) => `$ ${numero(n, 2)}`;
export const fmtPct = (n: number, decimales = 1) => `${n > 0 ? '+' : ''}${numero(n * 100, decimales)} %`;
/** Número decimal corto (por ejemplo 1,8 o 1.8). */
export const fmtDec = (n: number, decimales = 1) => numero(n, decimales);

/** Formato compacto: US$ 1,2 M · US$ 850 mil (es) · US$ 1.2 M · US$ 850 K (en). */
export function fmtCompacto(n: number, moneda: 'USD' | 'COP' = 'USD'): string {
  const pref = moneda === 'USD' ? 'US$ ' : idioma === 'es' ? '$ ' : 'COP ';
  const abs = Math.abs(n);
  if (moneda === 'COP' && abs >= 1e9) return `${pref}${numero(Math.round(n / 1e6))} M`; // $ 1.479 M (millones)
  if (abs >= 1e6) return `${pref}${numero(n / 1e6, 1)} M`;
  if (abs >= 1e3) return `${pref}${numero(Math.round(n / 1e3))} ${idioma === 'es' ? 'mil' : 'K'}`;
  return `${pref}${numero(n)}`;
}

export const fmtFecha = (d: Date | string | null) => {
  if (!d) return '—';
  const f = typeof d === 'string' ? new Date(`${d}T00:00:00Z`) : d;
  return f.toLocaleDateString(LOCALE[idioma], { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};

/** Fecha larga sin año: «16 de octubre» / «October 16». */
export const fmtDiaMes = (d: Date) => d.toLocaleDateString(LOCALE[idioma], { day: 'numeric', month: 'long', timeZone: 'UTC' });

/** Etiqueta corta de mes a partir de "2026-10": «oct 26» / «Oct 26». */
export function fmtMes(clave: string): string {
  const d = new Date(`${clave}-01T00:00:00Z`);
  return d
    .toLocaleDateString(LOCALE[idioma], { month: 'short', year: '2-digit', timeZone: 'UTC' })
    .replace('.', '')
    .replace(' de ', ' ');
}

/** Nombre largo de mes: «octubre de 2026» / «October 2026». */
export function fmtMesLargo(clave: string): string {
  const d = new Date(`${clave}-01T00:00:00Z`);
  return d.toLocaleDateString(LOCALE[idioma], { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
