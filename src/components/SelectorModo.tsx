import { useIdioma } from '../lib/idioma';
import { MODO, cambiarModo, type Modo } from '../lib/modo';

/** Selector de modo de datos: Demo (datos inventados) o Real (datos de Green Services). */
export default function SelectorModo() {
  const { tr } = useIdioma();
  const opciones: { valor: Modo; texto: string; ayuda: string }[] = [
    { valor: 'demo', texto: tr('Demo', 'Demo'), ayuda: tr('Datos inventados para probar y presentar', 'Made-up data to try and present') },
    { valor: 'real', texto: tr('Real', 'Real'), ayuda: tr('Datos reales de Green Services', "Green Services' real data") },
  ];
  return (
    <div>
      <p className="mb-1 text-[0.7rem] font-medium uppercase tracking-wide text-tenue">{tr('Datos', 'Data')}</p>
      <div className="flex rounded-lg border border-borde p-0.5" role="group" aria-label={tr('Modo de datos', 'Data mode')}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => cambiarModo(o.valor)}
            aria-pressed={MODO === o.valor}
            title={o.ayuda}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              MODO === o.valor
                ? o.valor === 'demo'
                  ? 'bg-acento/15 text-acento'
                  : 'bg-turquesa/15 text-turquesa'
                : 'text-tenue hover:text-white'
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}
