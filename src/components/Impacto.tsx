/**
 * Métrica de impacto: tiempo de consolidación antes vs. con Órbita.
 * Lee src/config/impacto.ts. Si no hay dato de la empresa, lo dice: no inventamos cifras.
 */
import { IMPACTO } from '../config/impacto';
import { useIdioma } from '../lib/idioma';
import { fmtNum } from '../lib/format';

export default function Impacto({ className = '' }: { className?: string }) {
  const { tr } = useIdioma();
  const { horasConsolidacionManual: horas, minutosConOrbita: minutos } = IMPACTO;
  const veces = horas ? Math.round((horas * 60) / minutos) : null;
  return (
    <section
      className={`flex flex-col gap-2 rounded-2xl border border-azul/40 bg-azul/10 p-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
      aria-label={tr('Tiempo de consolidación', 'Consolidation time')}
    >
      <p className="text-sm text-blue-100">{tr('Consolidar el mes', 'Monthly consolidation')}</p>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="text-tenue">{tr('Antes', 'Before')}:</span>
        {horas === null ? (
          <span className="rounded bg-fondo/60 px-2 py-0.5 font-medium text-amber-300">{tr('[por confirmar con Green Services]', '[to be confirmed with Green Services]')}</span>
        ) : (
          <strong className="text-white">{tr(`${fmtNum(horas)} horas a mano`, `${fmtNum(horas)} hours by hand`)}</strong>
        )}
        <span aria-hidden="true" className="text-tenue">
          →
        </span>
        <span className="text-tenue">{tr('Ahora', 'Now')}:</span>
        <strong className="font-titulo text-lg text-white">~{minutos} {tr('minutos', 'minutes')}</strong>
        {veces && <span className="text-xs text-tenue">({tr(`${veces} veces más rápido`, `${veces}× faster`)})</span>}
      </p>
    </section>
  );
}
