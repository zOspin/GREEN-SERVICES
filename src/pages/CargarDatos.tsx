import { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button, Card, EmptyState, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr } from '../components/ui';
import { IconoCandado, IconoCheck, IconoDescargar, IconoSubir } from '../components/Iconos';
import { clientes, meta, productoPorId, productos, trm, ventas } from '../lib/datos';
import { NOMBRE_CAMPO, unirArchivos, type ResultadoUnion } from '../lib/unificar';
import { fmtFecha, fmtNum, fmtUsd } from '../lib/format';

type Fila = Record<string, unknown>;
interface Archivo {
  nombre: string;
  filas: Fila[];
  error?: string;
}

const EJEMPLOS = [
  { archivo: 'plataforma-a-erp-colombia.csv', titulo: 'Plataforma A', detalle: 'ERP de Colombia · separador «;» · fechas dd/mm/aaaa · clientes por nombre' },
  { archivo: 'plataforma-b-internacional.csv', titulo: 'Plataforma B', detalle: 'Sedes internacionales · columnas en inglés · fecha con hora · códigos' },
  { archivo: 'excel-operaciones.csv', titulo: 'Excel de Operaciones', detalle: 'Digitado a mano · valores en pesos con TRM · duplicados y filas sucias' },
];

/** Lee un CSV o Excel y devuelve sus filas como objetos { columna: valor }. */
async function leer(nombre: string, contenido: () => Promise<string | ArrayBuffer>): Promise<Archivo> {
  const ext = nombre.split('.').pop()?.toLowerCase();
  try {
    if (ext === 'csv' || ext === 'txt') {
      const r = Papa.parse<Fila>(String(await contenido()), { header: true, skipEmptyLines: true });
      return { nombre, filas: r.data };
    }
    if (ext === 'xlsx' || ext === 'xls') {
      const libro = XLSX.read(await contenido(), { type: 'array', cellDates: true });
      const filas = XLSX.utils.sheet_to_json<Fila>(libro.Sheets[libro.SheetNames[0]], { defval: '', blankrows: true });
      return { nombre, filas };
    }
    return { nombre, filas: [], error: 'Formato no soportado. Usa CSV o Excel (.xlsx, .xls).' };
  } catch (e) {
    return { nombre, filas: [], error: `No se pudo leer: ${(e as Error).message}` };
  }
}

