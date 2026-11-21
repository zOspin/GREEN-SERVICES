import type { SVGProps } from 'react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import ModoPresentacion from './ModoPresentacion';
import { usePresentacion } from '../lib/presentacion';
import Logo from './Logo';
import Preferencias from './Preferencias';
import SelectorModo from './SelectorModo';
import AvisoSinDatos from './AvisoSinDatos';
import { cambiarModo } from '../lib/modo';
import { IconoAjustes, IconoAlerta, IconoCerrar, IconoClientes, IconoDatos, IconoInicio, IconoMenu, IconoModelo, IconoPlay, IconoPrediccion, IconoRadar, IconoReporte, IconoReto, IconoVentas } from './Iconos';
import { esDemoOriginal, hayDatos, meta, MODO, SEMILLA } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { fmtFecha } from '../lib/format';

/** Menú agrupado por área, como el tablero de referencia del reto. */
const GRUPOS: { es?: string; en?: string; enlaces: { a: string; es: string; en: string; Icono: (p: SVGProps<SVGSVGElement>) => JSX.Element }[] }[] = [
  { enlaces: [{ a: '/', es: 'Resumen general', en: 'Overview', Icono: IconoInicio }] },
  {
    es: 'Operaciones',
    en: 'Operations',
    enlaces: [
      { a: '/datos', es: 'Centro de datos', en: 'Data hub', Icono: IconoDatos },
      { a: '/reporte', es: 'Reporte del mes', en: 'Monthly report', Icono: IconoReporte },
    ],
  },
  {
    es: 'Comercial y Ventas',
    en: 'Sales',
    enlaces: [
      { a: '/radar', es: 'Radar de clientes', en: 'Client radar', Icono: IconoRadar },
      { a: '/alertas', es: 'Alertas', en: 'Alerts', Icono: IconoAlerta },
      { a: '/clientes', es: 'Clientes', en: 'Clients', Icono: IconoClientes },
    ],
  },
  {
    es: 'Gerencia Financiera',
    en: 'Finance',
    enlaces: [
      { a: '/ventas', es: 'Panel financiero', en: 'Finance dashboard', Icono: IconoVentas },
      { a: '/predicciones', es: 'Predicciones', en: 'Predictions', Icono: IconoPrediccion },
    ],
  },
  {
    es: 'Inteligencia artificial',
    en: 'Artificial intelligence',
    enlaces: [
      { a: '/modelo', es: 'Evaluación del modelo', en: 'Model evaluation', Icono: IconoModelo },
      { a: '/reto', es: 'El reto', en: 'The challenge', Icono: IconoReto },
      { a: '/configuracion', es: 'Configuración', en: 'Settings', Icono: IconoAjustes },
    ],
  },
];

/** Botón para iniciar la demo guiada (continúa después de la diapositiva 16). */
function BotonDemo({ alPulsar }: { alPulsar?: () => void }) {
  const { iniciar, activo } = usePresentacion();
  const { tr } = useIdioma();
  return (
    <button
      type="button"
      onClick={() => {
        // La historia del Cliente 23 vive en los datos de demo: en modo Real, primero se cambia a Demo.
        if (MODO === 'real') return cambiarModo('demo', { presentar: true });
        iniciar();
        alPulsar?.();
      }}
      title={MODO === 'real' ? tr('Cambia a modo Demo e inicia la presentación', 'Switches to Demo mode and starts the presentation') : undefined}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-acento/50 bg-acento/10 px-3 py-2 text-sm font-semibold text-acento hover:bg-acento/20"
    >
      <IconoPlay width={16} height={16} /> {activo ? tr('Reiniciar demo en vivo', 'Restart live demo') : tr('Iniciar demo en vivo', 'Start live demo')}
    </button>
  );
}

function Marca({ grande = false }: { grande?: boolean }) {
  const { tr } = useIdioma();
  if (!grande)
    return (
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <div className="hidden leading-tight min-[380px]:block">
          <p className="whitespace-nowrap font-titulo text-lg font-bold tracking-tight text-white">
            <span className="text-acento">Órbita</span>
          </p>
          <p className="hidden text-[0.7rem] text-tenue min-[400px]:block">{tr('para Green Services', 'for Green Services')}</p>
        </div>
      </div>
    );
  // Menú lateral: logo grande en un círculo, como la marca del tablero de referencia.
  return (
    <div className="flex flex-col items-center text-center">
      <div className="grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-gradient-to-br from-acento/25 via-tarjeta to-turquesa/25 shadow-tarjeta ring-1 ring-acento/30">
        <Logo size={54} />
      </div>
      <p className="mt-2 font-titulo text-lg font-bold tracking-tight text-white">
        <span className="text-acento">Órbita</span>
      </p>
      <p className="text-xs text-tenue">{tr('Inteligencia que gira a tu alrededor', 'Intelligence that revolves around you')}</p>
    </div>
  );
}

