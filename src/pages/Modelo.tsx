import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarraProbabilidad, Button, Card, EmptyState, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr } from '../components/ui';
import DesempenoModelo from '../components/DesempenoModelo';
import { clientePorId, modelo } from '../lib/datos';
import { VARIABLES, VENTANA_DIAS, type Metricas } from '../lib/modelo';
import { useIdioma } from '../lib/idioma';
import { fmtDec, fmtFecha, fmtNum } from '../lib/format';

const pct = (v: number) => `${fmtDec(v * 100)} %`;

function Diferencia({ m, r }: { m: number; r: number }) {
  const { tr } = useIdioma();
  const d = (m - r) * 100;
  if (Math.abs(d) < 0.05) return <span>{tr('igual que la regla base', 'same as baseline')}</span>;
  return (
    <span className={d > 0 ? 'text-green-300' : 'text-red-300'}>
      {d > 0 ? '▲ +' : '▼ −'}
      {fmtDec(Math.abs(d))} {tr('puntos vs. regla base', 'points vs. baseline')}
    </span>
  );
}

/** Matriz de confusión 2×2 explicada en palabras. */
function Matriz({ m }: { m: Metricas }) {
  const { tr } = useIdioma();
  const celdas = [
    { n: m.vp, t: tr('Dijo «comprará» y compró', 'Said "will buy" and did'), ok: true },
    { n: m.fp, t: tr('Dijo «comprará» y no compró (falsa alarma)', 'Said "will buy" but did not (false alarm)'), ok: false },
    { n: m.fn, t: tr('Dijo «no comprará» y sí compró (se le escapó)', 'Said "won\'t buy" but did (missed)'), ok: false },
    { n: m.vn, t: tr('Dijo «no comprará» y no compró', 'Said "won\'t buy" and did not'), ok: true },
  ];
  return (
    <div className="grid grid-cols-2 gap-3" role="table" aria-label={tr('Matriz de confusión', 'Confusion matrix')}>
      {celdas.map((c, i) => (
        <div key={i} role="cell" className={`rounded-xl border p-3 ${c.ok ? 'border-turquesa/40 bg-turquesa/10' : 'border-acento/30 bg-acento/5'}`}>
          <p className={`font-titulo text-2xl font-bold ${c.ok ? 'text-estado-ok' : 'text-acento'}`}>{c.n}</p>
          <p className="text-xs text-slate-300">{c.t}</p>
        </div>
      ))}
    </div>
  );
}

