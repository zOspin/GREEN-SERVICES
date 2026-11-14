/** Lectura y guardado seguro de preferencias en el navegador (puede fallar en modo privado). */
export function leerPreferencia<T extends string>(clave: string, validos: readonly T[], porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v && (validos as readonly string[]).includes(v) ? (v as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export function guardarPreferencia(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    /* sin almacenamiento: la preferencia dura solo esta visita */
  }
}
