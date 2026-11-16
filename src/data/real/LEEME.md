# Datos reales (modo Real)

Hoy no hay datos reales: por eso el modo **Real** de la web muestra todo en cero.

## Forma fácil (recomendada): desde la página

1. Activa el modo **Real** en el menú (selector «Datos»).
2. Ve a **Centro de datos** y pulsa **Descargar plantilla** (solo trae los encabezados).
3. Llénala con la exportación de Green Services, o sube los archivos tal como salen de cada sistema: Órbita Pulse reconoce columnas con otros nombres.
4. Pulsa **«Usar estos datos en modo Real»**.

Los datos quedan guardados **solo en ese navegador** (no se suben a internet ni a GitHub). Para quitarlos: **Borrar datos reales**.

## Forma fija: en esta carpeta

Si se quiere que los datos reales vengan dentro del proyecto (no recomendado si son confidenciales), se llenan estos archivos con el mismo formato que los de `src/data/` (los del modo Demo). Se usan solo si el navegador no tiene datos reales guardados:

| Archivo | Qué contiene |
|---|---|
| `clientes.json` | Lista de clientes (`id`, `nombre` anonimizado como «Cliente 23», `sector`, `ciudad`, `fecha_primera_compra`, `es_base_instalada`). |
| `productos.json` | Catálogo (`id`, `nombre`, `categoria`, `precio_usd`, `tipo`). |
| `ventas.json` | Una fila por venta (`id`, `fecha`, `id_cliente`, `id_producto`, `cantidad`, `valor_usd`, `valor_cop`). |
| `trm.json` | TRM diaria (`fecha`, `valor`). |
| `meta.json` | `fecha_corte` (el «hoy» de los datos) y `fecha_inicio`. Si `fecha_corte` es `null`, se usa la fecha de hoy. |

**Nunca** pongas aquí nombres reales de clientes ni datos de contacto.
