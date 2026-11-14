import { Link } from 'react-router-dom';
import { ButtonLink, Card, PageHeader, Table, Td, Th, Thead, Tr } from '../components/ui';
import { IconoCheck, IconoCerrar, IconoFlecha } from '../components/Iconos';
import { conteoEstados, enRiesgo, resultadoBacktest, alertas } from '../lib/datos';
import { fmtCompacto } from '../lib/format';

const PREGUNTAS: { pregunta: string; area: string; pantallas: { texto: string; ruta: string }[] }[] = [
  { pregunta: 'Centralizar la información de diferentes plataformas', area: 'Operaciones', pantallas: [{ texto: 'Cargar datos', ruta: '/datos' }] },
  { pregunta: 'Reducir tareas manuales con IA', area: 'Operaciones', pantallas: [{ texto: 'Cargar datos', ruta: '/datos' }, { texto: 'Reporte del mes', ruta: '/reporte' }] },
  { pregunta: 'Identificar patrones de compra para anticipar necesidades', area: 'Operaciones', pantallas: [{ texto: '¿Cómo funciona la IA?', ruta: '/predicciones' }, { texto: 'Ficha del cliente', ruta: '/clientes/CLI-030' }] },
  { pregunta: 'Generar reportes automáticos para decidir', area: 'Operaciones', pantallas: [{ texto: 'Reporte del mes', ruta: '/reporte' }] },
  { pregunta: 'Identificar clientes que dejaron de comprar', area: 'Comercial', pantallas: [{ texto: 'Alertas', ruta: '/alertas' }, { texto: 'Clientes', ruta: '/clientes' }] },
  { pregunta: 'Predecir la próxima compra de un cliente', area: 'Comercial', pantallas: [{ texto: 'Ficha del cliente', ruta: '/clientes/CLI-030' }] },
  { pregunta: 'Conocer el historial de cada cliente para ofrecerle lo que necesita', area: 'Comercial', pantallas: [{ texto: 'Ficha del cliente', ruta: '/clientes/CLI-030' }] },
  { pregunta: 'Recomendar qué producto ofrecer a cada cliente', area: 'Comercial', pantallas: [{ texto: 'Recomendación de IA', ruta: '/clientes/CLI-030' }, { texto: 'Alertas', ruta: '/alertas' }] },
  { pregunta: 'Analizar tendencias de compras, ventas y TRM', area: 'Financiera', pantallas: [{ texto: 'Ventas y TRM', ruta: '/ventas' }] },
  { pregunta: 'Tener información actualizada y confiable para planificar', area: 'Financiera', pantallas: [{ texto: 'Inicio', ruta: '/' }, { texto: 'Predicciones', ruta: '/predicciones' }] },
];

const COLOR_AREA: Record<string, string> = {
  Operaciones: 'bg-azul/15 text-blue-200 border-azul/40',
  Comercial: 'bg-acento/15 text-amber-200 border-acento/40',
  Financiera: 'bg-violet-400/15 text-violet-200 border-violet-400/40',
};

const ANTES = [
  'Datos regados en varias plataformas',
  'Consolidación manual en Excel, una vez al mes',
  'Se enteran tarde de que un cliente dejó de comprar',
  'Reportes armados a mano',
  'Decisiones reactivas',
];
const AHORA = [
  'Datos unidos y limpios en un solo lugar',
  'Cálculos automáticos cada vez que llegan datos',
  'Alertas de quién contactar esta semana y por qué',
  'Reporte del mes generado solo, listo para imprimir',
  'Atención proactiva, con recomendación de qué ofrecer',
];

export default function Reto() {
  return (
    <>
      <PageHeader titulo="El reto" subtitulo="Green Services and Solutions SAS · Hackatón Estud-IA, Alcaldía de Medellín · Equipo Órbita" />

      <section className="rounded-2xl border border-acento/40 bg-tarjeta p-6 sm:p-8">
        <p className="etiqueta-seccion text-acento">Pregunta principal</p>
        <p className="mt-2 font-titulo text-2xl font-semibold leading-snug text-white sm:text-3xl">
          ¿Cómo podríamos ayudar al área Comercial a <span className="text-acento">anticipar qué clientes están por dejar de comprar</span> y{' '}
          <span className="text-acento">cuándo deberían volver a hacerlo</span>, para contactarlos a tiempo?
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-amber-300">{fmtCompacto(enRiesgo.total)}</p>
            <p className="text-sm text-tenue">al año en {conteoEstados.riesgo + conteoEstados.frio} clientes en riesgo o fríos, detectados a tiempo</p>
          </div>
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-white">{alertas.length}</p>
            <p className="text-sm text-tenue">alertas con motivo y recomendación</p>
          </div>
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-green-300">{Math.round(resultadoBacktest.porcentaje * 100)} %</p>
            <p className="text-sm text-tenue">de acierto al predecir quién deja de comprar</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card titulo="Antes">
          <p className="-mt-2 mb-3 text-sm text-tenue">Excel, manual, reactivo</p>
          <ul className="space-y-2">
            {ANTES.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-lg bg-superficie px-3 py-2.5 text-slate-300">
                <IconoCerrar width={18} height={18} className="mt-0.5 shrink-0 text-red-300" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card titulo={<span>Ahora, con <span className="text-acento">Órbita Pulse</span></span>} className="border-acento/40">
          <p className="-mt-2 mb-3 text-sm text-tenue">Datos unidos, alertas, proactivo</p>
          <ul className="space-y-2">
            {AHORA.map((t) => (
              <li key={t} className="flex items-start gap-3 rounded-lg bg-superficie px-3 py-2.5 text-slate-100">
                <IconoCheck width={18} height={18} className="mt-0.5 shrink-0 text-green-300" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card titulo="Las 10 preguntas y dónde se responden" className="mt-6">
        <Table minWidth={640}>
          <Thead>
            <Th className="w-10">#</Th>
            <Th>Pregunta</Th>
            <Th>Área</Th>
            <Th>Pantalla que la responde</Th>
          </Thead>
          <tbody>
            {PREGUNTAS.map((p, i) => (
              <Tr key={p.pregunta}>
                <Td className="tabular-nums text-tenue">{i + 1}</Td>
                <Td className="text-slate-100">{p.pregunta}</Td>
                <Td>
                  <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${COLOR_AREA[p.area]}`}>{p.area}</span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {p.pantallas.map((s) => (
                      <Link key={s.texto} to={s.ruta} className="inline-flex items-center gap-1 whitespace-nowrap text-azul hover:underline">
                        {s.texto} <IconoFlecha width={14} height={14} />
                      </Link>
                    ))}
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <ButtonLink to="/" variante="primario">Empezar el recorrido <IconoFlecha width={16} height={16} /></ButtonLink>
        <ButtonLink to="/predicciones">Ver cómo funciona la IA</ButtonLink>
      </div>
    </>
  );
}
