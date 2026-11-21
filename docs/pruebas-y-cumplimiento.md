# Pruebas y cumplimiento

Estado del prototipo Órbita a 21/11/2026. Todo se puede repetir con los comandos de abajo.

## 1. Cumplimiento de lo solicitado

### Los 7 puntos del reto
| Pide el reto | Estado | Dónde |
|---|---|---|
| Cargar los datos de los clientes | ✅ | Centro de datos: ventas, lista de clientes y TRM (CSV o Excel), plantilla, modo Real |
| Integrar el historial de ventas | ✅ | Centro de datos: une varias fuentes, quita duplicados y ventas anuladas |
| Calcular indicadores comerciales | ✅ | Resumen general, Clientes, Panel financiero, Reporte |
| Entrenar un modelo predictivo | ✅ | Regresión logística entrenada en el navegador (`src/lib/modelo.ts`) |
| Identificar clientes con probabilidad de compra | ✅ | Prob. compra a 30 días y prioridad en Resumen, Clientes y Ficha |
| Mostrar los resultados | ✅ | 14 pantallas con el estilo del tablero del reto |
| Validar las predicciones | ✅ | Evaluación del modelo: 6 meses, comparación con regla base, detalle por cliente |

### Los 3 documentos de requisitos
Revisados punto por punto (pantallas, datos, lógica de IA, Cliente 23, umbrales, impacto, privacidad, preguntas del jurado, capturas, documentos). Diferencias decididas y anotadas en `docs/decisiones.md`:
- **Estilo**: los documentos pedían azul oscuro con dorado; el equipo pidió después el estilo lila/morado/turquesa del tablero del reto (claro por defecto, oscuro disponible).
- **Nombre**: «Órbita» en lugar de «Órbita Pulse», a pedido del equipo.
- **«Frío»** se muestra como **«Inactivo»** (decisión 4).

## 2. Resultados del modelo (datos de la demo, inventados)

Validación en 6 meses (cada mes: entrenar solo con el pasado, predecir los 30 días siguientes y comparar con lo que pasó).

| | Precisión | Exhaustividad | F1 | Exactitud |
|---|---|---|---|---|
| **Modelo** (promedio) | 74,8 % | 95,4 % | **83,3 %** | 81,1 % |
| Regla base: «compró en los últimos 30 días» | 72,8 % | 79,0 % | 75,5 % | — |

El modelo iguala o supera a la regla base en **5 de 6 meses**. Con datos reales esta misma validación se recalcula sola [por confirmar con Green Services].

## 3. Pruebas automáticas

| Tipo | Cantidad | Comando |
|---|---|---|
| Unitarias (lógica, sin navegador) | 50 | `npm test` |
| Interfaz (navegador real) | 105 | `npm run test:e2e` |

Las pruebas de interfaz incluyen:
- **Todas las pantallas** abren sin errores ni textos rotos (NaN, undefined).
- **Flujos**: idioma, tema, menú, Centro de datos, modo Real (subir, usar y borrar datos, con un cliente sin compras), demo al azar, demo en vivo de 5 pasos, evaluación del modelo.
- **Accesibilidad (WCAG 2.1 AA, con axe)**: las 14 pantallas en tema claro y oscuro, sin problemas.

## 4. Dispositivos (emulados)

| Perfil | Pantalla | Resultado |
|---|---|---|
| Windows (portátil común) | 1920×1080 al 125 % | ✅ |
| Windows (portátil básico) | 1366×768 | ✅ |
| Monitor | 1920×1080 | ✅ |
| iPad | vertical y horizontal | ✅ |
| Android | Pixel 7 y Galaxy S8 (360 px) | ✅ |
| iPhone | iPhone 13 y iPhone SE | ✅ |

En cada perfil se revisa: todas las pantallas sin errores, sin desplazamiento horizontal, idioma y tema visibles sin bajar, navegación funcionando y botones táctiles de al menos 24 px.
**Límite:** son emulaciones con el motor de Chrome (también el de Edge). **Safari real en iPhone no se ha probado**: hay que abrir la web publicada en un iPhone.

## 5. Rendimiento

Medido como un celular con 4G y procesador 4 veces más lento.

| Pantalla | Antes | Ahora |
|---|---|---|
| Resumen general | 3,5 s · 924 KB de JS | **2,0 s · 399 KB** |
| Clientes | 3,5 s | **2,1 s** |
| Evaluación del modelo | 3,0 s | **2,4 s** |
| Centro de datos | 4,3 s · 1.298 KB | **1,9 s · 444 KB** |

Se logró con carga diferida por pantalla, librerías en archivos aparte, gráficas después de los números y el lector de Excel solo cuando se sube un Excel. La validación en 6 meses (~0,5 s) se calcula solo cuando se muestra.

## 6. Pendiente

- **Probar con los datos de prueba de Green Services** (carpeta `Green_Services_Recursos_de_Prueba`).
- **Publicar la web** en GitHub Pages (la configuración ya está; falta activarla en el repositorio).
- **Probar en un iPhone real** (Safari).
