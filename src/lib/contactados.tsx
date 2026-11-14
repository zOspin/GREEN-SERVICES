/** Estado en memoria de los clientes marcados como contactados (se pierde al recargar). */
import { createContext, useContext, useState, type ReactNode } from 'react';

interface Ctx {
  contactados: Set<string>;
  alternar: (id: string) => void;
}
const ContactadosContext = createContext<Ctx | null>(null);

export function ContactadosProvider({ children }: { children: ReactNode }) {
  const [contactados, setContactados] = useState<Set<string>>(new Set());
  const alternar = (id: string) =>
    setContactados((prev) => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });
  return <ContactadosContext.Provider value={{ contactados, alternar }}>{children}</ContactadosContext.Provider>;
}

export function useContactados(): Ctx {
  const ctx = useContext(ContactadosContext);
  if (!ctx) throw new Error('useContactados debe usarse dentro de ContactadosProvider');
  return ctx;
}
