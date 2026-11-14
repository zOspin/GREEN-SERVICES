import { useState } from 'react';
import { Button, EmptyState, PageHeader } from '../components/ui';
import { IconoDescargar } from '../components/Iconos';
import { descargarCsv } from '../lib/descargar';
import { fmtFecha } from '../lib/format';
import AlertaItem from '../components/AlertaItem';
import { alertas } from '../lib/datos';
import { useContactados } from '../lib/contactados';
import type { TipoAlerta } from '../lib/analytics';

const FILTROS: { valor: '' | TipoAlerta; texto: string }[] = [
  { valor: '', texto: 'Todas' },
  { valor: 'riesgo', texto: 'En riesgo' },
  { valor: 'frio', texto: 'Fríos recuperables' },
  { valor: 'recompra', texto: 'Recompra próxima' },
];

export default function Alertas() {
  const { contactados } = useContactados();
  const [tipo, setTipo] = useState<'' | TipoAlerta>('');
  const [ocultarHechas, setOcultarHechas] = useState(false);

  const lista = alertas.filter((a) => (!tipo || a.tipo === tipo) && (!ocultarHechas || !contactados.has(a.id)));
  const pendientes = alertas.filter((a) => !contactados.has(a.id)).length;

  // Lista de llamadas para el equipo comercial (lo que se ve en pantalla, con los filtros aplicados).
  const descargar = () =>
    descargarCsv(
      'lista-de-llamadas.csv',
      lista.map((x) => ({
        prioridad: x.prioridad,
        cliente: x.analisis.cliente.nombre,
        codigo: x.analisis.cliente.id,
        sector: x.analisis.cliente.sector,
        ciudad: x.analisis.cliente.ciudad,
        estado: x.analisis.estado,
        ultima_compra: fmtFecha(x.analisis.ultimaCompra),
        motivo: x.motivo,
        ofrecer: x.analisis.productoRecomendado
          ? `${x.analisis.productoRecomendado.tipo === 'renovacion' ? 'Renovación de ' : ''}${x.analisis.productoRecomendado.producto.nombre}`
          : '',
        recomendacion: x.analisis.recomendacion,
        contactado: contactados.has(x.id) ? 'sí' : 'no',
      })),
    );

  return (
    <>
      <PageHeader
        titulo="Alertas"
        subtitulo="A quién contactar esta semana, por qué y qué ofrecerle. Ordenadas por prioridad = riesgo del cliente × valor del cliente."
      >
        <p className="text-sm text-tenue">
          <span className="font-semibold text-white">{pendientes}</span> pendientes · {contactados.size} contactados
        </p>
        <Button onClick={descargar} disabled={!lista.length}>
          <IconoDescargar width={16} height={16} /> Descargar lista
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar alertas por tipo">
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
              {f.texto} <span className="text-tenue">({n})</span>
            </button>
          );
        })}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={ocultarHechas} onChange={(e) => setOcultarHechas(e.target.checked)} className="h-4 w-4 accent-amber-500" />
          Ocultar contactados
        </label>
      </div>

      {lista.length ? (
        <ul className="flex flex-col gap-3">
          {lista.map((a) => <AlertaItem key={a.id} alerta={a} />)}
        </ul>
      ) : (
        <EmptyState titulo="No hay alertas en esta vista" descripcion="Prueba con otro filtro o muestra también los clientes ya contactados." />
      )}
      <p className="mt-4 text-xs text-tenue">El estado «contactado» se guarda solo en memoria durante esta sesión (prototipo sin backend).</p>
    </>
  );
}
