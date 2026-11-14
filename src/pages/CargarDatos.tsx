import { useRef, useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Button, Card, EmptyState, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr, INFO_ESTADO } from '../components/ui';
import { IconoCandado, IconoCheck, IconoDescargar, IconoSubir } from '../components/Iconos';
import { clientes, meta, productoPorId, productos, trm, ventas } from '../lib/datos';
import { NOMBRE_CAMPO, unirArchivos, type ResultadoUnion } from '../lib/unificar';
import { producto } from '../lib/catalogo';
import { useIdioma, type Bi } from '../lib/idioma';
import { fmtFecha, fmtNum, fmtUsd } from '../lib/format';
import { descargarCsv } from '../lib/descargar';

type Fila = Record<string, unknown>;
interface Archivo {
  nombre: string;
  filas: Fila[];
  error?: Bi;
}

const EJEMPLOS = [
  {
    archivo: 'plataforma-a-erp-colombia.csv',
    titulo: { es: 'Plataforma A', en: 'Platform A' },
    detalle: {
      es: 'ERP de Colombia · separador «;» · fechas dd/mm/aaaa · clientes por nombre',
      en: 'Colombia ERP · ";" separator · dd/mm/yyyy dates · clients by name',
    },
  },
  {
    archivo: 'plataforma-b-internacional.csv',
    titulo: { es: 'Plataforma B', en: 'Platform B' },
    detalle: {
      es: 'Sedes internacionales · columnas en inglés · fecha con hora · códigos',
      en: 'International offices · English columns · date with time · codes',
    },
  },
  {
    archivo: 'excel-operaciones.csv',
    titulo: { es: 'Excel de Operaciones', en: 'Operations spreadsheet' },
    detalle: {
      es: 'Digitado a mano · valores en pesos con TRM · duplicados y filas sucias',
      en: 'Typed by hand · amounts in pesos with TRM · duplicates and dirty rows',
    },
  },
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
    return {
      nombre,
      filas: [],
      error: { es: 'Formato no soportado. Usa CSV o Excel (.xlsx, .xls).', en: 'Unsupported format. Use CSV or Excel (.xlsx, .xls).' },
    };
  } catch (e) {
    const m = (e as Error).message;
    return { nombre, filas: [], error: { es: `No se pudo leer: ${m}`, en: `Could not read the file: ${m}` } };
  }
}

