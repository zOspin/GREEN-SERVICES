import type { ReactNode } from 'react';

/** Mensaje cuando no hay nada que mostrar (sin resultados, sin alertas, etc.). */
export default function EmptyState({ titulo, descripcion, accion }: { titulo: string; descripcion?: ReactNode; accion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borde px-6 py-10 text-center">
      <div className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-superficie text-tenue" aria-hidden="true">○</div>
      <p className="font-medium text-white">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-md text-sm text-tenue">{descripcion}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}
