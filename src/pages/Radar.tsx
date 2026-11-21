import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ButtonLink, Card, INFO_ESTADO, PageHeader, StatusChip } from '../components/ui';
import ExplicacionRiesgo from '../components/ExplicacionRiesgo';
import { IconoFlecha } from '../components/Iconos';
import { clientes, HOY } from '../lib/datos';
import { valorAnual, type AnalisisCliente } from '../lib/analytics';
import { useDatos } from '../lib/umbrales';
import { useIdioma } from '../lib/idioma';
import { sector as nombreSector } from '../lib/catalogo';
import { fmtCompacto, fmtDec } from '../lib/format';
import type { Umbrales } from '../config/umbrales';

const TAM = 680;
const C = TAM / 2;
const R = 262; // radio del anillo exterior (deja margen para los nombres de sector)
// Anillos: hasta 40 % del radio = activo, 40–70 % = en riesgo, 70–100 % = inactivo.
const R_RIESGO = 0.4 * R;
const R_INACTIVO = 0.7 * R;
const SECTORES = [...new Set(clientes.map((c) => c.sector))].sort();

/** Distancia al centro según qué tan atrasado va el cliente (ratio = días sin comprar ÷ ciclo). */
function radio(a: AnalisisCliente, u: Umbrales): number {
  const r = a.ratio;
  if (a.estado === 'frio') {
    const exceso = Math.max(0, r - u.inactivo);
    return R_INACTIVO + 8 + (R - R_INACTIVO - 14) * (1 - Math.exp(-exceso / 1.5));
  }
  if (r <= u.riesgo) return Math.max(18, (r / u.riesgo) * (R_RIESGO - 6));
  return R_RIESGO + ((r - u.riesgo) / (u.inactivo - u.riesgo)) * (R_INACTIVO - R_RIESGO);
}

