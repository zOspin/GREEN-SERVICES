const usd0 = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const cop0 = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const num2 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtUsd = (n: number) => usd0.format(n);
export const fmtCop = (n: number) => cop0.format(n);
export const fmtNum = (n: number) => num.format(n);
export const fmtTrm = (n: number) => `$ ${num2.format(n)}`;
export const fmtPct = (n: number, decimales = 1) =>
  `${n > 0 ? '+' : ''}${(n * 100).toFixed(decimales).replace('.', ',')} %`;

/** Formato compacto: US$ 1,2 M, $ 850 mil, etc. */
export function fmtCompacto(n: number, moneda: 'USD' | 'COP' = 'USD'): string {
  const pref = moneda === 'USD' ? 'US$ ' : '$ ';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${pref}${num.format(Math.round(n / 1e6))} M`; // p. ej. $ 1.479 M (millones)
  if (abs >= 1e6) return `${pref}${(n / 1e6).toFixed(1).replace('.', ',')} M`;
  if (abs >= 1e3) return `${pref}${(n / 1e3).toFixed(0)} mil`;
  return `${pref}${n.toFixed(0)}`;
}

export const fmtFecha = (d: Date | string | null) => {
  if (!d) return '—';
  const f = typeof d === 'string' ? new Date(`${d}T00:00:00Z`) : d;
  return f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
};
