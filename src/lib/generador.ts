/**
 * Generador de datos sintéticos para el modo Demo de Órbita.
 *
 * Todo es inventado: no hay ningún dato real de clientes.
 * Con la misma semilla produce siempre los mismos datos. La semilla 2026 es la demo «original»
 * (la del guion de la presentación); el botón «Generar otra demo al azar» usa otra semilla.
 * El Cliente 23 sigue siempre el mismo patrón, para que la historia de la demo funcione con cualquier semilla.
 *
 * Lo usan la web (en el navegador) y scripts/generate-data.ts (para escribir src/data/ y public/ejemplos/).
 */

/** Semilla de la demo original. */
export const SEMILLA_ORIGINAL = 2026;
/** El «hoy» de la demo. */
export const FECHA_CORTE_DEMO = '2026-11-14';
const DIAS_HISTORIA = 548; // ~18 meses

export function generarDatos(semilla: number = SEMILLA_ORIGINAL, fechaCorte: string = FECHA_CORTE_DEMO) {
  // ---------- Generador pseudoaleatorio con semilla (mulberry32) ----------
  let estado = semilla;
  function azar(): number {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const entre = (min: number, max: number) => min + azar() * (max - min);
  const entero = (min: number, max: number) => Math.floor(entre(min, max + 1));
  const elegir = <T,>(lista: readonly T[]): T => lista[Math.floor(azar() * lista.length)];
  function barajar<T>(lista: T[]): T[] {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(azar() * (i + 1));
      [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
  }

  // ---------- Fechas ----------
  const DIA = 86_400_000;
  const hoy = new Date(`${fechaCorte}T00:00:00Z`).getTime();
  const inicio = hoy - DIAS_HISTORIA * DIA;
  const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
  const diaIndice = (t: number) => Math.round((t - inicio) / DIA);

  // ---------- TRM diaria ----------
  // Paseo aleatorio con reversión a la media, acotado entre 3.800 y 4.400.
  // En los últimos ~35 días forzamos una subida para que se vea el ajuste por TRM.
  const trm: { fecha: string; valor: number }[] = [];
  let valorTrm = 4050;
  for (let d = 0; d <= DIAS_HISTORIA; d++) {
    const diasParaHoy = DIAS_HISTORIA - d;
    const media = 4050;
    let deriva = (media - valorTrm) * 0.02;
    if (diasParaHoy === 40) valorTrm = Math.min(valorTrm, 3960);
    if (diasParaHoy <= 35) deriva = 8; // subida reciente del dólar
    valorTrm += deriva + entre(-18, 18);
    valorTrm = Math.max(3800, Math.min(4400, valorTrm));
    trm.push({ fecha: iso(inicio + d * DIA), valor: Math.round(valorTrm * 100) / 100 });
  }
  const trmDe = (t: number) => trm[Math.max(0, Math.min(trm.length - 1, diaIndice(t)))].valor;

  // ---------- Productos ----------
  const CATEGORIAS = ['Redes', 'Nube', 'Ciberseguridad', 'Hardware', 'Software', 'Almacenamiento'] as const;
  const catalogo: [string, (typeof CATEGORIAS)[number], number][] = [
    ['Switch administrable 48 puertos', 'Redes', 3200],
    ['Access point Wi-Fi 6', 'Redes', 450],
    ['Router empresarial SD-WAN', 'Redes', 5800],
    ['Cableado estructurado (punto)', 'Redes', 120],
    ['Suscripción nube privada (mes)', 'Nube', 2400],
    ['Migración a la nube', 'Nube', 9500],
    ['Respaldo en la nube (TB/año)', 'Nube', 900],
    ['Firewall de nueva generación', 'Ciberseguridad', 7400],
    ['Antivirus empresarial (licencia)', 'Ciberseguridad', 60],
    ['Auditoría de seguridad', 'Ciberseguridad', 6500],
    ['Servidor rack 2U', 'Hardware', 8900],
    ['Portátil corporativo', 'Hardware', 1300],
    ['Estación de trabajo', 'Hardware', 2100],
    ['Licencia ofimática (usuario/año)', 'Software', 150],
    ['Licencia de virtualización', 'Software', 3800],
    ['Soporte y mesa de ayuda (mes)', 'Software', 1800],
    ['Arreglo de almacenamiento NAS', 'Almacenamiento', 6200],
    ['Discos SSD empresariales', 'Almacenamiento', 480],
    ['Almacenamiento SAN', 'Almacenamiento', 14500],
    ['Unidad de cintas de respaldo', 'Almacenamiento', 3900],
  ];
  // Servicios que se renuevan periódicamente (licencias, suscripciones, soporte).
  const RECURRENTES = new Set([
    'Suscripción nube privada (mes)',
    'Respaldo en la nube (TB/año)',
    'Antivirus empresarial (licencia)',
    'Licencia ofimática (usuario/año)',
    'Licencia de virtualización',
    'Soporte y mesa de ayuda (mes)',
  ]);
  const productos = catalogo.map(([nombre, categoria, precio_usd], i) => ({
    id: `PRD-${String(i + 1).padStart(3, '0')}`,
    nombre,
    categoria,
    precio_usd,
    tipo: RECURRENTES.has(nombre) ? 'servicio recurrente' : 'producto',
  }));

  // ---------- Clientes ----------
  const SECTORES = ['salud', 'educación', 'retail', 'manufactura', 'gobierno', 'financiero'] as const;
  const CIUDADES = ['Medellín', 'Medellín', 'Medellín', 'Bogotá', 'Bogotá', 'Cali', 'Quito', 'Miami', 'San Juan'] as const;

  type Perfil = 'frecuente' | 'frenado' | 'frio' | 'ocasional';
  const perfiles: Perfil[] = barajar([
    ...Array<Perfil>(25).fill('frecuente'),
    ...Array<Perfil>(15).fill('frenado'),
    ...Array<Perfil>(10).fill('frio'),
    ...Array<Perfil>(10).fill('ocasional'),
  ]);

  type Venta = {
    id: string;
    fecha: string;
    id_cliente: string;
    id_producto: string;
    cantidad: number;
    valor_usd: number;
    valor_cop: number;
  };
  const ventasSinId: Omit<Venta, 'id'>[] = [];

  /** Elige un producto, con preferencia por las categorías favoritas del cliente. */
  function comprar(idCliente: string, t: number, favoritas: string[]) {
    const pool = azar() < 0.8 ? productos.filter((p) => favoritas.includes(p.categoria)) : productos;
    const n = azar() < 0.35 ? 2 : 1; // a veces compran dos productos el mismo día
    for (let k = 0; k < n; k++) {
      const p = elegir(pool);
      const cantidad = p.precio_usd < 500 ? entero(5, 40) : p.precio_usd < 3000 ? entero(1, 8) : entero(1, 2);
      const valor_usd = Math.round(p.precio_usd * cantidad * entre(0.92, 1.05) * 100) / 100;
      ventasSinId.push({
        fecha: iso(t),
        id_cliente: idCliente,
        id_producto: p.id,
        cantidad,
        valor_usd,
        valor_cop: Math.round(valor_usd * trmDe(t)),
      });
    }
  }

  let frenadosVistos = 0;
  const clientes = perfiles.map((perfil, i) => {
    const id = `CLI-${String(i + 1).padStart(3, '0')}`;
    const favoritas = barajar([...CATEGORIAS]).slice(0, entero(1, 2));
    const fechas: number[] = [];

    if (perfil === 'frecuente') {
      // Compra con un ciclo regular de 20 a 45 días hasta hoy.
      const ciclo = entero(20, 45);
      let t = inicio + entero(0, 60) * DIA;
      while (t <= hoy) {
        fechas.push(t);
        t += Math.round(ciclo * entre(0.85, 1.15)) * DIA;
      }
    } else if (perfil === 'frenado') {
      // Compraba con regularidad, empezó a espaciar sus compras y se detuvo.
      // 9 se frenaron hace poco (hoy están "en riesgo"); 6 se frenaron hace 3–4 meses
      // (hace 60 días ya se veían atrasados; esto le da material al backtest).
      const ciclo = entero(25, 42);
      frenadosVistos++;
      const recenciaFinal =
        frenadosVistos <= 6
          ? Math.round(ciclo * entre(1.3, 1.6)) + 60
          : Math.round(ciclo * entre(1.35, 1.9));
      const ultima = hoy - recenciaFinal * DIA;
      let t = ultima;
      const atras: number[] = [t];
      // Las últimas dos compras ya venían más espaciadas (señal de enfriamiento).
      const factores = [entre(1.3, 1.6), entre(1.1, 1.3)];
      let paso = 0;
      while (t > inicio + 30 * DIA) {
        const f = factores[paso] ?? entre(0.85, 1.15);
        t -= Math.round(ciclo * f) * DIA;
        if (t >= inicio) atras.push(t);
        paso++;
      }
      fechas.push(...atras.reverse());
    } else if (perfil === 'frio') {
      // Fue cliente regular hace tiempo; lleva más de 6 meses sin comprar.
      const ciclo = entero(30, 60);
      const ultima = hoy - entero(190, 400) * DIA;
      const n = entero(3, 7);
      for (let k = n - 1; k >= 0; k--) {
        const t = ultima - Math.round(k * ciclo * entre(0.9, 1.1)) * DIA;
        if (t >= inicio) fechas.push(t);
      }
    } else {
      // Ocasional: pocas compras en fechas sueltas.
      const n = entero(2, 6);
      const dias = new Set<number>();
      while (dias.size < n) dias.add(entero(0, DIAS_HISTORIA));
      fechas.push(...[...dias].sort((a, b) => a - b).map((d) => inicio + d * DIA));
    }

    fechas.forEach((t) => comprar(id, t, favoritas));

    const baseProb = perfil === 'frecuente' ? 0.6 : perfil === 'frenado' ? 0.5 : 0.25;
    return {
      id,
      nombre: `Cliente ${String(i + 1).padStart(2, '0')}`,
      sector: elegir(SECTORES),
      ciudad: elegir(CIUDADES),
      fecha_primera_compra: iso(Math.min(...fechas)),
      es_base_instalada: azar() < baseProb,
    };
  });

  // ---------- Historia de la demo: Cliente 23 ----------
  // Cliente de base instalada que compraba una suscripción de nube cada ~30 días y lleva ~50 días
  // sin comprar (≈1,7× su ritmo → «en riesgo»), con la renovación vencida.
  // Se escribe con un patrón fijo (sin el generador aleatorio) para no alterar al resto de clientes.
  const DEMO = 'CLI-023';
  const DIAS_SIN_COMPRAR_DEMO = 50;
  {
    for (let k = ventasSinId.length - 1; k >= 0; k--) if (ventasSinId[k].id_cliente === DEMO) ventasSinId.splice(k, 1);
    const porNombre = (n: string) => productos.find((p) => p.nombre === n)!;
    const nube = porNombre('Suscripción nube privada (mes)');
    const extras = ['Soporte y mesa de ayuda (mes)', 'Firewall de nueva generación', 'Respaldo en la nube (TB/año)', 'Licencia ofimática (usuario/año)'].map(porNombre);
    const desvio = [0, 2, -1, 1, -2, 3, -1, 0, 2, -3, 1, -1]; // pequeñas variaciones fijas alrededor de 30 días
    const fechasDemo: number[] = [];
    let t = hoy - DIAS_SIN_COMPRAR_DEMO * DIA;
    for (let k = 0; t >= inicio + 20 * DIA; k++) {
      fechasDemo.unshift(t);
      t -= (30 + desvio[k % desvio.length]) * DIA;
    }
    fechasDemo.forEach((f, k) => {
      const lineas: [typeof nube, number][] = [[nube, 2]]; // 2 suscripciones = USD 4.800 por compra
      const esUltima = k === fechasDemo.length - 1;
      if (!esUltima && k % 3 === 1) lineas.push([extras[k % extras.length], extras[k % extras.length].precio_usd < 500 ? 12 : 1]);
      for (const [p, cantidad] of lineas) {
        const valor_usd = Math.round(p.precio_usd * cantidad * 100) / 100;
        ventasSinId.push({ fecha: iso(f), id_cliente: DEMO, id_producto: p.id, cantidad, valor_usd, valor_cop: Math.round(valor_usd * trmDe(f)) });
      }
    });
    const c = clientes.find((x) => x.id === DEMO)!;
    c.es_base_instalada = true;
    c.ciudad = 'Medellín';
    c.fecha_primera_compra = iso(fechasDemo[0]);
  }

  const ventas: Venta[] = ventasSinId
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id_cliente.localeCompare(b.id_cliente))
    .map((v, i) => ({ id: `VEN-${String(i + 1).padStart(5, '0')}`, ...v }));

  const meta = {
    fecha_corte: fechaCorte,
    fecha_inicio: iso(inicio),
    semilla,
    meses_historia: 18,
    generado_por: 'src/lib/generador.ts',
    nota: 'Datos 100 % sintéticos. No corresponden a clientes reales.',
  };

  return {
    clientes,
    productos,
    ventas,
    trm,
    meta,
    // Lo siguiente lo usa el script para escribir los archivos de ejemplo con el mismo generador.
    extra: { azar, entero, trmDe, hoy, iso, DIA, DEMO, perfiles },
  };
}
export type DatosGenerados = ReturnType<typeof generarDatos>;
