import { Link } from 'react-router-dom';
import { Card, PageHeader, Panel, StatusChip, Table, Td, Th, Thead, Tr } from '../components/ui';
import GraficaVentas from '../components/GraficaVentas';
import { pronostico, resultadoBacktest as bt, serie, trmVariacion30, HOY } from '../lib/datos';
import { etiquetaMes, UMBRAL_ACTIVO, UMBRAL_FRIO, DIAS_FRIO } from '../lib/analytics';
import { fmtFecha, fmtUsd } from '../lib/format';

export default function Predicciones() {
  const pct = Math.round(bt.porcentaje * 100);
  const sube = pronostico.tendencia >= 0;

  return (
    <>
      <PageHeader titulo="Predicciones" subtitulo="Qué esperamos que pase y qué tan confiable ha sido la IA." />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card titulo={`Pronóstico de ventas: ${etiquetaMes(pronostico.mes)}`} className="xl:col-span-2">
          <p className="mb-4 font-titulo text-4xl font-bold text-acento">{fmtUsd(pronostico.valor)}</p>
          <GraficaVentas datos={serie} alto={260} />
          <Panel className="mt-4 text-sm text-slate-300">
            <p className="font-semibold text-white">¿De dónde sale este número?</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>
                Tomamos las ventas de los últimos 3 meses cerrados:{' '}
                {pronostico.ultimos3.map((m, i) => (
                  <span key={m.clave}>{etiquetaMes(m.clave)} {fmtUsd(m.usd)}{i < 2 ? ', ' : '.'}</span>
                ))}
              </li>
              <li>Su promedio es <strong>{fmtUsd(pronostico.promedio3)}</strong>.</li>
              <li>
                En esos meses las ventas {sube ? 'subieron' : 'bajaron'} en promedio{' '}
                <strong>{fmtUsd(Math.abs(pronostico.tendencia))}</strong> por mes (la tendencia).
              </li>
              <li>Pronóstico = promedio {sube ? '+' : '−'} tendencia = <strong className="text-acento">{fmtUsd(pronostico.valor)}</strong>.</li>
            </ol>
            <p className="mt-3 text-xs text-tenue">
              Es un método sencillo a propósito: fácil de explicar y de verificar. Con datos reales se puede reemplazar por un modelo estacional.
            </p>
          </Panel>
        </Card>

        <Card titulo="% de acierto de la IA">
          <div className="flex items-center gap-4">
            <div
              className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full"
              style={{ background: `conic-gradient(#22C55E ${pct * 3.6}deg, #22305A 0deg)` }}
              role="img"
              aria-label={`${pct} por ciento de acierto`}
            >
              <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full bg-tarjeta">
                <span className="font-titulo text-3xl font-bold">{pct}%</span>
              </div>
            </div>
            <p className="text-sm text-slate-300">
              De <strong>{bt.marcados}</strong> clientes que la IA marcó en riesgo, <strong>{bt.aciertos}</strong> efectivamente no volvieron a comprar.
            </p>
          </div>
          <Panel className="mt-4 text-sm text-slate-300">
            <p className="font-semibold text-white">¿Cómo lo medimos?</p>
            <p className="mt-1">
              «Viajamos al pasado»: le mostramos a la IA solo los datos hasta el <strong>{fmtFecha(bt.fechaCorte)}</strong> (60 días antes de hoy)
              y le pedimos señalar quiénes estaban en riesgo. Luego miramos lo que de verdad pasó hasta el {fmtFecha(HOY)}.
            </p>
          </Panel>
          <ul className="mt-4 max-h-56 space-y-2 overflow-auto text-sm">
            {bt.detalle.map((d) => (
              <li key={d.analisis.cliente.id} className="flex items-center justify-between gap-2 rounded-lg border border-borde/60 px-3 py-2">
                <Link to={`/clientes/${d.analisis.cliente.id}`} className="hover:text-acento hover:underline">{d.analisis.cliente.nombre}</Link>
                {d.compro ? (
                  <span className="text-xs text-red-300"><span aria-hidden="true">✕</span> Sí compró (falsa alarma)</span>
                ) : (
                  <span className="text-xs text-green-300"><span aria-hidden="true">✓</span> No compró (acierto)</span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card titulo="¿Cómo funciona la IA?" className="mt-6">
        <blockquote className="rounded-xl border-l-4 border-acento bg-acento/10 p-4 text-lg text-slate-100">
          «Si un vecino compra pan cada 3 días y lleva 10 sin aparecer, la dueña nota que algo pasó.
          Órbita Pulse hace eso con cada cliente.»
        </blockquote>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['1. Conoce su ritmo', 'Calcula cada cuántos días compra cada cliente (su ciclo), cuánto compra y cuándo fue la última vez.'],
            ['2. Mide el atraso', 'Divide los días sin comprar entre su ciclo. Si compra cada 30 días y lleva 60, el atraso es 2 veces su ritmo.'],
            ['3. Da un puntaje', `Convierte ese atraso en un puntaje de 0 a 100. Si el dólar subió más de 5 % en 30 días (hoy: ${(trmVariacion30 * 100).toFixed(1).replace('.', ',')} %), suma unos puntos: las compras en dólares tienden a aplazarse.`],
            ['4. Recomienda', 'Con reglas simples sugiere a quién llamar, por qué y qué ofrecerle según lo último que compró.'],
          ].map(([t, d]) => (
            <Panel key={t}>
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-1 text-sm text-slate-300">{d}</p>
            </Panel>
          ))}
        </div>
        <Table minWidth={480} className="mt-5">
            <Thead>
              <Th>Estado</Th>
              <Th>Regla (atraso = días sin comprar ÷ ciclo)</Th>
              <Th>Qué hacer</Th>
            </Thead>
            <tbody>
              <Tr><Td><StatusChip estado="activo" /></Td><Td>atraso ≤ {String(UMBRAL_ACTIVO).replace('.', ',')}</Td><Td>Preparar la próxima propuesta.</Td></Tr>
              <Tr><Td><StatusChip estado="riesgo" /></Td><Td>entre {String(UMBRAL_ACTIVO).replace('.', ',')} y {UMBRAL_FRIO}</Td><Td>Llamar esta semana.</Td></Tr>
              <Tr><Td><StatusChip estado="frio" /></Td><Td>atraso &gt; {UMBRAL_FRIO} o más de {DIAS_FRIO} días sin comprar</Td><Td>Plan de reactivación.</Td></Tr>
            </tbody>
        </Table>
      </Card>
    </>
  );
}
