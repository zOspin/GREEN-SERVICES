import { useIdioma } from '../lib/idioma';
import { IconoDado } from './Iconos';
import { MODO, SEMILLA, cambiarModo, esDemoOriginal, nuevaDemoAlAzar, volverADemoOriginal, type Modo } from '../lib/modo';

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
                  : 'bg-turquesa/15 text-estado-ok'
                : 'text-tenue hover:text-white'
            }`}
          >
            {o.texto}
          </button>
        ))}
      </div>
      {MODO === 'demo' && (
        <div className="mt-2 space-y-1">
          <button
            type="button"
            onClick={nuevaDemoAlAzar}
            title={tr('Crea clientes y compras nuevos al azar (el Cliente 23 se mantiene)', 'Creates new random clients and purchases (Client 23 stays)')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-borde px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/5"
          >
            <IconoDado width={15} height={15} /> {tr('Generar otra demo al azar', 'Generate another random demo')}
          </button>
          {!esDemoOriginal && (
            <p className="text-center text-[0.7rem] text-tenue">
              {tr(`Demo al azar n.º ${SEMILLA}`, `Random demo #${SEMILLA}`)} ·{' '}
              <button type="button" onClick={volverADemoOriginal} className="text-azul hover:underline">
                {tr('volver a la original', 'back to the original')}
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
