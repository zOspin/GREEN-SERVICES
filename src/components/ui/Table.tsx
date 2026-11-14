import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

/** Tabla con scroll horizontal en pantallas pequeñas. */
export default function Table({ children, minWidth = 480, className = '' }: { children: ReactNode; minWidth?: number; className?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full text-sm" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, fija = false }: { children: ReactNode; fija?: boolean }) {
  return (
    <thead className={fija ? 'sticky top-0 z-10 bg-tarjeta' : ''}>
      <tr className="border-b border-borde text-left text-xs uppercase tracking-wider text-tenue">{children}</tr>
    </thead>
  );
}

export function Th({ className = '', derecha = false, ...props }: ThHTMLAttributes<HTMLTableCellElement> & { derecha?: boolean }) {
  return <th className={`px-3 py-2.5 font-semibold ${derecha ? 'text-right' : ''} ${className}`} {...props} />;
}

export function Tr({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={`border-b border-borde/60 last:border-0 ${className}`} {...props} />;
}

export function Td({ className = '', derecha = false, ...props }: TdHTMLAttributes<HTMLTableCellElement> & { derecha?: boolean }) {
  return <td className={`px-3 py-2.5 text-slate-300 ${derecha ? 'text-right tabular-nums' : ''} ${className}`} {...props} />;
}
