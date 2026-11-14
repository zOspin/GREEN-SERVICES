import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PuntoMensual } from '../lib/analytics';
import { fmtCompacto, fmtUsd } from '../lib/format';

/** Ventas por mes (línea sólida) y pronóstico del mes en curso (línea punteada). */
export default function GraficaVentas({ datos, alto = 300 }: { datos: PuntoMensual[]; alto?: number }) {
  return (
    <div style={{ height: alto }} role="img" aria-label="Gráfica de ventas mensuales en dólares de los últimos 12 meses, con el pronóstico del mes en curso en línea punteada">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#22305A" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="etiqueta" tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={{ stroke: '#22305A' }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#94A3C4', fontSize: 12 }} axisLine={false} tickLine={false} width={92} tickFormatter={(v: number) => fmtCompacto(v).replace(/ /g, '\u00A0')} />
          <Tooltip
            contentStyle={{ background: '#0B1020', border: '1px solid #22305A', borderRadius: 10, color: '#E2E8F0' }}
            labelStyle={{ color: '#E2E8F0', fontWeight: 600 }}
            formatter={(v: number, nombre: string) => [fmtUsd(v), nombre]}
          />
          <Legend wrapperStyle={{ color: '#94A3C4', fontSize: 12 }} />
          <Line type="monotone" dataKey="usd" name="Ventas (USD)" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3, fill: '#3B82F6' }} activeDot={{ r: 5 }} connectNulls={false} />
          <Line type="monotone" dataKey="pronostico" name="Pronóstico (USD)" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="6 5" dot={{ r: 4, fill: '#F59E0B' }} connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
