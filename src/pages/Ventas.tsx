import { Link, useSearchParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import { categoriasMes, correlacionVentasTrm, serieVentasTrm, HOY, trmHoy, trmHace30 } from '../lib/datos';
import { valorAnual } from '../lib/analytics';
import { useDatos } from '../lib/umbrales';
import { producto as nombreProducto } from '../lib/catalogo';
import { StatusChip } from '../components/ui';
import { categoria } from '../lib/catalogo';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { fmtCompacto, fmtCop, fmtDec, fmtMes, fmtNum, fmtPct, fmtTrm, fmtUsd } from '../lib/format';

/** Colores por categoría (no se usan verde/ámbar/rojo para no confundir con los estados). */
const COLOR_CATEGORIA: Record<string, string> = {
  Redes: '#6D4AFF',
  Nube: '#08AAC4',
  Ciberseguridad: '#A78BFA',
  Hardware: '#38BDF8',
  Software: '#D946EF',
  Almacenamiento: '#8B93C9',
};
// Categorías que no son de la demo (datos reales): toman un color de esta lista, en orden.
const COLORES_EXTRA = ['#2DD4BF', '#FB923C', '#4ADE80', '#E879F9', '#FACC15', '#60A5FA', '#F87171', '#A3E635'];
const colorCategoria = (cat: string) =>
  COLOR_CATEGORIA[cat] ?? (COLOR_CATEGORIA[cat] = COLORES_EXTRA[(Object.keys(COLOR_CATEGORIA).length - 6) % COLORES_EXTRA.length]);
const eje = (v: number) => fmtCompacto(v).replace(/ /g, ' ');

/** Traduce la correlación a palabras sencillas. */
function describirRelacion(r: number, tr: (es: string, en: string) => string): string {
  const abs = Math.abs(r);
  if (abs < 0.3) {
    return tr(
      'La relación es débil: en estos 12 meses, los cambios del dólar no explican por sí solos cuánto vendemos en USD.',
      'The relationship is weak: over these 12 months, exchange-rate changes alone do not explain how much we sell in USD.',
    );
  }
  const fuerte = abs >= 0.6;
  return r < 0
    ? tr(
        `La relación es ${fuerte ? 'fuerte' : 'moderada'} e inversa: los meses con el dólar más caro tienden a ser de menos ventas en USD.`,
        `The relationship is ${fuerte ? 'strong' : 'moderate'} and inverse: months with a pricier dollar tend to have lower USD sales.`,
      )
    : tr(
        `La relación es ${fuerte ? 'fuerte' : 'moderada'} y directa: los meses con el dólar más caro tienden a ser de más ventas en USD.`,
        `The relationship is ${fuerte ? 'strong' : 'moderate'} and direct: months with a pricier dollar tend to have higher USD sales.`,
      );
}

/** «Recuperar a un cliente»: cuánto vale y cómo lo afecta la TRM. */
function RecuperarCliente() {
  const { idioma, tr } = useIdioma();
  const { alertas, analisisPorId, analisis } = useDatos();
  const [params, setParams] = useSearchParams();
  const id = params.get('cliente') ?? alertas[0]?.analisis.cliente.id ?? '';
  const a = analisisPorId.get(id);
  if (!a) return null;
  const anual = valorAnual(a, HOY);
  const rec = a.productoRecomendado;
  const oportunidad = rec?.valorEstimado ?? 0;
  const copHoy = oportunidad * trmHoy.valor;
  const copAntes = oportunidad * trmHace30.valor;
  const variacion = trmHace30.valor ? (trmHoy.valor - trmHace30.valor) / trmHace30.valor : 0;
  const candidatos = analisis.filter((x) => x.estado !== 'activo' || x.cliente.id === id).sort((x, y) => x.cliente.nombre.localeCompare(y.cliente.nombre));

  return (
    <Card
      titulo={tr('Recuperar a un cliente: lo que está en juego', 'Winning back a client: what is at stake')}
      className="mt-6 border-turquesa/40"
      accion={
        <label className="flex items-center gap-2 text-sm text-tenue">
          {tr('Cliente', 'Client')}
          <select className="campo w-auto" value={id} onChange={(e) => setParams({ cliente: e.target.value })}>
            {candidatos.map((x) => (
              <option key={x.cliente.id} value={x.cliente.id}>
                {x.cliente.nombre}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div className="-mt-2 mb-4 flex flex-wrap items-center gap-2 text-sm text-tenue">
        <Link to={`/clientes/${a.cliente.id}`} className="font-semibold text-white hover:text-acento hover:underline">
          {a.cliente.nombre}
        </Link>
        <StatusChip estado={a.estado} />
        <span>{tr(`${a.recencia} días sin comprar`, `${a.recencia} days without buying`)}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Panel>
          <p className="text-sm text-tenue">{tr('Compra al año (promedio)', 'Buys per year (average)')}</p>
          <p className="mt-1 font-titulo text-3xl font-bold text-turquesa">{fmtUsd(anual)}</p>
          <p className="text-xs text-tenue">{tr(`≈ ${fmtCompacto(anual * trmHoy.valor, 'COP')} con la TRM de hoy`, `≈ ${fmtCompacto(anual * trmHoy.valor, 'COP')} at today's TRM`)}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-tenue">
            {rec?.tipo === 'renovacion' ? tr('Oportunidad inmediata: renovación', 'Immediate opportunity: renewal') : tr('Oportunidad inmediata', 'Immediate opportunity')}
          </p>
          <p className="mt-1 font-titulo text-3xl font-bold text-acento">{fmtUsd(oportunidad)}</p>
          <p className="text-xs text-tenue">{rec ? nombreProducto(rec.producto.nombre, idioma) : '—'}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-tenue">{tr('Efecto de la TRM en esa compra', 'Exchange-rate effect on that purchase')}</p>
          <p className="mt-1 font-titulo text-3xl font-bold text-white">{fmtCompacto(copHoy, 'COP')}</p>
          <p className="text-xs text-tenue">
            {tr(
              `Hace 30 días costaba ${fmtCompacto(copAntes, 'COP')}: ${fmtCompacto(Math.abs(copHoy - copAntes), 'COP')} ${variacion >= 0 ? 'más' : 'menos'} (${fmtPct(variacion)} en la TRM).`,
              `30 days ago it cost ${fmtCompacto(copAntes, 'COP')}: ${fmtCompacto(Math.abs(copHoy - copAntes), 'COP')} ${variacion >= 0 ? 'more' : 'less'} (${fmtPct(variacion)} in the TRM).`,
            )}
          </p>
        </Panel>
      </div>
      <p className="mt-4 text-sm text-slate-300">
        {variacion > 0.03
          ? tr(
              `Con el dólar ${fmtDec(variacion * 100)} % más caro, al cliente la misma compra le cuesta más pesos y puede aplazarla. Ofrecer precio fijo en pesos o pago diferido ayuda a cerrarla. Recuperarlo protege ${fmtUsd(anual)} al año.`,
              `With the dollar ${fmtDec(variacion * 100)}% pricier, the same purchase costs the client more pesos and they may postpone it. Offering a fixed peso price or deferred payment helps close it. Winning them back protects ${fmtUsd(anual)} per year.`,
            )
          : tr(`Recuperarlo protege ${fmtUsd(anual)} al año.`, `Winning them back protects ${fmtUsd(anual)} per year.`)}
      </p>
    </Card>
  );
}

export default function Ventas() {
  const { idioma, tr } = useIdioma();
  const { colores: c } = useTema();
  const total = serieVentasTrm.reduce((s, p) => ({ usd: s.usd + p.usd, cop: s.cop + p.cop }), { usd: 0, cop: 0 });
  const trmMin = Math.min(...serieVentasTrm.map((p) => p.trm));
  const trmMax = Math.max(...serieVentasTrm.map((p) => p.trm));
  const primero = serieVentasTrm[0];
  const ultimo = serieVentasTrm[serieVentasTrm.length - 1];
  const variacionTrm = primero.trm ? (ultimo.trm - primero.trm) / primero.trm : 0;
  // Sin ventas (modo Real vacío) no hay categoría líder: se muestra un guion.
  const top = categoriasMes.ranking[0] as (typeof categoriasMes.ranking)[number] | undefined;
  const tooltip = {
    contentStyle: { background: c.tooltipFondo, border: `1px solid ${c.tooltipBorde}`, borderRadius: 10, color: c.tooltipTexto },
    labelStyle: { color: c.tooltipTexto, fontWeight: 600 },
    labelFormatter: (clave: string) => fmtMes(clave),
  };
  const ejeX = { dataKey: 'clave', tickFormatter: (k: string) => fmtMes(k), tick: { fill: c.eje, fontSize: 12 }, axisLine: { stroke: c.rejilla }, tickLine: false };

  return (
    <>
      <PageHeader
        titulo={tr('Panel financiero', 'Finance dashboard')}
        subtitulo={tr(
          'Tendencias de ventas por mes y por categoría, y cómo se mueven frente al precio del dólar. Para Gerencia Financiera.',
          'Sales trends by month and category, and how they move against the US dollar price (TRM). For the Finance team.',
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard titulo={tr('Ventas últimos 12 meses', 'Sales, last 12 months')} valor={fmtCompacto(total.usd)} detalle={fmtCompacto(total.cop, 'COP')} />
        <StatCard
          titulo={tr('Categoría que más vende', 'Top-selling category')}
          valor={top ? categoria(top.categoria, idioma) : '—'}
          detalle={tr(`${fmtCompacto(top?.usd ?? 0)} en 12 meses`, `${fmtCompacto(top?.usd ?? 0)} in 12 months`)}
        />
        <StatCard
          titulo={tr('TRM promedio mensual', 'Monthly average TRM')}
          valor={`$ ${fmtNum(trmMin)} – ${fmtNum(trmMax)}`}
          detalle={tr('rango de los 12 meses', '12-month range')}
        />
        <StatCard
          titulo={tr('Cambio de la TRM', 'TRM change')}
          valor={<Variacion valor={variacionTrm} />}
          detalle={`${fmtMes(primero.clave)} → ${fmtMes(ultimo.clave)}`}
        />
      </div>

      <RecuperarCliente />

      <Card titulo={tr('Ventas (USD) contra TRM', 'Sales (USD) vs. TRM')} className="mt-6">
        <div
          className="h-80"
          role="img"
          aria-label={tr(
            'Barras con las ventas mensuales en dólares y una línea con la TRM promedio de cada mes',
            'Bars with monthly sales in US dollars and a line with the average TRM of each month',
          )}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={serieVentasTrm} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={c.rejilla} strokeDasharray="3 3" vertical={false} />
              <XAxis {...ejeX} />
              <YAxis yAxisId="usd" tick={{ fill: c.eje, fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={eje} />
              <YAxis
                yAxisId="trm"
                orientation="right"
                domain={[3700, 4450]}
                tick={{ fill: c.acentoTexto, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v: number) => fmtNum(v)}
              />
              <Tooltip {...tooltip} formatter={(v: number, nombre: string) => [nombre.startsWith('TRM') ? fmtTrm(v) : fmtUsd(v), nombre]} />
              <Legend wrapperStyle={{ color: c.eje, fontSize: 12 }} />
              <Bar yAxisId="usd" dataKey="usd" name={tr('Ventas (USD)', 'Sales (USD)')} fill={c.azul} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line yAxisId="trm" dataKey="trm" name={tr('TRM promedio (COP)', 'TRM average (COP)')} stroke={c.acento} strokeWidth={2.5} dot={{ r: 3, fill: c.acento }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel className="text-sm text-slate-300">
            <p className="font-semibold text-white">{tr('¿Cómo se relacionan?', 'How are they related?')}</p>
            <p className="mt-1">
              {tr(
                'Medimos qué tanto se mueven juntas las dos líneas con un número entre −1 y 1 (correlación). Aquí da ',
                'We measure how much the two lines move together with a number between −1 and 1 (correlation). Here it is ',
              )}
              <strong className="text-acento">{fmtDec(correlacionVentasTrm, 2)}</strong>.
            </p>
            <p className="mt-1">{describirRelacion(correlacionVentasTrm, tr)}</p>
            <p className="mt-2 text-xs text-tenue">
              {tr(
                'Con datos inventados el resultado es ilustrativo; con datos reales esta misma medida se calcula sola cada mes.',
                'With synthetic data the result is illustrative; with real data this same measure is recalculated automatically every month.',
              )}
            </p>
          </Panel>
          <Panel className="text-sm text-slate-300">
            <p className="font-semibold text-white">{tr('¿Por qué importa la TRM?', 'Why does the TRM matter?')}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                {tr(
                  'Muchos productos se cotizan en dólares. Si el dólar sube, al cliente colombiano le cuestan más pesos y puede aplazar la compra.',
                  'Many products are quoted in dollars. When the dollar rises, Colombian clients pay more pesos and may postpone the purchase.',
                )}
              </li>
              <li>
                {tr(
                  'Para la empresa, la misma venta en USD vale más en pesos cuando la TRM sube: mira la columna COP de la tabla.',
                  'For the company, the same USD sale is worth more in pesos when the TRM rises: see the COP column in the table.',
                )}
              </li>
              <li>
                {tr(
                  'Por eso la IA sube un poco el riesgo de los clientes cuando el dólar sube más de 5 % en 30 días.',
                  'That is why the AI slightly raises client risk when the dollar rises more than 5% in 30 days.',
                )}
              </li>
            </ul>
          </Panel>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card titulo={tr('Ventas por categoría (USD)', 'Sales by category (USD)')} className="xl:col-span-2">
          <div className="h-80" role="img" aria-label={tr('Barras apiladas con las ventas mensuales por categoría', 'Stacked bars with monthly sales by category')}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriasMes.filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={c.rejilla} strokeDasharray="3 3" vertical={false} />
                <XAxis {...ejeX} />
                <YAxis tick={{ fill: c.eje, fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={eje} />
                <Tooltip {...tooltip} formatter={(v: number, nombre: string) => [fmtUsd(v), nombre]} cursor={{ fill: 'rgba(127,127,127,0.08)' }} />
                <Legend wrapperStyle={{ color: c.eje, fontSize: 12 }} />
                {categoriasMes.categorias.map((cat, i) => (
                  <Bar
                    key={cat}
                    dataKey={cat}
                    name={categoria(cat, idioma)}
                    stackId="cat"
                    fill={colorCategoria(cat)}
                    stroke={c.tarjeta}
                    strokeWidth={1}
                    radius={i === categoriasMes.categorias.length - 1 ? [4, 4, 0, 0] : 0}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card titulo={tr('Ranking de categorías', 'Category ranking')}>
          <ol className="space-y-3">
            {categoriasMes.ranking.map((r, i) => (
              <li key={r.categoria}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-4 text-tenue">{i + 1}.</span>
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colorCategoria(r.categoria) }} aria-hidden="true" />
                    {categoria(r.categoria, idioma)}
                  </span>
                  <span className="tabular-nums text-slate-300">{fmtCompacto(r.usd)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(r.usd / categoriasMes.ranking[0].usd) * 100}%`, background: colorCategoria(r.categoria) }} />
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card titulo={tr('Detalle mensual', 'Monthly detail')} className="mt-6 !p-0 [&>div:first-child]:px-5 [&>div:first-child]:pt-5">
        <Table minWidth={560}>
          <Thead>
            <Th className="pl-5">{tr('Mes', 'Month')}</Th>
            <Th derecha>{tr('Ventas USD', 'Sales USD')}</Th>
            <Th derecha>{tr('TRM promedio', 'Average TRM')}</Th>
            <Th derecha className="pr-5">{tr('Ventas COP', 'Sales COP')}</Th>
          </Thead>
          <tbody>
            {serieVentasTrm.map((p) => (
              <Tr key={p.clave}>
                <Td className="pl-5 capitalize text-slate-200">{fmtMes(p.clave)}</Td>
                <Td derecha>{fmtUsd(p.usd)}</Td>
                <Td derecha>{fmtTrm(p.trm)}</Td>
                <Td derecha className="pr-5">{fmtCop(p.cop)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
