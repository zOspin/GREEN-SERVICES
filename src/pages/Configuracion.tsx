import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader, Panel, StatCard, StatusChip, INFO_ESTADO } from '../components/ui';
import { calcularDatos } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { useIdioma } from '../lib/idioma';
import { fmtDec } from '../lib/format';
import { UMBRALES, type Umbrales } from '../config/umbrales';
import type { Estado } from '../lib/analytics';

/** Estados con los valores del archivo de configuración: la referencia para ver qué cambia. */
const BASE = calcularDatos(UMBRALES);

function Deslizador({
  id,
  etiqueta,
  ayuda,
  valor,
  min,
  max,
  paso,
  formato,
  alCambiar,
}: {
  id: string;
  etiqueta: string;
  ayuda: string;
  valor: number;
  min: number;
  max: number;
  paso: number;
  formato: (v: number) => string;
  alCambiar: (v: number) => void;
}) {
  return (
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold text-white">
          {etiqueta}
        </label>
        <output htmlFor={id} className="font-titulo text-2xl font-bold tabular-nums text-acento">
          {formato(valor)}
        </output>
      </div>
      <p className="mt-1 text-sm text-tenue">{ayuda}</p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        onChange={(e) => alCambiar(Number(e.target.value))}
        className="mt-3 w-full accent-amber-500"
      />
      <div className="flex justify-between text-xs text-tenue" aria-hidden="true">
        <span>{formato(min)}</span>
        <span>{formato(max)}</span>
      </div>
    </Panel>
  );
}

