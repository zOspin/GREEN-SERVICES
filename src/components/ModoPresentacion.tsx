import { useState } from 'react';
import { PASOS, usePresentacion } from '../lib/presentacion';
import { useIdioma } from '../lib/idioma';
import { IconoCerrar, IconoFlecha, IconoAtras } from './Iconos';

/** Barra inferior del modo presentación: paso actual, leyenda, notas y navegación. */
export default function ModoPresentacion() {
  const { activo, paso, total, ir, salir } = usePresentacion();
  const { tr, b } = useIdioma();
  const [notas, setNotas] = useState(false);
  if (!activo) return null;
  const p = PASOS[paso];
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-acento/50 bg-tarjeta/95 px-4 py-3 shadow-2xl backdrop-blur print:hidden"
      role="region"
      aria-label={tr('Modo presentación', 'Presentation mode')}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2" aria-label={tr('Pasos', 'Steps')}>
          {PASOS.map((x, i) => (
            <button
              key={x.ruta}
              type="button"
              onClick={() => ir(i)}
              aria-current={i === paso ? 'step' : undefined}
              aria-label={`${i + 1}. ${b(x.titulo)}`}
              title={b(x.titulo)}
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors ${
                i === paso ? 'bg-[#F5A524] text-[#1A1306]' : i < paso ? 'bg-acento/25 text-acento' : 'border border-borde text-tenue hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="text-xs font-semibold uppercase tracking-wider text-acento">
            {tr(`Demo en vivo · paso ${paso + 1} de ${total}`, `Live demo · step ${paso + 1} of ${total}`)} · {b(p.titulo)}
          </p>
          <p className="text-sm text-slate-100">{b(p.leyenda)}</p>
          {notas && <p className="mt-2 rounded-lg bg-fondo/70 p-2 text-sm text-slate-300">{b(p.notas)}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setNotas((v) => !v)} aria-pressed={notas} className="rounded-lg border border-borde px-3 py-2 text-xs text-slate-200 hover:bg-white/5">
            {notas ? tr('Ocultar notas', 'Hide notes') : tr('Notas del comunicador', 'Speaker notes')}
          </button>
          <button
            type="button"
            onClick={() => ir(paso - 1)}
            disabled={paso === 0}
            aria-label={tr('Paso anterior', 'Previous step')}
            className="rounded-lg border border-borde p-2 text-slate-200 hover:bg-white/5 disabled:opacity-40"
          >
            <IconoAtras width={18} height={18} />
          </button>
          <button
            type="button"
            onClick={() => (paso === total - 1 ? salir() : ir(paso + 1))}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F5A524] px-3.5 py-2 text-sm font-semibold text-[#1A1306] hover:bg-[#F7B84B]"
          >
            {paso === total - 1 ? tr('Terminar', 'Finish') : tr('Siguiente', 'Next')} <IconoFlecha width={16} height={16} />
          </button>
          <button type="button" onClick={salir} aria-label={tr('Salir del modo presentación', 'Exit presentation mode')} className="rounded-lg p-2 text-tenue hover:bg-white/5 hover:text-white">
            <IconoCerrar width={18} height={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
