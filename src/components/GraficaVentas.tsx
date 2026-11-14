import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PuntoMensual } from '../lib/analytics';
import { fmtCompacto, fmtMes, fmtUsd } from '../lib/format';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';

const ejeY = (v: number) => fmtCompacto(v).replace(/ /g, ' ');
/** El último punto es el mes en curso (pronóstico): se marca con asterisco. */
const ejeX = (clave: string, i: number, total: number) => `${fmtMes(clave)}${i === total - 1 ? '*' : ''}`;

/** Ventas por mes (línea sólida) y pronóstico del mes en curso (línea punteada). */
export default function GraficaVentas({ datos, alto = 300 }: { datos: PuntoMensual[]; alto?: number }) {
  const { tr } = useIdioma();
  const { colores: c } = useTema();
  return (
    <div
      style={{ height: alto }}
      role="img"
      aria-label={tr(
        'Gráfica de ventas mensuales en dólares de los últimos 12 meses, con el pronóstico del mes en curso en línea punteada',
        'Chart of monthly sales in US dollars over the last 12 months, with the current month forecast as a dashed line',
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c.rejilla} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="clave"
            tickFormatter={(clave: string, i: number) => ejeX(clave, i, datos.length)}
            tick={{ fill: c.eje, fontSize: 12 }}
            axisLine={{ stroke: c.rejilla }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: c.eje, fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={ejeY} />
          <Tooltip
            contentStyle={{ background: c.tooltipFondo, border: `1px solid ${c.tooltipBorde}`, borderRadius: 10, color: c.tooltipTexto }}
            labelStyle={{ color: c.tooltipTexto, fontWeight: 600 }}
            labelFormatter={(clave: string) => fmtMes(clave)}
            formatter={(v: number, nombre: string) => [fmtUsd(v), nombre]}
          />
          <Legend wrapperStyle={{ color: c.eje, fontSize: 12 }} />
          <Line type="monotone" dataKey="usd" name={tr('Ventas (USD)', 'Sales (USD)')} stroke={c.azul} strokeWidth={2.5} dot={{ r: 3, fill: c.azul }} activeDot={{ r: 5 }} connectNulls={false} />
          <Line type="monotone" dataKey="pronostico" name={tr('Pronóstico (USD)', 'Forecast (USD)')} stroke={c.acento} strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 4, fill: c.acento }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
