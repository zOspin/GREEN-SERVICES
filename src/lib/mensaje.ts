/**
 * Borrador de mensaje para el cliente, armado con plantillas (español o inglés).
 * El asesor lo revisa, completa los datos entre corchetes y lo envía por su canal habitual.
 */
import type { AnalisisCliente } from './analytics';
import { producto as prod, sector as sec } from './catalogo';

export function mensajeParaCliente(a: AnalisisCliente, i: 'es' | 'en'): { asunto: string; cuerpo: string } {
  const es = i === 'es';
  const rec = a.productoRecomendado;
  const producto = rec ? prod(rec.producto.nombre, i).replace(/\s*\(.*\)$/, '') : null;
  const sector = sec(a.cliente.sector, i);
  const saludo = es
    ? `Hola, [nombre del contacto]:\n\nTe saluda [tu nombre], de Green Services and Solutions.`
    : `Hi [contact name],\n\nThis is [your name] from Green Services and Solutions.`;
  const cierre = es
    ? `\n\n¿Te parece si agendamos una llamada corta esta semana?\n\nQuedo atento,\n[tu nombre]\nGreen Services and Solutions`
    : `\n\nWould you be open to a short call this week?\n\nBest regards,\n[your name]\nGreen Services and Solutions`;

  if (rec?.tipo === 'renovacion') {
    return es
      ? {
          asunto: `Renovación de ${producto}`,
          cuerpo: `${saludo} Revisando su cuenta, vimos que se acerca (o ya pasó) la fecha de renovación de ${producto}. Queremos asegurarnos de que no tengan interrupciones en el servicio y contarles las opciones de renovación y soporte disponibles.${cierre}`,
        }
      : {
          asunto: `${producto} renewal`,
          cuerpo: `${saludo} Reviewing your account, we noticed that the renewal date for ${producto} is coming up (or has passed). We want to make sure your service isn't interrupted and walk you through the renewal and support options.${cierre}`,
        };
  }
  if (a.estado === 'frio') {
    return es
      ? {
          asunto: 'Queremos saber cómo están',
          cuerpo: `${saludo} Hace un tiempo no hablamos y queremos saber cómo les ha ido con las soluciones que tienen con nosotros y si hay algo en lo que podamos ayudar.${producto ? ` También nos gustaría contarles sobre ${producto}, que está funcionando muy bien en empresas de ${sector}.` : ''}${cierre}`,
        }
      : {
          asunto: 'Checking in',
          cuerpo: `${saludo} It's been a while since we last spoke, and we'd like to know how the solutions you have with us are working and whether there's anything we can help with.${producto ? ` We'd also love to tell you about ${producto}, which is working very well for ${sector} companies.` : ''}${cierre}`,
        };
  }
  if (a.estado === 'riesgo') {
    return es
      ? {
          asunto: producto ? `Una propuesta de ${producto} para ustedes` : 'Seguimiento de su cuenta',
          cuerpo: `${saludo} Queremos hacer seguimiento a sus necesidades de tecnología para este periodo.${producto ? ` Por lo que vemos en empresas similares de ${sector}, creemos que ${producto} les puede aportar mucho.` : ''} Podemos preparar una propuesta a su medida.${cierre}`,
        }
      : {
          asunto: producto ? `A ${producto} proposal for you` : 'Following up on your account',
          cuerpo: `${saludo} We'd like to follow up on your technology needs for this period.${producto ? ` Based on what we see at similar ${sector} companies, we think ${producto} could add a lot of value.` : ''} We can prepare a proposal tailored to you.${cierre}`,
        };
  }
  return es
    ? {
        asunto: producto ? `Propuesta de ${producto}` : 'Su próxima compra',
        cuerpo: `${saludo} Según su ritmo habitual, pronto estarán planeando su próxima compra y queremos adelantarnos con una propuesta${producto ? ` que incluya ${producto}` : ''}.${cierre}`,
      }
    : {
        asunto: producto ? `${producto} proposal` : 'Your next purchase',
        cuerpo: `${saludo} Based on your usual cycle, you'll soon be planning your next purchase, and we'd like to get ahead with a proposal${producto ? ` that includes ${producto}` : ''}.${cierre}`,
      };
}
