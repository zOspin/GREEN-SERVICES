/**
 * Modo presentación: guía la demo en vivo con la historia del Cliente 23,
 * continuando donde termina la diapositiva 16 («¡Gracias!» → demo en vivo).
 * Cada paso abre una pantalla; la barra inferior (ModoPresentacion.tsx) muestra el paso y las notas.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { CLIENTE_DEMO } from './datos';
import type { Bi } from './idioma';

export interface Paso {
  ruta: string;
  /** Sección a la que se lleva la vista después de abrir la pantalla. */
  ancla?: string;
  titulo: Bi;
  /** Texto corto que ve el público en la barra. */
  leyenda: Bi;
  /** Lo que dice el comunicador (notas, ocultas por defecto). */
  notas: Bi;
}

export const PASOS: Paso[] = [
  {
    ruta: `/datos?demo=1&cliente=${CLIENTE_DEMO}`,
    ancla: 'seguimiento-cliente',
    titulo: { es: 'Centro de datos', en: 'Data hub' },
    leyenda: {
      es: 'Tres plataformas, tres formatos: el Cliente 23 venía regado y repetido. Órbita Pulse lo une en segundos.',
      en: 'Three platforms, three formats: Client 23 was scattered and repeated. Órbita Pulse merges it in seconds.',
    },
    notas: {
      es: 'Estos son tres archivos reales en su forma: el ERP, la sede internacional y el Excel que Operaciones llena a mano. Miren al Cliente 23: en uno se llama «Cliente 23», en otro «CLI-23» y en el Excel «CLIENTE 023», y su última compra estaba dos veces. Órbita Pulse lo reconoce como un solo cliente y quita el duplicado. Esto hoy se hace a mano en Excel cada mes.',
      en: 'These are three files as they really come: the ERP, the international office and the spreadsheet Operations fills by hand. Look at Client 23: it appears as "Cliente 23", "CLI-23" and "CLIENTE 023", and its last purchase was there twice. Órbita Pulse recognizes one client and removes the duplicate. Today this is done by hand in Excel every month.',
    },
  },
  {
    ruta: `/radar?destacar=${CLIENTE_DEMO}`,
    titulo: { es: 'Radar de clientes', en: 'Client radar' },
    leyenda: {
      es: 'Con los datos unidos, la IA ubica a cada cliente. El Cliente 23 aparece en el anillo «en riesgo».',
      en: 'With the data merged, the AI places every client. Client 23 shows up in the "at risk" ring.',
    },
    notas: {
      es: 'Cada punto es un cliente. Cerca del centro compran a su ritmo; hacia afuera se van atrasando. El punto que parpadea es el Cliente 23: está en el anillo «en riesgo». Nadie tuvo que buscarlo: la IA lo marcó sola.',
      en: 'Each dot is a client. Near the center they buy on schedule; further out they are falling behind. The blinking dot is Client 23, in the "at risk" ring. Nobody had to look for it: the AI flagged it.',
    },
  },
  {
    ruta: `/clientes/${CLIENTE_DEMO}`,
    ancla: 'por-que',
    titulo: { es: 'Ficha del Cliente 23', en: 'Client 23 profile' },
    leyenda: {
      es: '¿Por qué está en riesgo? Compra cada 30 días y lleva 50 sin comprar. Su renovación de nube está vencida.',
      en: 'Why is it at risk? It buys every 30 days and has gone 50 without buying. Its cloud renewal is overdue.',
    },
    notas: {
      es: 'La pregunta que siempre hacen: ¿cómo sabe eso la IA? Aquí está: compra cada 30 días, lleva 50 sin comprar, 1,7 veces su ritmo normal. La barra lo muestra. Y la confianza es alta porque tiene muchas compras. Además, la IA recomienda qué ofrecerle: la renovación de su suscripción de nube, con su valor en dólares, y un mensaje listo para enviar. La IA sugiere; la persona decide.',
      en: 'The question we always get: how does the AI know? Here it is: buys every 30 days, 50 days without buying, 1.7× their normal pace. The bar shows it, and confidence is high because there are many purchases. The AI also recommends what to offer: the cloud subscription renewal, with its dollar value, and a message ready to send. The AI suggests; people decide.',
    },
  },
  {
    ruta: `/ventas?cliente=${CLIENTE_DEMO}`,
    titulo: { es: 'Panel financiero', en: 'Finance dashboard' },
    leyenda: {
      es: 'Cuánto representa recuperarlo y cómo lo afecta la TRM.',
      en: 'What winning it back is worth and how the exchange rate affects it.',
    },
    notas: {
      es: 'Para Gerencia Financiera: esto es lo que el Cliente 23 compra en un año y lo que vale la renovación pendiente. Y el efecto de la TRM: con el dólar más caro, la misma renovación le cuesta más pesos que hace un mes; por eso la IA sugiere ofrecer precio fijo en pesos o pago diferido.',
      en: 'For Finance: this is what Client 23 buys in a year and what the pending renewal is worth. And the exchange-rate effect: with a pricier dollar, the same renewal costs more pesos than a month ago; that is why the AI suggests a fixed peso price or deferred payment.',
    },
  },
  {
    ruta: '/cierre',
    titulo: { es: 'Cierre', en: 'Closing' },
    leyenda: {
      es: 'Llamar hoy al Cliente 23 es recuperar su compra del año.',
      en: 'Calling Client 23 today means winning back its yearly purchases.',
    },
    notas: {
      es: 'Y así con cada cliente, todas las semanas, sin esperar el Excel del mes. Llamar hoy al Cliente 23 es recuperar lo que compra en un año. Esto es Órbita Pulse: inteligencia que gira a tu alrededor.',
      en: 'And so with every client, every week, without waiting for the monthly spreadsheet. Calling Client 23 today wins back what it buys in a year. This is Órbita Pulse: intelligence that revolves around you.',
    },
  },
];

interface Ctx {
  activo: boolean;
  paso: number;
  total: number;
  iniciar: () => void;
  ir: (n: number) => void;
  salir: () => void;
}
const PresentacionContext = createContext<Ctx | null>(null);

export function PresentacionProvider({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const [activo, setActivo] = useState(false);
  const [paso, setPaso] = useState(0);

  const ir = useCallback(
    (n: number) => {
      const i = Math.max(0, Math.min(PASOS.length - 1, n));
      setPaso(i);
      setActivo(true);
      navegar(PASOS[i].ruta);
      const ancla = PASOS[i].ancla;
      if (ancla) {
        // La sección puede tardar un momento en aparecer (por ejemplo, mientras se leen los archivos).
        let intentos = 0;
        const buscar = () => {
          const el = document.getElementById(ancla);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else if (intentos++ < 30) setTimeout(buscar, 100);
        };
        setTimeout(buscar, 150);
      }
    },
    [navegar],
  );

  useEffect(() => {
    if (!activo) return;
    const teclas = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, select, textarea')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') ir(paso + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') ir(paso - 1);
      else if (e.key === 'Escape') setActivo(false);
    };
    window.addEventListener('keydown', teclas);
    return () => window.removeEventListener('keydown', teclas);
  }, [activo, paso, ir]);

  return (
    <PresentacionContext.Provider value={{ activo, paso, total: PASOS.length, iniciar: () => ir(0), ir, salir: () => setActivo(false) }}>
      {children}
    </PresentacionContext.Provider>
  );
}

export function usePresentacion(): Ctx {
  const ctx = useContext(PresentacionContext);
  if (!ctx) throw new Error('usePresentacion debe usarse dentro de PresentacionProvider');
  return ctx;
}
