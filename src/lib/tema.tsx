/**
 * Tema claro / oscuro.
 * Los colores de la interfaz son variables CSS (src/index.css); aquí solo se cambia el atributo
 * data-theme del <html>. Las gráficas reciben sus colores con useTema().colores.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { guardarPreferencia, leerPreferencia } from './preferencias';

export type Tema = 'dark' | 'light';

const COLORES = {
  dark: {
    eje: '#94A3C4',
    rejilla: '#22305A',
    tooltipFondo: '#0B1020',
    tooltipBorde: '#22305A',
    tooltipTexto: '#E2E8F0',
    tarjeta: '#121A33',
    azul: '#3B82F6',
    acento: '#F59E0B',
    acentoTexto: '#FCD34D',
  },
  light: {
    eje: '#54607D',
    rejilla: '#D6DDEB',
    tooltipFondo: '#FFFFFF',
    tooltipBorde: '#D6DDEB',
    tooltipTexto: '#111827',
    tarjeta: '#FFFFFF',
    azul: '#2563EB',
    acento: '#D97706',
    acentoTexto: '#B45309',
  },
} as const;

interface Ctx {
  tema: Tema;
  alternar: () => void;
  colores: (typeof COLORES)[Tema];
}
const TemaContext = createContext<Ctx | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => leerPreferencia('orbita-tema', ['dark', 'light'] as const, 'dark'));
  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === 'light') raiz.dataset.theme = 'light';
    else delete raiz.dataset.theme;
    guardarPreferencia('orbita-tema', tema);
  }, [tema]);
  const alternar = () => setTema((t) => (t === 'dark' ? 'light' : 'dark'));
  return <TemaContext.Provider value={{ tema, alternar, colores: COLORES[tema] }}>{children}</TemaContext.Provider>;
}

export function useTema(): Ctx {
  const ctx = useContext(TemaContext);
  if (!ctx) throw new Error('useTema debe usarse dentro de TemaProvider');
  return ctx;
}
