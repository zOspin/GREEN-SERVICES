# Órbita Pulse

**Inteligencia que gira a tu alrededor.**

Prototipo del equipo **Órbita** para el hackatón **Estud-IA** (Alcaldía de Medellín), reto de **Green Services and Solutions SAS**, una empresa de tecnología de Medellín con presencia en Colombia, Ecuador, Estados Unidos y Puerto Rico.

> 🔒 Los datos reales de la empresa son confidenciales. **Esta demo usa solo datos inventados** («Cliente 01», «Cliente 02»…).

## El problema

El área de Operaciones tiene la información de compras, ventas, TRM (precio del dólar), clientes frecuentes, clientes fríos y base instalada **regada en varias plataformas**. La consolidan **a mano en Excel cada mes**, así que el análisis es **reactivo**: se enteran tarde de que un cliente dejó de comprar.

## La pregunta que resolvemos

> **¿Cómo podríamos ayudar al área Comercial a anticipar qué clientes están por dejar de comprar y cuándo deberían volver a hacerlo, para contactarlos a tiempo?**

## ¿Qué es Órbita Pulse?

Un tablero web que:

1. **Une los datos regados** de varias plataformas (aunque cada una use columnas y formatos distintos), quita duplicados y avisa lo que no pudo leer.
2. Da una **vista completa de cada cliente**: qué tiene, cada cuánto compra y cuándo debería volver.
3. **Detecta quién está por dejar de comprar** y genera **alertas** de a quién contactar esta semana, **por qué** y **qué ofrecerle**.
4. Muestra **tendencias de ventas y TRM**, **pronostica** las ventas y dice **qué tan acertada ha sido la IA**.
5. Escribe solo el **reporte del mes**, listo para imprimir o guardar en PDF.
6. **Entrena un modelo predictivo** (regresión logística) que da a cada cliente su **probabilidad de compra en los próximos 30 días** y una prioridad (Alta / Media / Baja), y **valida sus predicciones** contra una regla simple.

### Cómo cubre el reto

| Lo que pide el reto | Dónde está |
|---|---|
| Cargar los datos de los clientes | **Centro de datos** (`/datos`): CSV o Excel, plantilla, modo Demo y modo Real |
| Integrar el historial de ventas | **Centro de datos**: une varias plataformas, quita duplicados y reconoce clientes escritos distinto |
| Calcular indicadores comerciales | **Resumen general**, **Clientes** y **Panel financiero**: RFM, ciclo de compra, ventas en riesgo, TRM |
| Entrenar un modelo predictivo | `src/lib/modelo.ts`: regresión logística entrenada en el navegador con el historial |
| Identificar clientes con probabilidad de compra | **Resumen general** (clientes prioritarios), columna «Prob. compra (30 días)» en **Clientes** y en cada **ficha** |
| Mostrar los resultados | Todas las pantallas, con el estilo del tablero del reto |
| Validar las predicciones | **Evaluación del modelo** (`/modelo`): precisión, exhaustividad, F1, matriz de aciertos y comparación con la regla base |

## Idioma y tema

Arriba a la derecha de cada página (en celular, en el encabezado) hay dos interruptores siempre visibles:

- **ES / EN**: cambia toda la interfaz entre español e inglés, incluidos los textos que genera la IA (recomendaciones, motivos de alerta, mensaje al cliente y reporte del mes) y el formato de fechas y números (14 nov 2026 · 1.234,5 ↔ Nov 14, 2026 · 1,234.5).
- **Claro / Oscuro**: el tema **claro** (predeterminado) sigue el estilo del tablero del reto: fondo lila, tarjetas blancas, morado y turquesa. El **oscuro** es la misma paleta en versión nocturna.

