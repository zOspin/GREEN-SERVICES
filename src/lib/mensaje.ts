/**
 * Borrador de mensaje para el cliente, armado con plantillas.
 * El asesor lo revisa, completa los datos entre corchetes y lo envía por su canal habitual.
 */
import type { AnalisisCliente } from './analytics';

export function mensajeParaCliente(a: AnalisisCliente): { asunto: string; cuerpo: string } {
  const rec = a.productoRecomendado;
  const producto = rec ? rec.producto.nombre.replace(/\s*\(.*\)$/, '') : null;
  const saludo = `Hola, [nombre del contacto]:\n\nTe saluda [tu nombre], de Green Services and Solutions.`;
  const cierre = `\n\n¿Te parece si agendamos una llamada corta esta semana?\n\nQuedo atento,\n[tu nombre]\nGreen Services and Solutions`;

  if (rec?.tipo === 'renovacion') {
    return {
      asunto: `Renovación de ${producto}`,
      cuerpo: `${saludo} Revisando su cuenta, vimos que se acerca (o ya pasó) la fecha de renovación de ${producto}. Queremos asegurarnos de que no tengan interrupciones en el servicio y contarles las opciones de renovación y soporte disponibles.${cierre}`,
    };
  }
  if (a.estado === 'frio') {
    return {
      asunto: 'Queremos saber cómo están',
      cuerpo: `${saludo} Hace un tiempo no hablamos y queremos saber cómo les ha ido con las soluciones que tienen con nosotros y si hay algo en lo que podamos ayudar.${producto ? ` También nos gustaría contarles sobre ${producto}, que está funcionando muy bien en empresas de ${a.cliente.sector}.` : ''}${cierre}`,
    };
  }
  if (a.estado === 'riesgo') {
    return {
      asunto: producto ? `Una propuesta de ${producto} para ustedes` : 'Seguimiento de su cuenta',
      cuerpo: `${saludo} Queremos hacer seguimiento a sus necesidades de tecnología para este periodo.${producto ? ` Por lo que vemos en empresas similares de ${a.cliente.sector}, creemos que ${producto} les puede aportar mucho.` : ''} Podemos preparar una propuesta a su medida.${cierre}`,
    };
  }
  return {
    asunto: producto ? `Propuesta de ${producto}` : 'Su próxima compra',
    cuerpo: `${saludo} Según su ritmo habitual, pronto estarán planeando su próxima compra y queremos adelantarnos con una propuesta${producto ? ` que incluya ${producto}` : ''}.${cierre}`,
  };
}
