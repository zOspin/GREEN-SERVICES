import type { Prioridad } from '../../lib/modelo';
import { useIdioma } from '../../lib/idioma';
import { fmtDec } from '../../lib/format';

const ESTILO: Record<Prioridad, string> = {
  alta: 'bg-violeta/15 text-violeta border-violeta/40',
  media: 'bg-turquesa/15 text-estado-ok border-turquesa/40',
  baja: 'bg-tenue/10 text-tenue border-borde',
};

/** Chip de prioridad (Alta / Media / Baja) según la probabilidad de compra del modelo. */
export function ChipPrioridad({ prioridad }: { prioridad: Prioridad }) {
  const { tr } = useIdioma();
  const texto = { alta: tr('Alta', 'High'), media: tr('Media', 'Medium'), baja: tr('Baja', 'Low') }[prioridad];
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ESTILO[prioridad]}`}>{texto}</span>;
}

/** Probabilidad como número (0,68) con una barrita. */
export function BarraProbabilidad({ p }: { p: number }) {
  return (
    <span className="inline-flex items-center gap-2" title={`${Math.round(p * 100)} %`}>
      <span className="tabular-nums">{fmtDec(p, 2)}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-borde/60" aria-hidden="true">
        <span className="block h-full rounded-full bg-gradient-to-r from-turquesa to-violeta" style={{ width: `${Math.round(p * 100)}%` }} />
      </span>
    </span>
  );
}
