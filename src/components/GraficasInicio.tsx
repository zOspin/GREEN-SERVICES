/**
 * Gráficas del Resumen general (en archivo aparte para cargarlas después de los números).
 */
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Estado } from '../lib/analytics';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { fmtCompacto, fmtMes } from '../lib/format';

export function AreaIngresos({ datos }: { datos: { clave: string; cop: number }[] }) {
  const { tr } = useIdioma();
  const { colores: c } = useTema();
  const ingresosMensuales = datos;
  return (
    <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ingresosMensuales} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="relleno-ingresos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c.turquesa} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={c.turquesa} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={c.rejilla} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="clave" tickFormatter={(k: string) => fmtMes(k)} tick={{ fill: c.eje, fontSize: 11 }} axisLine={{ stroke: c.rejilla }} tickLine={false} interval="preserveStartEnd" minTickGap={24} />
                <YAxis tickFormatter={(v: number) => fmtCompacto(v, 'COP')} tick={{ fill: c.eje, fontSize: 11 }} axisLine={false} tickLine={false} width={84} />
                <Tooltip
                  contentStyle={{ background: c.tooltipFondo, border: `1px solid ${c.tooltipBorde}`, borderRadius: 10, color: c.tooltipTexto }}
                  labelFormatter={(k: string) => fmtMes(k)}
                  formatter={(v: number) => [fmtCompacto(v, 'COP'), tr('Ingresos', 'Revenue')]}
                />
                <Area type="monotone" dataKey="cop" stroke={c.turquesa} strokeWidth={2.5} fill="url(#relleno-ingresos)" dot={{ r: 2.5, fill: c.turquesa }} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
  );
}

export function Dona({ situacion }: { situacion: { estado: Estado; n: number; color: string }[] }) {
  return (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={situacion} dataKey="n" nameKey="estado" innerRadius="62%" outerRadius="100%" stroke="none" isAnimationActive={false}>
                    {situacion.map((s2) => (
                      <Cell key={s2.estado} fill={s2.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
  );
}
