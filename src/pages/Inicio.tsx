import { Link } from 'react-router-dom';
import { lazy, Suspense, type ReactNode } from 'react';
import { ButtonLink, Card, ChipPrioridad, EmptyState, INFO_ESTADO, StatCard, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import AlertaItem from '../components/AlertaItem';
import Impacto from '../components/Impacto';
import { IconoCalendario, IconoCarrito, IconoClientes, IconoCopo, IconoDatos, IconoFlecha, IconoInfo, IconoModelo } from '../components/Iconos';
import { clientes, hayDatos, HOY, mesActual, modelo, MODO, pronostico, serie, trmHoy, trmVariacion30, ventas } from '../lib/datos';
import { ventasPorMes, type Estado } from '../lib/analytics';
import { useDatos } from '../lib/umbrales';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { fmtCompacto, fmtDec, fmtFecha, fmtMes, fmtNum, fmtTrm, fmtUsd } from '../lib/format';

// Las gráficas (Recharts) se descargan después de mostrar los números: la página aparece antes.
const AreaIngresos = lazy(() => import('../components/GraficasInicio').then((m) => ({ default: m.AreaIngresos })));
const Dona = lazy(() => import('../components/GraficasInicio').then((m) => ({ default: m.Dona })));
const GraficaVentas = lazy(() => import('../components/GraficaVentas'));
const DesempenoPromedio = lazy(() => import('../components/DesempenoModelo').then((m) => ({ default: m.DesempenoPromedio })));

/** Espacio reservado (del mismo alto) mientras llega una gráfica, para que la página no salte. */
function Diferido({ alto, children }: { alto: string; children: ReactNode }) {
  return <Suspense fallback={<div className={`${alto} w-full animate-pulse rounded-xl bg-superficie`} aria-hidden="true" />}>{children}</Suspense>;
}

/** Ingresos en pesos de todos los meses con ventas (para la gráfica de área). */
// Se omite el mes en curso (aún incompleto) para no mostrar una caída falsa.
const ingresosMensuales = [...ventasPorMes(ventas).entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .filter(([clave]) => clave < HOY.toISOString().slice(0, 7))
  .map(([clave, v]) => ({ clave, cop: v.cop }));
const totalCop = ventas.reduce((s, v) => s + v.valor_cop, 0);

/** Tarjeta de indicador con ícono en círculo, como el tablero de referencia. */
function Indicador({ icono, valor, etiqueta, detalle }: { icono: ReactNode; valor: ReactNode; etiqueta: string; detalle?: ReactNode }) {
  return (
    <div className="flex h-full items-center gap-4 rounded-2xl border border-borde bg-tarjeta p-4 shadow-tarjeta sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-turquesa/20 to-acento/20 text-acento">{icono}</span>
      <div className="min-w-0">
        <p className="whitespace-nowrap font-titulo text-2xl font-bold tabular-nums text-white xl:text-[1.7rem]">{valor}</p>
        <p className="text-sm text-slate-300">{etiqueta}</p>
        {detalle && <p className="text-xs text-tenue">{detalle}</p>}
      </div>
    </div>
  );
}

export default function Inicio() {
  const { contactados } = useContactados();
  const { alertas, analisis, conteoEstados, enRiesgo } = useDatos();
  const { tr, b } = useIdioma();
  const { colores: c } = useTema();
  const urgentes = alertas.filter((a) => !contactados.has(a.id)).slice(0, 5);
  const total = clientes.length || 1;
  const situacion: { estado: Estado; n: number; color: string }[] = [
    { estado: 'activo', n: conteoEstados.activo, color: c.turquesa },
    { estado: 'riesgo', n: conteoEstados.riesgo, color: c.violeta },
    { estado: 'frio', n: conteoEstados.frio, color: c.acento + '66' },
  ];
  // Clientes prioritarios: mayor probabilidad de compra entre los que ya «tocan» (no compraron en los últimos 15 días).
  const prioritarios = analisis
    .map((a) => ({ a, p: modelo.predicciones.get(a.cliente.id) }))
    .filter((x) => x.p && x.a.recencia >= 15)
    .sort((x, y) => y.p!.probabilidad - x.p!.probabilidad)
    .slice(0, 6);

  return (
    <>
      {/* Encabezado al estilo del tablero del reto */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-tenue">
            <strong className="font-semibold text-white">ESTUD-IA</strong> <span aria-hidden="true">|</span> {tr('Reto 4 · IA en Operaciones', 'Challenge 4 · AI in Operations')}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-4xl">
            {tr('Inteligencia Artificial en', 'Artificial Intelligence in')} <span className="text-acento">{tr('Operaciones', 'Operations')}</span>
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            {tr(
              'Integración de datos, análisis y predicción para una gestión comercial, operativa y financiera más proactiva.',
              'Data integration, analysis and prediction for more proactive sales, operations and finance management.',
            )}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-borde bg-tarjeta px-3 py-2 text-sm text-slate-200 shadow-tarjeta">
          <IconoCalendario width={18} height={18} className="text-acento" /> {tr('Corte', 'As of')}: {fmtFecha(HOY)}
        </span>
      </header>

      {MODO === 'demo' && (
        <p className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-2xl border border-turquesa/30 bg-turquesa/10 px-4 py-3 text-sm text-slate-200" role="note">
          <span className="inline-flex items-center gap-2 font-titulo text-base font-semibold text-white">
            <IconoInfo width={20} height={20} className="text-turquesa" /> {tr('Datos de prueba', 'Test data')}
          </span>
          <span className="hidden text-tenue xl:inline" aria-hidden="true">|</span>
          {tr(
            'Los datos y resultados corresponden a un ejercicio de prueba. No representan información real de la empresa.',
            'Data and results come from a test exercise. They do not represent real company information.',
          )}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Indicador icono={<IconoClientes width={24} height={24} />} valor={fmtNum(clientes.length)} etiqueta={tr('Clientes', 'Clients')} />
        <Indicador icono={<IconoCarrito width={24} height={24} />} valor={fmtNum(ventas.length)} etiqueta={tr('Ventas confirmadas', 'Confirmed sales')} />
        <Indicador icono={<IconoDatos width={24} height={24} />} valor={fmtCompacto(totalCop, 'COP')} etiqueta={tr('Ingresos COP', 'Revenue (COP)')} detalle={fmtCompacto(ventas.reduce((s, v) => s + v.valor_usd, 0))} />
        <Indicador icono={<IconoCopo width={24} height={24} />} valor={fmtNum(conteoEstados.frio)} etiqueta={tr('Clientes inactivos (fríos)', 'Inactive (cold) clients')} />
      </div>

      {/* Indicadores del mes: ventas (USD y COP) con variación, TRM de hoy y clientes por estado */}
      <div className="mt-4 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <StatCard
            titulo={tr(`Ventas del mes (1 al ${mesActual.dia})`, `Month-to-date sales (1–${mesActual.dia})`)}
            valor={fmtUsd(mesActual.usd)}
            detalle={
              <div className="flex flex-col gap-0.5">
                <span>{fmtCompacto(mesActual.cop, 'COP')}</span>
                <Variacion valor={mesActual.variacionUsd} texto={tr('vs. mismos días del mes anterior', 'vs. same days last month')} />
              </div>
            }
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <StatCard titulo={tr('TRM de hoy', "Today's exchange rate (TRM)")} valor={fmtTrm(trmHoy.valor)} detalle={<Variacion valor={trmVariacion30} texto={tr('en 30 días', 'in 30 days')} />} />
        </div>
        <StatCard
          titulo={tr('Clientes activos', 'Active clients')}
          valor={conteoEstados.activo}
          color={INFO_ESTADO.activo.color}
          detalle={<span><span aria-hidden="true">●</span> {tr('compran a su ritmo', 'buying on schedule')}</span>}
        />
        <StatCard
          titulo={tr('En riesgo', 'At risk')}
          valor={conteoEstados.riesgo}
          color={INFO_ESTADO.riesgo.color}
          detalle={<span><span aria-hidden="true">▲</span> {tr('se están atrasando', 'falling behind')}</span>}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card titulo={tr('Ingresos mensuales (COP)', 'Monthly revenue (COP)')} className="xl:col-span-3">
          <div
            className="h-64"
            role="img"
            aria-label={tr('Gráfica de área con los ingresos mensuales en pesos de todo el historial', 'Area chart of monthly revenue in pesos over the whole history')}
          >
            <Diferido alto="h-64">
              <AreaIngresos datos={ingresosMensuales} />
            </Diferido>
          </div>
        </Card>

        <Card titulo={tr('Clientes por situación', 'Clients by status')} className="xl:col-span-2">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-48 w-48 shrink-0" role="img" aria-label={situacion.map((s2) => `${b(INFO_ESTADO[s2.estado])}: ${s2.n}`).join(', ')}>
              <Diferido alto="h-48">
                <Dona situacion={situacion} />
              </Diferido>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-titulo text-3xl font-bold text-white">{clientes.length}</p>
                  <p className="text-xs text-tenue">{tr('Clientes', 'Clients')}</p>
                </div>
              </div>
            </div>
            <ul className="w-full space-y-2 text-sm">
              {situacion.map((s2) => (
                <li key={s2.estado} className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded" style={{ background: s2.color }} aria-hidden="true" />
                  <span className="flex-1 text-slate-200">
                    {b(INFO_ESTADO[s2.estado])} <span className="text-tenue">({fmtDec((s2.n / total) * 100)} %)</span>
                  </span>
                  <span className="font-semibold tabular-nums text-white">{s2.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card
          titulo={tr('Clientes prioritarios para seguimiento', 'Priority clients to follow up')}
          className="xl:col-span-3"
          accion={
            <Link to="/clientes" className="inline-flex items-center gap-1 text-sm font-medium text-acento hover:underline">
              {tr('Ver todos', 'See all')} <IconoFlecha width={16} height={16} />
            </Link>
          }
        >
          {prioritarios.length ? (
            <Table minWidth={560}>
              <Thead>
                <Th className="pl-4">{tr('Cliente', 'Client')}</Th>
                <Th derecha>{tr('Días sin compra', 'Days without buying')}</Th>
                <Th>{tr('Renovación', 'Renewal')}</Th>
                <Th derecha>{tr('Prob. compra (30 días)', 'Purchase prob. (30 days)')}</Th>
                <Th>{tr('Prioridad', 'Priority')}</Th>
              </Thead>
              <tbody>
                {prioritarios.map(({ a, p }) => (
                  <Tr key={a.cliente.id}>
                    <Td className="pl-4">
                      <Link to={`/clientes/${a.cliente.id}`} className="whitespace-nowrap font-semibold text-acento hover:underline">
                        {a.cliente.nombre}
                      </Link>
                    </Td>
                    <Td derecha>{a.recencia}</Td>
                    <Td className="whitespace-nowrap text-slate-300">
                      {a.productoRecomendado?.tipo === 'renovacion' ? (
                        <span title={a.productoRecomendado.producto.nombre}>{tr('Pendiente', 'Due')} · {fmtCompacto(a.productoRecomendado.valorEstimado)}</span>
                      ) : (
                        <span className="text-tenue">—</span>
                      )}
                    </Td>
                    <Td derecha className="tabular-nums">{fmtDec(p!.probabilidad, 2)}</Td>
                    <Td><ChipPrioridad prioridad={p!.prioridad} /></Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              titulo={tr('Sin predicciones todavía', 'No predictions yet')}
              descripcion={modelo.motivo ? b(modelo.motivo) : tr('El modelo necesita datos de ventas.', 'The model needs sales data.')}
            />
          )}
        </Card>

        <Card
          titulo={
            <span className="inline-flex items-center gap-2">
              <IconoModelo width={20} height={20} className="text-acento" /> {tr('Desempeño del modelo de IA', 'AI model performance')}
            </span>
          }
          className="xl:col-span-2"
          accion={
            <Link to="/modelo" className="text-sm font-medium text-acento hover:underline">
              {tr('Ver evaluación', 'See evaluation')}
            </Link>
          }
        >
          {modelo.validacion ? (
            <Diferido alto="h-72">
              <DesempenoPromedio />
            </Diferido>
          ) : (
            <EmptyState titulo={tr('Aún no hay validación', 'No validation yet')} descripcion={modelo.motivo ? b(modelo.motivo) : undefined} />
          )}
        </Card>
      </div>

      <section
        className="mt-6 flex flex-col gap-3 rounded-2xl border border-acento/40 bg-acento/10 p-4 shadow-tarjeta sm:flex-row sm:items-center sm:justify-between sm:p-5"
        aria-label={tr('Ventas en riesgo', 'Revenue at risk')}
      >
        <div>
          <p className="text-sm text-amber-200">{tr('Ventas en riesgo', 'Revenue at risk')}</p>
          <p className="font-titulo text-2xl font-bold text-white sm:text-3xl">
            {fmtCompacto(enRiesgo.riesgo)} <span className="text-base font-medium text-tenue">{tr('al año', 'per year')}</span>
          </p>
          <p className="mt-1 text-sm text-slate-300">
            {tr(
              `Es lo que compran en un año los ${conteoEstados.riesgo} clientes en riesgo. Otros ${fmtCompacto(enRiesgo.friosRecuperables)} al año están en clientes inactivos que aún se pueden recuperar.`,
              `That's what the ${conteoEstados.riesgo} at-risk clients buy in a year. Another ${fmtCompacto(enRiesgo.friosRecuperables)} per year sits with inactive clients who can still be won back.`,
            )}
          </p>
        </div>
        <ButtonLink to="/alertas" variante="primario" className="shrink-0">
          {tr('Ver a quién llamar', 'See who to call')} <IconoFlecha width={16} height={16} />
        </ButtonLink>
      </section>

      <Impacto className="mt-4" />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card
          titulo={tr('Ventas por mes', 'Sales by month')}
          className="xl:col-span-3"
          accion={<Link to="/predicciones" className="text-sm text-azul hover:underline">{tr('Ver pronóstico', 'See forecast')}</Link>}
        >
          <Diferido alto="h-[340px]">
            <GraficaVentas datos={serie} alto={340} />
          </Diferido>
          <p className="mt-3 text-xs text-tenue">
            {tr(
              `Últimos 12 meses cerrados. La línea punteada es el pronóstico para ${fmtMes(pronostico.mes)}* (${fmtUsd(pronostico.valor)}).`,
              `Last 12 closed months. The dashed line is the forecast for ${fmtMes(pronostico.mes)}* (${fmtUsd(pronostico.valor)}).`,
            )}
          </p>
        </Card>

        <Card
          titulo={tr('Contactar esta semana', 'Contact this week')}
          className="xl:col-span-2"
          accion={
            <ButtonLink to="/alertas">
              {tr('Ver todas', 'See all')} <IconoFlecha width={16} height={16} />
            </ButtonLink>
          }
        >
          {urgentes.length ? (
            <ul className="flex flex-col gap-3">
              {urgentes.map((a) => <AlertaItem key={a.id} alerta={a} compacta />)}
            </ul>
          ) : (
            <EmptyState
              titulo={tr('No hay alertas pendientes', 'No pending alerts')}
              descripcion={
                hayDatos
                  ? tr('Ya contactaste a todos los clientes priorizados. ¡Buen trabajo!', "You've contacted every prioritized client. Great job!")
                  : tr('Las alertas aparecen cuando haya datos de ventas.', 'Alerts appear once there is sales data.')
              }
            />
          )}
        </Card>
      </div>
    </>
  );
}
