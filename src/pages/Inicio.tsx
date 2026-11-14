import { Link } from 'react-router-dom';
import { ButtonLink, Card, EmptyState, INFO_ESTADO, PageHeader, StatCard, Variacion } from '../components/ui';
import GraficaVentas from '../components/GraficaVentas';
import AlertaItem from '../components/AlertaItem';
import Impacto from '../components/Impacto';
import { IconoFlecha, IconoReporte } from '../components/Iconos';
import { HOY, mesActual, pronostico, serie, trmHoy, trmVariacion30 } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { fmtCompacto, fmtFecha, fmtMes, fmtTrm, fmtUsd } from '../lib/format';

export default function Inicio() {
  const { contactados } = useContactados();
  const { alertas, conteoEstados, enRiesgo } = useDatos();
  const { tr } = useIdioma();
  const urgentes = alertas.filter((a) => !contactados.has(a.id)).slice(0, 5);

  return (
    <>
      <PageHeader
        titulo={tr('Inicio', 'Home')}
        subtitulo={tr(
          `Resumen al ${fmtFecha(HOY)}. Toda la información de clientes, ventas y TRM en un solo lugar, sin consolidar Excel a mano.`,
          `Summary as of ${fmtFecha(HOY)}. All client, sales and exchange-rate data in one place, with no manual Excel consolidation.`,
        )}
      >
        <ButtonLink to="/reporte">
          <IconoReporte width={18} height={18} /> {tr('Reporte del mes', 'Monthly report')}
        </ButtonLink>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="col-span-2">
          <StatCard
            titulo={tr(`Ventas del mes (1 al ${mesActual.dia})`, `Month-to-date sales (1–${mesActual.dia})`)}
            valor={
              <span className="flex flex-wrap items-baseline gap-x-3">
                {fmtUsd(mesActual.usd)}
                <span className="text-base font-medium text-tenue">{fmtCompacto(mesActual.cop, 'COP')}</span>
              </span>
            }
            detalle={
              <div className="flex flex-col gap-0.5">
                <Variacion valor={mesActual.variacionUsd} texto={tr('en USD vs. mismos días del mes anterior', 'in USD vs. same days last month')} />
                <Variacion valor={mesActual.variacionCop} texto={tr('en COP', 'in COP')} />
              </div>
            }
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            titulo={tr('TRM de hoy', "Today's exchange rate (TRM)")}
            valor={fmtTrm(trmHoy.valor)}
            detalle={<Variacion valor={trmVariacion30} texto={tr('en 30 días', 'in 30 days')} />}
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            titulo={tr('Clientes activos', 'Active clients')}
            valor={conteoEstados.activo}
            color={INFO_ESTADO.activo.color}
            detalle={<span><span aria-hidden="true">●</span> {tr('compran a su ritmo', 'buying on schedule')}</span>}
          />
        </div>
        <StatCard
          titulo={tr('En riesgo', 'At risk')}
          valor={conteoEstados.riesgo}
          color={INFO_ESTADO.riesgo.color}
          detalle={<span><span aria-hidden="true">▲</span> {tr('se están atrasando', 'falling behind')}</span>}
        />
        <StatCard
          titulo={tr('Inactivos', 'Inactive')}
          valor={conteoEstados.frio}
          color={INFO_ESTADO.frio.color}
          detalle={<span><span aria-hidden="true">■</span> {tr('dejaron de comprar', 'stopped buying')}</span>}
        />
      </div>

      <section
        className="mt-4 flex flex-col gap-3 rounded-2xl border border-acento/40 bg-acento/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
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
          <GraficaVentas datos={serie} alto={340} />
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
              descripcion={tr('Ya contactaste a todos los clientes priorizados. ¡Buen trabajo!', "You've contacted every prioritized client. Great job!")}
            />
          )}
        </Card>
      </div>
    </>
  );
}