function Navegacion({ alNavegar }: { alNavegar?: () => void }) {
  const { contactados } = useContactados();
  const { tr } = useIdioma();
  const { alertas } = useDatos();
  const pendientes = alertas.filter((a) => !contactados.has(a.id)).length;
  return (
    <nav aria-label={tr('Navegación principal', 'Main navigation')} className="space-y-2">
      {GRUPOS.map((g, i) => (
        <div key={i}>
          {g.es && <p className="mb-1 px-3 text-[0.65rem] font-semibold uppercase tracking-wider text-tenue">{tr(g.es, g.en!)}</p>}
          <ul className="flex flex-col gap-0.5">
            {g.enlaces.map(({ a, es, en, Icono }) => (
              <li key={a}>
                <NavLink
                  to={a}
                  end={a === '/'}
                  onClick={alNavegar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? 'bg-acento text-sobre-acento shadow-tarjeta' : 'text-slate-200 hover:bg-acento/10 hover:text-acento'
                    }`
                  }
                >
                  <Icono />
                  <span className="flex-1">{tr(es, en)}</span>
                  {a === '/alertas' && pendientes > 0 && (
                    <span className="rounded-full bg-acento/15 px-2 py-0.5 text-xs font-semibold text-acento" aria-label={tr(`${pendientes} alertas pendientes`, `${pendientes} pending alerts`)}>
                      {pendientes}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Texto corto del modo actual (banda superior y pie de página). */
function useTextoModo() {
  const { tr } = useIdioma();
  if (MODO === 'demo')
    return esDemoOriginal ? tr('Demo con datos de prueba', 'Demo with test data') : tr(`Demo con datos al azar (n.º ${SEMILLA})`, `Demo with random data (#${SEMILLA})`);
  return hayDatos ? tr('Modo real · datos de Green Services', 'Real mode · Green Services data') : tr('Modo real · sin datos todavía', 'Real mode · no data yet');
}

function PieDemo() {
  const { tr } = useIdioma();
  return (
    <div className="rounded-xl border border-borde bg-fondo/60 p-3 text-xs text-tenue [@media(max-height:960px)]:hidden">
      <p className="font-medium text-slate-300">
        {MODO === 'demo' ? tr('Demo con datos sintéticos', 'Demo with synthetic data') : tr('Modo real', 'Real mode')}
      </p>
      <p className="mt-1">{hayDatos ? <>{tr('Corte', 'Data as of')}: {fmtFecha(meta.fecha_corte)}</> : tr('Sin datos cargados', 'No data loaded')}</p>
      <p className="mt-1">{tr('Equipo Órbita · Estud-IA Medellín', 'Team Órbita · Estud-IA Medellín')}</p>
    </div>
  );
}

export default function Layout() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const { tr } = useIdioma();
  const { activo: presentando } = usePresentacion();
  const textoModo = useTextoModo();
  useEffect(() => {
    setAbierto(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
    {/* Enlace para teclado: salta el menú y va directo al contenido (visible solo al usar Tab) */}
    <a href="#contenido" className="sr-only z-50 rounded-xl bg-acento px-4 py-2 text-sm font-semibold text-sobre-acento focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
      {tr('Saltar al contenido', 'Skip to content')}
    </a>
    {/* Banda discreta en toda la web */}
    <div className="border-b border-turquesa/25 bg-turquesa/10 px-4 py-1 text-center text-xs text-slate-200 print:hidden" role="note">
      <span aria-hidden="true" className={MODO === 'real' ? 'text-turquesa' : 'text-acento'}>● </span>
      {textoModo} ·{' '}
      <Link to="/privacidad" className="underline-offset-2 hover:text-white hover:underline">
        {tr('Privacidad', 'Privacy')}
      </Link>
    </div>
    <div className="min-h-screen lg:flex">
      {/* Menú lateral (computador) */}
      <aside className="hidden w-64 shrink-0 border-r border-borde bg-tarjeta/85 backdrop-blur print:!hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-4 lg:px-4 lg:py-5">
        <Marca grande />
        <div className="flex-1 overflow-y-auto">
          <Navegacion />
        </div>
        <BotonDemo />
        <SelectorModo />
        <PieDemo />
      </aside>

      {/* Menú superior (celular y tableta) */}
      <header className="sticky top-0 z-30 border-b border-borde bg-fondo/95 backdrop-blur print:hidden lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Marca />
          <div className="ml-auto">
            <Preferencias compacto />
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 hover:bg-white/5"
            aria-label={abierto ? tr('Cerrar menú', 'Close menu') : tr('Abrir menú', 'Open menu')}
            aria-expanded={abierto}
            aria-controls="menu-movil"
            onClick={() => setAbierto((v) => !v)}
          >
            {abierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
        </div>
        {abierto && (
          <div id="menu-movil" className="border-t border-borde px-4 pb-4 pt-2">
            <Navegacion alNavegar={() => setAbierto(false)} />
            <div className="mt-3 space-y-3 border-t border-borde pt-3">
              <BotonDemo alPulsar={() => setAbierto(false)} />
              <SelectorModo />
            </div>
          </div>
        )}
      </header>

      <main id="contenido" tabIndex={-1} className={`min-w-0 flex-1 focus:outline-none px-4 py-6 print:p-0 sm:px-6 lg:px-10 lg:py-8 ${presentando ? 'pb-48 lg:pb-36' : ''}`}>
        <div className="mx-auto max-w-7xl">
          {/* Idioma y tema: siempre visibles arriba a la derecha (en celular van en el encabezado) */}
          <div className="mb-4 hidden justify-end print:hidden lg:flex">
            <Preferencias />
          </div>
          <AvisoSinDatos />
          <Outlet />
        </div>
        <footer className="mx-auto mt-12 flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-borde pt-4 text-xs text-tenue print:hidden">
          <p>
            Órbita · {tr('Hackatón Estud-IA, Alcaldía de Medellín', 'Estud-IA Hackathon, Medellín City Hall')}
          </p>
          <nav aria-label={tr('Pie de página', 'Footer')} className="flex gap-4">
            <Link to="/privacidad" className="hover:text-white hover:underline">
              {tr('Privacidad', 'Privacy')}
            </Link>
            <Link to="/configuracion" className="hover:text-white hover:underline">
              {tr('Configuración', 'Settings')}
            </Link>
            <span>{textoModo}</span>
          </nav>
        </footer>
      </main>
    </div>
    <ModoPresentacion />
    </>
  );
}
