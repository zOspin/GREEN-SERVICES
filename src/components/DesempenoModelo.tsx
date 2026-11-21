/**
 * Gráfica «Desempeño del modelo de IA»: precisión, exhaustividad y F1 del modelo
 * contra la regla base (compró en los últimos 30 días), con la conclusión en una frase.
 */
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Metricas } from '../lib/modelo';
import { useIdioma } from '../lib/idioma';
import { useTema } from '../lib/tema';
import { fmtDec } from '../lib/format';
import { IconoInfo } from './Iconos';

const pct = (v: number) => `${fmtDec(v * 100)} %`;

/** Conclusión en lenguaje simple, según cómo salió la comparación. */
export function conclusionModelo(m: Metricas, r: Metricas, tr: (es: string, en: string) => string): string {
  if (m.exhaustividad > r.exhaustividad + 0.02 && m.precision < r.precision - 0.02)
    return tr(
      'El modelo identifica más compradores (mayor exhaustividad), pero con más falsos positivos. Requiere revisión humana.',
      'The model finds more buyers (higher recall), but with more false positives. It needs human review.',
    );
  if (m.f1 > r.f1 + 0.02)
    return tr('El modelo supera a la regla base en el balance entre aciertos y alcance (F1).', 'The model beats the baseline rule on the balance between accuracy and reach (F1).');
  if (m.f1 < r.f1 - 0.02)
    return tr(
      'Con estos datos la regla simple funciona igual o mejor: el modelo necesita más historia o más variables.',
      'With this data the simple rule works as well or better: the model needs more history or more variables.',
    );
  return tr('El modelo y la regla base rinden parecido; el modelo además da una probabilidad para ordenar a quién llamar.', 'The model and the baseline rule perform similarly; the model also gives a probability to rank who to call.');
}

export default function DesempenoModelo({ modelo, regla, alto = 220 }: { modelo: Metricas; regla: Metricas; alto?: number }) {
  const { tr } = useIdioma();
  const { colores: c } = useTema();
  const datos = [
    { nombre: tr('Precisión', 'Precision'), modelo: modelo.precision, regla: regla.precision },
    { nombre: tr('Exhaustividad', 'Recall'), modelo: modelo.exhaustividad, regla: regla.exhaustividad },
    { nombre: 'F1', modelo: modelo.f1, regla: regla.f1 },
  ];
  return (
    <div>
      <div
        style={{ height: alto }}
        role="img"
        aria-label={tr(
          `Modelo: precisión ${pct(modelo.precision)}, exhaustividad ${pct(modelo.exhaustividad)}, F1 ${pct(modelo.f1)}. Regla base: precisión ${pct(regla.precision)}, exhaustividad ${pct(regla.exhaustividad)}, F1 ${pct(regla.f1)}.`,
          `Model: precision ${pct(modelo.precision)}, recall ${pct(modelo.exhaustividad)}, F1 ${pct(modelo.f1)}. Baseline rule: precision ${pct(regla.precision)}, recall ${pct(regla.exhaustividad)}, F1 ${pct(regla.f1)}.`,
        )}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 20, right: 8, left: -8, bottom: 0 }} barGap={6}>
            <CartesianGrid stroke={c.rejilla} strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="nombre" tick={{ fill: c.eje, fontSize: 12 }} axisLine={{ stroke: c.rejilla }} tickLine={false} />
            <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tickFormatter={(v: number) => `${Math.round(v * 100)}%`} tick={{ fill: c.eje, fontSize: 11 }} axisLine={false} tickLine={false} width={44} />
            <Tooltip
              cursor={{ fill: c.rejilla, opacity: 0.4 }}
              contentStyle={{ background: c.tooltipFondo, border: `1px solid ${c.tooltipBorde}`, borderRadius: 10, color: c.tooltipTexto }}
              formatter={(v: number, n: string) => [pct(v), n]}
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ color: c.eje, fontSize: 12, paddingTop: 6 }} />
            <Bar dataKey="modelo" name={tr('Modelo (regresión logística)', 'Model (logistic regression)')} fill={c.turquesa} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="modelo" position="top" formatter={(v: number) => `${fmtDec(v * 100)}%`} style={{ fill: c.eje, fontSize: 10, fontWeight: 600 }} />
            </Bar>
            <Bar dataKey="regla" name={tr('Regla base (compra últimos 30 días)', 'Baseline rule (bought in last 30 days)')} fill={c.violeta} radius={[6, 6, 0, 0]} isAnimationActive={false}>
              <LabelList dataKey="regla" position="top" formatter={(v: number) => `${fmtDec(v * 100)}%`} style={{ fill: c.eje, fontSize: 10, fontWeight: 600 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 flex items-start gap-2 rounded-xl border border-acento/20 bg-acento/5 p-3 text-sm text-slate-200">
        <IconoInfo className="mt-0.5 shrink-0 text-acento" width={18} height={18} />
        {conclusionModelo(modelo, regla, tr)}
      </p>
    </div>
  );
}
