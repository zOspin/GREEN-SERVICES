import type { ReactNode } from 'react';
import { fmtDec } from '../../lib/format';

/** Tarjeta con un indicador numérico grande. */
export default function StatCard({
  titulo,
  valor,
  detalle,
  color,
}: {
  titulo: string;
  valor: ReactNode;
  detalle?: ReactNode;
  color?: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-borde bg-tarjeta shadow-tarjeta p-4 sm:p-5">
      <p className="text-sm text-tenue">{titulo}</p>
      <p className="mt-2 font-titulo text-2xl font-semibold tabular-nums" style={color ? { color } : undefined}>
        {valor}
      </p>
      {detalle && <div className="mt-1 text-xs text-tenue">{detalle}</div>}
    </div>
  );
}

/** Variación porcentual con flecha y color (verde si sube, rojo si baja). */
export function Variacion({ valor, texto }: { valor: number; texto?: string }) {
  const sube = valor >= 0;
  return (
    <span className={sube ? 'text-green-300' : 'text-red-300'}>
      <span aria-hidden="true">{sube ? '▲' : '▼'}</span> {sube ? '+' : '−'}
      {fmtDec(Math.abs(valor) * 100)} %{texto && <span className="text-tenue"> {texto}</span>}
    </span>
  );
}
