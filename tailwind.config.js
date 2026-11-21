/**
 * Los colores vienen de variables CSS (ver src/index.css), así cambian con el tema claro/oscuro.
 * Estilo: lila, morado y turquesa, como el tablero de referencia del reto.
 * Formato "R G B" para que funcionen las transparencias de Tailwind (por ejemplo bg-acento/10).
 */
const v = (nombre) => `rgb(var(--${nombre}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: v('c-fondo'),
        tarjeta: v('c-tarjeta'),
        superficie: v('c-superficie'),
        borde: v('c-borde'),
        acento: v('c-acento'),
        azul: v('c-azul'),
        turquesa: v('c-turquesa'),
        violeta: v('c-violeta'),
        'sobre-acento': v('c-sobre-acento'),
        'estado-ok': v('texto-ok'),
        'estado-riesgo': v('texto-riesgo'),
        'estado-frio': v('texto-frio'),
        ok: v('c-ok'),
        riesgo: v('c-riesgo'),
        frio: v('c-frio'),
        tenue: v('c-tenue'),
        // Textos: en modo claro "white" y "slate" se vuelven tonos oscuros.
        white: v('t-fuerte'),
        slate: { 100: v('t-100'), 200: v('t-200'), 300: v('t-300') },
        green: { 300: v('t-verde') },
        amber: { 200: v('t-ambar-suave'), 300: v('t-ambar') },
        red: { 200: v('t-rojo-suave'), 300: v('t-rojo') },
        blue: { 100: v('t-azul-suave'), 200: v('t-azul') },
        violet: { 200: v('t-violeta') },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        titulo: ['Poppins', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        tarjeta: '0 10px 30px -14px rgb(var(--c-sombra) / 0.28), 0 1px 2px rgb(var(--c-sombra) / 0.06)',
      },
    },
  },
  plugins: [],
};
