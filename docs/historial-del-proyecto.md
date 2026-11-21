# Historial del proyecto Órbita

Resumen de todo lo construido para el reto de **Green Services and Solutions SAS** (Hackatón Estud-IA, Alcaldía de Medellín), del **14 al 21 de noviembre de 2026**.

- **Equipo:** Órbita.
- **Repositorio:** `zOspin/GREEN-SERVICES`, rama `orbita-pulse-prototipo`.
- **Para ver la web:** `npm install` y `npm run dev` → http://localhost:5190

---

## 1. ¿Qué es Órbita?

Una web que **une los datos de ventas regados en varias plataformas**, **detecta qué clientes están por dejar de comprar**, **predice quién comprará en los próximos 30 días** con un modelo de IA y **dice a quién llamar, por qué y qué ofrecerle**.

**Pregunta que resuelve:** ¿cómo podríamos ayudar al área Comercial a anticipar qué clientes están por dejar de comprar y cuándo deberían volver a hacerlo, para contactarlos a tiempo?

### Cómo cumple el reto

| El reto pide | Dónde está |
|---|---|
| Cargar los datos de los clientes | **Centro de datos**: ventas, lista de clientes y TRM (CSV o Excel), plantilla, modo Real |
| Integrar el historial de ventas | **Centro de datos**: une varias fuentes y quita duplicados y ventas anuladas |
| Calcular indicadores comerciales | **Resumen general**, **Clientes**, **Panel financiero** y **Reporte** |
| Entrenar un modelo predictivo | Regresión logística entrenada en el navegador |
| Identificar clientes con probabilidad de compra | «Prob. compra (30 días)» con prioridad Alta, Media o Baja |
| Mostrar los resultados | 14 pantallas con el estilo del tablero del reto |
| Validar las predicciones | **Evaluación del modelo**: 6 meses, comparación con regla base, detalle por cliente |

---

## 2. Línea de tiempo

### 14 de noviembre · Primera versión
- **Prototipo web** con React, TypeScript, Vite, Tailwind y Recharts, sin servidor ni login.
- **Datos inventados** con semilla fija: 60 clientes, 20 productos, 965 ventas y 18 meses de TRM.
- **Lógica de IA explicable:**
  - RFM, ciclo de compra y próxima compra;
  - puntaje de riesgo y estados (activo, en riesgo, inactivo);
  - alertas priorizadas y recomendación de producto;
  - pronóstico de ventas y backtest («acertó en 7 de 8»).
- **Pantallas:** Inicio, Centro de datos, Radar, Alertas, Clientes, Ficha del cliente, Panel financiero, Predicciones, Reporte del mes y El reto.
- **Mejoras de la demo:** ventas en riesgo (US$ al año), mensaje sugerido para el cliente y listas descargables.
- **Idioma** español/inglés y **tema** claro/oscuro.
- **Documento de mejoras:**
  - «¿Por qué este cliente está en riesgo?», con barra de ritmo y nivel de confianza;
  - umbrales configurables (`/configuracion`);
  - métrica de impacto sin inventar datos («[por confirmar]»);
  - **historia del Cliente 23** y **modo presentación** de 5 pasos;
  - página de **Privacidad** y banda «Demo con datos de prueba»;
  - `docs/preguntas-jurado.md` y capturas automáticas para las diapositivas.

### 16 de noviembre · Demo y modo Real
- **Puerto propio (5190)**, para no chocar con otros proyectos en el computador.
- **Modo Demo y modo Real.** El Real queda en cero hasta cargar datos, sin nada inventado.
- **Demo al azar:** genera clientes y compras nuevos; el Cliente 23 se mantiene.
- **Carga de datos reales desde la página:** plantilla descargable, se guardan solo en el navegador y se pueden borrar.

### 21 de noviembre · Modelo, estilo del reto y calidad
- **Modelo predictivo (regresión logística):**
  - entrenado con 12 «fotos» del historial;
  - da la probabilidad de compra a 30 días por cliente y su prioridad;
  - explica qué pesó en cada predicción.
- **Página «Evaluación del modelo»:**
  - precisión, exhaustividad, F1 y exactitud frente a la regla base;
  - matriz de aciertos, señales que más pesan y predicción vs. realidad.
- **Estilo del tablero del reto:**
  - tema claro lila, morado y turquesa, con tipografía Poppins;
  - menú agrupado (Operaciones, Comercial y Ventas, Gerencia Financiera, Inteligencia artificial);
  - **Resumen general** como la referencia.
- **Pruebas automáticas:** Vitest para la lógica y Playwright para la interfaz.
- **Idioma y tema siempre visibles** arriba a la derecha.
- **Guía técnica** (`docs/guia-tecnica.md`): arquitectura, flujo de datos, de dónde sale cada número y fórmulas.
- **Nombre del producto: «Órbita»** (antes «Órbita Pulse»).
- **Revisión contra los 3 documentos de requisitos:**
  - volvieron las ventas del mes y la TRM al Resumen;
  - se quitaron los emojis de la interfaz;
  - capturas en oscuro y en claro.
