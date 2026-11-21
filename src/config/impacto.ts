/**
 * Métrica de impacto: cuánto tiempo toma hoy consolidar el mes y cuánto con Órbita.
 * NO inventamos el dato de la empresa: mientras sea `null`, la web muestra «[por confirmar con Green Services]».
 * Cuando Green Services confirme cuántas horas toma hoy, escribe el número aquí (por ejemplo 16).
 */
export const IMPACTO: { horasConsolidacionManual: number | null; minutosConOrbita: number } = {
  horasConsolidacionManual: null,
  minutosConOrbita: 5,
};
