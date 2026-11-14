import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import { Button, ButtonLink, Card, EmptyState, INFO_ESTADO, Panel, RiskBar, StatCard, StatusChip, Table, Td, Th, Thead, Tr } from '../components/ui';
import { IconoAtras, IconoCheck, IconoChispa } from '../components/Iconos';
import ExplicacionRiesgo from '../components/ExplicacionRiesgo';
import { HOY, productoPorId } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { DIA } from '../lib/analytics';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { mensajeParaCliente } from '../lib/mensaje';
import { categoria, producto, sector, tipoProducto } from '../lib/catalogo';
import { fmtCompacto, fmtCop, fmtFecha, fmtMes, fmtNum, fmtUsd } from '../lib/format';

const ejeCompacto = (v: number) => fmtCompacto(v).replace(/ /g, ' ');

export default function FichaCliente() {
  const { id = '' } = useParams();
  const { analisisPorId } = useDatos();
  const a = analisisPorId.get(id);
  const { contactados, alternar } = useContactados();
  const { idioma, tr, b } = useIdioma();
  const { colores: col } = useTema();
  const [copiado, setCopiado] = useState(false);

  if (!a) {
    return (
      <EmptyState
        titulo={tr('Cliente no encontrado', 'Client not found')}
        descripcion={tr(`No existe un cliente con el código «${id}».`, `There is no client with code "${id}".`)}
        accion={<ButtonLink to="/clientes" variante="primario">{tr('Volver a clientes', 'Back to clients')}</ButtonLink>}
      />
    );
  }

  const c = a.cliente;
  const historial = [...a.ventas].reverse();
  const puntos = a.ventas.map((v) => ({
    t: new Date(`${v.fecha}T00:00:00Z`).getTime(),
    usd: v.valor_usd,
    producto: producto(productoPorId.get(v.id_producto)?.nombre ?? v.id_producto, idioma),
  }));
  const dominio: [number, number] = [
    Math.min(...puntos.map((p) => p.t), HOY.getTime()) - 15 * DIA,
    Math.max(HOY.getTime(), a.proximaCompra?.getTime() ?? 0) + 15 * DIA,
  ];
  // Marcas del eje: el primer día de cada mes del rango, como máximo 8.
  const meses: number[] = [];
  for (let d = new Date(dominio[0]); d.getTime() <= dominio[1]; d.setUTCMonth(d.getUTCMonth() + 1)) {
    meses.push(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  }
  const paso = Math.ceil(meses.length / 8);
  const marcas = meses.filter((t, i) => i % paso === 0 && t <= dominio[1]);
  const vencida = a.proximaCompra && a.proximaCompra < HOY;
  const rec = a.productoRecomendado;
  const hecho = contactados.has(c.id);
  const mensaje = mensajeParaCliente(a, idioma);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${mensaje.asunto}\n\n${mensaje.cuerpo}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  };

  // Productos que tiene el cliente (su base instalada con nosotros)
  const tenencia = [...a.ventas.reduce((m, v) => {
    const x = m.get(v.id_producto) ?? { veces: 0, unidades: 0, usd: 0, ultima: v.fecha };
    x.veces++;
    x.unidades += v.cantidad;
    x.usd += v.valor_usd;
    if (v.fecha > x.ultima) x.ultima = v.fecha;
    return m.set(v.id_producto, x);
  }, new Map<string, { veces: number; unidades: number; usd: number; ultima: string }>())]
    .map(([idp, x]) => ({ p: productoPorId.get(idp)!, ...x }))
    .sort((m, n) => n.ultima.localeCompare(m.ultima));

  return (
    <>
      <Link to="/clientes" className="mb-4 inline-flex items-center gap-2 text-sm text-tenue hover:text-white">
        <IconoAtras width={16} height={16} /> {tr('Volver a clientes', 'Back to clients')}
      </Link>

      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{c.nombre}</h1>
          <StatusChip estado={a.estado} />
          {c.es_base_instalada && (
            <span className="rounded-full border border-azul/40 bg-azul/15 px-2.5 py-0.5 text-xs font-medium text-blue-200">
              {tr('Base instalada', 'Installed base')}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-tenue">
            {c.id} · <span className="capitalize">{sector(c.sector, idioma)}</span> · {c.ciudad} · {tr('cliente desde', 'client since')} {fmtFecha(c.fecha_primera_compra)}
          </p>
          <Button variante={hecho ? 'secundario' : 'primario'} onClick={() => alternar(c.id)} aria-pressed={hecho} className="self-start">
            {hecho ? (
              <>
                <IconoCheck width={16} height={16} /> {tr('Contactado · deshacer', 'Contacted · undo')}
              </>
            ) : (
              tr('Marcar como contactado', 'Mark as contacted')
            )}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard titulo={tr('Total comprado', 'Total purchased')} valor={fmtCompacto(a.montoUsd)} detalle={fmtCop(a.montoCop)} />
        <StatCard
          titulo={tr('Número de compras', 'Number of purchases')}
          valor={fmtNum(a.frecuencia)}
          detalle={`${tr('Última', 'Last')}: ${fmtFecha(a.ultimaCompra)}`}
        />
        <StatCard
          titulo={tr('Ciclo de compra', 'Purchase cycle')}
          valor={tr(`${Math.round(a.ciclo)} días`, `${Math.round(a.ciclo)} days`)}
          detalle={
            a.cicloEstimado
              ? tr('Estimado (pocas compras)', 'Estimated (few purchases)')
              : tr(`Lleva ${a.recencia} días sin comprar`, `${a.recencia} days since last purchase`)
          }
        />
        <StatCard
          titulo={tr('Próxima compra estimada', 'Next estimated purchase')}
          valor={fmtFecha(a.proximaCompra)}
          detalle={
            vencida ? (
              <span className="text-amber-300">
                <span aria-hidden="true">▲ </span>
                {tr('Ya debió haber comprado', 'Should have bought already')}
              </span>
            ) : (
              tr('Según su ritmo habitual', 'Based on their usual pace')
            )
          }
        />
        <div className="col-span-2 lg:col-span-1">
          <StatCard
            titulo={tr('Puntaje de riesgo', 'Risk score')}
            valor={
              <span style={{ color: INFO_ESTADO[a.estado].color }}>
                {a.puntaje}
                <span className="text-base text-tenue"> / 100</span>
              </span>
            }
            detalle={<RiskBar puntaje={a.puntaje} />}
          />
        </div>
      </div>

      <section className="mt-6" aria-label={tr('Explicación del estado', 'Status explanation')} id="por-que">
        <ExplicacionRiesgo a={a} />
      </section>

      <section className="mt-6 rounded-2xl border border-acento/40 bg-acento/5 p-5" aria-labelledby="titulo-recomendacion">
        <h2 id="titulo-recomendacion" className="flex items-center gap-2 text-lg font-semibold text-acento">
          <IconoChispa /> {tr('Recomendación de IA', 'AI recommendation')}
        </h2>
        <p className="mt-2 text-slate-100">{b(a.recomendacion)}</p>
        {rec && (
          <Panel className="mt-4">
            <p className="etiqueta-seccion">{tr('Producto sugerido', 'Suggested product')}</p>
            <p className="mt-1 font-titulo text-lg font-semibold text-white">
              {rec.tipo === 'renovacion' ? tr('Renovación de ', 'Renewal of ') : ''}
              {producto(rec.producto.nombre, idioma)}
              <span className="ml-2 text-sm font-normal text-tenue">
                {categoria(rec.producto.categoria, idioma)} · {tr('desde', 'from')} {fmtUsd(rec.producto.precio_usd)}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-300">
              <span className="text-tenue">{tr('¿Por qué? ', 'Why? ')}</span>
              {b(rec.motivo)}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-tenue">
                {rec.tipo === 'renovacion' ? tr('Valor de la renovación', 'Renewal value') : tr('Valor estimado de la oportunidad', 'Estimated opportunity value')}:{' '}
              </span>
              <strong className="font-titulo text-lg text-acento">{fmtUsd(rec.valorEstimado)}</strong>
              <span className="text-xs text-tenue">
                {' '}
                {rec.tipo === 'renovacion'
                  ? tr('(lo que este cliente suele pagar por él)', '(what this client usually pays for it)')
                  : tr('(lo que se paga en promedio por él)', '(average price paid for it)')}
              </span>
            </p>
          </Panel>
        )}

        <details className="mt-4 rounded-xl border border-borde/60 bg-superficie p-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-medium text-white">
            {tr('Mensaje sugerido para el cliente', 'Suggested message for the client')}
            <span className="text-sm font-normal text-azul">{tr('Ver', 'Show')}</span>
          </summary>
          <p className="mt-3 text-sm text-tenue">
            {tr('Asunto', 'Subject')}: <span className="text-slate-200">{mensaje.asunto}</span>
          </p>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-fondo/70 p-3 font-sans text-sm text-slate-200">{mensaje.cuerpo}</pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variante="primario" onClick={() => void copiar()}>
              {copiado ? tr('Copiado', 'Copied') : tr('Copiar mensaje', 'Copy message')}
            </Button>
            <a
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-borde px-3.5 py-2 text-sm font-medium text-slate-200 hover:bg-white/5"
              href={`mailto:?subject=${encodeURIComponent(mensaje.asunto)}&body=${encodeURIComponent(mensaje.cuerpo)}`}
            >
              {tr('Abrir en el correo', 'Open in email')}
            </a>
          </div>
          <p className="mt-2 text-xs text-tenue" aria-live="polite">
            {copiado
              ? tr('El mensaje quedó copiado: pégalo en tu correo o WhatsApp.', 'Message copied: paste it into your email or WhatsApp.')
              : tr('Completa los datos entre corchetes antes de enviarlo.', 'Fill in the bracketed details before sending.')}
          </p>
        </details>
        <p className="mt-3 text-xs text-tenue">
          {tr(
            `Generada con reglas a partir de su ciclo de compra (${Math.round(a.ciclo)} días), los días sin comprar (${a.recencia}), lo que tiene comprado, lo que compran clientes parecidos y la TRM.`,
            `Generated with rules from their purchase cycle (${Math.round(a.ciclo)} days), days since last purchase (${a.recencia}), what they already own, what similar clients buy, and the exchange rate.`,
          )}
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card titulo={tr('Línea de tiempo de compras', 'Purchase timeline')}>
          <div
            className="h-64"
            role="img"
            aria-label={tr(`Línea de tiempo con las ${a.ventas.length} compras de ${c.nombre}`, `Timeline of the ${a.ventas.length} purchases by ${c.nombre}`)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={col.rejilla} strokeDasharray="3 3" />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={dominio}
                  ticks={marcas}
                  tickFormatter={(t: number) => fmtMes(new Date(t).toISOString().slice(0, 7))}
                  tick={{ fill: col.eje, fontSize: 12 }}
                  axisLine={{ stroke: col.rejilla }}
                />
                <YAxis dataKey="usd" tick={{ fill: col.eje, fontSize: 12 }} tickFormatter={ejeCompacto} width={92} axisLine={false} />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    const p = payload?.[0]?.payload as (typeof puntos)[number] | undefined;
                    if (!p) return null;
                    return (
                      <div className="rounded-lg border border-borde bg-tarjeta px-3 py-2 text-xs text-slate-100 shadow">
                        <p className="font-semibold">{fmtFecha(new Date(p.t))}</p>
                        <p className="text-tenue">{p.producto}</p>
                        {p.usd > 0 && <p>{fmtUsd(p.usd)}</p>}
                      </div>
                    );
                  }}
                />
                <Scatter data={puntos} fill={col.azul} isAnimationActive={false} />
                {a.proximaCompra && (
                  <Scatter
                    data={[{ t: a.proximaCompra.getTime(), usd: 0, producto: tr('Próxima compra estimada', 'Next estimated purchase') }]}
                    fill={col.acento}
                    shape="diamond"
                    isAnimationActive={false}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-tenue">
            <span className="text-azul" aria-hidden="true">●</span> {tr('Compras reales', 'Actual purchases')} ·{' '}
            <span className="text-acento" aria-hidden="true">◆</span> {tr('Próxima compra estimada', 'Next estimated purchase')}
          </p>
        </Card>

        <Card titulo={tr(`Productos que tiene (${tenencia.length})`, `Products owned (${tenencia.length})`)}>
          <div className="max-h-72 overflow-auto">
            <Table minWidth={480}>
              <Thead fija>
                <Th>{tr('Producto', 'Product')}</Th>
                <Th>{tr('Tipo', 'Type')}</Th>
                <Th derecha>{tr('Compras', 'Purchases')}</Th>
                <Th>{tr('Última vez', 'Last time')}</Th>
              </Thead>
              <tbody>
                {tenencia.map((t) => (
                  <Tr key={t.p.id}>
                    <Td className="text-slate-200">
                      {producto(t.p.nombre, idioma)}
                      <span className="block text-xs text-tenue">
                        {categoria(t.p.categoria, idioma)} · {fmtNum(t.unidades)} {tr('unidades', 'units')}
                      </span>
                    </Td>
                    <Td>
                      {t.p.tipo === 'servicio recurrente' ? (
                        <span className="rounded bg-azul/15 px-1.5 py-0.5 text-xs text-blue-200">{tipoProducto(t.p.tipo, idioma)}</span>
                      ) : (
                        <span className="text-xs">{tipoProducto(t.p.tipo, idioma)}</span>
                      )}
                    </Td>
                    <Td derecha>{t.veces}</Td>
                    <Td className="whitespace-nowrap">{fmtFecha(t.ultima)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <Card titulo={tr(`Historial de compras (${a.ventas.length} registros)`, `Purchase history (${a.ventas.length} records)`)} className="mt-6">
        <div className="max-h-80 overflow-auto">
          <Table minWidth={560}>
            <Thead fija>
              <Th>{tr('Fecha', 'Date')}</Th>
              <Th>{tr('Producto', 'Product')}</Th>
              <Th>{tr('Categoría', 'Category')}</Th>
              <Th derecha>{tr('Valor USD', 'USD amount')}</Th>
              <Th derecha>{tr('Valor COP', 'COP amount')}</Th>
            </Thead>
            <tbody>
              {historial.map((v) => {
                const p = productoPorId.get(v.id_producto);
                return (
                  <Tr key={v.id}>
                    <Td className="whitespace-nowrap">{fmtFecha(v.fecha)}</Td>
                    <Td className="text-slate-200">
                      {p ? producto(p.nombre, idioma) : v.id_producto} <span className="text-tenue">×{v.cantidad}</span>
                    </Td>
                    <Td>{p ? categoria(p.categoria, idioma) : ''}</Td>
                    <Td derecha className="text-slate-200">{fmtUsd(v.valor_usd)}</Td>
                    <Td derecha>{fmtCop(v.valor_cop)}</Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}
