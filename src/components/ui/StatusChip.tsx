import type { Estado } from '../../lib/analytics';

export const INFO_ESTADO: Record<Estado, { texto: string; color: string; clase: string; simbolo: string }> = {
  activo: { texto: 'Activo', color: '#22C55E', clase: 'bg-ok/15 text-green-300 border-ok/40', simbolo: '●' },
  riesgo: { texto: 'En riesgo', color: '#F59E0B', clase: 'bg-riesgo/15 text-amber-300 border-riesgo/40', simbolo: '▲' },
  frio: { texto: 'Frío', color: '#EF4444', clase: 'bg-frio/15 text-red-300 border-frio/40', simbolo: '■' },
};

/** Chip de estado: color + forma + texto (nunca solo color). */
export default function StatusChip({ estado }: { estado: Estado }) {
  const i = INFO_ESTADO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${i.clase}`}>
      <span aria-hidden="true" className="text-[0.6rem]">{i.simbolo}</span>
      {i.texto}
    </span>
  );
}
