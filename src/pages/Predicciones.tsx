import { Link } from 'react-router-dom';
import { Card, PageHeader, Panel, StatusChip, Table, Td, Th, Thead, Tr } from '../components/ui';
import GraficaVentas from '../components/GraficaVentas';
import { pronostico, serie, trmVariacion30, HOY } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { useIdioma } from '../lib/idioma';
import { fmtDec, fmtFecha, fmtMes, fmtUsd } from '../lib/format';

export default function Predicciones() {
  const { tr } = useIdioma();
  const { resultadoBacktest: bt, umbrales: u } = useDatos();
  const UMBRAL_ACTIVO = u.riesgo;
  const UMBRAL_FRIO = fmtDec(u.inactivo);
  const DIAS_FRIO = u.diasMaximosSinComprar;
  const pct = Math.round(bt.porcentaje * 100);
  const sube = pronostico.tendencia >= 0;
  const umbralActivo = fmtDec(UMBRAL_ACTIVO);
  const pasos: [string, string][] = [
    [
      tr('1. Conoce su ritmo', '1. Learns their pace'),
      tr(
        'Calcula cada cuántos días compra cada cliente (su ciclo), cuánto compra y cuándo fue la última vez.',
        'Calculates how often each client buys (their cycle), how much they buy and when they last bought.',
      ),
    ],
    [
      tr('2. Mide el atraso', '2. Measures the delay'),
      tr(
        'Divide los días sin comprar entre su ciclo. Si compra cada 30 días y lleva 60, el atraso es 2 veces su ritmo.',
        'Divides days since last purchase by their cycle. If they buy every 30 days and it has been 60, the delay is 2× their pace.',
      ),
    ],
    [
      tr('3. Da un puntaje', '3. Scores the risk'),
      tr(
        `Convierte ese atraso en un puntaje de 0 a 100. Si el dólar subió más de 5 % en 30 días (hoy: ${fmtDec(trmVariacion30 * 100)} %), suma unos puntos: las compras en dólares tienden a aplazarse.`,
        `Turns that delay into a 0–100 score. If the dollar rose more than 5% in 30 days (today: ${fmtDec(trmVariacion30 * 100)}%), it adds a few points: purchases in dollars tend to be postponed.`,
      ),
    ],
    [
      tr('4. Recomienda', '4. Recommends'),
      tr(
        'Con reglas simples sugiere a quién llamar, por qué y qué ofrecerle según lo que tiene y lo que compran clientes parecidos.',
        'With simple rules it suggests who to call, why, and what to offer based on what they own and what similar clients buy.',
      ),
    ],
  ];

  return (
    <>
      <PageHeader
        titulo={tr('Predicciones', 'Predictions')}
        subtitulo={tr('Qué esperamos que pase y qué tan confiable ha sido la IA.', 'What we expect to happen and how reliable the AI has been.')}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card titulo={tr(`Pronóstico de ventas: ${fmtMes(pronostico.mes)}`, `Sales forecast: ${fmtMes(pronostico.mes)}`)} className="xl:col-span-2">
          <p className="mb-4 font-titulo text-4xl font-bold text-acento">{fmtUsd(pronostico.valor)}</p>
          <GraficaVentas datos={serie} alto={260} />
          <Panel className="mt-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{tr('¿De dónde sale este número?', 'Where does this number come from?')}</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                {tr('Tomamos las ventas de los últimos 3 meses cerrados: ', 'We take sales from the last 3 closed months: ')}
                {pronostico.ultimos3.map((m, i) => (
                  <span key={m.clave}>
                    {fmtMes(m.clave)} {fmtUsd(m.usd)}
                    {i < 2 ? ', ' : '.'}
                  </span>
                ))}
              </li>
              <li>
                {tr('Su promedio es ', 'Their average is ')}
                <strong>{fmtUsd(pronostico.promedio3)}</strong>.
              </li>
              <li>
                {sube
                  ? tr('En esos meses las ventas subieron en promedio ', 'Over those months sales went up on average by ')
                  : tr('En esos meses las ventas bajaron en promedio ', 'Over those months sales went down on average by ')}
                <strong>{fmtUsd(Math.abs(pronostico.tendencia))}</strong> {tr('por mes (la tendencia).', 'per month (the trend).')}
              </li>
              <li>
                {tr('Pronóstico = promedio ', 'Forecast = average ')}
                {sube ? '+' : '−'} {tr('tendencia', 'trend')} = <strong className="text-acento">{fmtUsd(pronostico.valor)}</strong>.
              </li>
            </ol>
            <p className="mt-3 text-xs text-tenue">
              {tr(
                'Es un método sencillo a propósito: fácil de explicar y de verificar. Con datos reales se puede reemplazar por un modelo estacional.',
                'It is a deliberately simple method: easy to explain and verify. With real data it can be replaced by a seasonal model.',
              )}
            </p>
          </Panel>
        </Card>

        <Card titulo={tr('% de acierto de la IA', 'AI accuracy')}>
          <div className="flex items-center gap-4">
            <div
              className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(rgb(var(--texto-ok)) ${pct * 3.6}deg, rgb(var(--c-borde)) 0deg)` }}
              role="img"
              aria-label={tr(`${pct} por ciento de acierto`, `${pct} percent accuracy`)}
            >
              <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full bg-tarjeta">
                <span className="font-titulo text-3xl font-bold">{pct}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              {tr('De ', 'Of the ')}
              <strong>{bt.marcados}</strong>
              {tr(' clientes que la IA marcó en riesgo, ', ' clients the AI flagged as at risk, ')}
              <strong>{bt.aciertos}</strong>
              {tr(' efectivamente no volvieron a comprar.', ' did not buy again.')}
            </p>
          </div>
          <Panel className="mt-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{tr('¿Cómo lo medimos?', 'How do we measure it?')}</p>
            <p className="mt-1">
              {tr(
                `«Viajamos al pasado»: le mostramos a la IA solo los datos hasta el ${fmtFecha(bt.fechaCorte)} (60 días antes de hoy) y le pedimos señalar quiénes estaban en riesgo. Luego miramos lo que de verdad pasó hasta el ${fmtFecha(HOY)}.`,
                `"We travel back in time": we show the AI only the data up to ${fmtFecha(bt.fechaCorte)} (60 days before today) and ask it to flag who was at risk. Then we check what actually happened up to ${fmtFecha(HOY)}.`,
              )}
            </p>
          </Panel>
          <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
            {bt.detalle.map((d) => (
              <li key={d.analisis.cliente.id} className="flex items-center justify-between gap-2 rounded-lg border border-borde/60 px-3 py-2">
                <Link to={`/clientes/${d.analisis.cliente.id}`} className="hover:text-acento hover:underline">
                  {d.analisis.cliente.nombre}
                </Link>
                {d.compro ? (
                  <span className="text-xs text-red-300">
                    <span aria-hidden="true">✕</span> {tr('Sí compró (falsa alarma)', 'Did buy (false alarm)')}
                  </span>
                ) : (
                  <span className="text-xs text-green-300">
                    <span aria-hidden="true">✓</span> {tr('No compró (acierto)', 'Did not buy (correct)')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card titulo={tr('¿Cómo funciona la IA?', 'How does the AI work?')} className="mt-6">
        <blockquote className="rounded-xl border-l-4 border-acento bg-acento/10 p-4 text-lg text-slate-100">
          {tr(
            '«Si un vecino compra pan cada 3 días y lleva 10 sin aparecer, la dueña nota que algo pasó. Órbita hace eso con cada cliente.»',
            '"If a neighbor buys bread every 3 days and hasn\'t shown up in 10, the baker notices something happened. Órbita does that with every client."',
          )}
        </blockquote>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pasos.map(([t, d]) => (
            <Panel key={t}>
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </Panel>
          ))}
        </div>
        <Table minWidth={480} className="mt-5">
          <Thead>
            <Th>{tr('Estado', 'Status')}</Th>
            <Th>{tr('Regla (atraso = días sin comprar ÷ ciclo)', 'Rule (delay = days since purchase ÷ cycle)')}</Th>
            <Th>{tr('Qué hacer', 'What to do')}</Th>
          </Thead>
          <tbody>
            <Tr>
              <Td><StatusChip estado="activo" /></Td>
              <Td>{tr('atraso', 'delay')} ≤ {umbralActivo}</Td>
              <Td>{tr('Preparar la próxima propuesta.', 'Prepare the next proposal.')}</Td>
            </Tr>
            <Tr>
              <Td><StatusChip estado="riesgo" /></Td>
              <Td>{tr(`entre ${umbralActivo} y ${UMBRAL_FRIO}`, `between ${umbralActivo} and ${UMBRAL_FRIO}`)}</Td>
              <Td>{tr('Llamar esta semana.', 'Call this week.')}</Td>
            </Tr>
            <Tr>
              <Td><StatusChip estado="frio" /></Td>
              <Td>
                {tr(`atraso > ${UMBRAL_FRIO} o más de ${DIAS_FRIO} días sin comprar`, `delay > ${UMBRAL_FRIO} or more than ${DIAS_FRIO} days without buying`)}
              </Td>
              <Td>{tr('Plan de reactivación.', 'Win-back plan.')}</Td>
            </Tr>
          </tbody>
        </Table>
      </Card>
    </>
  );
}
