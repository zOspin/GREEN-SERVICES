/**
 * «¿Por qué este cliente está en riesgo?»
 * Explica en lenguaje simple, con los datos del propio cliente, por qué la IA le asigna su estado:
 * texto, barra de ritmo (ritmo normal vs. días actuales, con los umbrales) y nivel de confianza.
 */
import type { ReactNode } from 'react';
import type { AnalisisCliente } from '../lib/analytics';
import { categoria } from '../lib/catalogo';
import { trmVariacion30 } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { useIdioma } from '../lib/idioma';
import { fmtDec, fmtUsd } from '../lib/format';
import { INFO_ESTADO } from './ui';

export type Confianza = 'alta' | 'media' | 'baja';

/** Confianza según cuántas compras distintas tiene el cliente (más historia = más confiable). */
export function nivelConfianza(compras: number): Confianza {
  if (compras < 4) return 'baja';
  if (compras < 8) return 'media';
  return 'alta';
}

const B = ({ children }: { children: ReactNode }) => <strong className="font-semibold text-white">{children}</strong>;

export default function ExplicacionRiesgo({ a, compacta = false }: { a: AnalisisCliente; compacta?: boolean }) {
  const { idioma, tr, b } = useIdioma();
  const { umbrales: u } = useDatos();
  if (!a.ultimaCompra) return null;

  const ciclo = Math.round(a.ciclo);
  const veces = fmtDec(a.ratio);
  const estado = b(INFO_ESTADO[a.estado]);
  const confianza = nivelConfianza(a.frecuencia);
  const porDias = a.recencia > u.diasMaximosSinComprar;
  // Valor de la última compra (todas las líneas de ese día)
  const ultimaFecha = a.ventas[a.ventas.length - 1]?.fecha;
  const valorUltima = a.ventas.filter((v) => v.fecha === ultimaFecha).reduce((s, v) => s + v.valor_usd, 0);
  const trmPct = fmtDec(Math.abs(trmVariacion30) * 100);

  const titulo =
    a.estado === 'riesgo'
      ? tr('¿Por qué este cliente está en riesgo?', 'Why is this client at risk?')
      : a.estado === 'frio'
        ? tr('¿Por qué este cliente está inactivo?', 'Why is this client inactive?')
        : tr('¿Por qué este cliente está activo?', 'Why is this client active?');

  // Escala de la barra en «veces su ritmo»: hasta un poco más allá del mayor entre el umbral y el cliente.
  const max = Math.max(u.inactivo * 1.25, Math.min(a.ratio, u.inactivo * 2.5) * 1.08);
  const pos = (x: number) => `${Math.min(100, (x / max) * 100)}%`;
  // Alineación de cada etiqueta para que no se encimen: 1× hacia la izquierda, el umbral de riesgo hacia la derecha.
  const marcas = [
    { x: 1, etq: tr('1× ritmo normal', '1× normal pace'), dias: ciclo, alinear: '-translate-x-full text-right pr-1' },
    { x: u.riesgo, etq: `${fmtDec(u.riesgo)}× ${tr('en riesgo', 'at risk')}`, dias: Math.round(ciclo * u.riesgo), alinear: 'text-left pl-1' },
    { x: u.inactivo, etq: `${fmtDec(u.inactivo)}× ${tr('inactivo', 'inactive')}`, dias: Math.round(ciclo * u.inactivo), alinear: '-translate-x-1/2 text-center' },
  ];
  const fueraDeEscala = a.ratio > max;

  const textoConfianza: Record<Confianza, string> = {
    alta: tr(`Confianza alta: ${a.frecuencia} compras dan un ritmo claro.`, `High confidence: ${a.frecuencia} purchases give a clear pattern.`),
    media: tr(
      `Confianza media: ${a.frecuencia} compras; el ritmo es orientativo.`,
      `Medium confidence: ${a.frecuencia} purchases; the pattern is a guide.`,
    ),
    baja: tr(
      `Confianza baja: solo ${a.frecuencia} ${a.frecuencia === 1 ? 'compra' : 'compras'}. Con menos de 4 compras el ritmo no es confiable; tómalo como una pista, no como una certeza.`,
      `Low confidence: only ${a.frecuencia} ${a.frecuencia === 1 ? 'purchase' : 'purchases'}. With fewer than 4 purchases the pattern isn't reliable; treat it as a hint, not a certainty.`,
    ),
  };
  const colorConfianza = confianza === 'alta' ? 'text-green-300 border-ok/40 bg-ok/10' : confianza === 'media' ? 'text-amber-300 border-riesgo/40 bg-riesgo/10' : 'text-red-300 border-frio/40 bg-frio/10';

  return (
    <div className={compacta ? '' : 'rounded-xl border border-borde/60 bg-superficie p-4'}>
      {!compacta && <p className="font-semibold text-white">{titulo}</p>}

      <p className={`text-sm leading-relaxed text-slate-300 ${compacta ? '' : 'mt-2'}`}>
        {idioma === 'es' ? (
          <>
            {a.cicloEstimado ? 'Con tan pocas compras usamos el ritmo general: cada ' : 'Compra cada '}
            <B>{ciclo} días</B> en promedio. Lleva <B>{a.recencia} días</B> sin comprar: <B>{veces} veces</B> su ritmo normal →{' '}
            <B>{estado}</B>
            {porDias && <> (además supera el máximo de {u.diasMaximosSinComprar} días sin comprar)</>}. Su última compra fue{' '}
            <B>{a.ultimaCategoria ? categoria(a.ultimaCategoria, 'es') : '—'}</B> ({fmtUsd(valorUltima)}).{' '}
            {Math.abs(trmVariacion30) >= 0.01 && (
              <>
                La TRM {trmVariacion30 > 0 ? 'subió' : 'bajó'} <B>{trmPct} %</B> en los últimos 30 días.
              </>
            )}
          </>
        ) : (
          <>
            {a.cicloEstimado ? 'With so few purchases we use the overall pace: every ' : 'Buys every '}
            <B>{ciclo} days</B> on average. It has been <B>{a.recencia} days</B> without a purchase: <B>{veces}×</B> their normal pace →{' '}
            <B>{estado}</B>
            {porDias && <> (it also exceeds the {u.diasMaximosSinComprar}-day maximum without buying)</>}. Last purchase:{' '}
            <B>{a.ultimaCategoria ? categoria(a.ultimaCategoria, 'en') : '—'}</B> ({fmtUsd(valorUltima)}).{' '}
            {Math.abs(trmVariacion30) >= 0.01 && (
              <>
                The exchange rate {trmVariacion30 > 0 ? 'rose' : 'fell'} <B>{trmPct}%</B> in the last 30 days.
              </>
            )}
          </>
        )}
      </p>

      {/* Barra de ritmo: zonas activo / en riesgo / inactivo, marcas de umbral y posición actual */}
      <div
        className="relative mt-4 pb-9 pt-7"
        role="img"
        aria-label={tr(
          `Ritmo normal ${ciclo} días; hoy lleva ${a.recencia} días (${veces} veces). En riesgo desde ${fmtDec(u.riesgo)} veces; inactivo desde ${fmtDec(u.inactivo)} veces.`,
          `Normal pace ${ciclo} days; today ${a.recencia} days (${veces}×). At risk from ${fmtDec(u.riesgo)}×; inactive from ${fmtDec(u.inactivo)}×.`,
        )}
      >
        <div className="relative h-3 overflow-hidden rounded-full">
          <div className="absolute inset-y-0 left-0 bg-ok/35" style={{ width: pos(u.riesgo) }} />
          <div className="absolute inset-y-0 bg-riesgo/40" style={{ left: pos(u.riesgo), width: `calc(${pos(u.inactivo)} - ${pos(u.riesgo)})` }} />
          <div className="absolute inset-y-0 right-0 bg-frio/35" style={{ left: pos(u.inactivo) }} />
        </div>
        {marcas.map((m) => (
          <div key={m.etq} className="absolute bottom-0 top-6" style={{ left: pos(m.x) }} aria-hidden="true">
            <div className="h-5 w-px bg-slate-300/70" />
            <p className={`mt-0.5 whitespace-nowrap text-[0.65rem] leading-tight text-tenue ${m.alinear}`}>
              {m.etq}
              <br />
              {m.dias} {tr('d', 'd')}
            </p>
          </div>
        ))}
        <div className="absolute top-0 -translate-x-1/2 text-center" style={{ left: pos(Math.min(a.ratio, max)) }} aria-hidden="true">
          <p className="whitespace-nowrap rounded bg-fondo/80 px-1.5 text-[0.7rem] font-semibold" style={{ color: INFO_ESTADO[a.estado].color }}>
            {tr('hoy', 'today')}: {a.recencia} d{fueraDeEscala ? ' →' : ''}
          </p>
          <div className="mx-auto mt-0.5 h-5 w-1 rounded-full" style={{ background: INFO_ESTADO[a.estado].color }} />
        </div>
      </div>

      <p className={`mt-1 inline-flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${colorConfianza}`}>
        <span className="font-semibold">{tr('Confianza', 'Confidence')}: {tr(confianza, confianza === 'alta' ? 'high' : confianza === 'media' ? 'medium' : 'low')}</span>
        <span className="text-slate-300">{textoConfianza[confianza].split(': ').slice(1).join(': ')}</span>
      </p>
    </div>
  );
}