La elección se guarda en el navegador: al volver a abrir la web sigue como la dejaste.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev
```

Abre en el navegador la dirección que aparece en la terminal (**http://localhost:5190**; Órbita Pulse usa su propio puerto para no chocar con otros proyectos).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia la web en tu computador (localhost) y se recarga sola al editar |
| `npm run build` | Revisa que no haya errores de tipos y genera la versión final en `dist/` |
| `npm run preview` | Sirve la versión final para probarla |
| `npm run generate-data` | Regenera los datos inventados y los CSV de ejemplo |


## Modo Demo y modo Real

En el menú, el selector **Datos** cambia entre:

- **Demo**: datos inventados (60 clientes, 18 meses) con la historia del Cliente 23. Es el modo para presentar.
  El botón **🎲 Generar otra demo al azar** crea clientes y compras nuevos (el Cliente 23 se mantiene); «volver a la original» regresa a la del guion.
- **Real**: datos reales anonimizados de Green Services. Sin datos, todo aparece en cero (no se inventa nada). Para llenarlo: **Centro de datos → Descargar plantilla**, llenarla con la exportación (o subir los archivos tal como salen de cada sistema) y pulsar **«Usar estos datos en modo Real»**. Se guardan solo en ese navegador. Más detalle: `src/data/real/LEEME.md`.

La demo en vivo siempre usa la demo original.

## Pantallas

| Ruta | Pantalla | Para quién |
|---|---|---|
| `/` | **Resumen general**: clientes, ventas confirmadas, ingresos COP, clientes fríos, ingresos mensuales, clientes por situación, **clientes prioritarios con su probabilidad de compra**, **desempeño del modelo**, ventas en riesgo y «Contactar esta semana» | Todos |
| `/modelo` | **Evaluación del modelo**: precisión, exhaustividad, F1 y exactitud contra la regla base, matriz de aciertos, cómo se entrenó, qué señales pesan más y predicción vs. realidad cliente por cliente | Todos |
| `/datos` | **Centro de datos**: une y limpia archivos de varias plataformas y muestra cómo llegó cada cliente (`?demo=1` carga los ejemplos solos) | Operaciones |
| `/radar` | **Radar de clientes**: cada cliente en un anillo (activo, en riesgo, inactivo); `?destacar=CLI-023` hace parpadear a uno | Comercial |
| `/alertas` | **Alertas**: lista priorizada con motivo, producto a ofrecer, «Marcar como contactado» y descarga de la lista de llamadas (CSV) | Comercial |
| `/clientes` | **Clientes**: tabla con buscador, filtros (estado, sector, base instalada) y columnas ordenables | Comercial |
| `/clientes/:id` | **Ficha del cliente**: **«¿Por qué está en riesgo?»** (barra de ritmo y confianza), indicadores, recomendación de IA con valor en USD, **mensaje sugerido**, línea de tiempo e historial | Comercial |
| `/ventas` | **Panel financiero**: «Recuperar a un cliente» (valor y efecto de la TRM), ventas por mes y categoría, y ventas contra TRM | Financiera |
| `/predicciones` | **Predicciones**: pronóstico, % de acierto y «¿Cómo funciona la IA?» | Todos |
| `/reporte` | **Reporte del mes**: resumen automático, imprimible | Operaciones y Gerencia |
| `/reto` | **El reto**: pregunta principal, las 10 preguntas, el antes y el ahora, y el botón de la demo en vivo | Presentación |
| `/configuracion` | **Configuración**: umbrales de riesgo e inactividad con controles deslizantes y efecto en vivo | Todos |
| `/privacidad` | **Privacidad y confianza**: cómo se cuidan los datos (enlazada en el pie de página) | Todos |
| `/cierre` | **Cierre** de la demo: «Llamar hoy al Cliente 23 = US$ X recuperados» | Presentación |

### Modo presentación (demo en vivo)

Continúa donde termina la diapositiva 16. Se inicia con **«Iniciar demo en vivo»** (menú o página El reto) y cuenta la historia del **Cliente 23** en 5 pasos: Centro de datos → Radar → Ficha → Panel financiero → Cierre. Se avanza con el botón **Siguiente** o las flechas ← →; **Esc** sale. El guion completo está en `docs/guion-demo.md`.

### Capturas para las diapositivas

```bash
npm run capturas
```

Levanta la web por su cuenta y guarda en `presentacion/capturas/` (1920×1080, tema claro): `resumen-general.png`, `evaluacion-modelo.png`, `centro-datos.png` (diapositiva 10), `radar-clientes.png` y `ficha-cliente-23.png` (diapositiva 11) y `panel-financiero.png` (diapositiva 12). La primera vez en un computador nuevo hay que descargar el navegador con `npx playwright install chromium`.

## Datos inventados

`scripts/generate-data.ts` crea, siempre igual (semilla fija), estos archivos en `src/data/`:

- `clientes.json`: 60 clientes, con sector, ciudad, fecha de primera compra y si son base instalada.
- `productos.json`: 20 productos en 6 categorías, cada uno de tipo «producto» o «servicio recurrente» (licencias, soporte, suscripciones).
- `ventas.json`: 965 ventas en 18 meses, en USD y en COP según la TRM del día.
- `trm.json`: TRM diaria entre 3.800 y 4.400 COP.
- `meta.json`: el «hoy» de la demo (14 de noviembre de 2026) y la semilla.

Además crea en `public/ejemplos/` **tres CSV con formatos distintos** para demostrar la unión de datos:

| Archivo | Simula | Diferencias |
|---|---|---|
| `plataforma-a-erp-colombia.csv` | ERP de Colombia | separador `;`, fechas `16/09/2026`, clientes por nombre, coma decimal |
| `plataforma-b-internacional.csv` | Sistema de las sedes internacionales | columnas en inglés, fecha con hora, códigos |
| `excel-operaciones.csv` | Excel digitado a mano | MAYÚSCULAS, fechas `3-oct-2026`, valores en pesos con TRM, duplicados, una fila vacía y un cliente sin código |

Los datos cuentan una historia: **25 clientes frecuentes** (compran cada 20 a 45 días), **15 que se frenaron** (9 hace poco y 6 hace 3 o 4 meses), **10 inactivos** (más de 6 meses sin comprar) y **10 ocasionales**. En el último mes el dólar sube un 6 %.

**El Cliente 23** es el protagonista de la demo y se escribe a mano en el generador: es de base instalada, compraba una suscripción de nube cada ~30 días (US$ 4.800 cada vez) y lleva 50 días sin comprar, así que está **en riesgo** con la renovación vencida. En los 3 archivos de ejemplo aparece escrito distinto («Cliente 23», «CLI-23» y «CLIENTE 023») y con un registro duplicado.

Para mover el «hoy» de la demo:

```bash
FECHA_CORTE=2026-12-01 npm run generate-data
```

## ¿Cómo funciona la «IA»?

> *«Si un vecino compra pan cada 3 días y lleva 10 sin aparecer, la dueña nota que algo pasó. Órbita Pulse hace eso con cada cliente.»*

Es una IA **sencilla y explicable**: reglas y cálculos que cualquiera puede revisar en `src/lib/analytics.ts` (comentado en español).

1. **RFM**: para cada cliente, **R**ecencia (días desde la última compra), **F**recuencia (número de compras) y **M**onto (total en USD).
2. **Ciclo de recompra**: cada cuántos días compra, en promedio. Con menos de 3 compras se usa el ritmo general de todos los clientes.
3. **Próxima compra estimada** = última compra + ciclo.
4. **Ratio de atraso** = días sin comprar ÷ ciclo. Si compra cada 30 días y lleva 60, el atraso es 2.
5. **Puntaje de riesgo (0–100)** a partir del atraso. Si el dólar subió más de 5 % en 30 días, se suman 5 puntos a quienes ya están cerca de su fecha de compra.
6. **Estado**: 🟢 **activo** (atraso ≤ 1,2) · 🟡 **en riesgo** (entre 1,2 y 2) · 🔴 **inactivo** (más de 2, o más de 180 días sin comprar). Estos umbrales están en `src/config/umbrales.ts`, se validan con la empresa y se pueden mover en vivo en `/configuracion`.
   - **Explicación**: cada ficha muestra «¿Por qué este cliente está en riesgo?» con sus números, una barra de ritmo y un **nivel de confianza** (baja con menos de 4 compras, media de 4 a 7, alta con 8 o más).
7. **Prioridad de alerta** = riesgo × valor del cliente: los clientes grandes en riesgo van primero.
8. **Recomendación de producto**, con tres reglas en orden:
   - **Renovación**: tiene un servicio recurrente que ya compró al menos 2 veces y ya le tocaba renovarlo.
   - **Venta cruzada**: «clientes del mismo sector que compraron X también compraron Y» (y él aún no tiene Y).
   - **Lo más vendido en su sector** que aún no tiene.
9. **Texto de recomendación** con plantillas: *«Compra cada 37 días y lleva 66 sin comprar. Su última compra fue Hardware. Llámalo esta semana y ofrécele Antivirus empresarial.»*
10. **Pronóstico de ventas** = promedio de los últimos 3 meses + tendencia mensual.
11. **Ventas en riesgo**: lo que compran en un año los clientes en riesgo (total comprado ÷ meses como cliente × 12). Hoy: unos US$ 1,2 M al año, más US$ 755 mil en inactivos recuperables.
12. **Mensaje sugerido**: un borrador de correo o WhatsApp según el estado del cliente y el producto recomendado, listo para copiar.
13. **% de acierto (backtest)**: se «viaja al pasado» 60 días, la IA marca a quién ve en riesgo con los datos de ese momento y luego se revisa si de verdad dejaron de comprar. Con los datos de la demo acierta en **7 de 8 casos (88 %)**.

### El modelo predictivo (regresión logística)

Además de las reglas de arriba, Órbita Pulse **entrena un modelo** con el historial (`src/lib/modelo.ts`):

1. **Fotos del pasado**: cada 15 días (12 fotos) se mira cómo estaba cada cliente (atraso frente a su ritmo, número de compras, total comprado, compras en los últimos 90 días, ciclo corto, base instalada, servicios recurrentes) y si **compró en los 30 días siguientes**.
2. **Entrenamiento**: una regresión logística aprende cuánto pesa cada señal. Corre en el navegador, en menos de un segundo, y siempre da el mismo resultado con los mismos datos.
3. **Predicción**: probabilidad de compra en los próximos 30 días para cada cliente. Prioridad **Alta** desde 0,6 y **Media** desde 0,35.
4. **Validación sin trampa**: un modelo entrenado solo con datos anteriores a hace 30 días predice quién compraría, y se compara con lo que pasó. También se compara con una **regla base** («comprará si compró en los últimos 30 días»).

Con la demo original: el modelo detecta al **91 %** de los clientes que compraron (exhaustividad), contra 74 % de la regla, pero con más falsas alarmas (precisión 54 % contra 63 %). Por eso **requiere revisión humana**: la IA sugiere, la persona decide.

La unión de archivos está en `src/lib/unificar.ts` (reconoce sinónimos de columnas, 4 formatos de fecha, números con punto o coma, pesos o dólares) y el reporte en `src/lib/reporte.ts`.

## Guía técnica

Para explicar el código (arquitectura, flujo de datos, de dónde sale cada número, fórmulas exactas y el modelo): **`docs/guia-tecnica.md`**.

## Pruebas automáticas

```bash
npm test
```

**Pruebas unitarias** (`tests/unidad/`, con Vitest): revisan la lógica sin abrir la web. Cubren la lectura de fechas y números, el reconocimiento de columnas, la unión de archivos y el modo Real, los estados de los clientes, el backtest, el modelo predictivo y sus métricas, y que la demo original no cambie.

```bash
npm run test:e2e
```

**Pruebas de interfaz** (`tests/interfaz/`, con Playwright): abren la web en un navegador y la recorren como una persona. Revisan que todas las pantallas abran sin errores ni textos rotos, los temas y el idioma, el menú, la evaluación del modelo, el orden por probabilidad, el Centro de datos, el modo Real (subir, usar y borrar datos), la demo al azar, la demo en vivo de 5 pasos y que todo quepa en un celular. La primera vez en un computador nuevo: `npx playwright install chromium`.

`npm run test:todo` corre las dos.

## Estructura del proyecto

```
scripts/generate-data.ts     Generador de datos inventados y CSV de ejemplo
public/ejemplos/             3 CSV «regados» para la demo del Centro de datos
src/
  data/                      JSON generados
  lib/
    analytics.ts             La «IA»: riesgo, alertas, recomendación, pronóstico, backtest
    unificar.ts              Une y limpia archivos de varias plataformas
    mensaje.ts               Borrador de mensaje para el cliente
    descargar.ts             Descarga de tablas como CSV
    reporte.ts               Reporte automático del mes
    datos.ts                 Carga los datos y ejecuta los cálculos una vez
    format.ts                Formato de moneda, fechas y porcentajes según el idioma
    idioma.tsx               Idioma de la interfaz (español / inglés)
    tema.tsx                 Tema claro / oscuro
    catalogo.ts              Traducción de categorías, sectores y productos
  components/
    ui/                      Piezas reutilizables: Card, StatCard, StatusChip, RiskBar,
                             Button, Table, PageHeader, EmptyState
    Layout.tsx, Logo.tsx…    Menú, logo, gráfica de ventas, tarjeta de alerta
  pages/                     Una página por pantalla
src/config/
  umbrales.ts                Umbrales de riesgo e inactividad (validar con la empresa)
  impacto.ts                 Horas de consolidación manual (null = por confirmar)
scripts/capturas.ts          Capturas 1920×1080 para las diapositivas (npm run capturas)
presentacion/                README y estilos de las diapositivas; capturas/ con las imágenes
docs/
  guion-demo.md              Demo en vivo con la historia del Cliente 23
  preguntas-jurado.md        Respuestas cortas a las preguntas del jurado y pendientes
  decisiones.md              Decisiones tomadas durante el desarrollo
```

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Recharts · React Router · PapaParse (CSV) · SheetJS (Excel). Sin backend ni inicio de sesión: todo corre en el navegador.
