import { Link } from 'react-router-dom';
import { ButtonLink, Card, EmptyState, PageHeader, StatCard, Variacion } from '../components/ui';
import GraficaVentas from '../components/GraficaVentas';
import AlertaItem from '../components/AlertaItem';
import { IconoFlecha, IconoReporte } from '../components/Iconos';
import { alertas, conteoEstados, HOY, mesActual, pronostico, serie, trmHoy, trmVariacion30 } from '../lib/datos';
import { useContactados } from '../lib/contactados';
import { etiquetaMes } from '../lib/analytics';
import { fmtCompacto, fmtFecha, fmtTrm, fmtUsd } from '../lib/format';

export default function Inicio() {
  const { contactados } = useContactados();
  const urgentes = alertas.filter((a) => !contactados.has(a.id)).slice(0, 5);

  return (
    <>
      <PageHeader titulo="Inicio" subtitulo={`Resumen al ${fmtFecha(HOY)}. Toda la información de clientes, ventas y TRM en un solo lugar, sin consolidar Excel a mano.`}>
        <ButtonLink to="/reporte">
          <IconoReporte width={18} height={18} /> Reporte del mes
        </ButtonLink>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="col-span-2">
          <StatCard
            titulo={`Ventas del mes (1 al ${mesActual.dia})`}
            valor={
              <span className="flex flex-wrap items-baseline gap-x-3">
                {fmtUsd(mesActual.usd)}
                <span className="text-base font-medium text-tenue">{fmtCompacto(mesActual.cop, 'COP')}</span>
              </span>
            }
            detalle={
              <div className="flex flex-col gap-0.5">
                <Variacion valor={mesActual.variacionUsd} texto="en USD vs. mismos días del mes anterior" />
                <Variacion valor={mesActual.variacionCop} texto="en COP" />
              </div>
            }
          />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <StatCard titulo="TRM de hoy" valor={fmtTrm(trmHoy.valor)} detalle={<Variacion valor={trmVariacion30} texto="en 30 días" />} />
        </div>
        <div className="col-span-2 lg:col-span-1">
          <StatCard titulo="Clientes activos" valor={conteoEstados.activo} color="#22C55E" detalle={<span><span aria-hidden="true">●</span> compran a su ritmo</span>} />
        </div>
        <StatCard titulo="En riesgo" valor={conteoEstados.riesgo} color="#F59E0B" detalle={<span><span aria-hidden="true">▲</span> se están atrasando</span>} />
        <StatCard titulo="Fríos" valor={conteoEstados.frio} color="#EF4444" detalle={<span><span aria-hidden="true">■</span> dejaron de comprar</span>} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card
          titulo="Ventas por mes"
          className="xl:col-span-3"
          accion={<Link to="/predicciones" className="text-sm text-azul hover:underline">Ver pronóstico</Link>}
        >
          <GraficaVentas datos={serie} alto={340} />
          <p className="mt-3 text-xs text-tenue">
            Últimos 12 meses cerrados. La línea punteada es el pronóstico para {etiquetaMes(pronostico.mes)}* ({fmtUsd(pronostico.valor)}).
          </p>
        </Card>

        <Card
          titulo="Contactar esta semana"
          className="xl:col-span-2"
          accion={
            <ButtonLink to="/alertas">
              Ver todas <IconoFlecha width={16} height={16} />
            </ButtonLink>
          }
        >
          {urgentes.length ? (
            <ul className="flex flex-col gap-3">
              {urgentes.map((a) => <AlertaItem key={a.id} alerta={a} compacta />)}
            </ul>
          ) : (
            <EmptyState titulo="No hay alertas pendientes" descripcion="Ya contactaste a todos los clientes priorizados. ¡Buen trabajo!" />
          )}
        </Card>
      </div>
    </>
  );
}
