import { useIdioma, type Idioma } from '../lib/idioma';
import { useTema, type Tema } from '../lib/tema';
import { IconoLuna, IconoSol } from './Iconos';

/** Interruptor de dos opciones (mismo estilo para idioma y tema). */
function Interruptor<T extends string>({
  etiqueta,
  valor,
  opciones,
  alElegir,
}: {
  etiqueta: string;
  valor: T;
  opciones: { valor: T; texto: React.ReactNode; nombre: string; lang?: string }[];
  alElegir: (v: T) => void;
}) {
  return (
    <div className="flex rounded-xl border border-borde bg-tarjeta p-0.5 shadow-tarjeta" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          lang={o.lang}
          onClick={() => alElegir(o.valor)}
          aria-pressed={valor === o.valor}
          aria-label={o.nombre}
          title={o.nombre}
          className={`inline-flex min-h-[30px] min-w-[32px] items-center justify-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            valor === o.valor ? 'bg-acento text-sobre-acento' : 'text-tenue hover:text-acento'
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** Selector de idioma (ES / EN) y de tema (Claro / Oscuro), siempre visibles arriba a la derecha. */
export default function Preferencias({ compacto = false }: { compacto?: boolean }) {
  const { idioma, cambiar, tr } = useIdioma();
  const { tema, alternar } = useTema();
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Interruptor<Idioma>
        etiqueta={tr('Idioma', 'Language')}
        valor={idioma}
        alElegir={cambiar}
        opciones={[
          { valor: 'es', texto: 'ES', nombre: 'Español', lang: 'es' },
          { valor: 'en', texto: 'EN', nombre: 'English', lang: 'en' },
        ]}
      />
      <Interruptor<Tema>
        etiqueta={tr('Tema', 'Theme')}
        valor={tema}
        alElegir={(t) => t !== tema && alternar()}
        opciones={[
          { valor: 'light', texto: <><IconoSol width={14} height={14} />{!compacto && tr('Claro', 'Light')}</>, nombre: tr('Modo claro', 'Light mode') },
          { valor: 'dark', texto: <><IconoLuna width={14} height={14} />{!compacto && tr('Oscuro', 'Dark')}</>, nombre: tr('Modo oscuro', 'Dark mode') },
        ]}
      />
    </div>
  );
}