export default function Radar() {
  const { idioma, tr, b } = useIdioma();
  const { analisis, umbrales: u, analisisPorId, conteoEstados } = useDatos();
  const [params, setParams] = useSearchParams();
  const navegar = useNavigate();
  const destacado = params.get('destacar') ?? '';
  const [foco, setFoco] = useState<string | null>(null);
  const seleccionado = analisisPorId.get(foco ?? destacado);

  const puntos = useMemo(() => {
    const maxValor = Math.max(...analisis.map((a) => valorAnual(a, HOY)));
    const porSector = new Map<string, AnalisisCliente[]>();
    for (const a of analisis) porSector.set(a.cliente.sector, [...(porSector.get(a.cliente.sector) ?? []), a]);
    const ancho = (2 * Math.PI) / SECTORES.length;
    return SECTORES.flatMap((s, i) => {
      const lista = (porSector.get(s) ?? []).sort((x, y) => x.cliente.id.localeCompare(y.cliente.id));
      return lista.map((a, k) => {
        const angulo = -Math.PI / 2 + i * ancho + ((k + 0.5) / lista.length) * ancho;
        const r = radio(a, u);
        return {
          a,
          x: C + r * Math.cos(angulo),
          y: C + r * Math.sin(angulo),
          tam: 4 + 8 * Math.sqrt(valorAnual(a, HOY) / maxValor),
        };
      });
    });
  }, [analisis, u]);

  const ir = (id: string) => navegar(`/clientes/${id}`);

  return (
    <>
      <PageHeader
        titulo={tr('Radar de clientes', 'Client radar')}
        subtitulo={tr(
          'Cada punto es un cliente. Cerca del centro compra a su ritmo; hacia afuera se va atrasando. El tamaño indica cuánto compra al año.',
          'Each dot is a client. Near the center they buy on schedule; further out they are falling behind. Size shows how much they buy per year.',
        )}
      >
        <label className="flex items-center gap-2 text-sm text-tenue">
          {tr('Destacar', 'Highlight')}
          <select
            className="campo w-auto"
            value={destacado}
            onChange={(e) => {
              setFoco(null);
              setParams(e.target.value ? { destacar: e.target.value } : {});
            }}
          >
            <option value="">{tr('Ninguno', 'None')}</option>
            {analisis
              .slice()
              .sort((x, y) => x.cliente.nombre.localeCompare(y.cliente.nombre))
              .map((a) => (
                <option key={a.cliente.id} value={a.cliente.id}>
                  {a.cliente.nombre}
                </option>
              ))}
          </select>
        </label>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <svg
            viewBox={`0 0 ${TAM} ${TAM}`}
            className="mx-auto block w-full max-w-[640px]"
            role="group"
            aria-label={tr(
              `Radar con ${analisis.length} clientes: ${conteoEstados.activo} activos, ${conteoEstados.riesgo} en riesgo y ${conteoEstados.frio} inactivos.`,
              `Radar with ${analisis.length} clients: ${conteoEstados.activo} active, ${conteoEstados.riesgo} at risk and ${conteoEstados.frio} inactive.`,
            )}
          >
            {/* Anillos */}
            <circle cx={C} cy={C} r={R} className="fill-frio/[0.07] stroke-frio/40" strokeWidth={1.5} />
            <circle cx={C} cy={C} r={R_INACTIVO} className="fill-riesgo/[0.09] stroke-riesgo/50" strokeWidth={1.5} />
            <circle cx={C} cy={C} r={R_RIESGO} className="fill-ok/[0.1] stroke-ok/50" strokeWidth={1.5} />
            {/* Barrido del radar (decorativo) */}
            <g className="radar-barrido" style={{ transformOrigin: `${C}px ${C}px` }} aria-hidden="true">
              <path d={`M ${C} ${C} L ${C} ${C - R} A ${R} ${R} 0 0 1 ${C + R * Math.sin(0.5)} ${C - R * Math.cos(0.5)} Z`} className="fill-azul/10" />
            </g>
            {/* Divisiones por sector */}
            {SECTORES.map((s, i) => {
              const ang = -Math.PI / 2 + (i * 2 * Math.PI) / SECTORES.length;
              const medio = ang + Math.PI / SECTORES.length;
              return (
                <g key={s} aria-hidden="true">
                  <line x1={C} y1={C} x2={C + R * Math.cos(ang)} y2={C + R * Math.sin(ang)} className="stroke-borde" strokeWidth={1} />
                  <text
                    x={C + (R + 22) * Math.cos(medio)}
                    y={C + (R + 22) * Math.sin(medio)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-tenue text-[13px] capitalize"
                  >
                    {nombreSector(s, idioma)}
                  </text>
                </g>
              );
            })}
            {/* Etiquetas de los anillos: abajo, sobre la división entre sectores (donde casi no hay puntos) */}
            <g aria-hidden="true" className="text-[12px] font-semibold" textAnchor="middle" style={{ paintOrder: 'stroke' }} stroke="rgb(var(--c-tarjeta))" strokeWidth={4}>
              <text x={C} y={C + R_RIESGO - 10} className="fill-estado-ok">
                {b(INFO_ESTADO.activo)}
              </text>
              <text x={C} y={C + R_INACTIVO - 10} className="fill-estado-riesgo">
                {b(INFO_ESTADO.riesgo)}
              </text>
              <text x={C} y={C + R - 10} className="fill-estado-frio">
                {b(INFO_ESTADO.frio)}
              </text>
            </g>
            <circle cx={C} cy={C} r={4} className="fill-slate-300" aria-hidden="true" />

            {/* Clientes */}
            {puntos.map(({ a, x, y, tam }) => {
              const esDestacado = a.cliente.id === destacado;
              return (
                <g
                  key={a.cliente.id}
                  role="link"
                  tabIndex={0}
                  aria-label={tr(
                    `${a.cliente.nombre}: ${b(INFO_ESTADO[a.estado])}, ${a.recencia} días sin comprar. Abrir ficha.`,
                    `${a.cliente.nombre}: ${b(INFO_ESTADO[a.estado])}, ${a.recencia} days without buying. Open profile.`,
                  )}
                  className="cursor-pointer outline-none [&:focus-visible>circle.punto]:stroke-white [&:focus-visible>circle.punto]:stroke-[3]"
                  onClick={() => ir(a.cliente.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      ir(a.cliente.id);
                    }
                  }}
                  onMouseEnter={() => setFoco(a.cliente.id)}
                  onMouseLeave={() => setFoco(null)}
                  onFocus={() => setFoco(a.cliente.id)}
                  onBlur={() => setFoco(null)}
                >
                  <title>{`${a.cliente.nombre} · ${b(INFO_ESTADO[a.estado])} · ${a.recencia} ${tr('días', 'days')}`}</title>
                  {esDestacado && (
                    <>
                      <circle cx={x} cy={y} r={tam + 6} fill="none" stroke={INFO_ESTADO[a.estado].color} strokeWidth={2} className="radar-pulso" style={{ transformOrigin: `${x}px ${y}px` }} />
                      <text x={x} y={y - tam - 12} textAnchor="middle" className="fill-white text-[13px] font-semibold" style={{ paintOrder: 'stroke' }} stroke="rgb(var(--c-tarjeta))" strokeWidth={4}>
                        {a.cliente.nombre}
                      </text>
                    </>
                  )}
                  <circle
                    cx={x}
                    cy={y}
                    r={tam}
                    className={`punto ${esDestacado ? 'radar-latido' : ''}`}
                    style={{ fill: INFO_ESTADO[a.estado].color, transformOrigin: `${x}px ${y}px` }}
                    fillOpacity={destacado && !esDestacado ? 0.45 : 0.85}
                    stroke="rgb(var(--c-tarjeta))"
                    strokeWidth={1.5}
                  />
                </g>
              );
            })}
          </svg>
          <p className="mt-2 text-center text-xs text-tenue">
            {tr(
              `Anillos: activo hasta ${fmtDec(u.riesgo)}× su ritmo, en riesgo hasta ${fmtDec(u.inactivo)}×, inactivo más allá o con más de ${u.diasMaximosSinComprar} días sin comprar.`,
              `Rings: active up to ${fmtDec(u.riesgo)}× their pace, at risk up to ${fmtDec(u.inactivo)}×, inactive beyond that or after ${u.diasMaximosSinComprar} days without buying.`,
            )}{' '}
            <Link to="/configuracion" className="text-azul hover:underline">
              {tr('Ajustar umbrales', 'Adjust thresholds')}
            </Link>
          </p>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <div className="grid grid-cols-3 gap-3">
            {(['activo', 'riesgo', 'frio'] as const).map((e) => (
              <div key={e} className="rounded-2xl border border-borde bg-tarjeta p-3 text-center">
                <p className="font-titulo text-2xl font-bold" style={{ color: INFO_ESTADO[e].color }}>
                  {conteoEstados[e]}
                </p>
                <p className="text-xs text-tenue">
                  <span aria-hidden="true">{INFO_ESTADO[e].simbolo} </span>
                  {b(INFO_ESTADO[e])}
                </p>
              </div>
            ))}
          </div>

          {seleccionado ? (
            <Card
              titulo={
                <span className="flex flex-wrap items-center gap-2">
                  {seleccionado.cliente.nombre} <StatusChip estado={seleccionado.estado} />
                </span>
              }
              accion={
                <ButtonLink to={`/clientes/${seleccionado.cliente.id}`} variante="primario">
                  {tr('Ver ficha', 'Open profile')} <IconoFlecha width={16} height={16} />
                </ButtonLink>
              }
            >
              <p className="-mt-2 mb-3 text-sm text-tenue">
                <span className="capitalize">{nombreSector(seleccionado.cliente.sector, idioma)}</span> · {seleccionado.cliente.ciudad && <>{seleccionado.cliente.ciudad} · </>}
                {tr(`compra ${fmtCompacto(valorAnual(seleccionado, HOY))} al año`, `buys ${fmtCompacto(valorAnual(seleccionado, HOY))} per year`)}
              </p>
              <ExplicacionRiesgo a={seleccionado} compacta />
            </Card>
          ) : (
            <Card>
              <p className="text-sm text-slate-300">
                {tr(
                  'Pasa el cursor (o el foco del teclado) por un punto para ver por qué la IA lo ubica ahí. Haz clic para abrir su ficha.',
                  'Hover over a dot (or focus it with the keyboard) to see why the AI places it there. Click to open the profile.',
                )}
              </p>
            </Card>
          )}

          <Card titulo={tr('En el anillo «en riesgo»', 'In the "at risk" ring')}>
            <ul className="space-y-2 text-sm">
              {analisis
                .filter((a) => a.estado === 'riesgo')
                .sort((x, y) => y.puntaje - x.puntaje)
                .map((a) => (
                  <li key={a.cliente.id} className="flex items-center justify-between gap-2">
                    <Link
                      to={`/radar?destacar=${a.cliente.id}`}
                      className={`hover:text-acento hover:underline ${a.cliente.id === destacado ? 'font-semibold text-acento' : 'text-slate-200'}`}
                    >
                      {a.cliente.nombre}
                    </Link>
                    <span className="text-xs tabular-nums text-tenue">
                      {tr(`${a.recencia} días · ${fmtDec(a.ratio)}×`, `${a.recencia} days · ${fmtDec(a.ratio)}×`)}
                    </span>
                  </li>
                ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
