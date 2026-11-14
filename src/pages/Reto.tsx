import { Link } from 'react-router-dom';
import { Button, ButtonLink, Card, PageHeader, Table, Td, Th, Thead, Tr } from '../components/ui';
import { IconoCheck, IconoCerrar, IconoFlecha, IconoPlay } from '../components/Iconos';
import { usePresentacion } from '../lib/presentacion';
import { useDatos } from '../lib/umbrales';
import { useIdioma, type Bi } from '../lib/idioma';
import { fmtCompacto } from '../lib/format';

type Area = 'ops' | 'com' | 'fin';
const AREA: Record<Area, Bi & { clase: string }> = {
  ops: { es: 'Operaciones', en: 'Operations', clase: 'bg-azul/15 text-blue-200 border-azul/40' },
  com: { es: 'Comercial', en: 'Sales', clase: 'bg-acento/15 text-amber-200 border-acento/40' },
  fin: { es: 'Financiera', en: 'Finance', clase: 'bg-turquesa/15 text-violet-200 border-turquesa/40' },
};

const P = {
  datos: { es: 'Centro de datos', en: 'Data hub', ruta: '/datos' },
  reporte: { es: 'Reporte del mes', en: 'Monthly report', ruta: '/reporte' },
  ia: { es: '¿Cómo funciona la IA?', en: 'How the AI works', ruta: '/predicciones' },
  ficha: { es: 'Ficha del cliente', en: 'Client profile', ruta: '/clientes/CLI-023' },
  recomendacion: { es: 'Recomendación de IA', en: 'AI recommendation', ruta: '/clientes/CLI-023' },
  alertas: { es: 'Alertas', en: 'Alerts', ruta: '/alertas' },
  radar: { es: 'Radar de clientes', en: 'Client radar', ruta: '/radar' },
  clientes: { es: 'Clientes', en: 'Clients', ruta: '/clientes' },
  ventas: { es: 'Panel financiero', en: 'Finance dashboard', ruta: '/ventas' },
  inicio: { es: 'Inicio', en: 'Home', ruta: '/' },
  predicciones: { es: 'Predicciones', en: 'Predictions', ruta: '/predicciones' },
};

const PREGUNTAS: { pregunta: Bi; area: Area; pantallas: (Bi & { ruta: string })[] }[] = [
  { pregunta: { es: 'Centralizar la información de diferentes plataformas', en: 'Centralize information from different platforms' }, area: 'ops', pantallas: [P.datos] },
  { pregunta: { es: 'Reducir tareas manuales con IA', en: 'Reduce manual work with AI' }, area: 'ops', pantallas: [P.datos, P.reporte] },
  { pregunta: { es: 'Identificar patrones de compra para anticipar necesidades', en: 'Identify purchase patterns to anticipate needs' }, area: 'ops', pantallas: [P.ia, P.ficha] },
  { pregunta: { es: 'Generar reportes automáticos para decidir', en: 'Generate automatic reports for decision-making' }, area: 'ops', pantallas: [P.reporte] },
  { pregunta: { es: 'Identificar clientes que dejaron de comprar', en: 'Identify clients who stopped buying' }, area: 'com', pantallas: [P.radar, P.alertas, P.clientes] },
  { pregunta: { es: 'Predecir la próxima compra de un cliente', en: "Predict a client's next purchase" }, area: 'com', pantallas: [P.ficha] },
  { pregunta: { es: 'Conocer el historial de cada cliente para ofrecerle lo que necesita', en: "Know each client's history to offer what they need" }, area: 'com', pantallas: [P.ficha] },
  { pregunta: { es: 'Recomendar qué producto ofrecer a cada cliente', en: 'Recommend which product to offer each client' }, area: 'com', pantallas: [P.recomendacion, P.alertas] },
  { pregunta: { es: 'Analizar tendencias de compras, ventas y TRM', en: 'Analyze purchase, sales and exchange-rate trends' }, area: 'fin', pantallas: [P.ventas] },
  { pregunta: { es: 'Tener información actualizada y confiable para planificar', en: 'Have up-to-date, reliable information to plan' }, area: 'fin', pantallas: [P.inicio, P.predicciones] },
];

const ANTES: Bi[] = [
  { es: 'Datos regados en varias plataformas', en: 'Data scattered across several platforms' },
  { es: 'Consolidación manual en Excel, una vez al mes', en: 'Manual Excel consolidation, once a month' },
  { es: 'Se enteran tarde de que un cliente dejó de comprar', en: 'They find out late that a client stopped buying' },
  { es: 'Reportes armados a mano', en: 'Reports built by hand' },
  { es: 'Decisiones reactivas', en: 'Reactive decisions' },
];
const AHORA: Bi[] = [
  { es: 'Datos unidos y limpios en un solo lugar', en: 'Clean, unified data in one place' },
  { es: 'Cálculos automáticos cada vez que llegan datos', en: 'Automatic calculations whenever new data arrives' },
  { es: 'Alertas de quién contactar esta semana y por qué', en: 'Alerts on who to contact this week and why' },
  { es: 'Reporte del mes generado solo, listo para imprimir', en: 'Monthly report generated automatically, ready to print' },
  { es: 'Atención proactiva, con recomendación de qué ofrecer', en: 'Proactive service, with a recommendation of what to offer' },
];

