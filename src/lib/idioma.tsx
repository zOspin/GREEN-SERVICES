/**
 * Idioma de la interfaz: español (por defecto) o inglés.
 *
 * Uso en un componente:
 *   const { tr } = useIdioma();
 *   <p>{tr('Clientes activos', 'Active clients')}</p>
 *
 * Los textos que genera la IA vienen en los dos idiomas ({ es, en }) y se eligen con `b(texto)`.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarPreferencia, leerPreferencia } from './preferencias';
import { fijarIdioma } from './format';

export type Idioma = 'es' | 'en';
/** Texto bilingüe. */
export interface Bi {
  es: string;
  en: string;
}

interface Ctx {
  idioma: Idioma;
  cambiar: (i: Idioma) => void;
  tr: (es: string, en: string) => string;
  b: (texto: Bi) => string;
}
const IdiomaContext = createContext<Ctx | null>(null);

export function IdiomaProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>(() => leerPreferencia('orbita-idioma', ['es', 'en'] as const, 'es'));
  // Los formatos de números y fechas siguen al idioma (se fija antes de pintar los hijos).
  fijarIdioma(idioma);
  useEffect(() => {
    document.documentElement.lang = idioma;
    guardarPreferencia('orbita-idioma', idioma);
  }, [idioma]);
  const tr = (es: string, en: string) => (idioma === 'es' ? es : en);
  const b = (t: Bi) => t[idioma];
  return <IdiomaContext.Provider value={{ idioma, cambiar: setIdioma, tr, b }}>{children}</IdiomaContext.Provider>;
}

export function useIdioma(): Ctx {
  const ctx = useContext(IdiomaContext);
  if (!ctx) throw new Error('useIdioma debe usarse dentro de IdiomaProvider');
  return ctx;
}
