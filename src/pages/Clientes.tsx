import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, PageHeader, RiskBar, StatusChip, Table, Td, Th, Thead, Tr } from '../components/ui';
import { IconoBuscar } from '../components/Iconos';
import { clientes } from '../lib/datos';
import { useDatos } from '../lib/umbrales';
import type { AnalisisCliente, Estado } from '../lib/analytics';
import { fmtCompacto, fmtFecha } from '../lib/format';
import { useIdioma } from '../lib/idioma';
import { sector as nombreSector } from '../lib/catalogo';

const SECTORES = [...new Set(clientes.map((c) => c.sector))].sort();
const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Columnas por las que se puede ordenar la tabla. */
type Orden = 'nombre' | 'sector' | 'ultima' | 'ciclo' | 'recencia' | 'monto' | 'puntaje';
const ORDEN_ESTADO: Record<Estado, number> = { activo: 0, riesgo: 1, frio: 2 };
const VALOR: Record<Orden, (a: AnalisisCliente) => number | string> = {
  nombre: (a) => a.cliente.nombre,
  sector: (a) => a.cliente.sector,
  ultima: (a) => a.ultimaCompra?.getTime() ?? 0,
  ciclo: (a) => a.ciclo,
  recencia: (a) => a.recencia,
  monto: (a) => a.montoUsd,
  puntaje: (a) => a.puntaje * 10 + ORDEN_ESTADO[a.estado],
};

