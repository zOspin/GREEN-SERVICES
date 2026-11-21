import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variante = 'primario' | 'secundario' | 'fantasma';

const CLASES: Record<Variante, string> = {
  primario: 'bg-acento text-sobre-acento shadow-tarjeta hover:bg-acento/90',
  secundario: 'border border-borde bg-tarjeta text-slate-200 hover:border-acento/50 hover:text-acento',
  fantasma: 'text-azul hover:bg-acento/10',
};
const base = 'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 print:hidden';

/** Botón real (<button>). Si solo tiene ícono, pasa `aria-label`. */
export default function Button({
  variante = 'secundario',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return <button type="button" className={`${base} ${CLASES[variante]} ${className}`} {...props} />;
}

/** Enlace con apariencia de botón, para navegar entre pantallas. */
export function ButtonLink({ to, variante = 'secundario', children, className = '' }: { to: string; variante?: Variante; children: ReactNode; className?: string }) {
  return (
    <Link to={to} className={`${base} ${CLASES[variante]} ${className}`}>
      {children}
    </Link>
  );
}
