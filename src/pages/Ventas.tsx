import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import { categoriasMes, correlacionVentasTrm, serieVentasTrm } from '../lib/datos';
import { categoria } from '../lib/catalogo';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { fmtCompacto, fmtCop, fmtDec, fmtMes, fmtNum, fmtTrm, fmtUsd } from '../lib/format';

/** Colores por categoría (no se usan verde/ámbar/rojo para no confundir con los estados). */
const COLOR_CATEGORIA: Record<string, string> = {
  Redes: '#3B82F6',
  Nube: '#38BDF8',
  Ciberseguridad: '#A78BFA',
  Hardware: '#F59E0B',
  Software: '#F472B6',
  Almacenamiento: '#94A3B8',
};
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

export default function Ventas() {
  const { idioma, tr } = useIdioma();
  const { colores: c } = useTema();
  const total = serieVentasTrm.reduce((s, p) => ({ usd: s.usd + p.usd, cop: s.cop + p.cop }), { usd: 0, cop: 0 });
  const trmMin = Math.min(...serieVentasTrm.map((p) => p.trm));
  const trmMax = Math.max(...serieVentasTrm.map((p) => p.trm));
  const primero = serieVentasTrm[0];
  const ultimo = serieVentasTrm[serieVentasTrm.length - 1];
  const variacionTrm = (ultimo.trm - primero.trm) / primero.trm;
  const top = categoriasMes.ranking[0];
  const tooltip = {
    contentStyle: { background: c.tooltipFondo, border: `1px solid ${c.tooltipBorde}`, borderRadius: 10, color: c.tooltipTexto },
    labelStyle: { color: c.tooltipTexto, fontWeight: 600 },
    labelFormatter: (clave: string) => fmtMes(clave),
  };
  const ejeX = { dataKey: 'clave', tickFormatter: (k: string) => fmtMes(k), tick: { fill: c.eje, fontSize: 12 }, axisLine: { stroke: c.rejilla }, tickLine: false };

  return (
    <>
      <PageHeader
        titulo={tr('Ventas y TRM', 'Sales & exchange rate')}
        subtitulo={tr(
          'Tendencias de ventas por mes y por categoría, y cómo se mueven frente al precio del dólar. Para Gerencia Financiera.',
          'Sales trends by month and category, and how they move against the US dollar price (TRM). For the Finance team.',
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard titulo={tr('Ventas últimos 12 meses', 'Sales, last 12 months')} valor={fmtCompacto(total.usd)} detalle={fmtCompacto(total.cop, 'COP')} />
        <StatCard
          titulo={tr('Categoría que más vende', 'Top-selling category')}
          valor={categoria(top.categoria, idioma)}
          detalle={tr(`${fmtCompacto(top.usd)} en 12 meses`, `${fmtCompacto(top.usd)} in 12 months`)}
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
                    fill={COLOR_CATEGORIA[cat]}
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
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_CATEGORIA[r.categoria] }} aria-hidden="true" />
                    {categoria(r.categoria, idioma)}
                  </span>
                  <span className="tabular-nums text-slate-300">{fmtCompacto(r.usd)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(r.usd / categoriasMes.ranking[0].usd) * 100}%`, background: COLOR_CATEGORIA[r.categoria] }} />
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
