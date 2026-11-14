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
    eje: '#B9C3DA',
    rejilla: '#2A3760',
    tooltipFondo: '#0B1020',
    tooltipBorde: '#2A3760',
    tooltipTexto: '#F4F1EA',
    tarjeta: '#141C36',
    azul: '#5B9BFF',
    acento: '#F5A524',
    acentoTexto: '#F8C766',
    turquesa: '#2DD4BF',
  },
  light: {
    eje: '#4A5568',
    rejilla: '#E2DCCD',
    tooltipFondo: '#FFFDF8',
    tooltipBorde: '#E2DCCD',
    tooltipTexto: '#131A2E',
    tarjeta: '#FFFDF8',
    azul: '#1F5FCC',
    acento: '#C77700',
    acentoTexto: '#A15C00',
    turquesa: '#0F7A6C',
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
