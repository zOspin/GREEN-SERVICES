import type { ReactNode } from 'react';

/** Título y subtítulo de cada pantalla, con espacio opcional para acciones a la derecha. */
export default function PageHeader({ titulo, subtitulo, children }: { titulo: string; subtitulo?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{titulo}</h1>
        {subtitulo && <p className="mt-1 max-w-3xl text-sm text-tenue">{subtitulo}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
