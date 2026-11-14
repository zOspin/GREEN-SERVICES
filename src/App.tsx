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
import { ButtonLink, EmptyState } from './components/ui';
// Carga diferida: la lectura de Excel (SheetJS) solo se descarga al entrar a /datos.
const CargarDatos = lazy(() => import('./pages/CargarDatos'));

function NoEncontrada() {
  return (
    <EmptyState titulo="Página no encontrada" descripcion="La dirección no existe en Órbita Pulse." accion={<ButtonLink to="/" variante="primario">Ir al inicio</ButtonLink>} />
  );
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
        <Route path="datos" element={<Suspense fallback={<p className="text-tenue">Cargando…</p>}><CargarDatos /></Suspense>} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}
