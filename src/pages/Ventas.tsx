import { Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr, Variacion } from '../components/ui';
import { categoriasMes, correlacionVentasTrm, serieVentasTrm } from '../lib/datos';
import { fmtCompacto, fmtCop, fmtTrm, fmtUsd } from '../lib/format';

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
const estiloTooltip = {
  contentStyle: { background: '#0B1020', border: '1px solid #22305A', borderRadius: 10, color: '#E2E8F0' },
  labelStyle: { color: '#E2E8F0', fontWeight: 600 },
};

/** Traduce la correlación a palabras sencillas. */
function describirRelacion(r: number): string {
  const fuerza = Math.abs(r) < 0.3 ? 'débil' : Math.abs(r) < 0.6 ? 'moderada' : 'fuerte';
  if (Math.abs(r) < 0.3) return `La relación es ${fuerza}: en estos 12 meses, los cambios del dólar no explican por sí solos cuánto vendemos en USD.`;
  return r < 0
    ? `La relación es ${fuerza} e inversa: los meses con el dólar más caro tienden a ser de menos ventas en USD.`
    : `La relación es ${fuerza} y directa: los meses con el dólar más caro tienden a ser de más ventas en USD.`;
}

export default function Ventas() {
  const total = serieVentasTrm.reduce((s, p) => ({ usd: s.usd + p.usd, cop: s.cop + p.cop }), { usd: 0, cop: 0 });
  const trmMin = Math.min(...serieVentasTrm.map((p) => p.trm));
  const trmMax = Math.max(...serieVentasTrm.map((p) => p.trm));
  const primero = serieVentasTrm[0];
  const ultimo = serieVentasTrm[serieVentasTrm.length - 1];
  const variacionTrm = (ultimo.trm - primero.trm) / primero.trm;
  const top = categoriasMes.ranking[0];

  return (
    <>
      <PageHeader
        titulo="Ventas y TRM"
        subtitulo="Tendencias de ventas por mes y por categoría, y cómo se mueven frente al precio del dólar. Para Gerencia Financiera."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard titulo="Ventas últimos 12 meses" valor={fmtCompacto(total.usd)} detalle={fmtCompacto(total.cop, 'COP')} />
        <StatCard titulo="Categoría que más vende" valor={top.categoria} detalle={`${fmtCompacto(top.usd)} en 12 meses`} />
        <StatCard titulo="TRM promedio mensual" valor={`${fmtTrm(trmMin).replace(',00', '')} – ${fmtTrm(trmMax).replace(',00', '').replace('$ ', '')}`} detalle="rango de los 12 meses" />
        <StatCard titulo="Cambio de la TRM" valor={<Variacion valor={variacionTrm} />} detalle={`${primero.etiqueta} → ${ultimo.etiqueta}`} />
      </div>

      <Card titulo="Ventas (USD) contra TRM" className="mt-6">
        <div className="h-80" role="img" aria-label="Barras con las ventas mensuales en dólares y una línea con la TRM promedio de cada mes">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={serieVentasTrm} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#22305A" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="etiqueta" tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={{ stroke: '#22305A' }} tickLine={false} />
              <YAxis yAxisId="usd" tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={eje} />
              <YAxis
                yAxisId="trm"
                orientation="right"
                domain={[3700, 4450]}
                tick={{ fill: '#FCD34D', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={52}
                tickFormatter={(v: number) => v.toLocaleString('es-CO')}
              />
              <Tooltip
                {...estiloTooltip}
                formatter={(v: number, nombre: string) => [nombre.startsWith('TRM') ? fmtTrm(v) : fmtUsd(v), nombre]}
              />
              <Legend wrapperStyle={{ color: '#94A3C4', fontSize: 12 }} />
              <Bar yAxisId="usd" dataKey="usd" name="Ventas (USD)" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line yAxisId="trm" dataKey="trm" name="TRM promedio (COP)" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3, fill: '#F59E0B' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel className="text-sm text-slate-300">
            <p className="font-semibold text-white">¿Cómo se relacionan?</p>
            <p className="mt-1">
              Medimos qué tanto se mueven juntas las dos líneas con un número entre −1 y 1 (correlación). Aquí da{' '}
              <strong className="text-acento">{correlacionVentasTrm.toFixed(2).replace('.', ',')}</strong>.
            </p>
            <p className="mt-1">{describirRelacion(correlacionVentasTrm)}</p>
            <p className="mt-2 text-xs text-tenue">Con datos inventados el resultado es ilustrativo; con datos reales esta misma medida se calcula sola cada mes.</p>
          </Panel>
          <Panel className="text-sm text-slate-300">
            <p className="font-semibold text-white">¿Por qué importa la TRM?</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Muchos productos se cotizan en dólares. Si el dólar sube, al cliente colombiano le cuestan más pesos y puede aplazar la compra.</li>
              <li>Para la empresa, la misma venta en USD vale más en pesos cuando la TRM sube: mira la columna COP de la tabla.</li>
              <li>Por eso la IA sube un poco el riesgo de los clientes cuando el dólar sube más de 5 % en 30 días.</li>
            </ul>
          </Panel>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card titulo="Ventas por categoría (USD)" className="xl:col-span-2">
          <div className="h-80" role="img" aria-label="Barras apiladas con las ventas mensuales por categoría">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoriasMes.filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#22305A" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="etiqueta" tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={{ stroke: '#22305A' }} tickLine={false} />
                <YAxis tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={eje} />
                <Tooltip {...estiloTooltip} formatter={(v: number, nombre: string) => [fmtUsd(v), nombre]} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Legend wrapperStyle={{ color: '#94A3C4', fontSize: 12 }} />
                {categoriasMes.categorias.map((c, i) => (
                  <Bar
                    key={c}
                    dataKey={c}
                    stackId="cat"
                    fill={COLOR_CATEGORIA[c]}
                    stroke="#121A33"
                    strokeWidth={1}
                    radius={i === categoriasMes.categorias.length - 1 ? [4, 4, 0, 0] : 0}
                    maxBarSize={36}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card titulo="Ranking de categorías">
          <ol className="space-y-3">
            {categoriasMes.ranking.map((r, i) => (
              <li key={r.categoria}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-4 text-tenue">{i + 1}.</span>
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLOR_CATEGORIA[r.categoria] }} aria-hidden="true" />
                    {r.categoria}
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

      <Card titulo="Detalle mensual" className="mt-6 !p-0 [&>div:first-child]:px-5 [&>div:first-child]:pt-5">
        <Table minWidth={560}>
          <Thead>
            <Th className="pl-5">Mes</Th>
            <Th derecha>Ventas USD</Th>
            <Th derecha>TRM promedio</Th>
            <Th derecha className="pr-5">Ventas COP</Th>
          </Thead>
          <tbody>
            {serieVentasTrm.map((p) => (
              <Tr key={p.clave}>
                <Td className="pl-5 capitalize text-slate-200">{p.etiqueta}</Td>
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
