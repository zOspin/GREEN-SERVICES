/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: '#0B1020',
        tarjeta: '#121A33',
        superficie: '#1A2444',
        borde: '#22305A',
        acento: '#F59E0B',
        azul: '#3B82F6',
        ok: '#22C55E',
        riesgo: '#F59E0B',
        frio: '#EF4444',
        tenue: '#94A3C4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        titulo: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
