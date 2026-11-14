/**
 * Logo de Órbita Pulse.
 * Círculo central = el cliente · órbita elíptica = su ciclo de compra · punto brillante = la IA,
 * que gira alrededor con una animación CSS (ver `.logo-punto` en index.css).
 */
export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Logo de Órbita Pulse">
      <defs>
        <radialGradient id="op-nucleo" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="32" rx="27" ry="11" fill="none" stroke="#3B82F6" strokeWidth="2.5" opacity="0.9" transform="rotate(-25 32 32)" />
      <circle cx="32" cy="32" r="10" fill="url(#op-nucleo)" />
      <g className="logo-punto">
        <circle r="7" fill="#FDE68A" opacity="0.25" />
        <circle r="3.8" fill="#FDE68A" />
      </g>
    </svg>
  );
}
