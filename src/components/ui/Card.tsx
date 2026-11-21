import type { ReactNode } from 'react';

/** Superficie base de la interfaz. Con `titulo` se convierte en una sección con encabezado. */
export default function Card({
  titulo,
  accion,
  children,
  className = '',
  id,
}: {
  titulo?: ReactNode;
  accion?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`rounded-2xl border border-borde bg-tarjeta shadow-tarjeta p-4 sm:p-5 print:border-slate-300 print:bg-white ${className}`}>
      {(titulo || accion) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {titulo && <h2 className="text-lg font-semibold">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

/** Caja interna más clara, para destacar un bloque dentro de una Card. */
export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-borde/60 bg-superficie p-4 print:bg-white ${className}`}>{children}</div>;
}
