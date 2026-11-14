import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';
import Preferencias from './Preferencias';
import { IconoAlerta, IconoCerrar, IconoClientes, IconoDatos, IconoInicio, IconoMenu, IconoPrediccion, IconoReporte, IconoReto, IconoVentas } from './Iconos';
import { alertas, meta } from '../lib/datos';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { fmtFecha } from '../lib/format';

const ENLACES = [
  { a: '/', es: 'Inicio', en: 'Home', Icono: IconoInicio },
  { a: '/alertas', es: 'Alertas', en: 'Alerts', Icono: IconoAlerta },
  { a: '/clientes', es: 'Clientes', en: 'Clients', Icono: IconoClientes },
  { a: '/ventas', es: 'Ventas y TRM', en: 'Sales & exchange rate', Icono: IconoVentas },
  { a: '/predicciones', es: 'Predicciones', en: 'Predictions', Icono: IconoPrediccion },
  { a: '/datos', es: 'Cargar datos', en: 'Load data', Icono: IconoDatos },
  { a: '/reporte', es: 'Reporte del mes', en: 'Monthly report', Icono: IconoReporte },
  { a: '/reto', es: 'El reto', en: 'The challenge', Icono: IconoReto },
];

function Marca() {
  const { tr } = useIdioma();
  return (
    <div className="flex items-center gap-3">
      <Logo size={42} />
      <div className="leading-tight">
        <p className="font-titulo text-lg font-bold tracking-tight">
          Órbita <span className="text-acento">Pulse</span>
        </p>
        <p className="text-[0.7rem] text-tenue">{tr('Inteligencia que gira a tu alrededor', 'Intelligence that revolves around you')}</p>
      </div>
    </div>
  );
}

function Navegacion({ alNavegar }: { alNavegar?: () => void }) {
  const { contactados } = useContactados();
  const { tr } = useIdioma();
  const pendientes = alertas.filter((a) => !contactados.has(a.id)).length;
  return (
    <nav aria-label={tr('Navegación principal', 'Main navigation')}>
      <ul className="flex flex-col gap-1">
        {ENLACES.map(({ a, es, en, Icono }) => (
          <li key={a}>
            <NavLink
              to={a}
              end={a === '/'}
              onClick={alNavegar}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-acento/15 text-acento' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icono />
              <span className="flex-1">{tr(es, en)}</span>
              {a === '/alertas' && pendientes > 0 && (
                <span className="rounded-full bg-frio/20 px-2 py-0.5 text-xs text-red-200" aria-label={tr(`${pendientes} alertas pendientes`, `${pendientes} pending alerts`)}>
                  {pendientes}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function PieDemo() {
  const { tr } = useIdioma();
  return (
    <div className="rounded-xl border border-borde bg-fondo/60 p-3 text-xs text-tenue">
      <p className="font-medium text-slate-300">{tr('Demo con datos sintéticos', 'Demo with synthetic data')}</p>
      <p className="mt-1">{tr('Corte', 'Data as of')}: {fmtFecha(meta.fecha_corte)}</p>
      <p className="mt-1">{tr('Equipo Órbita · Estud-IA Medellín', 'Team Órbita · Estud-IA Medellín')}</p>
    </div>
  );
}

export default function Layout() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const { tr } = useIdioma();
  useEffect(() => {
    setAbierto(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      {/* Menú lateral (computador) */}
      <aside className="hidden w-64 shrink-0 border-r border-borde bg-tarjeta/60 print:!hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:gap-6 lg:px-4 lg:py-6">
        <Marca />
        <div className="flex-1 overflow-y-auto">
          <Navegacion />
        </div>
        <Preferencias />
        <PieDemo />
      </aside>

      {/* Menú superior (celular y tableta) */}
      <header className="sticky top-0 z-30 border-b border-borde bg-fondo/95 backdrop-blur print:hidden lg:hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <Marca />
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
            <div className="mt-3 border-t border-borde pt-3">
              <Preferencias />
            </div>
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 print:p-0 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
