/**
 * Umbrales activos (los de src/config/umbrales.ts, o los que se muevan en Configuración)
 * y los datos calculados con ellos.
 *
 * Uso: const { analisis, alertas, umbrales } = useDatos();
 *
 * Los cambios duran mientras la página esté abierta: al recargar vuelven los valores
 * del archivo de configuración (así la demo siempre arranca igual).
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { UMBRALES, type Umbrales } from '../config/umbrales';
import { calcularDatos, type Datos } from './datos';

interface Ctx extends Datos {
  umbrales: Umbrales;
  cambiarUmbrales: (u: Umbrales) => void;
  restaurar: () => void;
  modificados: boolean;
}
const UmbralesContext = createContext<Ctx | null>(null);

export function UmbralesProvider({ children }: { children: ReactNode }) {
  const [umbrales, cambiarUmbrales] = useState<Umbrales>(UMBRALES);
  const datos = useMemo(() => calcularDatos(umbrales), [umbrales]);
  const modificados =
    umbrales.riesgo !== UMBRALES.riesgo ||
    umbrales.inactivo !== UMBRALES.inactivo ||
    umbrales.diasMaximosSinComprar !== UMBRALES.diasMaximosSinComprar;
  return (
    <UmbralesContext.Provider value={{ ...datos, umbrales, cambiarUmbrales, restaurar: () => cambiarUmbrales(UMBRALES), modificados }}>
      {children}
    </UmbralesContext.Provider>
  );
}

export function useDatos(): Ctx {
  const ctx = useContext(UmbralesContext);
  if (!ctx) throw new Error('useDatos debe usarse dentro de UmbralesProvider');
  return ctx;
}