/** Encabezado que ordena la tabla al hacer clic (y anuncia el orden a lectores de pantalla). */
function ThOrden({ campo, orden, desc, alCambiar, children, derecha = false, className = '' }: {
  campo: Orden; orden: Orden; desc: boolean; alCambiar: (c: Orden) => void; children: string; derecha?: boolean; className?: string;
}) {
  const activo = orden === campo;
  return (
    <Th derecha={derecha} className={className} aria-sort={activo ? (desc ? 'descending' : 'ascending') : 'none'}>
      <button
        type="button"
        onClick={() => alCambiar(campo)}
        className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-white ${activo ? 'text-acento' : ''}`}
      >
        {children}
        <span aria-hidden="true" className={activo ? '' : 'opacity-30'}>{activo && !desc ? '↑' : '↓'}</span>
      </button>
    </Th>
  );
}

export default function Clientes() {
  const navegar = useNavigate();
  const { idioma, tr } = useIdioma();
  const { analisis } = useDatos();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<'' | Estado>('');
  const [sector, setSector] = useState('');
  const [base, setBase] = useState<'' | 'si' | 'no'>('');
  const [orden, setOrden] = useState<Orden>('puntaje');
  const [desc, setDesc] = useState(true);
  const cambiarOrden = (c: Orden) => {
    if (c === orden) setDesc((d) => !d);
    else { setOrden(c); setDesc(c !== 'nombre' && c !== 'sector'); }
  };

  const filas = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return analisis
      .filter((a) => {
        if (q && !`${a.cliente.nombre} ${a.cliente.id} ${a.cliente.ciudad} ${a.cliente.sector}`.toLowerCase().includes(q)) return false;
        if (estado && a.estado !== estado) return false;
        if (sector && a.cliente.sector !== sector) return false;
        if (base === 'si' && !a.cliente.es_base_instalada) return false;
        if (base === 'no' && a.cliente.es_base_instalada) return false;
        return true;
      })
      .sort((x, y) => {
        const a = VALOR[orden](x), b = VALOR[orden](y);
        const r = typeof a === 'string' ? a.localeCompare(b as string, 'es') : a - (b as number);
        return desc ? -r : r;
      });
  }, [analisis, texto, estado, sector, base, orden, desc]);

  const hayFiltros = Boolean(texto || estado || sector || base);
  const limpiar = () => { setTexto(''); setEstado(''); setSector(''); setBase(''); };

  return (
    <>
      <PageHeader titulo={tr('Clientes', 'Clients')} subtitulo={tr('Vista completa de cada cliente. Haz clic en un encabezado para ordenar y en una fila para ver su ficha.', 'A complete view of every client. Click a header to sort and a row to open the client profile.')} />

      <Card className="mb-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative lg:col-span-2">
            <span className="sr-only">{tr('Buscar cliente', 'Search clients')}</span>
            <IconoBuscar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tenue" width={18} height={18} />
            <input className="campo pl-9" placeholder={tr('Buscar por nombre, código o ciudad', 'Search by name, code or city')} value={texto} onChange={(e) => setTexto(e.target.value)} />
          </label>
          <label>
            <span className="sr-only">{tr('Filtrar por estado', 'Filter by status')}</span>
            <select className="campo" value={estado} onChange={(e) => setEstado(e.target.value as '' | Estado)}>
              <option value="">{tr('Todos los estados', 'All statuses')}</option>
              <option value="activo">{tr('Activo', 'Active')}</option>
              <option value="riesgo">{tr('En riesgo', 'At risk')}</option>
              <option value="frio">{tr('Inactivo', 'Inactive')}</option>
            </select>
          </label>
          <label>
            <span className="sr-only">{tr('Filtrar por sector', 'Filter by sector')}</span>
            <select className="campo" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">{tr('Todos los sectores', 'All sectors')}</option>
              {SECTORES.map((s) => <option key={s} value={s}>{mayuscula(nombreSector(s, idioma))}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{tr('Filtrar por base instalada', 'Filter by installed base')}</span>
            <select className="campo" value={base} onChange={(e) => setBase(e.target.value as '' | 'si' | 'no')}>
              <option value="">{tr('Base instalada: todos', 'Installed base: all')}</option>
              <option value="si">{tr('Solo base instalada', 'Installed base only')}</option>
              <option value="no">{tr('Sin base instalada', 'Not installed base')}</option>
            </select>
          </label>
        </div>
      </Card>

      <div className="mb-2 flex items-center justify-between text-sm text-tenue">
        <p aria-live="polite">{tr(`${filas.length} de ${analisis.length} clientes`, `${filas.length} of ${analisis.length} clients`)}</p>
        {hayFiltros && <Button variante="fantasma" onClick={limpiar}>{tr('Limpiar filtros', 'Clear filters')}</Button>}
      </div>

      {filas.length ? (
        <Card className="!p-0">
          <Table minWidth={920}>
            <Thead>
              <ThOrden campo="nombre" orden={orden} desc={desc} alCambiar={cambiarOrden} className="pl-4">{tr('Cliente', 'Client')}</ThOrden>
              <ThOrden campo="sector" orden={orden} desc={desc} alCambiar={cambiarOrden}>{tr('Sector', 'Sector')}</ThOrden>
              <ThOrden campo="ultima" orden={orden} desc={desc} alCambiar={cambiarOrden}>{tr('Última compra', 'Last purchase')}</ThOrden>
              <ThOrden campo="ciclo" orden={orden} desc={desc} alCambiar={cambiarOrden} derecha>{tr('Ciclo', 'Cycle')}</ThOrden>
              <ThOrden campo="recencia" orden={orden} desc={desc} alCambiar={cambiarOrden} derecha>{tr('Días sin comprar', 'Days since purchase')}</ThOrden>
              <ThOrden campo="monto" orden={orden} desc={desc} alCambiar={cambiarOrden} derecha>{tr('Total comprado', 'Total purchased')}</ThOrden>
              <ThOrden campo="puntaje" orden={orden} desc={desc} alCambiar={cambiarOrden}>{tr('Riesgo', 'Risk')}</ThOrden>
              <Th>{tr('Estado', 'Status')}</Th>
            </Thead>
            <tbody>
              {filas.map((a) => {
                const ir = () => navegar(`/clientes/${a.cliente.id}`);
                return (
                  <Tr
                    key={a.cliente.id}
                    onClick={ir}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } }}
                    tabIndex={0}
                    role="link"
                    aria-label={tr(`Ver ficha de ${a.cliente.nombre}`, `Open profile of ${a.cliente.nombre}`)}
                    className="cursor-pointer hover:bg-white/5 focus-visible:bg-white/5"
                  >
                    <Td className="pl-4">
                      <p className="font-medium text-white">{a.cliente.nombre}</p>
                      <p className="text-xs text-tenue">
                        {a.cliente.id}{a.cliente.ciudad && ` · ${a.cliente.ciudad}`}
                        {a.cliente.es_base_instalada && <span className="ml-1 rounded bg-azul/15 px-1.5 py-0.5 text-[0.65rem] text-blue-200">{tr('Base instalada', 'Installed base')}</span>}
                      </p>
                    </Td>
                    <Td>{mayuscula(nombreSector(a.cliente.sector, idioma))}</Td>
                    <Td>{fmtFecha(a.ultimaCompra)}</Td>
                    <Td derecha>
                      {Math.round(a.ciclo)} d{a.cicloEstimado && <span title={tr('Estimado: el cliente tiene menos de 3 compras', 'Estimated: the client has fewer than 3 purchases')}>*</span>}
                    </Td>
                    <Td derecha>{a.recencia}</Td>
                    <Td derecha>{fmtCompacto(a.montoUsd)}</Td>
                    <Td><RiskBar puntaje={a.puntaje} /></Td>
                    <Td><StatusChip estado={a.estado} /></Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      ) : (
        <EmptyState titulo={tr('Ningún cliente coincide con los filtros', 'No clients match the filters')} accion={<Button onClick={limpiar}>{tr('Limpiar filtros', 'Clear filters')}</Button>} />
      )}
      <p className="mt-2 text-xs text-tenue">{tr('* Ciclo estimado con el ritmo general de todos los clientes, porque este cliente tiene menos de 3 compras.', '* Cycle estimated from the overall pace of all clients, because this client has fewer than 3 purchases.')}</p>
    </>
  );
}
