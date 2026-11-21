import { lazy, Suspense, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import { ButtonLink, EmptyState } from './components/ui';
import { useIdioma } from './lib/idioma';
// Carga diferida: cada pantalla (salvo el Resumen general) se descarga solo cuando se abre.
// Así la primera carga es más liviana, sobre todo en celulares.
const Clientes = lazy(() => import('./pages/Clientes'));
const FichaCliente = lazy(() => import('./pages/FichaCliente'));
const Alertas = lazy(() => import('./pages/Alertas'));
const Predicciones = lazy(() => import('./pages/Predicciones'));
const Ventas = lazy(() => import('./pages/Ventas'));
const Reporte = lazy(() => import('./pages/Reporte'));
const Reto = lazy(() => import('./pages/Reto'));
const Radar = lazy(() => import('./pages/Radar'));
const Configuracion = lazy(() => import('./pages/Configuracion'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Cierre = lazy(() => import('./pages/Cierre'));
const Modelo = lazy(() => import('./pages/Modelo'));
const CargarDatos = lazy(() => import('./pages/CargarDatos'));

function NoEncontrada() {
  const { tr } = useIdioma();
  return (
    <EmptyState
      titulo={tr('Página no encontrada', 'Page not found')}
      descripcion={tr('La dirección no existe en Órbita.', "This address doesn't exist in Órbita.")}
      accion={<ButtonLink to="/" variante="primario">{tr('Ir al inicio', 'Go home')}</ButtonLink>}
    />
  );
}

function Cargando() {
  const { tr } = useIdioma();
  return <p className="text-tenue">{tr('Cargando…', 'Loading…')}</p>;
}

/** Muestra «Cargando…» mientras se descarga una pantalla. */
const Diferida = ({ children }: { children: ReactNode }) => <Suspense fallback={<Cargando />}>{children}</Suspense>;

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="clientes" element={<Diferida><Clientes /></Diferida>} />
        <Route path="clientes/:id" element={<Diferida><FichaCliente /></Diferida>} />
        <Route path="alertas" element={<Diferida><Alertas /></Diferida>} />
        <Route path="ventas" element={<Diferida><Ventas /></Diferida>} />
        <Route path="predicciones" element={<Diferida><Predicciones /></Diferida>} />
        <Route path="reporte" element={<Diferida><Reporte /></Diferida>} />
        <Route path="reto" element={<Diferida><Reto /></Diferida>} />
        <Route path="radar" element={<Diferida><Radar /></Diferida>} />
        <Route path="configuracion" element={<Diferida><Configuracion /></Diferida>} />
        <Route path="privacidad" element={<Diferida><Privacidad /></Diferida>} />
        <Route path="cierre" element={<Diferida><Cierre /></Diferida>} />
        <Route path="modelo" element={<Diferida><Modelo /></Diferida>} />
        <Route path="datos" element={<Diferida><CargarDatos /></Diferida>} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
