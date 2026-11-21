import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import Clientes from './pages/Clientes';
import FichaCliente from './pages/FichaCliente';
import Alertas from './pages/Alertas';
import Predicciones from './pages/Predicciones';
import Ventas from './pages/Ventas';
import Reporte from './pages/Reporte';
import Reto from './pages/Reto';
import Radar from './pages/Radar';
import Configuracion from './pages/Configuracion';
import Privacidad from './pages/Privacidad';
import Cierre from './pages/Cierre';
import Modelo from './pages/Modelo';
import { ButtonLink, EmptyState } from './components/ui';
import { useIdioma } from './lib/idioma';
// Carga diferida: la lectura de Excel (SheetJS) solo se descarga al entrar a /datos.
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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:id" element={<FichaCliente />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="predicciones" element={<Predicciones />} />
        <Route path="reporte" element={<Reporte />} />
        <Route path="reto" element={<Reto />} />
        <Route path="radar" element={<Radar />} />
        <Route path="configuracion" element={<Configuracion />} />
        <Route path="privacidad" element={<Privacidad />} />
        <Route path="cierre" element={<Cierre />} />
        <Route path="modelo" element={<Modelo />} />
        <Route path="datos" element={<Suspense fallback={<Cargando />}><CargarDatos /></Suspense>} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
