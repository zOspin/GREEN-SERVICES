import { Link } from 'react-router-dom';
import type { Alerta } from '../lib/analytics';
import { Button, StatusChip } from './ui';
import { IconoCheck } from './Iconos';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { producto, sector } from '../lib/catalogo';
import { fmtUsd } from '../lib/format';

const TIPO = {
  riesgo: { es: 'Riesgo de abandono', en: 'Churn risk' },
  frio: { es: 'Reactivar cliente frío', en: 'Win back cold client' },
  recompra: { es: 'Recompra próxima', en: 'Repurchase coming up' },
};

/** Una alerta: a quién contactar, por qué y qué ofrecerle. */
export default function AlertaItem({ alerta, compacta = false }: { alerta: Alerta; compacta?: boolean }) {
  const { contactados, alternar } = useContactados();
  const { idioma, tr, b } = useIdioma();
  const hecho = contactados.has(alerta.id);
  const a = alerta.analisis;
  const rec = a.productoRecomendado;
  return (
    <li className={`flex flex-col gap-3 rounded-xl border border-borde/60 bg-superficie p-4 sm:flex-row sm:items-start ${hecho ? 'opacity-60' : ''}`}>
      <div
        className="flex shrink-0 items-baseline gap-2 self-start rounded-lg bg-fondo/60 px-3 py-1.5 sm:w-20 sm:flex-col sm:items-center sm:gap-0 sm:py-2"
        title={tr('Prioridad: riesgo del cliente × valor del cliente', 'Priority: client risk × client value')}
      >
        <span className="font-titulo text-xl font-bold tabular-nums text-acento">{alerta.prioridad}</span>
        <span className="text-[0.65rem] uppercase tracking-wide text-tenue">{tr('prioridad', 'priority')}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`/clientes/${a.cliente.id}`} className="font-semibold text-white hover:text-acento hover:underline">
            {a.cliente.nombre}
          </Link>
          <StatusChip estado={a.estado} />
          <span className="text-xs text-tenue">{b(TIPO[alerta.tipo])}</span>
          {hecho && (
            <span className="inline-flex items-center gap-1 text-xs text-green-300">
              <IconoCheck width={14} height={14} /> {tr('Contactado', 'Contacted')}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-200">
          <span className="text-tenue">{tr('Motivo', 'Why')}: </span>
          {b(alerta.motivo)}
        </p>
        {rec && (
          <p className="mt-1 text-sm text-slate-200">
            <span className="text-tenue">{tr('Ofrecer', 'Offer')}: </span>
            <span className="font-medium text-acento">
              {rec.tipo === 'renovacion' ? tr('Renovación de ', 'Renewal of ') : ''}
              {producto(rec.producto.nombre, idioma)}
            </span>
          </p>
        )}
        {!compacta && <p className="mt-2 text-sm text-tenue">{b(a.recomendacion)}</p>}
        <p className="mt-1 text-xs text-tenue">
          <span className="capitalize">{sector(a.cliente.sector, idioma)}</span> · {a.cliente.ciudad} · {tr('Total histórico', 'Lifetime total')} {fmtUsd(a.montoUsd)}
          {a.cliente.es_base_instalada ? ` · ${tr('Base instalada', 'Installed base')}` : ''}
        </p>
      </div>
      {!compacta && (
        <Button variante={hecho ? 'secundario' : 'primario'} onClick={() => alternar(alerta.id)} aria-pressed={hecho} className="shrink-0">
          {hecho ? tr('Deshacer', 'Undo') : tr('Marcar como contactado', 'Mark as contacted')}
        </Button>
      )}
    </li>
  );
}
