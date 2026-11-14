import { useIdioma, type Idioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { IconoLuna, IconoSol } from './Iconos';

/** Selector de idioma (ES / EN) y botón de tema claro / oscuro. */
export default function Preferencias({ compacto = false }: { compacto?: boolean }) {
  const { idioma, cambiar, tr } = useIdioma();
  const { tema, alternar } = useTema();
  const opciones: { valor: Idioma; texto: string; nombre: string }[] = [
    { valor: 'es', texto: 'ES', nombre: 'Español' },
    { valor: 'en', texto: 'EN', nombre: 'English' },
  ];
  const claro = tema === 'light';
  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-borde p-0.5" role="group" aria-label={tr('Idioma', 'Language')}>
        {opciones.map((o) => (
          <button
            key={o.valor}
            type="button"
            lang={o.valor}
            onClick={() => cambiar(o.valor)}
            aria-pressed={idioma === o.valor}
            aria-label={o.nombre}
            title={o.nombre}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
              idioma === o.valor ? 'bg-acento/15 text-acento' : 'text-tenue hover:text-white'
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={alternar}
        aria-label={claro ? tr('Cambiar a modo oscuro', 'Switch to dark mode') : tr('Cambiar a modo claro', 'Switch to light mode')}
        title={claro ? tr('Modo oscuro', 'Dark mode') : tr('Modo claro', 'Light mode')}
        className="inline-flex items-center gap-2 rounded-lg border border-borde px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
      >
        {claro ? <IconoLuna width={16} height={16} /> : <IconoSol width={16} height={16} />}
        {!compacto && <span>{claro ? tr('Oscuro', 'Dark') : tr('Claro', 'Light')}</span>}
      </button>
    </div>
  );
}
