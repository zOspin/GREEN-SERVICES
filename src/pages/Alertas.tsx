import { useState } from 'react';
import { Button, EmptyState, PageHeader } from '../components/ui';
import AlertaItem from '../components/AlertaItem';
import { IconoDescargar } from '../components/Iconos';
import { alertas } from '../lib/datos';
import { useContactados } from '../lib/contactados';
import { useIdioma } from '../lib/idioma';
import { INFO_ESTADO } from '../components/ui';
import { producto, sector } from '../lib/catalogo';
import { descargarCsv } from '../lib/descargar';
import { fmtFecha } from '../lib/format';
import type { TipoAlerta } from '../lib/analytics';

const FILTROS: { valor: '' | TipoAlerta; es: string; en: string }[] = [
  { valor: '', es: 'Todas', en: 'All' },
  { valor: 'riesgo', es: 'En riesgo', en: 'At risk' },
  { valor: 'frio', es: 'Fríos recuperables', en: 'Recoverable cold' },
  { valor: 'recompra', es: 'Recompra próxima', en: 'Repurchase coming up' },
];

export default function Alertas() {
  const { contactados } = useContactados();
  const { idioma, tr, b } = useIdioma();
  const [tipo, setTipo] = useState<'' | TipoAlerta>('');
  const [ocultarHechas, setOcultarHechas] = useState(false);

  const lista = alertas.filter((a) => (!tipo || a.tipo === tipo) && (!ocultarHechas || !contactados.has(a.id)));
  const pendientes = alertas.filter((a) => !contactados.has(a.id)).length;

  // Lista de llamadas para el equipo comercial (lo que se ve en pantalla, con los filtros aplicados).
  const descargar = () =>
    descargarCsv(
      tr('lista-de-llamadas.csv', 'call-list.csv'),
      lista.map((x) => {
        const a = x.analisis;
        const rec = a.productoRecomendado;
        const fila = {
          prioridad: x.prioridad,
          cliente: a.cliente.nombre,
          codigo: a.cliente.id,
          sector: sector(a.cliente.sector, idioma),
          ciudad: a.cliente.ciudad,
          estado: b(INFO_ESTADO[a.estado]),
          ultima_compra: fmtFecha(a.ultimaCompra),
          motivo: b(x.motivo),
          ofrecer: rec ? `${rec.tipo === 'renovacion' ? tr('Renovación de ', 'Renewal of ') : ''}${producto(rec.producto.nombre, idioma)}` : '',
          recomendacion: b(a.recomendacion),
          contactado: contactados.has(x.id) ? tr('sí', 'yes') : 'no',
        };
        if (idioma === 'es') return fila;
        // Encabezados en inglés
        const en = ['priority', 'client', 'code', 'sector', 'city', 'status', 'last_purchase', 'reason', 'offer', 'recommendation', 'contacted'];
        return Object.fromEntries(Object.values(fila).map((v, i) => [en[i], v]));
      }),
    );

  return (
    <>
      <PageHeader
        titulo={tr('Alertas', 'Alerts')}
        subtitulo={tr(
          'A quién contactar esta semana, por qué y qué ofrecerle. Ordenadas por prioridad = riesgo del cliente × valor del cliente.',
          'Who to contact this week, why, and what to offer. Sorted by priority = client risk × client value.',
        )}
      >
        <p className="text-sm text-tenue">
          <span className="font-semibold text-white">{pendientes}</span> {tr('pendientes', 'pending')} · {contactados.size} {tr('contactados', 'contacted')}
        </p>
        <Button onClick={descargar} disabled={!lista.length}>
          <IconoDescargar width={16} height={16} /> {tr('Descargar lista', 'Download list')}
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label={tr('Filtrar alertas por tipo', 'Filter alerts by type')}>
        {FILTROS.map((f) => {
          const n = alertas.filter((a) => !f.valor || a.tipo === f.valor).length;
          const activo = tipo === f.valor;
          return (
            <button
              key={f.valor || 'todas'}
              type="button"
              onClick={() => setTipo(f.valor)}
              aria-pressed={activo}
              className={`rounded-full border px-3 py-1.5 text-sm ${activo ? 'border-acento bg-acento/15 text-acento' : 'border-borde text-slate-300 hover:bg-white/5'}`}
            >
              {b(f)} <span className="text-tenue">({n})</span>
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={ocultarHechas} onChange={(e) => setOcultarHechas(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          {tr('Ocultar contactados', 'Hide contacted')}
        </label>
      </div>

      {lista.length ? (
        <ul className="flex flex-col gap-3">
          {lista.map((a) => <AlertaItem key={a.id} alerta={a} />)}
        </ul>
      ) : (
        <EmptyState
          titulo={tr('No hay alertas en esta vista', 'No alerts in this view')}
          descripcion={tr('Prueba con otro filtro o muestra también los clientes ya contactados.', 'Try another filter or show contacted clients too.')}
        />
      )}
      <p className="mt-4 text-xs text-tenue">
        {tr(
          'El estado «contactado» se guarda solo en memoria durante esta sesión (prototipo sin backend).',
          'The "contacted" status is kept in memory for this session only (prototype without a backend).',
        )}
      </p>
    </>
  );
}
