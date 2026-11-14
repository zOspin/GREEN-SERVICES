/**
 * Los colores vienen de variables CSS (ver src/index.css), así cambian con el tema claro/oscuro.
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
        titulo: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
