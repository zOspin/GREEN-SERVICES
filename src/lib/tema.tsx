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
    eje: '#BAB6DE',
    rejilla: '#37306C',
    tooltipFondo: '#181438',
    tooltipBorde: '#37306C',
    tooltipTexto: '#F3F1FF',
    tarjeta: '#181438',
    azul: '#22D3EE',
    acento: '#A78BFA',
    acentoTexto: '#D8B4FE',
    turquesa: '#22D3EE',
    violeta: '#C084FC',
  },
  light: {
    eje: '#626085',
    rejilla: '#E4DFF7',
    tooltipFondo: '#FFFFFF',
    tooltipBorde: '#E4DFF7',
    tooltipTexto: '#1E1B4B',
    tarjeta: '#FFFFFF',
    azul: '#08AAC4',
    acento: '#6D4AFF',
    acentoTexto: '#6D28D9',
    turquesa: '#08AAC4',
    violeta: '#7C3AED',
  },
} as const;

interface Ctx {
  tema: Tema;
  alternar: () => void;
  colores: (typeof COLORES)[Tema];
}
const TemaContext = createContext<Ctx | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => leerPreferencia('orbita-tema', ['dark', 'light'] as const, 'light'));
  useEffect(() => {
    const raiz = document.documentElement;
    // Claro por defecto (estilo del reto); oscuro con data-theme="dark".
    if (tema === 'dark') raiz.dataset.theme = 'dark';
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
