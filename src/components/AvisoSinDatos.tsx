import { hayDatos, MODO } from '../lib/datos';
import { cambiarModo } from '../lib/modo';
import { useIdioma } from '../lib/idioma';

/** En modo Real sin datos: explica por qué todo está en cero y ofrece volver a la demo. */
export default function AvisoSinDatos() {
  const { tr } = useIdioma();
  if (MODO !== 'real' || hayDatos) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-turquesa/40 bg-turquesa/10 p-4 text-sm text-slate-200 print:hidden" role="status">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{tr('Modo Real: todavía no hay datos de Green Services', 'Real mode: no Green Services data yet')}</p>
        <p className="mt-1">
          {tr(
            'Por eso todo aparece en cero. Cuando lleguen los datos reales (anonimizados), las pantallas se llenan solas con la misma lógica de la demo.',
            'That is why everything shows zero. Once the real (anonymized) data arrives, the screens fill in with the same logic as the demo.',
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={() => cambiarModo('demo')}
        className="rounded-lg border border-acento/60 bg-acento/10 px-3 py-2 text-sm font-semibold text-acento hover:bg-acento/20"
      >
        {tr('Ver la demo', 'See the demo')}
      </button>
    </div>
  );
}
