import type { Estado } from '../../lib/analytics';
import { useIdioma } from '../../lib/idioma';

/** Texto, color (variable de tema) y forma de cada estado. */
export const INFO_ESTADO: Record<Estado, { es: string; en: string; color: string; clase: string; simbolo: string }> = {
  activo: { es: 'Activo', en: 'Active', color: 'rgb(var(--texto-ok))', clase: 'bg-ok/15 text-green-300 border-ok/40', simbolo: '●' },
  riesgo: { es: 'En riesgo', en: 'At risk', color: 'rgb(var(--texto-riesgo))', clase: 'bg-riesgo/15 text-amber-300 border-riesgo/40', simbolo: '▲' },
  frio: { es: 'Inactivo', en: 'Inactive', color: 'rgb(var(--texto-frio))', clase: 'bg-frio/15 text-red-300 border-frio/40', simbolo: '■' },
};

/** Chip de estado: color + forma + texto (nunca solo color). */
export default function StatusChip({ estado }: { estado: Estado }) {
  const { b } = useIdioma();
  const i = INFO_ESTADO[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${i.clase}`}>
      <span aria-hidden="true" className="text-[0.6rem]">{i.simbolo}</span>
      {b(i)}
    </span>
  );
}
