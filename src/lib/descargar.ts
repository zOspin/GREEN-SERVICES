/** Descarga un arreglo de objetos como archivo CSV (con BOM para que Excel respete las tildes). */
export function descargarCsv(nombre: string, filas: Record<string, unknown>[]) {
  if (!filas.length) return;
  const columnas = Object.keys(filas[0]);
  const celda = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const texto = [columnas.join(','), ...filas.map((f) => columnas.map((c) => celda(f[c])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/** Descarga un CSV vacío, solo con los encabezados (la plantilla para los datos reales). */
export function descargarEncabezados(nombre: string, columnas: readonly string[]) {
  const url = URL.createObjectURL(new Blob(['﻿' + columnas.join(',') + '\n'], { type: 'text/csv;charset=utf-8' }));
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