export default function Reto() {
  const { tr, b } = useIdioma();
  const { conteoEstados, enRiesgo, resultadoBacktest, alertas } = useDatos();
  const { iniciar } = usePresentacion();
  return (
    <>
      <PageHeader
        titulo={tr('El reto', 'The challenge')}
        subtitulo={tr(
          'Green Services and Solutions SAS · Hackatón Estud-IA, Alcaldía de Medellín · Equipo Órbita',
          'Green Services and Solutions SAS · Estud-IA Hackathon, Medellín City Hall · Team Órbita',
        )}
      />

      <section className="rounded-2xl border border-acento/40 bg-tarjeta p-6 sm:p-8">
        <p className="etiqueta-seccion text-acento">{tr('Pregunta principal', 'Main question')}</p>
        <p className="mt-2 font-titulo text-2xl font-semibold leading-snug text-white sm:text-3xl">
          {tr('¿Cómo podríamos ayudar al área Comercial a ', 'How might we help the Sales team ')}
          <span className="text-acento">{tr('anticipar qué clientes están por dejar de comprar', 'anticipate which clients are about to stop buying')}</span>
          {tr(' y ', ' and ')}
          <span className="text-acento">{tr('cuándo deberían volver a hacerlo', 'when they should buy again')}</span>
          {tr(', para contactarlos a tiempo?', ', so they can reach out in time?')}
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-amber-300">{fmtCompacto(enRiesgo.total)}</p>
            <p className="text-sm text-tenue">
              {tr(
                `al año en ${conteoEstados.riesgo + conteoEstados.frio} clientes en riesgo o inactivos, detectados a tiempo`,
                `per year across ${conteoEstados.riesgo + conteoEstados.frio} at-risk or inactive clients, detected in time`,
              )}
            </p>
          </div>
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-white">{alertas.length}</p>
            <p className="text-sm text-tenue">{tr('alertas con motivo y recomendación', 'alerts with a reason and a recommendation')}</p>
          </div>
          <div className="rounded-xl bg-superficie p-4">
            <p className="font-titulo text-3xl font-bold text-green-300">{Math.round(resultadoBacktest.porcentaje * 100)} %</p>
            <p className="text-sm text-tenue">{tr('de acierto al predecir quién deja de comprar', 'accuracy predicting who stops buying')}</p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card titulo={tr('Antes', 'Before')}>
          <p className="-mt-2 mb-3 text-sm text-tenue">{tr('Excel, manual, reactivo', 'Excel, manual, reactive')}</p>
          <ul className="space-y-2">
            {ANTES.map((t) => (
              <li key={t.es} className="flex items-start gap-3 rounded-lg bg-superficie px-3 py-2.5 text-slate-300">
                <IconoCerrar width={18} height={18} className="mt-0.5 shrink-0 text-red-300" />
                {b(t)}
              </li>
            ))}
          </ul>
        </Card>
        <Card
          titulo={
            <span>
              {tr('Ahora, con ', 'Now, with ')}
              <span className="text-acento">Órbita Pulse</span>
            </span>
          }
          className="border-acento/40"
        >
          <p className="-mt-2 mb-3 text-sm text-tenue">{tr('Datos unidos, alertas, proactivo', 'Unified data, alerts, proactive')}</p>
          <ul className="space-y-2">
            {AHORA.map((t) => (
              <li key={t.es} className="flex items-start gap-3 rounded-lg bg-superficie px-3 py-2.5 text-slate-100">
                <IconoCheck width={18} height={18} className="mt-0.5 shrink-0 text-green-300" />
                {b(t)}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card titulo={tr('Las 10 preguntas y dónde se responden', 'The 10 questions and where they are answered')} className="mt-6">
        <Table minWidth={640}>
          <Thead>
            <Th className="w-10">#</Th>
            <Th>{tr('Pregunta', 'Question')}</Th>
            <Th>{tr('Área', 'Area')}</Th>
            <Th>{tr('Pantalla que la responde', 'Screen that answers it')}</Th>
          </Thead>
          <tbody>
            {PREGUNTAS.map((p, i) => (
              <Tr key={p.pregunta.es}>
                <Td className="tabular-nums text-tenue">{i + 1}</Td>
                <Td className="text-slate-100">{b(p.pregunta)}</Td>
                <Td>
                  <span className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${AREA[p.area].clase}`}>{b(AREA[p.area])}</span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {p.pantallas.map((s) => (
                      <Link key={s.es} to={s.ruta} className="inline-flex items-center gap-1 whitespace-nowrap text-azul hover:underline">
                        {b(s)} <IconoFlecha width={14} height={14} />
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
        <Button variante="primario" onClick={iniciar}>
          <IconoPlay width={16} height={16} /> {tr('Iniciar demo en vivo (Cliente 23)', 'Start live demo (Client 23)')}
        </Button>
        <ButtonLink to="/">
          {tr('Empezar el recorrido libre', 'Start a free tour')} <IconoFlecha width={16} height={16} />
        </ButtonLink>
        <ButtonLink to="/predicciones">{tr('Ver cómo funciona la IA', 'See how the AI works')}</ButtonLink>
      </div>
    </>
  );
}