export default function CargarDatos() {
  const { idioma, tr, b } = useIdioma();
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
        EJEMPLOS.map((e) =>
          leer(e.archivo, async () => {
            const r = await fetch(`${base}ejemplos/${e.archivo}`);
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
          }),
        ),
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
      <PageHeader
        titulo={tr('Cargar datos', 'Load data')}
        subtitulo={tr(
          'Une la información que hoy está regada en varias plataformas. Órbita Pulse reconoce las columnas, traduce formatos, quita duplicados y avisa lo que no pudo leer.',
          "Bring together data that is scattered across several platforms. Órbita Pulse recognizes columns, converts formats, removes duplicates and flags what it couldn't read.",
        )}
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-azul/40 bg-azul/10 p-4 text-sm text-blue-100" role="note">
        <IconoCandado className="mt-0.5 shrink-0" />
        <p>
          <strong>
            {tr('Los datos reales son confidenciales; esta demo usa datos inventados.', 'Real company data is confidential; this demo uses synthetic data.')}
          </strong>
        </p>
      </div>

      <Card titulo={tr('Datos actuales', 'Current data')}>
        <p className="text-slate-200" role="status">
          <IconoCheck width={18} height={18} className="mr-1 inline text-green-300" />
          {tr(
            `Datos sintéticos cargados: ${clientes.length} clientes, ${fmtNum(ventas.length)} ventas, ${meta.meses_historia} meses`,
            `Synthetic data loaded: ${clientes.length} clients, ${fmtNum(ventas.length)} sales, ${meta.meses_historia} months`,
          )}
          <span className="text-tenue">
            {' '}
            ({fmtFecha(meta.fecha_inicio)} – {fmtFecha(meta.fecha_corte)}),{' '}
            {tr(
              `${productos.length} productos y ${fmtNum(trm.length)} días de TRM.`,
              `${productos.length} products and ${fmtNum(trm.length)} days of exchange rates.`,
            )}
          </span>
        </p>
      </Card>

      <Card titulo={tr('1. Trae los archivos de cada plataforma', '1. Bring the files from each platform')} className="mt-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {EJEMPLOS.map((e) => (
            <Panel key={e.archivo}>
              <p className="font-semibold text-white">{b(e.titulo)}</p>
              <p className="mt-1 text-xs text-tenue">{b(e.detalle)}</p>
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
          onDragOver={(e) => {
            e.preventDefault();
            setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={(e) => {
            e.preventDefault();
            setArrastrando(false);
            void procesar(e.dataTransfer.files);
          }}
        >
          <IconoSubir width={36} height={36} className="text-acento" />
          <p className="mt-3 font-medium text-white">{tr('Arrastra aquí tus archivos CSV o Excel', 'Drag your CSV or Excel files here')}</p>
          <p className="mt-1 text-sm text-tenue">{tr('Se leen en tu navegador; nada se envía a internet.', 'They are read in your browser; nothing is sent to the internet.')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variante="primario" onClick={() => void cargarEjemplos()}>
              {tr('Cargar los 3 archivos de ejemplo', 'Load the 3 sample files')}
            </Button>
            <Button onClick={() => entrada.current?.click()}>{tr('Elegir archivos', 'Choose files')}</Button>
            {archivos.length > 0 && (
              <Button variante="fantasma" onClick={() => setArchivos([])}>
                {tr('Quitar todos', 'Remove all')}
              </Button>
            )}
          </div>
          <input
            ref={entrada}
            type="file"
            multiple
            accept=".csv,.txt,.xlsx,.xls"
            className="sr-only"
            aria-label={tr('Elegir archivos CSV o Excel', 'Choose CSV or Excel files')}
            onChange={(e) => {
              void procesar(e.target.files);
              e.target.value = '';
            }}
          />
          {leyendo && (
            <p className="mt-3 text-sm text-tenue" role="status">
              {tr('Leyendo archivos…', 'Reading files…')}
            </p>
          )}
        </div>
      </Card>

      {!union && !archivos.length && (
        <div className="mt-6">
          <EmptyState
            titulo={tr('Aún no hay archivos cargados', 'No files loaded yet')}
            descripcion={tr(
              'Usa «Cargar los 3 archivos de ejemplo» para ver cómo Órbita Pulse une datos regados.',
              'Use "Load the 3 sample files" to see how Órbita Pulse brings scattered data together.',
            )}
          />
        </div>
      )}

      {archivos
        .filter((a) => a.error)
        .map((a) => (
          <p key={a.nombre} className="mt-4 rounded-lg border border-frio/40 bg-frio/10 p-3 text-sm text-red-200">
            <strong>{a.nombre}:</strong> {a.error && b(a.error)}
          </p>
        ))}

      {union && (
        <>
          <Card titulo={tr('2. Columnas reconocidas', '2. Recognized columns')} className="mt-6">
            <p className="-mt-2 mb-4 text-sm text-tenue">
              {tr(
                'Cada plataforma llama distinto a lo mismo. Así se tradujo cada columna al formato común:',
                'Each platform names the same thing differently. This is how each column was mapped to the common format:',
              )}
            </p>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {union.archivos.map((a) => (
                <Panel key={a.nombre}>
                  <p className="font-semibold text-white">{a.nombre}</p>
                  <p className="text-xs text-tenue">
                    {tr(`${a.filasLeidas} filas · `, `${a.filasLeidas} rows · `)}
                    {a.esVentas
                      ? tr(`${a.validas} ventas válidas`, `${a.validas} valid sales`)
                      : tr('no parece un archivo de ventas: solo vista previa', "doesn't look like a sales file: preview only")}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {Object.entries(a.columnas).map(([col, campo]) => (
                      <li key={col} className="flex items-center justify-between gap-2">
                        <code className="truncate rounded bg-fondo/70 px-1.5 py-0.5 text-xs text-slate-300">{col}</code>
                        <span className="text-tenue" aria-hidden="true">→</span>
                        {campo ? (
                          <span className="text-green-300">
                            <span aria-hidden="true">✓ </span>
                            {b(NOMBRE_CAMPO[campo])}
                          </span>
                        ) : (
                          <span className="text-tenue">{tr('ignorada', 'ignored')}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </div>
          </Card>

          <Card titulo={tr('3. Unión y limpieza', '3. Merge and clean-up')} className="mt-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <StatCard
                titulo={tr('Filas leídas', 'Rows read')}
                valor={fmtNum(totalLeidas)}
                detalle={tr(`de ${union.archivos.length} archivos`, `from ${union.archivos.length} files`)}
              />
              <StatCard titulo={tr('Filas vacías quitadas', 'Empty rows removed')} valor={totalVacias} />
              <StatCard
                titulo={tr('Duplicados quitados', 'Duplicates removed')}
                valor={union.duplicados}
                color={INFO_ESTADO.riesgo.color}
                detalle={tr('misma venta en dos fuentes', 'same sale in two sources')}
              />
              <StatCard
                titulo={tr('Con problemas', 'With issues')}
                valor={union.problemas.length}
                color={union.problemas.length ? INFO_ESTADO.frio.color : undefined}
                detalle={tr('para revisar a mano', 'to review by hand')}
              />
              <div className="col-span-2 lg:col-span-1">
                <StatCard
                  titulo={tr('Ventas unificadas', 'Unified sales')}
                  valor={fmtNum(union.ventas.length)}
                  color={INFO_ESTADO.activo.color}
                  detalle={tr(`${union.coincidenConBase} coinciden con la base`, `${union.coincidenConBase} match the database`)}
                />
              </div>
            </div>
            {union.problemas.length > 0 && (
              <Panel className="mt-4">
                <p className="font-semibold text-white">{tr('Filas que necesitan revisión', 'Rows that need review')}</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  {union.problemas.map((p) => (
                    <li key={`${p.origen}-${p.fila}`}>
                      <span className="text-red-300" aria-hidden="true">■ </span>
                      {tr(`${p.origen}, fila ${p.fila}: `, `${p.origen}, row ${p.fila}: `)}
                      {b(p.motivo)}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
            <p className="mt-4 text-sm text-slate-300">
              <strong className="text-white">{tr('Resumen:', 'Summary:')}</strong>{' '}
              {tr(
                `de ${fmtNum(totalLeidas)} filas en ${union.archivos.length} archivos quedaron ${fmtNum(union.ventas.length)} ventas únicas y limpias. Antes, este trabajo se hacía a mano en Excel cada mes.`,
                `${fmtNum(totalLeidas)} rows across ${union.archivos.length} files became ${fmtNum(union.ventas.length)} unique, clean sales. This used to be done by hand in Excel every month.`,
              )}
            </p>
          </Card>

          {union.ventas.length > 0 && (
            <Card
              titulo={tr('4. Resultado: una sola tabla', '4. Result: a single table')}
              className="mt-6"
              accion={
                <Button onClick={() => descargarCsv(tr('ventas-unificadas.csv', 'unified-sales.csv'), union.ventas as unknown as Record<string, unknown>[])}>
                  <IconoDescargar width={16} height={16} /> {tr('Descargar CSV unificado', 'Download unified CSV')}
                </Button>
              }
            >
              <p className="-mt-2 mb-3 text-sm text-tenue">
                {tr(
                  `Primeras 10 de ${union.ventas.length} ventas, todas en el mismo formato.`,
                  `First 10 of ${union.ventas.length} sales, all in the same format.`,
                )}
              </p>
              <Table minWidth={640}>
                <Thead>
                  <Th>{tr('Fecha', 'Date')}</Th>
                  <Th>{tr('Cliente', 'Client')}</Th>
                  <Th>{tr('Producto', 'Product')}</Th>
                  <Th derecha>{tr('Cant.', 'Qty')}</Th>
                  <Th derecha>{tr('Valor USD', 'USD amount')}</Th>
                  <Th>{tr('Origen', 'Source')}</Th>
                </Thead>
                <tbody>
                  {union.ventas.slice(0, 10).map((v, i) => (
                    <Tr key={i}>
                      <Td className="whitespace-nowrap">{fmtFecha(v.fecha)}</Td>
                      <Td>{v.id_cliente}</Td>
                      <Td className="text-slate-200">{producto(productoPorId.get(v.id_producto)?.nombre ?? v.id_producto, idioma)}</Td>
                      <Td derecha>{v.cantidad}</Td>
                      <Td derecha>{fmtUsd(v.valor_usd)}</Td>
                      <Td className="text-xs text-tenue">{v.origen}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}

          {legibles
            .filter((a) => !union.archivos.find((r) => r.nombre === a.nombre)?.esVentas)
            .map((a) => (
              <Card key={a.nombre} titulo={tr(`Vista previa: ${a.nombre}`, `Preview: ${a.nombre}`)} className="mt-6">
                <Table minWidth={480}>
                  <Thead>
                    {Object.keys(a.filas[0] ?? {}).map((c) => (
                      <Th key={c}>{c}</Th>
                    ))}
                  </Thead>
                  <tbody>
                    {a.filas.slice(0, 8).map((f, k) => (
                      <Tr key={k}>
                        {Object.keys(a.filas[0] ?? {}).map((c) => (
                          <Td key={c} className="whitespace-nowrap">
                            {f[c] instanceof Date ? (f[c] as Date).toISOString().slice(0, 10) : String(f[c] ?? '')}
                          </Td>
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
