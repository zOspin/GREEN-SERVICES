import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Impacto from '../components/Impacto';
import Papa from 'papaparse';
import { Button, Card, EmptyState, PageHeader, Panel, StatCard, Table, Td, Th, Thead, Tr, INFO_ESTADO } from '../components/ui';
import { IconoCandado, IconoCheck, IconoDescargar, IconoSubir } from '../components/Iconos';
import { clientes, hayDatos, meta, MODO, productoPorId, productos, trm, ventas, CLIENTE_DEMO } from '../lib/datos';
import { NOMBRE_CAMPO, unirArchivos, type ResultadoUnion } from '../lib/unificar';
import { producto } from '../lib/catalogo';
import { useIdioma, type Bi } from '../lib/idioma';
import { fmtFecha, fmtNum, fmtUsd } from '../lib/format';
import { descargarCsv, descargarEncabezados } from '../lib/descargar';
import { armarDatosReales, COLUMNAS_PLANTILLA } from '../lib/datosReales';
import { borrarDatosReales, guardarDatosReales, leerDatosReales } from '../lib/modo';

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
      // El lector de Excel (SheetJS) es pesado: se descarga solo cuando llega un archivo Excel.
      const XLSX = await import('xlsx');
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
  const [params] = useSearchParams();
  const clienteSeguido = params.get('cliente') ?? CLIENTE_DEMO;
  const real = MODO === 'real';
  const [sinEspacio, setSinEspacio] = useState(false);
  const guardados = real ? leerDatosReales() : null;

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

  // Modo presentación (/datos?demo=1): carga sola los 3 archivos de ejemplo.
  const demo = params.get('demo') === '1' && !real;
  useEffect(() => {
    if (demo) void cargarEjemplos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  const legibles = archivos.filter((a) => !a.error);
  const union: ResultadoUnion | null = legibles.length
    ? unirArchivos(
        legibles.map((a) => ({ nombre: a.nombre, filas: a.filas })),
        // Modo Real: se parte de cero y se crean los clientes y productos que traigan los archivos.
        real ? { clientes: [], productos: [], trm: [], ventasBase: [], crearNuevos: true } : { clientes, productos, trm, ventasBase: ventas },
      )
    : null;
  // Nombres de productos: los del catálogo y los nuevos que vinieron en los archivos.
  const nombreProducto = (id: string) => productoPorId.get(id)?.nombre ?? union?.productosNuevos.find((p) => p.id === id)?.nombre ?? id;
  const usarEnModoReal = () => {
    if (!union) return;
    if (!guardarDatosReales(armarDatosReales(union, legibles.map((a) => a.nombre)))) setSinEspacio(true);
  };
  const totalLeidas = union?.archivos.reduce((s, a) => s + a.filasLeidas, 0) ?? 0;
  const totalVacias = union?.archivos.reduce((s, a) => s + a.vacias, 0) ?? 0;

  return (
    <>
      <PageHeader
        titulo={tr('Centro de datos', 'Data hub')}
        subtitulo={tr(
          'Une la información que hoy está regada en varias plataformas. Órbita reconoce las columnas, traduce formatos, quita duplicados y avisa lo que no pudo leer.',
          "Bring together data that is scattered across several platforms. Órbita recognizes columns, converts formats, removes duplicates and flags what it couldn't read.",
        )}
      />

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-azul/40 bg-azul/10 p-4 text-sm text-blue-100" role="note">
        <IconoCandado className="mt-0.5 shrink-0" />
        <p>
          <strong>
            {MODO === 'demo'
              ? tr('Los datos reales son confidenciales; esta demo usa datos inventados.', 'Real company data is confidential; this demo uses synthetic data.')
              : tr('Modo Real: los datos de Green Services llegan anonimizados y no salen de la empresa.', "Real mode: Green Services' data arrives anonymized and stays within the company.")}
          </strong>
        </p>
      </div>

      <Impacto className="mb-6" />

      <Card titulo={tr('Datos actuales', 'Current data')}>
        {!hayDatos ? (
          <p className="text-slate-200" role="status">
            {tr(
              'Todavía no hay datos reales. Descarga la plantilla, llénala con la exportación de Green Services (o sube los archivos tal como salen de cada sistema) y pulsa «Usar estos datos en modo Real».',
              "No real data yet. Download the template, fill it with Green Services' export (or upload the files as each system exports them) and press \"Use this data in Real mode\".",
            )}
          </p>
        ) : (
        <p className="text-slate-200" role="status">
          <IconoCheck width={18} height={18} className="mr-1 inline text-green-300" />
          {tr(
            `${MODO === 'demo' ? 'Datos sintéticos cargados' : 'Datos reales cargados'}: ${clientes.length} clientes, ${fmtNum(ventas.length)} ventas, ${meta.meses_historia} meses`,
            `${MODO === 'demo' ? 'Synthetic data loaded' : 'Real data loaded'}: ${clientes.length} clients, ${fmtNum(ventas.length)} sales, ${meta.meses_historia} months`,
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
        )}
        {guardados && (
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-tenue">
            <span>
              {tr('Guardados solo en este navegador desde', 'Saved only in this browser since')} {fmtFecha(guardados.meta.guardado.slice(0, 10))} ·{' '}
              {guardados.meta.archivos.join(', ')}
            </span>
            <Button variante="fantasma" onClick={() => window.confirm(tr('¿Borrar los datos reales de este navegador? El modo Real volverá a quedar en cero.', 'Delete the real data from this browser? Real mode will go back to zero.')) && borrarDatosReales()}>
              {tr('Borrar datos reales', 'Delete real data')}
            </Button>
          </div>
        )}
      </Card>

      <Card titulo={tr('1. Trae los archivos de cada plataforma', '1. Bring the files from each platform')} className="mt-6">
        {real ? (
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{tr('Lo que necesita la página', 'What the page needs')}</p>
                <p className="mt-1 text-sm text-tenue">
                  {tr(
                    'Una fila por venta. Los nombres de las columnas pueden variar: Órbita reconoce sinónimos (por ejemplo «date», «SKU», «Valor COP»).',
                    'One row per sale. Column names can vary: Órbita recognizes synonyms (for example "date", "SKU", "Valor COP").',
                  )}
                </p>
                <p className="mt-1 text-sm text-tenue">
                  {tr(
                    'También puedes subir, junto con las ventas, una lista de clientes (cliente, sector, ciudad, base instalada) para que cuenten todos, aunque no hayan comprado, y un archivo de TRM (fecha, trm).',
                    'Along with sales you can also upload a client list (client, sector, city, installed base) so every client counts, even without purchases, and an exchange-rate file (date, trm).',
                  )}
                </p>
              </div>
              <Button onClick={() => descargarEncabezados('plantilla-orbita-pulse.csv', COLUMNAS_PLANTILLA.map((c) => c.columna))}>
                <IconoDescargar width={16} height={16} /> {tr('Descargar plantilla', 'Download template')}
              </Button>
            </div>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-sm md:grid-cols-2">
              {COLUMNAS_PLANTILLA.map((c) => (
                <li key={c.columna}>
                  <code className="text-acento">{c.columna}</code>{' '}
                  <span className={c.obligatoria ? 'text-xs font-semibold text-red-300' : 'text-xs text-tenue'}>
                    ({c.obligatoria ? tr('obligatoria', 'required') : tr('opcional', 'optional')})
                  </span>{' '}
                  <span className="text-slate-300">— {tr(c.es, c.en)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        ) : (
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
        )}

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
            {!real && (
              <Button variante="primario" onClick={() => void cargarEjemplos()}>
                {tr('Cargar los 3 archivos de ejemplo', 'Load the 3 sample files')}
              </Button>
            )}
            <Button variante={real ? 'primario' : undefined} onClick={() => entrada.current?.click()}>
              {tr('Elegir archivos', 'Choose files')}
            </Button>
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
            descripcion={
              real
                ? tr('Sube los archivos reales de Green Services (CSV o Excel).', "Upload Green Services' real files (CSV or Excel).")
                : tr(
                    'Usa «Cargar los 3 archivos de ejemplo» para ver cómo Órbita une datos regados.',
                    'Use "Load the 3 sample files" to see how Órbita brings scattered data together.',
                  )
            }
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
                    {a.tipo === 'ventas'
                      ? tr(`${a.validas} ventas válidas`, `${a.validas} valid sales`) +
                        (a.excluidas ? tr(` · ${a.excluidas} anuladas o canceladas (no cuentan)`, ` · ${a.excluidas} void or cancelled (not counted)`) : '')
                      : a.tipo === 'clientes'
                        ? real
                          ? tr(`lista de clientes: ${a.validas} clientes`, `client list: ${a.validas} clients`)
                          : tr('lista de clientes (se usa al cargar datos reales)', 'client list (used when loading real data)')
                        : a.tipo === 'trm'
                          ? tr(`TRM: ${a.validas} días`, `exchange rate: ${a.validas} days`)
                          : tr('no se reconoce como ventas, clientes ni TRM: solo vista previa', 'not recognized as sales, clients or exchange rate: preview only')}
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

          {real && (
            <Card titulo={tr('4. Usar estos datos en modo Real', '4. Use this data in Real mode')} className="mt-6">
              <p className="text-sm text-slate-300">
                {tr(
                  `Se crearán ${union.clientesNuevos.length} clientes, ${union.productosNuevos.length} productos y ${fmtNum(union.ventas.length)} ventas, con ${union.trmLeida.length ? `TRM de ${fmtNum(union.trmLeida.length)} días` : 'sin TRM (los valores en pesos quedarán en 0 si no vienen en el archivo)'}. Todas las pantallas se recalculan con estos datos.`,
                  `This creates ${union.clientesNuevos.length} clients, ${union.productosNuevos.length} products and ${fmtNum(union.ventas.length)} sales, with ${union.trmLeida.length ? `exchange rates for ${fmtNum(union.trmLeida.length)} days` : 'no exchange rate (peso amounts stay at 0 unless the file has them)'}. Every screen is recalculated with this data.`,
                )}
              </p>
              <p className="mt-2 text-sm text-tenue">
                {tr(
                  'Se guardan solo en este navegador: no se suben a internet ni a GitHub. Si quedan filas «con problemas», corrígelas en el archivo y vuelve a subirlo.',
                  'They are saved only in this browser: nothing is uploaded to the internet or GitHub. If some rows have issues, fix them in the file and upload it again.',
                )}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button variante="primario" onClick={usarEnModoReal} disabled={!union.ventas.length}>
                  {tr('Usar estos datos en modo Real', 'Use this data in Real mode')}
                </Button>
                {guardados && <span className="text-sm text-tenue">{tr('Reemplaza los datos reales guardados.', 'Replaces the saved real data.')}</span>}
              </div>
              {sinEspacio && (
                <p className="mt-3 text-sm text-red-300" role="alert">
                  {tr('El navegador no tiene espacio para guardar tantos datos.', 'The browser has no room to store this much data.')}
                </p>
              )}
            </Card>
          )}

          {union.trazas.some((t) => t.id_cliente === clienteSeguido) && (
            <Card
              id="seguimiento-cliente"
              titulo={tr(
                `Así llegó el ${clientes.find((c) => c.id === clienteSeguido)?.nombre}: regado y repetido`,
                `How ${clientes.find((c) => c.id === clienteSeguido)?.nombre} arrived: scattered and repeated`,
              )}
              className="mt-6 border-acento/50"
              accion={
                <Link to={`/clientes/${clienteSeguido}`} className="text-sm text-azul hover:underline">
                  {tr('Ver su ficha', 'Open profile')}
                </Link>
              }
            >
              <p className="-mt-2 mb-3 text-sm text-slate-300">
                {tr(
                  'El mismo cliente venía escrito distinto en cada plataforma y una compra estaba dos veces. Órbita lo reconoce como un solo cliente y deja cada compra una sola vez.',
                  'The same client was written differently on each platform and one purchase appeared twice. Órbita recognizes it as one client and keeps each purchase once.',
                )}
              </p>
              <Table minWidth={720}>
                <Thead>
                  <Th>{tr('Archivo', 'File')}</Th>
                  <Th>{tr('Cómo venía escrito', 'How it was written')}</Th>
                  <Th>{tr('Fecha', 'Date')}</Th>
                  <Th>{tr('Producto', 'Product')}</Th>
                  <Th derecha>{tr('Valor USD', 'USD amount')}</Th>
                  <Th>{tr('Resultado', 'Result')}</Th>
                </Thead>
                <tbody>
                  {union.trazas
                    .filter((t) => t.id_cliente === clienteSeguido)
                    .sort((x, y) => x.fecha.localeCompare(y.fecha) || Number(x.duplicado) - Number(y.duplicado))
                    .map((t) => (
                      <Tr key={`${t.origen}-${t.fila}`} className="fila-resaltada">
                        <Td className="text-xs">
                          {t.origen} · {tr('fila', 'row')} {t.fila}
                        </Td>
                        <Td>
                          <code className="rounded bg-fondo/70 px-1.5 py-0.5 text-slate-100">{t.textoCliente}</code> → {t.id_cliente}
                        </Td>
                        <Td className="whitespace-nowrap">{fmtFecha(t.fecha)}</Td>
                        <Td>{producto(nombreProducto(t.id_producto), idioma)}</Td>
                        <Td derecha>{fmtUsd(t.valor_usd)}</Td>
                        <Td>
                          {t.duplicado ? (
                            <span className="text-red-300">
                              <span aria-hidden="true">✕ </span>
                              {tr('Duplicado, se quita', 'Duplicate, removed')}
                            </span>
                          ) : (
                            <span className="text-green-300">
                              <span aria-hidden="true">✓ </span>
                              {tr('Se une', 'Merged')}
                            </span>
                          )}
                        </Td>
                      </Tr>
                    ))}
                </tbody>
              </Table>
            </Card>
          )}

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
                      <Td className="text-slate-200">{producto(nombreProducto(v.id_producto), idioma)}</Td>
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
            .filter((a) => !union.archivos.find((r) => r.nombre === a.nombre)?.tipo)
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
