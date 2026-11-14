/** Barra horizontal del puntaje de riesgo (0–100), con el número siempre visible. */
export default function RiskBar({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 80 ? '#EF4444' : puntaje >= 40 ? '#F59E0B' : '#22C55E';
  return (
    <div className="flex items-center gap-2" title={`Puntaje de riesgo: ${puntaje} de 100`}>
      <div
        className="h-2 w-20 overflow-hidden rounded-full bg-white/10"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={puntaje}
        aria-label="Puntaje de riesgo"
      >
        <div className="h-full rounded-full" style={{ width: `${puntaje}%`, background: color }} />
      </div>
      <span className="w-7 text-right text-sm tabular-nums text-slate-200">{puntaje}</span>
    </div>
  );
}
