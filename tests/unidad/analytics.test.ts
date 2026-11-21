/** Pruebas de los indicadores comerciales y del estado de cada cliente. */
import { describe, expect, it } from 'vitest';
import { analizarClientes, backtest, estadoDesde, generarAlertas, pronosticarVentas } from '../../src/lib/analytics';
import { UMBRALES } from '../../src/config/umbrales';
import { clientes, HOY, productos, trm, ventas } from './demo';

describe('estadoDesde', () => {
  it('usa los umbrales 1,2× y 2× su ritmo', () => {
    expect(estadoDesde(1, 30)).toBe('activo');
    expect(estadoDesde(1.5, 45)).toBe('riesgo');
    expect(estadoDesde(2.5, 75)).toBe('frio');
  });
  it('más de 180 días sin comprar es inactivo aunque su ritmo sea lento', () => expect(estadoDesde(1, 200)).toBe('frio'));
  it('respeta umbrales personalizados', () => expect(estadoDesde(1.5, 45, { ...UMBRALES, riesgo: 1.6 })).toBe('activo'));
});

describe('analizarClientes (demo original)', () => {
  const analisis = analizarClientes(clientes, ventas, productos, trm, HOY);
  const c23 = analisis.find((a) => a.cliente.id === 'CLI-023')!;

  it('analiza a los 60 clientes con 30 activos, 10 en riesgo y 20 inactivos', () => {
    expect(analisis).toHaveLength(60);
    const n = (e: string) => analisis.filter((a) => a.estado === e).length;
    expect([n('activo'), n('riesgo'), n('frio')]).toEqual([30, 10, 20]);
  });
  it('Cliente 23: compra cada ~30 días, lleva 50 sin comprar y está en riesgo', () => {
    expect(Math.round(c23.ciclo)).toBe(30);
    expect(c23.recencia).toBe(50);
    expect(c23.estado).toBe('riesgo');
    expect(c23.productoRecomendado?.tipo).toBe('renovacion');
    expect(c23.productoRecomendado?.valorEstimado).toBe(4800);
  });
  it('los puntajes de riesgo están entre 0 y 100', () => {
    for (const a of analisis) expect(a.puntaje).toBeGreaterThanOrEqual(0), expect(a.puntaje).toBeLessThanOrEqual(100);
  });
  it('genera alertas ordenadas por prioridad', () => {
    const al = generarAlertas(analisis, HOY);
    expect(al.length).toBeGreaterThan(0);
    for (let i = 1; i < al.length; i++) expect(al[i - 1].prioridad).toBeGreaterThanOrEqual(al[i].prioridad);
  });
  it('el backtest de 60 días acierta 7 de 8', () => {
    const b = backtest(clientes, ventas, productos, trm, HOY, 60);
    expect([b.aciertos, b.marcados]).toEqual([7, 8]);
  });
});

describe('sin datos (modo Real vacío)', () => {
  it('no falla y todo queda en cero', () => {
    expect(analizarClientes([], [], [], [], HOY)).toEqual([]);
    expect(pronosticarVentas([], HOY).valor).toBe(0);
    expect(backtest([], [], [], [], HOY, 60).marcados).toBe(0);
  });
});
