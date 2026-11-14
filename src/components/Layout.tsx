import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { IconoAlerta, IconoCerrar, IconoClientes, IconoDatos, IconoInicio, IconoMenu, IconoPrediccion, IconoReporte, IconoReto, IconoVentas } from './Iconos';
import { alertas, meta } from '../lib/datos';
import { useContactados } from '../lib/contactados';
import { fmtFecha } from '../lib/format';

const ENLACES = [
  { a: '/', texto: 'Inicio', Icono: IconoInicio },
  { a: '/alertas', texto: 'Alertas', Icono: IconoAlerta },
  { a: '/clientes', texto: 'Clientes', Icono: IconoClientes },
  { a: '/ventas', texto: 'Ventas y TRM', Icono: IconoVentas },
  { a: '/predicciones', texto: 'Predicciones', Icono: IconoPrediccion },
  { a: '/datos', texto: 'Cargar datos', Icono: IconoDatos },
  { a: '/reporte', texto: 'Reporte del mes', Icono: IconoReporte },
  { a: '/reto', texto: 'El reto', Icono: IconoReto },
];

function Marca() {
  return (
    <div className="flex items-center gap-3">
      <Logo size={42} />
      <div className="leading-tight">
        <p className="font-titulo text-lg font-bold tracking-tight">
          Órbita <span className="text-acento">Pulse</span>
        </p>
        <p className="text-[0.7rem] text-tenue">Inteligencia que gira a tu alrededor</p>
      </div>
    </div>
  );
}

function Navegacion({ alNavegar }: { alNavegar?: () => void }) {
  const { contactados } = useContactados();
  const pendientes = alertas.filter((a) => !contactados.has(a.id)).length;
  return (
    <nav aria-label="Navegación principal">
      <ul className="flex flex-col gap-1">
        {ENLACES.map(({ a, texto, Icono }) => (
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
              <span className="flex-1">{texto}</span>
              {a === '/alertas' && pendientes > 0 && (
                <span className="rounded-full bg-frio/20 px-2 py-0.5 text-xs text-red-200" aria-label={`${pendientes} alertas pendientes`}>
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
  return (
    <div className="rounded-xl border border-borde bg-fondo/60 p-3 text-xs text-tenue">
      <p className="font-medium text-slate-300">Demo con datos sintéticos</p>
      <p className="mt-1">Corte: {fmtFecha(meta.fecha_corte)}</p>
      <p className="mt-1">Equipo Órbita · Estud-IA Medellín</p>
    </div>
  );
}

export default function Layout() {
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setAbierto(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen lg:flex">
      {/* Menú lateral (computador) */}
      <aside className="print:!hidden hidden w-64 shrink-0 border-r border-borde bg-tarjeta/60 lg:flex lg:flex-col lg:gap-6 lg:px-4 lg:py-6 lg:sticky lg:top-0 lg:h-screen">
        <Marca />
        <div className="flex-1 overflow-y-auto">
          <Navegacion />
        </div>
        <PieDemo />
      </aside>

      {/* Menú superior (celular y tableta) */}
      <header className="print:hidden sticky top-0 z-30 border-b border-borde bg-fondo/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Marca />
          <button
            type="button"
            className="rounded-lg p-2 text-slate-200 hover:bg-white/5"
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
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
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8 print:p-0">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
