import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, INFO_ESTADO, PageHeader, Panel, StatCard, StatusChip, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import { IconoImprimir } from '../components/Iconos';
import { generarReporte, mesesDisponibles } from '../lib/reporte';
import type { AnalisisCliente } from '../lib/analytics';
import { categoria } from '../lib/catalogo';
import { useIdioma } from '../lib/idioma';
import { fmtCompacto, fmtDec, fmtFecha, fmtMesLargo, fmtPct, fmtTrm, fmtUsd } from '../lib/format';
import { HOY, MODO } from '../lib/datos';
import { useDatos } from '../lib/umbrales';

const MESES = mesesDisponibles(6);
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function ListaClientes({ titulo, clientes, vacio }: { titulo: string; clientes: AnalisisCliente[]; vacio: string }) {
  return (
    <Panel>
      <p className="font-semibold text-white">
        {titulo} <span className="text-tenue">({clientes.length})</span>
      </p>
      {clientes.length ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {clientes.map((a) => (
            <li key={a.cliente.id}>
              <Link to={`/clientes/${a.cliente.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-borde px-2 py-1 text-sm hover:border-acento">
                {a.cliente.nombre} <StatusChip estado={a.estado} />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-sm text-tenue">{vacio}</p>
      )}
    </Panel>
  );
}

export default function Reporte() {
  const { idioma, tr } = useIdioma();
  const [mes, setMes] = useState(MESES[0]);
  const { umbrales } = useDatos();
  const r = useMemo(() => generarReporte(mes, umbrales), [mes, umbrales]);
  const es = idioma === 'es';
  const nombreMes = fmtMesLargo(r.clave); // «octubre de 2026» / «October 2026»
  const soloMes = es ? nombreMes.split(' de ')[0] : nombreMes.split(' ')[0];
  const prioridades = r.prioridades.map((a) => a.cliente.nombre);
  const unir = (xs: string[]) =>
    xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${es ? 'y' : 'and'} ${xs[xs.length - 1]}`;
  const subeTrm = r.variacionTrm >= 0;
  const pctTrm = `${fmtDec(Math.abs(r.variacionTrm) * 100)} %`;
  const nR = r.pasaronARiesgo.length;
  const nF = r.pasaronAFrio.length;
  const nRec = r.recuperados.length;
  const topCat = r.topCategorias[0];

  // El resumen se arma con plantillas: el mismo texto que antes se escribía a mano.
  const parrafos = es
    ? [
        `En ${soloMes} se vendieron ${fmtUsd(r.usd)} (${fmtPct(r.variacion)} frente al mes anterior), equivalentes a ${fmtCompacto(r.cop, 'COP')}, en ${r.numVentas} ventas a ${r.clientesCompradores} clientes.`,
        `${nR} ${nR === 1 ? 'cliente pasó' : 'clientes pasaron'} de activo a en riesgo y ${nF} ${nF === 1 ? 'pasó' : 'pasaron'} a inactivo. ${nRec ? `Se ${nRec === 1 ? 'recuperó' : 'recuperaron'} ${nRec}.` : 'No hubo clientes recuperados.'} Al cierre del mes hay ${r.estados.activo} activos, ${r.estados.riesgo} en riesgo y ${r.estados.frio} inactivos.`,
        `La TRM ${subeTrm ? 'subió' : 'bajó'} ${pctTrm} en el mes: pasó de ${fmtTrm(r.trmInicio)} a ${fmtTrm(r.trmFin)}.${r.variacionTrm > 0.03 ? ' Un dólar más caro puede hacer que los clientes aplacen compras en USD.' : ''}`,
        `La categoría que más vendió fue ${topCat?.categoria ?? '—'} (${fmtUsd(topCat?.usd ?? 0)}).`,
      ]
    : [
        `In ${soloMes} we sold ${fmtUsd(r.usd)} (${fmtPct(r.variacion)} vs. the previous month), equal to ${fmtCompacto(r.cop, 'COP')}, across ${r.numVentas} sales to ${r.clientesCompradores} clients.`,
        `${nR} ${nR === 1 ? 'client' : 'clients'} moved from active to at risk and ${nF} became inactive. ${nRec ? `${nRec} ${nRec === 1 ? 'was' : 'were'} won back.` : 'No clients were won back.'} At month end there are ${r.estados.activo} active, ${r.estados.riesgo} at risk and ${r.estados.frio} inactive.`,
        `The exchange rate (TRM) ${subeTrm ? 'rose' : 'fell'} ${pctTrm} during the month, from ${fmtTrm(r.trmInicio)} to ${fmtTrm(r.trmFin)}.${r.variacionTrm > 0.03 ? ' A pricier dollar may lead clients to postpone USD purchases.' : ''}`,
        `The top-selling category was ${topCat ? categoria(topCat.categoria, 'en') : '—'} (${fmtUsd(topCat?.usd ?? 0)}).`,
      ];

  return (
    <>
      <PageHeader
        titulo={tr('Reporte del mes', 'Monthly report')}
        subtitulo={tr(
          'Resumen automático para Operaciones, Comercial y Gerencia Financiera. Reemplaza la consolidación manual en Excel.',
          'Automatic summary for Operations, Sales and Finance. Replaces the manual Excel consolidation.',
        )}
      >
        <label className="flex items-center gap-2 text-sm text-tenue print:hidden">
          {tr('Mes', 'Month')}
          <select className="campo w-auto" value={mes} onChange={(e) => setMes(e.target.value)}>
            {MESES.map((m) => (
              <option key={m} value={m}>
                {mayuscula(fmtMesLargo(m))}
              </option>
            ))}
          </select>
        </label>
        <Button variante="primario" onClick={() => window.print()}>
          <IconoImprimir width={18} height={18} /> {tr('Imprimir o guardar PDF', 'Print or save as PDF')}
        </Button>
      </PageHeader>

      <article className="space-y-6" aria-label={tr(`Reporte de ${nombreMes}`, `${nombreMes} report`)}>
        <Card>
          <p className="etiqueta-seccion">
            {tr(
              'Órbita · Green Services and Solutions SAS · datos de demostración',
              'Órbita · Green Services and Solutions SAS · demo data',
            )}
          </p>
          <h2 className="mt-1 font-titulo text-2xl font-bold">{tr(`Reporte de ${nombreMes}`, `${nombreMes} report`)}</h2>
          <p className="text-xs text-tenue">{tr(`Generado automáticamente el ${fmtFecha(HOY)}`, `Automatically generated on ${fmtFecha(HOY)}`)}</p>
          <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-slate-200">
            {parrafos.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-acento/40 bg-acento/10 p-4">
            <p className="font-semibold text-acento">{tr('Recomendación', 'Recommendation')}</p>
            <p className="mt-1 text-slate-100">
              {prioridades.length
                ? tr(
                    `Priorizar el contacto con ${unir(prioridades)}: son los clientes con mayor riesgo y mayor valor al cierre del mes.`,
                    `Prioritize reaching out to ${unir(prioridades)}: they are the highest-risk, highest-value clients at month end.`,
                  )
                : tr('No hay clientes en riesgo que priorizar: mantener el seguimiento normal.', 'No at-risk clients to prioritize: keep regular follow-up.')}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            titulo={tr('Ventas del mes', 'Monthly sales')}
            valor={fmtCompacto(r.usd)}
            detalle={<Variacion valor={r.variacion} texto={tr('vs. mes anterior', 'vs. previous month')} />}
          />
          <StatCard
            titulo={tr('Clientes que compraron', 'Clients who bought')}
            valor={r.clientesCompradores}
            detalle={tr(`${r.numVentas} ventas`, `${r.numVentas} sales`)}
          />
          <StatCard
            titulo={tr('Pasaron a riesgo o inactivo', 'Moved to at risk or inactive')}
            valor={nR + nF}
            color={INFO_ESTADO.riesgo.color}
            detalle={tr(`${nRec} recuperados`, `${nRec} won back`)}
          />
          <StatCard
            titulo={tr('TRM al cierre', 'Month-end TRM')}
            valor={fmtTrm(r.trmFin)}
            detalle={<Variacion valor={r.variacionTrm} texto={tr('en el mes', 'this month')} />}
          />
        </div>

        <Card titulo={tr('Movimientos de clientes', 'Client changes')}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ListaClientes titulo={tr('Pasaron a riesgo', 'Moved to at risk')} clientes={r.pasaronARiesgo} vacio={tr('Ninguno este mes.', 'None this month.')} />
            <ListaClientes titulo={tr('Pasaron a inactivo', 'Became inactive')} clientes={r.pasaronAFrio} vacio={tr('Ninguno este mes.', 'None this month.')} />
            <ListaClientes titulo={tr('Recuperados', 'Won back')} clientes={r.recuperados} vacio={tr('Ninguno este mes.', 'None this month.')} />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card titulo={tr('Clientes que más compraron', 'Top clients this month')}>
            <Table minWidth={320}>
              <Thead>
                <Th>{tr('Cliente', 'Client')}</Th>
                <Th derecha>{tr('Compras del mes', 'Monthly purchases')}</Th>
              </Thead>
              <tbody>
                {r.topClientes.map((c) => (
                  <Tr key={c.id}>
                    <Td>
                      <Link to={`/clientes/${c.id}`} className="text-slate-200 hover:text-acento hover:underline">
                        {c.nombre}
                      </Link>
                    </Td>
                    <Td derecha>{fmtUsd(c.usd)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card titulo={tr('Ventas por categoría', 'Sales by category')}>
            <Table minWidth={320}>
              <Thead>
                <Th>{tr('Categoría', 'Category')}</Th>
                <Th derecha>USD</Th>
                <Th derecha>{tr('% del mes', '% of month')}</Th>
              </Thead>
              <tbody>
                {r.topCategorias.map((c) => (
                  <Tr key={c.categoria}>
                    <Td className="text-slate-200">{categoria(c.categoria, idioma)}</Td>
                    <Td derecha>{fmtUsd(c.usd)}</Td>
                    <Td derecha>{r.usd ? `${Math.round((c.usd / r.usd) * 100)} %` : '—'}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
        <p className="text-xs text-tenue">
          {tr(
            `Estados calculados con los datos disponibles al último día del mes.${MODO === 'demo' ? ' Los datos reales son confidenciales; este reporte usa datos inventados.' : ''}`,
            `Statuses calculated with the data available on the last day of the month.${MODO === 'demo' ? ' Real data is confidential; this report uses synthetic data.' : ''}`,
          )}
        </p>
      </article>
    </>
  );
}
