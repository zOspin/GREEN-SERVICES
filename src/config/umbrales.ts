/**
 * Umbrales que definen el estado de cada cliente.
 * Son valores iniciales razonables y deben VALIDARSE CON GREEN SERVICES.
 * En la pantalla «Configuración» (/configuracion) se pueden mover en vivo para ver el efecto.
 *
 * ratio = días sin comprar ÷ ciclo normal del cliente
 *   - Activo:    ratio ≤ riesgo
 *   - En riesgo: ratio entre riesgo e inactivo
 *   - Inactivo:  ratio > inactivo, o más de diasMaximosSinComprar días sin comprar
 */
export interface Umbrales {
  riesgo: number;
  inactivo: number;
  diasMaximosSinComprar: number;
}

export const UMBRALES: Umbrales = {
  riesgo: 1.2,
  inactivo: 2.0,
  diasMaximosSinComprar: 180,
};