function descargarCsv(nombre: string, datos: object[]) {
  const blob = new Blob(['﻿' + Papa.unparse(datos)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function CargarDatos() {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [arrastrando, setArrastrando] = useState(false);
  const [leyendo, setLeyendo] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const agregar = (nuevos: Archivo[]) =>
    setArchivos((prev) => [...prev.filter((p) => !nuevos.some((n) => n.nombre === p.nombre)), ...nuevos]);

  const procesar = async (lista: FileList | null) => {
    if (!lista?.length) return;
    setLeyendo(true);
    agregar(await Promise.all([...lista].map((f) => leer(f.name, () => (/\.xlsx?$/i.test(f.name) ? f.arrayBuffer() : f.text())))));
    setLeyendo(false);
  };

  const cargarEjemplos = async () => {
    setLeyendo(true);
    const base = import.meta.env.BASE_URL;
    agregar(
      await Promise.all(
        EJEMPLOS.map((e) => leer(e.archivo, async () => {
          const r = await fetch(`${base}ejemplos/${e.archivo}`);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.text();
        })),
      ),
    );
    setLeyendo(false);
  };

  const legibles = archivos.filter((a) => !a.error);
  const union: ResultadoUnion | null = legibles.length
    ? unirArchivos(legibles.map((a) => ({ nombre: a.nombre, filas: a.filas })), { clientes, productos, trm, ventasBase: ventas })
    : null;
  const totalLeidas = union?.archivos.reduce((s, a) => s + a.filasLeidas, 0) ?? 0;
  const totalVacias = union?.archivos.reduce((s, a) => s + a.vacias, 0) ?? 0;

  return (
    <>
      <PageHeader titulo="Cargar datos" subtitulo="Une la información que hoy está regada en varias plataformas. Órbita Pulse reconoce las columnas, traduce formatos, quita duplicados y avisa lo que no pudo leer." />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-azul/40 bg-azul/10 p-4 text-sm text-blue-100" role="note">
        <IconoCandado className="mt-0.5 shrink-0" />
        <p><strong>Los datos reales son confidenciales; esta demo usa datos inventados.</strong></p>
      </div>

      <Card titulo="Datos actuales">
        <p className="text-slate-200" role="status">
          <IconoCheck width={18} height={18} className="mr-1 inline text-green-300" />
          Datos sintéticos cargados: {clientes.length} clientes, {fmtNum(ventas.length)} ventas, {meta.meses_historia} meses
          <span className="text-tenue"> ({fmtFecha(meta.fecha_inicio)} – {fmtFecha(meta.fecha_corte)}), {productos.length} productos y {fmtNum(trm.length)} días de TRM.</span>
        </p>
      </Card>

      <Card titulo="1. Trae los archivos de cada plataforma" className="mt-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {EJEMPLOS.map((e) => (
            <Panel key={e.archivo}>
              <p className="font-semibold text-white">{e.titulo}</p>
              <p className="mt-1 text-xs text-tenue">{e.detalle}</p>
              <a href={`${import.meta.env.BASE_URL}ejemplos/${e.archivo}`} download className="mt-3 inline-flex items-center gap-1 text-sm text-azul hover:underline">
                <IconoDescargar width={16} height={16} /> {e.archivo}
              </a>
            </Panel>
          ))}
        </div>

        <div
          className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            arrastrando ? 'border-acento bg-acento/10' : 'border-borde'
          }`}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastrando(false); void procesar(e.dataTransfer.files); }}
        >
          <IconoSubir width={36} height={36} className="text-acento" />
          <p className="mt-3 font-medium text-white">Arrastra aquí tus archivos CSV o Excel</p>
          <p className="mt-1 text-sm text-tenue">Se leen en tu navegador; nada se envía a internet.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variante="primario" onClick={() => void cargarEjemplos()}>Cargar los 3 archivos de ejemplo</Button>
            <Button onClick={() => entrada.current?.click()}>Elegir archivos</Button>
            {archivos.length > 0 && <Button variante="fantasma" onClick={() => setArchivos([])}>Quitar todos</Button>}
          </div>
          <input
            ref={entrada}
            type="file"
            multiple
            accept=".csv,.txt,.xlsx,.xls"
            className="sr-only"
            aria-label="Elegir archivos CSV o Excel"
            onChange={(e) => { void procesar(e.target.files); e.target.value = ''; }}
          />
          {leyendo && <p className="mt-3 text-sm text-tenue" role="status">Leyendo archivos…</p>}
        </div>
      </Card>

      {!union && !archivos.length && (
        <div className="mt-6">
          <EmptyState titulo="Aún no hay archivos cargados" descripcion="Usa «Cargar los 3 archivos de ejemplo» para ver cómo Órbita Pulse une datos regados." />
        </div>
      )}

      {archivos.filter((a) => a.error).map((a) => (
        <p key={a.nombre} className="mt-4 rounded-lg border border-frio/40 bg-frio/10 p-3 text-sm text-red-200">
          <strong>{a.nombre}:</strong> {a.error}
        </p>
      ))}

      {union && (
        <>
          <Card titulo="2. Columnas reconocidas" className="mt-6">
            <p className="-mt-2 mb-4 text-sm text-tenue">Cada plataforma llama distinto a lo mismo. Así se tradujo cada columna al formato común:</p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {union.archivos.map((a) => (
                <Panel key={a.nombre}>
                  <p className="font-semibold text-white">{a.nombre}</p>
                  <p className="text-xs text-tenue">
                    {a.filasLeidas} filas · {a.esVentas ? `${a.validas} ventas válidas` : 'no parece un archivo de ventas: solo vista previa'}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {Object.entries(a.columnas).map(([col, campo]) => (
                      <li key={col} className="flex items-center justify-between gap-2">
                        <code className="truncate rounded bg-fondo/70 px-1.5 py-0.5 text-xs text-slate-300">{col}</code>
                        <span className="text-tenue" aria-hidden="true">→</span>
                        {campo ? (
                          <span className="text-green-300"><span aria-hidden="true">✓ </span>{NOMBRE_CAMPO[campo]}</span>
                        ) : (
                          <span className="text-tenue">ignorada</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </div>
          </Card>

          <Card titulo="3. Unión y limpieza" className="mt-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard titulo="Filas leídas" valor={fmtNum(totalLeidas)} detalle={`de ${union.archivos.length} archivos`} />
              <StatCard titulo="Filas vacías quitadas" valor={totalVacias} />
              <StatCard titulo="Duplicados quitados" valor={union.duplicados} color="#F59E0B" detalle="misma venta en dos fuentes" />
              <StatCard titulo="Con problemas" valor={union.problemas.length} color={union.problemas.length ? '#EF4444' : undefined} detalle="para revisar a mano" />
              <div className="col-span-2 lg:col-span-1">
                <StatCard titulo="Ventas unificadas" valor={fmtNum(union.ventas.length)} color="#22C55E" detalle={`${union.coincidenConBase} coinciden con la base`} />
              </div>
            </div>
            {union.problemas.length > 0 && (
              <Panel className="mt-4">
                <p className="font-semibold text-white">Filas que necesitan revisión</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {union.problemas.map((p) => (
                    <li key={`${p.origen}-${p.fila}`}>
                      <span className="text-red-300" aria-hidden="true">■ </span>
                      {p.origen}, fila {p.fila}: {p.motivo}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
            <p className="mt-4 text-sm text-slate-300">
              <strong className="text-white">Resumen:</strong> de {fmtNum(totalLeidas)} filas en {union.archivos.length} archivos quedaron{' '}
              {fmtNum(union.ventas.length)} ventas únicas y limpias. Antes, este trabajo se hacía a mano en Excel cada mes.
            </p>
          </Card>

          {union.ventas.length > 0 && (
            <Card
              titulo="4. Resultado: una sola tabla"
              className="mt-6"
              accion={
                <Button onClick={() => descargarCsv('ventas-unificadas.csv', union.ventas)}>
                  <IconoDescargar width={16} height={16} /> Descargar CSV unificado
                </Button>
              }
            >
              <p className="-mt-2 mb-3 text-sm text-tenue">Primeras 10 de {union.ventas.length} ventas, todas en el mismo formato.</p>
              <Table minWidth={640}>
                <Thead>
                  <Th>Fecha</Th>
                  <Th>Cliente</Th>
                  <Th>Producto</Th>
                  <Th derecha>Cant.</Th>
                  <Th derecha>Valor USD</Th>
                  <Th>Origen</Th>
                </Thead>
                <tbody>
                  {union.ventas.slice(0, 10).map((v, i) => (
                    <Tr key={i}>
                      <Td className="whitespace-nowrap">{v.fecha}</Td>
                      <Td>{v.id_cliente}</Td>
                      <Td className="text-slate-200">{productoPorId.get(v.id_producto)?.nombre}</Td>
                      <Td derecha>{v.cantidad}</Td>
                      <Td derecha>{fmtUsd(v.valor_usd)}</Td>
                      <Td className="text-xs text-tenue">{v.origen}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}

          {legibles.filter((a) => !union.archivos.find((r) => r.nombre === a.nombre)?.esVentas).map((a) => (
            <Card key={a.nombre} titulo={`Vista previa: ${a.nombre}`} className="mt-6">
              <Table minWidth={480}>
                <Thead>{Object.keys(a.filas[0] ?? {}).map((c) => <Th key={c}>{c}</Th>)}</Thead>
                <tbody>
                  {a.filas.slice(0, 8).map((f, k) => (
                    <Tr key={k}>
                      {Object.keys(a.filas[0] ?? {}).map((c) => (
                        <Td key={c} className="whitespace-nowrap">{f[c] instanceof Date ? (f[c] as Date).toISOString().slice(0, 10) : String(f[c] ?? '')}</Td>
                      ))}
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          ))}
        </>
      )}
    </>
  );
}
