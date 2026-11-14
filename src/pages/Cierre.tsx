import { ButtonLink } from '../components/ui';
import Logo from '../components/Logo';
import { CLIENTE_DEMO, HOY } from '../lib/datos';
import { valorAnual } from '../lib/analytics';
import { useDatos } from '../lib/umbrales';
import { useIdioma } from '../lib/idioma';
import { fmtUsd } from '../lib/format';
import { producto } from '../lib/catalogo';

/** Cierre de la demo: «Llamar hoy al Cliente 23 = USD X recuperados». */
export default function Cierre() {
  const { idioma, tr } = useIdioma();
  const { analisisPorId, resultadoBacktest } = useDatos();
  const a = analisisPorId.get(CLIENTE_DEMO);
  if (!a) return null;
  const anual = valorAnual(a, HOY);
  const rec = a.productoRecomendado;
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Logo size={84} />
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-acento">{tr('Demo en vivo · cierre', 'Live demo · closing')}</p>
      <h1 className="mt-4 max-w-4xl font-titulo text-4xl font-bold leading-tight sm:text-6xl">
        {tr(`Llamar hoy al ${a.cliente.nombre} = `, `Calling ${a.cliente.nombre} today = `)}
        <span className="text-acento">{fmtUsd(anual)}</span> {tr('recuperados al año', 'won back per year')}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-slate-300">
        {rec &&
          tr(
            `Empezando por la renovación de ${producto(rec.producto.nombre, idioma)} (${fmtUsd(rec.valorEstimado)}). Y así con cada cliente, cada semana, sin esperar el Excel del mes.`,
            `Starting with the ${producto(rec.producto.nombre, idioma)} renewal (${fmtUsd(rec.valorEstimado)}). And so with every client, every week, without waiting for the monthly spreadsheet.`,
          )}
      </p>
      <div className="mt-8 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-borde bg-tarjeta p-4">
          <p className="font-titulo text-3xl font-bold text-white">{Math.round(resultadoBacktest.porcentaje * 100)} %</p>
          <p className="text-sm text-tenue">{tr('de acierto en la prueba de 60 días', 'accuracy in the 60-day test')}</p>
        </div>
        <div className="rounded-2xl border border-borde bg-tarjeta p-4">
          <p className="font-titulo text-3xl font-bold text-white">~5 min</p>
          <p className="text-sm text-tenue">{tr('para unir los datos del mes', 'to merge the month’s data')}</p>
        </div>
        <div className="rounded-2xl border border-borde bg-tarjeta p-4">
          <p className="font-titulo text-xl font-bold leading-tight text-white">{tr('La IA sugiere, la persona decide', 'AI suggests, people decide')}</p>
          <p className="mt-1 text-sm text-tenue">{tr('nada se envía solo al cliente', 'nothing is sent to clients automatically')}</p>
        </div>
      </div>
      <p className="mt-10 font-titulo text-2xl font-semibold">
        Órbita <span className="text-acento">Pulse</span>
      </p>
      <p className="text-tenue">{tr('Inteligencia que gira a tu alrededor', 'Intelligence that revolves around you')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <ButtonLink to={`/clientes/${CLIENTE_DEMO}`}>{tr('Ver la ficha del cliente', 'Open the client profile')}</ButtonLink>
        <ButtonLink to="/" variante="primario">
          {tr('Ir al inicio', 'Go home')}
        </ButtonLink>
      </div>
    </section>
  );
}
