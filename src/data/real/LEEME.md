# Datos reales (modo Real)

Esta carpeta es para los **datos reales anonimizados** de Green Services. Hoy está vacía: por eso el modo **Real** de la web muestra todo en cero.

Cuando lleguen los datos, se llenan estos archivos con el mismo formato que los de `src/data/` (los del modo Demo):

| Archivo | Qué contiene |
|---|---|
| `clientes.json` | Lista de clientes (`id`, `nombre` anonimizado como «Cliente 23», `sector`, `ciudad`, `fecha_primera_compra`, `es_base_instalada`). |
| `productos.json` | Catálogo (`id`, `nombre`, `categoria`, `precio_usd`, `tipo`). |
| `ventas.json` | Una fila por venta (`id`, `fecha`, `id_cliente`, `id_producto`, `cantidad`, `valor_usd`, `valor_cop`). |
| `trm.json` | TRM diaria (`fecha`, `valor`). |
| `meta.json` | `fecha_corte` (el «hoy» de los datos) y `fecha_inicio`. Si `fecha_corte` es `null`, se usa la fecha de hoy. |

**Nunca** pongas aquí nombres reales de clientes ni datos de contacto.
