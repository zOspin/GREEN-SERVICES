import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader, Panel, StatCard, StatusChip, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import { IconoImprimir } from '../components/Iconos';
import { generarReporte, mesesDisponibles } from '../lib/reporte';
import type { AnalisisCliente } from '../lib/analytics';
import { fmtCompacto, fmtFecha, fmtPct, fmtTrm, fmtUsd } from '../lib/format';
import { HOY } from '../lib/datos';

const MESES = mesesDisponibles(6);
const lista = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`);

function ListaClientes({ titulo, clientes, vacio }: { titulo: string; clientes: AnalisisCliente[]; vacio: string }) {
  return (
    <Panel>
      <p className="font-semibold text-white">{titulo} <span className="text-tenue">({clientes.length})</span></p>
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
  const [mes, setMes] = useState(MESES[0]);
  const r = useMemo(() => generarReporte(mes), [mes]);
  const mesNombre = r.nombre.split(' de ')[0];
  const sube = r.variacion >= 0;
  const prioridades = r.prioridades.map((a) => a.cliente.nombre);

  // El resumen se arma con plantillas: el mismo texto que antes se escribía a mano.
  const parrafos = [
    `En ${mesNombre} se vendieron ${fmtUsd(r.usd)} (${fmtPct(r.variacion)} frente al mes anterior), equivalentes a ${fmtCompacto(r.cop, 'COP')}, en ${r.numVentas} ventas a ${r.clientesCompradores} clientes.`,
    `${r.pasaronARiesgo.length} ${r.pasaronARiesgo.length === 1 ? 'cliente pasó' : 'clientes pasaron'} de activo a en riesgo y ${r.pasaronAFrio.length} ${r.pasaronAFrio.length === 1 ? 'pasó' : 'pasaron'} a frío. ${r.recuperados.length ? `Se ${r.recuperados.length === 1 ? 'recuperó' : 'recuperaron'} ${r.recuperados.length}.` : 'No hubo clientes recuperados.'} Al cierre del mes hay ${r.estados.activo} activos, ${r.estados.riesgo} en riesgo y ${r.estados.frio} fríos.`,
    `La TRM ${r.variacionTrm >= 0 ? 'subió' : 'bajó'} ${fmtPct(Math.abs(r.variacionTrm)).replace('+', '')} en el mes: pasó de ${fmtTrm(r.trmInicio)} a ${fmtTrm(r.trmFin)}.${r.variacionTrm > 0.03 ? ' Un dólar más caro puede hacer que los clientes aplacen compras en USD.' : ''}`,
    `La categoría que más vendió fue ${r.topCategorias[0]?.categoria ?? '—'} (${fmtUsd(r.topCategorias[0]?.usd ?? 0)}).`,
  ];

  return (
    <>
      <PageHeader titulo="Reporte del mes" subtitulo="Resumen automático para Operaciones, Comercial y Gerencia Financiera. Reemplaza la consolidación manual en Excel.">
        <label className="flex items-center gap-2 text-sm text-tenue print:hidden">
          Mes
          <select className="campo w-auto" value={mes} onChange={(e) => setMes(e.target.value)}>
            {MESES.map((m) => <option key={m} value={m}>{generarReporteNombre(m)}</option>)}
          </select>
        </label>
        <Button variante="primario" onClick={() => window.print()}>
          <IconoImprimir width={18} height={18} /> Imprimir o guardar PDF
        </Button>
      </PageHeader>

      <article className="space-y-6" aria-label={`Reporte de ${r.nombre}`}>
        <Card>
          <p className="etiqueta-seccion">Órbita Pulse · Green Services and Solutions SAS · datos de demostración</p>
          <h2 className="mt-1 font-titulo text-2xl font-bold">Reporte de {r.nombre}</h2>
          <p className="text-xs text-tenue">Generado automáticamente el {fmtFecha(HOY)}</p>
          <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-slate-200">
            {parrafos.map((p) => <p key={p}>{p}</p>)}
          </div>
          <div className="mt-4 rounded-xl border border-acento/40 bg-acento/10 p-4">
            <p className="font-semibold text-acento">Recomendación</p>
            <p className="mt-1 text-slate-100">
              {prioridades.length
                ? `Priorizar el contacto con ${lista(prioridades)}: son los clientes con mayor riesgo y mayor valor al cierre del mes.`
                : 'No hay clientes en riesgo que priorizar: mantener el seguimiento normal.'}
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard titulo="Ventas del mes" valor={fmtCompacto(r.usd)} detalle={<Variacion valor={r.variacion} texto="vs. mes anterior" />} />
          <StatCard titulo="Clientes que compraron" valor={r.clientesCompradores} detalle={`${r.numVentas} ventas`} />
          <StatCard titulo="Pasaron a riesgo o frío" valor={r.pasaronARiesgo.length + r.pasaronAFrio.length} color="#F59E0B" detalle={`${r.recuperados.length} recuperados`} />
          <StatCard titulo="TRM al cierre" valor={fmtTrm(r.trmFin)} detalle={<Variacion valor={r.variacionTrm} texto="en el mes" />} />
        </div>

        <Card titulo="Movimientos de clientes">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ListaClientes titulo="Pasaron a riesgo" clientes={r.pasaronARiesgo} vacio="Ninguno este mes." />
            <ListaClientes titulo="Pasaron a frío" clientes={r.pasaronAFrio} vacio="Ninguno este mes." />
            <ListaClientes titulo="Recuperados" clientes={r.recuperados} vacio="Ninguno este mes." />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card titulo="Clientes que más compraron">
            <Table minWidth={320}>
              <Thead><Th>Cliente</Th><Th derecha>Compras del mes</Th></Thead>
              <tbody>
                {r.topClientes.map((c) => (
                  <Tr key={c.id}>
                    <Td><Link to={`/clientes/${c.id}`} className="text-slate-200 hover:text-acento hover:underline">{c.nombre}</Link></Td>
                    <Td derecha>{fmtUsd(c.usd)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card titulo="Ventas por categoría">
            <Table minWidth={320}>
              <Thead><Th>Categoría</Th><Th derecha>USD</Th><Th derecha>% del mes</Th></Thead>
              <tbody>
                {r.topCategorias.map((c) => (
                  <Tr key={c.categoria}>
                    <Td className="text-slate-200">{c.categoria}</Td>
                    <Td derecha>{fmtUsd(c.usd)}</Td>
                    <Td derecha>{r.usd ? `${Math.round((c.usd / r.usd) * 100)} %` : '—'}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
        <p className="text-xs text-tenue">
          {sube ? 'Las ventas crecieron' : 'Las ventas cayeron'} frente al mes anterior. Estados calculados con los datos disponibles al último día del mes.
          Los datos reales son confidenciales; este reporte usa datos inventados.
        </p>
      </article>
    </>
  );
}

const NOMBRES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
function generarReporteNombre(clave: string) {
  return `${NOMBRES[Number(clave.slice(5, 7)) - 1]} ${clave.slice(0, 4)}`;
}