export default function Configuracion() {
  const { tr } = useIdioma();
  const { umbrales: u, cambiarUmbrales, restaurar, modificados, analisis, conteoEstados } = useDatos();
  const fijar = (cambio: Partial<Umbrales>) => {
    const nuevo = { ...u, ...cambio };
    // El umbral de inactivo siempre debe quedar por encima del de riesgo.
    if (nuevo.inactivo <= nuevo.riesgo) nuevo.inactivo = Math.round((nuevo.riesgo + 0.1) * 10) / 10;
    cambiarUmbrales(nuevo);
  };

  const cambios = useMemo(
    () =>
      analisis
        .map((a) => ({ a, antes: BASE.analisisPorId.get(a.cliente.id)!.estado }))
        .filter((x) => x.antes !== x.a.estado)
        .sort((x, y) => y.a.puntaje - x.a.puntaje),
    [analisis],
  );

  const diferencia = (e: Estado) => {
    const d = conteoEstados[e] - BASE.conteoEstados[e];
    return d === 0 ? tr('sin cambio', 'no change') : `${d > 0 ? '+' : '−'}${Math.abs(d)} ${tr('vs. valores iniciales', 'vs. initial values')}`;
  };

  return (
    <>
      <PageHeader
        titulo={tr('Configuración', 'Settings')}
        subtitulo={tr(
          'Los umbrales que definen cuándo un cliente está en riesgo o inactivo. Son valores iniciales: se ajustan con Green Services.',
          'The thresholds that define when a client is at risk or inactive. They are starting values, to be adjusted with Green Services.',
        )}
      >
        <Button onClick={restaurar} disabled={!modificados}>
          {tr('Restaurar valores iniciales', 'Restore initial values')}
        </Button>
      </PageHeader>

      <div className="mb-6 rounded-xl border border-acento/40 bg-acento/10 p-4 text-sm text-slate-200" role="note">
        <strong className="text-white">{tr('Estos valores se ajustan con la empresa.', 'These values are tuned with the company.')}</strong>{' '}
        {tr(
          `Hoy usamos ${fmtDec(UMBRALES.riesgo)}× para «en riesgo», ${fmtDec(UMBRALES.inactivo)}× para «inactivo» y ${UMBRALES.diasMaximosSinComprar} días como máximo sin comprar. Green Services debe confirmar cuántos días sin comprar hacen a un cliente frío para su negocio [por confirmar]. Los cambios de esta pantalla duran mientras la página esté abierta; los valores definitivos se escriben en src/config/umbrales.ts.`,
          `Today we use ${fmtDec(UMBRALES.riesgo)}× for "at risk", ${fmtDec(UMBRALES.inactivo)}× for "inactive" and a ${UMBRALES.diasMaximosSinComprar}-day maximum without buying. Green Services must confirm how many days without buying make a client inactive for their business [to be confirmed]. Changes here last while the page is open; final values go in src/config/umbrales.ts.`,
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Deslizador
          id="umbral-riesgo"
          etiqueta={tr('En riesgo desde', 'At risk from')}
          ayuda={tr('Veces su ritmo normal a partir de las cuales el cliente pasa a «en riesgo».', 'Times their normal pace from which a client becomes "at risk".')}
          valor={u.riesgo}
          min={1}
          max={2}
          paso={0.05}
          formato={(v) => `${fmtDec(v, 2)}×`}
          alCambiar={(v) => fijar({ riesgo: v })}
        />
        <Deslizador
          id="umbral-inactivo"
          etiqueta={tr('Inactivo desde', 'Inactive from')}
          ayuda={tr('Veces su ritmo normal a partir de las cuales el cliente pasa a «inactivo».', 'Times their normal pace from which a client becomes "inactive".')}
          valor={u.inactivo}
          min={1.1}
          max={4}
          paso={0.1}
          formato={(v) => `${fmtDec(v)}×`}
          alCambiar={(v) => fijar({ inactivo: v })}
        />
        <Deslizador
          id="umbral-dias"
          etiqueta={tr('Máximo de días sin comprar', 'Maximum days without buying')}
          ayuda={tr('Pasado este número de días, el cliente es «inactivo» sin importar su ritmo.', 'Beyond this many days, the client is "inactive" regardless of their pace.')}
          valor={u.diasMaximosSinComprar}
          min={60}
          max={365}
          paso={15}
          formato={(v) => tr(`${v} días`, `${v} days`)}
          alCambiar={(v) => fijar({ diasMaximosSinComprar: v })}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" aria-live="polite">
        <StatCard titulo={tr('Activos', 'Active')} valor={conteoEstados.activo} color={INFO_ESTADO.activo.color} detalle={diferencia('activo')} />
        <StatCard titulo={tr('En riesgo', 'At risk')} valor={conteoEstados.riesgo} color={INFO_ESTADO.riesgo.color} detalle={diferencia('riesgo')} />
        <StatCard titulo={tr('Inactivos', 'Inactive')} valor={conteoEstados.frio} color={INFO_ESTADO.frio.color} detalle={diferencia('frio')} />
      </div>

      <Card titulo={tr(`Clientes que cambian de estado (${cambios.length})`, `Clients that change status (${cambios.length})`)} className="mt-6">
        {cambios.length ? (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {cambios.map(({ a, antes }) => (
              <li key={a.cliente.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-borde/60 bg-superficie px-3 py-2 text-sm">
                <Link to={`/clientes/${a.cliente.id}`} className="font-medium text-white hover:text-acento hover:underline">
                  {a.cliente.nombre}
                </Link>
                <StatusChip estado={antes} />
                <span className="text-tenue" aria-label={tr('pasa a', 'becomes')}>
                  →
                </span>
                <StatusChip estado={a.estado} />
                <span className="ml-auto text-xs text-tenue">
                  {tr(`${a.recencia} días · ${fmtDec(a.ratio)}× su ritmo`, `${a.recencia} days · ${fmtDec(a.ratio)}× their pace`)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            titulo={tr('Ningún cliente cambia de estado', 'No client changes status')}
            descripcion={tr(
              'Mueve los controles para ver el efecto: los cambios se aplican en vivo en toda la web (alertas, radar, fichas y reporte).',
              'Move the sliders to see the effect: changes apply live across the site (alerts, radar, profiles and report).',
            )}
          />
        )}
      </Card>
    </>
  );
}