export default function Modelo() {
  const { tr, b } = useIdioma();
  const [todos, setTodos] = useState(false);
  const v = modelo.validacion;
  const nombre = (id: string) => clientePorId.get(id)?.nombre ?? id;

  if (!v && !modelo.entrenado)
    return (
      <>
        <PageHeader titulo={tr('Evaluación del modelo', 'Model evaluation')} />
        <EmptyState
          titulo={tr('Todavía no se puede entrenar el modelo', 'The model cannot be trained yet')}
          descripcion={modelo.motivo ? b(modelo.motivo) : undefined}
          accion={<Link to="/datos" className="text-sm text-azul hover:underline">{tr('Ir al Centro de datos', 'Go to the data hub')}</Link>}
        />
      </>
    );

  const maxPeso = Math.max(...modelo.pesos.map((p) => Math.abs(p.peso)), 0.01);
  const pesos = [...modelo.pesos].sort((a, b2) => Math.abs(b2.peso) - Math.abs(a.peso));
  const detalle = v ? (todos ? v.detalle : v.detalle.slice(0, 12)) : [];

  return (
    <>
      <PageHeader
        titulo={tr('Evaluación del modelo', 'Model evaluation')}
        subtitulo={tr(
          `Así validamos las predicciones: entrenamos el modelo solo con el pasado, le pedimos que adivinara quién compraría en los ${VENTANA_DIAS} días siguientes y comparamos con lo que de verdad pasó.`,
          `This is how we validate the predictions: we train the model only on the past, ask it to guess who would buy in the next ${VENTANA_DIAS} days, and compare with what actually happened.`,
        )}
      />

      {v && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard titulo={tr('Precisión', 'Precision')} valor={pct(v.modelo.precision)} color="rgb(var(--texto-ok))" detalle={<Diferencia m={v.modelo.precision} r={v.regla.precision} />} />
            <StatCard titulo={tr('Exhaustividad', 'Recall')} valor={pct(v.modelo.exhaustividad)} color="rgb(var(--texto-ok))" detalle={<Diferencia m={v.modelo.exhaustividad} r={v.regla.exhaustividad} />} />
            <StatCard titulo="F1" valor={pct(v.modelo.f1)} color="rgb(var(--texto-ok))" detalle={<Diferencia m={v.modelo.f1} r={v.regla.f1} />} />
            <StatCard titulo={tr('Exactitud', 'Accuracy')} valor={pct(v.modelo.exactitud)} color="rgb(var(--texto-ok))" detalle={<Diferencia m={v.modelo.exactitud} r={v.regla.exactitud} />} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
            <Card titulo={tr('Desempeño del modelo de IA', 'AI model performance')} className="xl:col-span-3">
              <DesempenoModelo modelo={v.modelo} regla={v.regla} alto={280} />
            </Card>
            <Card titulo={tr('¿En qué acertó y en qué no?', 'Where was it right and wrong?')} className="xl:col-span-2">
              <Matriz m={v.modelo} />
              <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                <li>
                  <strong className="text-white">{tr('Precisión', 'Precision')}:</strong>{' '}
                  {tr('de los clientes que el modelo dijo que comprarían, cuántos compraron.', 'of the clients the model said would buy, how many did.')}
                </li>
                <li>
                  <strong className="text-white">{tr('Exhaustividad', 'Recall')}:</strong>{' '}
                  {tr('de los clientes que compraron, cuántos detectó el modelo.', 'of the clients who bought, how many the model caught.')}
                </li>
                <li>
                  <strong className="text-white">F1:</strong> {tr('el balance entre las dos.', 'the balance between both.')}
                </li>
              </ul>
            </Card>
          </div>
        </>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card titulo={tr('¿Cómo se entrenó?', 'How was it trained?')}>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
            <li>
              {tr(
                `Tomamos ${modelo.fotos} «fotos» del pasado, una cada 15 días: cómo estaba cada cliente ese día y si compró en los ${VENTANA_DIAS} días siguientes (${fmtNum(modelo.filasEntrenamiento)} ejemplos).`,
                `We took ${modelo.fotos} "snapshots" of the past, one every 15 days: how each client looked that day and whether they bought in the next ${VENTANA_DIAS} days (${fmtNum(modelo.filasEntrenamiento)} examples).`,
              )}
            </li>
            <li>
              {tr(
                'Con esos ejemplos se entrena una regresión logística: aprende cuánto pesa cada señal para estimar la probabilidad de compra (de 0 a 1).',
                'A logistic regression learns from those examples how much each signal weighs to estimate the purchase probability (0 to 1).',
              )}
            </li>
            {v && (
              <li>
                {tr(
                  `Validación: un modelo entrenado solo con datos anteriores al ${fmtFecha(v.fecha)} predijo quién compraría entre esa fecha y hoy. En ese periodo compró el ${fmtDec(v.tasaCompra * 100, 0)} % de los clientes.`,
                  `Validation: a model trained only on data before ${fmtFecha(v.fecha)} predicted who would buy between that date and today. ${fmtDec(v.tasaCompra * 100, 0)}% of clients bought in that period.`,
                )}
              </li>
            )}
            <li>
              {tr(
                'Se compara con una regla simple: «comprará si compró en los últimos 30 días». Si el modelo no le gana a esa regla, no vale la pena.',
                'It is compared with a simple rule: "will buy if they bought in the last 30 days". If the model can\'t beat that rule, it isn\'t worth it.',
              )}
            </li>
            <li>{tr('Para las predicciones de hoy se vuelve a entrenar con todos los datos.', "For today's predictions it is retrained with all the data.")}</li>
          </ol>
        </Card>

        <Card titulo={tr('Qué señales pesan más', 'Which signals weigh most')}>
          <ul className="space-y-3">
            {pesos.map((p) => {
              const info = VARIABLES.find((x) => x.id === p.id)!;
              return (
                <li key={p.id}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="text-slate-200">{b(info)}</span>
                    <span className={`text-xs font-semibold ${p.peso >= 0 ? 'text-estado-ok' : 'text-acento'}`}>
                      {p.peso >= 0 ? tr('sube la probabilidad', 'raises probability') : tr('baja la probabilidad', 'lowers probability')}
                    </span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-borde/60" aria-hidden="true">
                    <div className={`h-full rounded-full ${p.peso >= 0 ? 'bg-turquesa' : 'bg-acento'}`} style={{ width: `${(Math.abs(p.peso) / maxPeso) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {v && (
        <Card titulo={tr(`Predicción vs. realidad (${v.detalle.length} clientes)`, `Prediction vs. reality (${v.detalle.length} clients)`)} className="mt-6">
          <Table minWidth={620}>
            <Thead>
              <Th className="pl-4">{tr('Cliente', 'Client')}</Th>
              <Th>{tr('Probabilidad', 'Probability')}</Th>
              <Th>{tr('Modelo', 'Model')}</Th>
              <Th>{tr('Regla base', 'Baseline')}</Th>
              <Th>{tr('¿Compró?', 'Did they buy?')}</Th>
              <Th>{tr('Resultado', 'Result')}</Th>
            </Thead>
            <tbody>
              {detalle.map((d) => {
                const bien = d.predijo === d.compro;
                return (
                  <Tr key={d.idCliente}>
                    <Td className="pl-4">
                      <Link to={`/clientes/${d.idCliente}`} className="font-medium text-white hover:text-acento hover:underline">
                        {nombre(d.idCliente)}
                      </Link>
                    </Td>
                    <Td><BarraProbabilidad p={d.probabilidad} /></Td>
                    <Td>{d.predijo ? tr('Comprará', 'Will buy') : tr('No comprará', "Won't buy")}</Td>
                    <Td className="text-tenue">{d.regla ? tr('Comprará', 'Will buy') : tr('No comprará', "Won't buy")}</Td>
                    <Td>{d.compro ? tr('Sí', 'Yes') : tr('No', 'No')}</Td>
                    <Td>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${bien ? 'text-estado-ok' : 'text-acento'}`}>
                        <span aria-hidden="true">{bien ? '✓' : '✗'}</span> {bien ? tr('Acertó', 'Correct') : tr('Falló', 'Wrong')}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
          {v.detalle.length > 12 && (
            <div className="mt-3">
              <Button onClick={() => setTodos((t) => !t)}>{todos ? tr('Ver menos', 'Show less') : tr(`Ver los ${v.detalle.length}`, `Show all ${v.detalle.length}`)}</Button>
            </div>
          )}
        </Card>
      )}

      <Panel className="mt-6 text-sm text-slate-300">
        {tr(
          'Las cifras salen de los datos cargados (en la demo, inventados). Con los datos reales de Green Services esta misma validación se recalcula sola. Los umbrales de decisión deben validarse con la empresa [por confirmar].',
          "Figures come from the loaded data (in the demo, made up). With Green Services' real data this same validation is recalculated automatically. Decision thresholds must be validated with the company [to be confirmed].",
        )}
      </Panel>
    </>
  );
}
