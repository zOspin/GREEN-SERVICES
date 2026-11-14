import { Link } from 'react-router-dom';
import type { Alerta } from '../lib/analytics';
import { Button, StatusChip } from './ui';
import { IconoCheck } from './Iconos';
import { useContactados } from '../lib/contactados';
import { fmtUsd } from '../lib/format';

const TIPO = {
  riesgo: 'Riesgo de abandono',
  frio: 'Reactivar cliente frío',
  recompra: 'Recompra próxima',
};

/** Una alerta: a quién contactar, por qué y qué ofrecerle. */
export default function AlertaItem({ alerta, compacta = false }: { alerta: Alerta; compacta?: boolean }) {
  const { contactados, alternar } = useContactados();
  const hecho = contactados.has(alerta.id);
  const a = alerta.analisis;
  return (
    <li className={`flex flex-col gap-3 rounded-xl border border-borde/60 bg-superficie p-4 sm:flex-row sm:items-start ${hecho ? 'opacity-60' : ''}`}>
      <div
        className="flex shrink-0 items-baseline gap-2 self-start rounded-lg bg-fondo/60 px-3 py-1.5 sm:w-20 sm:flex-col sm:items-center sm:gap-0 sm:py-2"
        title="Prioridad: riesgo del cliente × valor del cliente"
      >
        <span className="font-titulo text-xl font-bold tabular-nums text-acento">{alerta.prioridad}</span>
        <span className="text-[0.65rem] uppercase tracking-wide text-tenue">prioridad</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/clientes/${a.cliente.id}`} className="font-semibold text-white hover:text-acento hover:underline">
            {a.cliente.nombre}
          </Link>
          <StatusChip estado={a.estado} />
          <span className="text-xs text-tenue">{TIPO[alerta.tipo]}</span>
          {hecho && (
            <span className="inline-flex items-center gap-1 text-xs text-green-300">
              <IconoCheck width={14} height={14} /> Contactado
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-200">
          <span className="text-tenue">Motivo: </span>
          {alerta.motivo}
        </p>
        {a.productoRecomendado && (
          <p className="mt-1 text-sm text-slate-200">
            <span className="text-tenue">Ofrecer: </span>
            <span className="font-medium text-acento">
              {a.productoRecomendado.tipo === 'renovacion' ? 'Renovación de ' : ''}
              {a.productoRecomendado.producto.nombre}
            </span>
          </p>
        )}
        {!compacta && <p className="mt-2 text-sm text-tenue">{a.recomendacion}</p>}
        <p className="mt-1 text-xs text-tenue">
          <span className="capitalize">{a.cliente.sector}</span> · {a.cliente.ciudad} · Total histórico {fmtUsd(a.montoUsd)}
          {a.cliente.es_base_instalada ? ' · Base instalada' : ''}
        </p>
      </div>
      {!compacta && (
        <Button variante={hecho ? 'secundario' : 'primario'} onClick={() => alternar(alerta.id)} aria-pressed={hecho} className="shrink-0">
          {hecho ? 'Deshacer' : 'Marcar como contactado'}
        </Button>
      )}
    </li>
  );
}
