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

## Idioma y tema

En el menú (abajo a la izquierda en computador; dentro del botón ☰ en celular) hay dos controles:

- **ES / EN**: cambia toda la interfaz entre español e inglés, incluidos los textos que genera la IA (recomendaciones, motivos de alerta, mensaje al cliente y reporte del mes) y el formato de fechas y números (14 nov 2026 · 1.234,5 ↔ Nov 14, 2026 · 1,234.5).
- **Claro / Oscuro**: cambia entre el tema oscuro de la marca y un tema claro, por ejemplo para proyectar en salas iluminadas o imprimir.

La elección se guarda en el navegador: al volver a abrir la web sigue como la dejaste.

## Cómo correrlo

Necesitas [Node.js](https://nodejs.org) 18 o superior.

```bash
npm install
npm run dev
```

Abre en el navegador la dirección que aparece en la terminal (normalmente **http://localhost:5173**).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Inicia la web en tu computador (localhost) y se recarga sola al editar |
| `npm run build` | Revisa que no haya errores de tipos y genera la versión final en `dist/` |
| `npm run preview` | Sirve la versión final para probarla |
| `npm run generate-data` | Regenera los datos inventados y los CSV de ejemplo |

## Pantallas

| Ruta | Pantalla | Para quién |
|---|---|---|
| `/` | **Inicio**: ventas del mes, TRM, clientes por estado, **ventas en riesgo (US$ al año)**, tiempo de consolidación, gráfica con pronóstico y «Contactar esta semana» | Todos |
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

Levanta la web por su cuenta y guarda en `presentacion/capturas/` (1920×1080, modo oscuro): `centro-datos.png` (diapositiva 10), `radar-clientes.png` y `ficha-cliente-23.png` (diapositiva 11) y `panel-financiero.png` (diapositiva 12). La primera vez en un computador nuevo hay que descargar el navegador con `npx playwright install chromium`.

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

La unión de archivos está en `src/lib/unificar.ts` (reconoce sinónimos de columnas, 4 formatos de fecha, números con punto o coma, pesos o dólares) y el reporte en `src/lib/reporte.ts`.

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
