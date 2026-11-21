/** Pruebas del modelo predictivo (regresión logística) y de su validación. */
import { describe, expect, it } from 'vitest';
import { entrenarLogistica, entrenarModelo, metricas, prioridadDesde, validarVariosMeses } from '../../src/lib/modelo';
import { generarDatos } from '../../src/lib/generador';
import { clientes, HOY, productos, ventas } from './demo';

describe('metricas', () => {
  it('calcula precisión, exhaustividad y F1 de una matriz conocida', () => {
    // 8 VP, 2 FP, 2 FN, 8 VN
    const pares = [
      ...Array(8).fill({ predijo: true, compro: true }),
      ...Array(2).fill({ predijo: true, compro: false }),
      ...Array(2).fill({ predijo: false, compro: true }),
      ...Array(8).fill({ predijo: false, compro: false }),
    ];
    const m = metricas(pares);
    expect(m.precision).toBeCloseTo(0.8);
    expect(m.exhaustividad).toBeCloseTo(0.8);
    expect(m.f1).toBeCloseTo(0.8);
    expect(m.exactitud).toBeCloseTo(0.8);
  });
  it('no divide entre cero', () => expect(metricas([]).f1).toBe(0));
});

describe('entrenarLogistica', () => {
  it('aprende una relación simple (más x → más probabilidad)', () => {
    const filas = Array.from({ length: 200 }, (_, i) => ({ x: [i / 200], y: i >= 100 ? 1 : 0 }));
    const m = entrenarLogistica(filas);
    expect(m.w[0]).toBeGreaterThan(1);
  });
});

describe('prioridadDesde', () => {
  it('Alta desde 0,6; Media desde 0,35', () => {
    expect([prioridadDesde(0.7), prioridadDesde(0.5), prioridadDesde(0.2)]).toEqual(['alta', 'media', 'baja']);
  });
});

describe('entrenarModelo (demo original)', () => {
  const r = entrenarModelo(clientes, ventas, productos, HOY);

  it('se entrena y predice para todos los clientes con probabilidades entre 0 y 1', () => {
    expect(r.entrenado).toBe(true);
    expect(r.predicciones.size).toBe(60);
    for (const p of r.predicciones.values()) expect(p.probabilidad).toBeGreaterThanOrEqual(0), expect(p.probabilidad).toBeLessThanOrEqual(1);
  });
  it('es determinista: mismo resultado cada vez', () => {
    const otra = entrenarModelo(clientes, ventas, productos, HOY);
    expect(otra.predicciones.get('CLI-023')!.probabilidad).toBe(r.predicciones.get('CLI-023')!.probabilidad);
  });
  it('la validación usa la foto de hace 30 días y detecta a la mayoría de compradores', () => {
    const v = r.validacion!;
    expect(v.fecha).toBe('2026-10-15');
    expect(v.detalle).toHaveLength(60);
    expect(v.modelo.exhaustividad).toBeGreaterThan(0.8);
    expect(v.modelo.vp + v.modelo.fp + v.modelo.fn + v.modelo.vn).toBe(60);
  });
  it('la validación no mira el futuro: el modelo de prueba se entrena solo con fotos anteriores', () => {
    expect(r.validacion!.filasEntrenamiento).toBeLessThanOrEqual(r.filasEntrenamiento);
  });
});

describe('entrenarModelo (otros casos)', () => {
  it('funciona con una demo al azar', () => {
    const d = generarDatos(4242);
    const r = entrenarModelo(d.clientes, d.ventas, d.productos, HOY);
    expect(r.entrenado).toBe(true);
    expect(r.validacion!.modelo.f1).toBeGreaterThan(0.5);
  });
  it('sin datos no se entrena y explica por qué', () => {
    const r = entrenarModelo([], [], [], HOY);
    expect(r.entrenado).toBe(false);
    expect(r.motivo?.es).toMatch(/más datos/);
  });
});

describe('validarVariosMeses (validación en 6 meses)', () => {
  const vm = validarVariosMeses(clientes, ventas, productos, HOY, 6)!;
  it('valida en 6 meses distintos, uno cada 30 días', () => {
    expect(vm.ventanas).toHaveLength(6);
    expect(vm.ventanas[0].fecha).toBe('2026-10-15');
    expect(vm.ventanas[1].fecha).toBe('2026-09-15');
  });
  it('en promedio el modelo supera a la regla base (F1) en la demo', () => {
    expect(vm.promedio.modelo.f1).toBeGreaterThan(vm.promedio.regla.f1);
    expect(vm.ganaModelo).toBeGreaterThanOrEqual(4);
  });
  it('la primera ventana coincide con la validación del último mes', () => {
    const r = entrenarModelo(clientes, ventas, productos, HOY);
    expect(vm.ventanas[0].modelo.f1).toBeCloseTo(r.validacion!.modelo.f1);
  });
});