- **Centro de datos** reconoce listas de clientes, archivos de TRM y ventas anuladas.
- **Pruebas en 11 dispositivos emulados:** Windows, iPad, Android e iPhone.
- **Carga más rápida:** en celular con 4G, de 3,5 s a unos 2 s.
- **Accesibilidad WCAG 2.1 AA** en todas las pantallas, tema claro y oscuro.
- **Validación del modelo en 6 meses**, con la cifra principal como promedio.
- **Publicación en GitHub Pages** preparada (falta activarla).
- **Logo animado** entregado aparte (SVG, PNG y código) para otras propuestas.

---

## 3. Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | **Resumen general:** indicadores, ingresos mensuales, clientes por situación, prioritarios con probabilidad de compra, desempeño del modelo, ventas en riesgo y a quién contactar |
| `/datos` | **Centro de datos:** une y limpia archivos; plantilla y carga de datos reales |
| `/radar` | **Radar de clientes:** cada cliente en su anillo (activo, en riesgo, inactivo) |
| `/alertas` | **Alertas:** a quién llamar, por qué y qué ofrecer |
| `/clientes` | **Clientes:** tabla con filtros, riesgo y probabilidad de compra |
| `/clientes/:id` | **Ficha:** por qué está en riesgo, probabilidad, recomendación, mensaje e historial |
| `/ventas` | **Panel financiero:** ventas por mes y categoría, TRM y valor de recuperar a un cliente |
| `/predicciones` | **Predicciones:** pronóstico y backtest |
| `/modelo` | **Evaluación del modelo:** validación en 6 meses y detalle |
| `/reporte` | **Reporte del mes,** imprimible |
| `/reto` | **El reto:** pregunta, las 10 preguntas y el antes y el ahora |
| `/configuracion` | **Umbrales** de riesgo e inactividad, en vivo |
| `/privacidad` | **Privacidad y confianza** |
| `/cierre` | **Cierre** de la demo en vivo |

---

## 4. Resultados (con los datos inventados de la demo)

| Indicador | Valor |
|---|---|
| Clientes / ventas | 60 / 965 |
| Estados | 30 activos · 10 en riesgo · 20 inactivos |
| Ventas en riesgo | ~US$ 1,2 M al año (+ US$ 755 mil en inactivos recuperables) |
| Backtest de riesgo (60 días) | acertó en 7 de 8 (88 %) |
| **Modelo**, promedio de 6 meses | precisión 74,8 % · exhaustividad 95,4 % · **F1 83,3 %** |
| Regla base, promedio de 6 meses | precisión 72,8 % · exhaustividad 79,0 % · F1 75,5 % |
| El modelo gana a la regla | 5 de 6 meses |
| **Cliente 23** | compra cada 30 días, lleva 50 sin comprar, renovación de US$ 4.800, ~US$ 70 mil al año |

---

## 5. Calidad

| Qué | Resultado |
|---|---|
| Pruebas unitarias (lógica) | **50** pasan · `npm test` |
| Pruebas de interfaz | **105** pasan · `npm run test:e2e` |
| Dispositivos emulados | 11 (Windows 1920×1080 al 125 %, 1366×768, monitor, iPad ×2, Pixel 7, Galaxy S8, iPhone 13, iPhone SE) |
| Accesibilidad | WCAG 2.1 AA en las 14 pantallas, claro y oscuro (axe) |
| Velocidad en celular 4G | ~2 s para ver el contenido (antes 3,5–4,3 s) |
| Errores reales encontrados por las pruebas | 3, corregidos: lectura de columnas, logo en celular, desborde en 360 px |

---

## 6. Documentos del proyecto

| Archivo | Para qué |
|---|---|
| `README.md` | Qué es, cómo correrlo, pantallas y cómo funciona la IA |
| `docs/guia-tecnica.md` | Explicar el código: arquitectura, fórmulas y modelo |
| `docs/guion-demo.md` | Demo en vivo de 3 minutos (Cliente 23) |
| `docs/preguntas-jurado.md` | Respuestas a preguntas difíciles |
| `docs/pruebas-y-cumplimiento.md` | Informe de pruebas y cumplimiento |
| `docs/decisiones.md` | Las 85 decisiones tomadas y por qué |
| `docs/historial-del-proyecto.md` | Este documento |
| `src/data/real/LEEME.md` | Cómo cargar los datos reales |
| `presentacion/capturas/` | Capturas para las diapositivas (oscuro y `claro/`) |

---

## 7. Pendiente

| # | Qué | Quién |
|---|---|---|
| 1 | Activar la publicación en GitHub Pages (Settings → Pages → GitHub Actions; Actions → Run workflow) | Equipo |
| 2 | Cargar los datos de prueba de Green Services y confirmar que aparecen los 120 clientes | Equipo + ajustes en el código |
| 3 | Probar en un iPhone real (Safari) | Equipo |
| 4 | Decidir el estilo de las diapositivas (claro u oscuro) | Equipo |
| 5 | Confirmar con la empresa: horas del consolidado manual, días para «inactivo», moneda de venta y el recurso «com» | Equipo |
| 6 | Video de respaldo de la demo, vista previa del enlace, código QR, revisión de textos, pruebas automáticas en GitHub, README con captura y resumen ejecutivo en PDF | Por hacer |
| 7 | Pasar la rama a `main` (opcional) | Por decidir |
