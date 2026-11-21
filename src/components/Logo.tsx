import { useId } from 'react';

/**
 * Logo de Órbita.
 * Círculo central = el cliente · órbita elíptica = su ciclo de compra · punto brillante = la IA,
 * que gira alrededor con una animación CSS (ver `.logo-punto` en index.css).
 */
export default function Logo({ size = 40 }: { size?: number }) {
  // Id único por logo: si hay dos en la página (menú y encabezado) y uno está oculto, el degradado no se pierde.
  const id = `op-nucleo-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Órbita">
      <defs>
        <radialGradient id={id} cx="40%" cy="35%" r="70%">
          <stop offset="0%" style={{ stopColor: 'var(--logo-nucleo-a)' }} />
          <stop offset="100%" style={{ stopColor: 'var(--logo-nucleo-b)' }} />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="32" rx="27" ry="11" fill="none" style={{ stroke: 'var(--logo-orbita)' }} strokeWidth="2.5" opacity="0.9" transform="rotate(-25 32 32)" />
      <circle cx="32" cy="32" r="10" fill={`url(#${id})`} />
      <g className="logo-punto">
        <circle r="7" style={{ fill: 'var(--logo-punto)' }} opacity="0.25" />
        <circle r="3.8" style={{ fill: 'var(--logo-punto)' }} />
      </g>
    </svg>
  );
}
