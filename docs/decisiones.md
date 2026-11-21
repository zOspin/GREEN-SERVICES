# Decisiones tomadas

Cuando algo no estaba especificado, tomamos la opción más simple. Aquí quedan anotadas.

## Datos

1. **«Hoy» fijo en el 14 de noviembre de 2026.** Así los datos y los números de la demo son siempre iguales. Se cambia con `FECHA_CORTE=AAAA-MM-DD npm run generate-data`.
2. **Los 15 clientes frenados se dividieron en dos grupos**: 9 que se frenaron hace poco (hoy están «en riesgo») y 6 que se frenaron hace 3 o 4 meses (hoy están «fríos»). Sin el segundo grupo, hace 60 días ningún cliente se veía atrasado y el backtest no tenía nada que medir (daba 0 %).
3. **Por eso hay 21 clientes fríos y no 10**: los 10 fríos de más de 6 meses, los 6 frenados antiguos y algunos ocasionales.
4. **Servicios recurrentes**: 6 de los 20 productos (licencias, suscripciones y soporte) se marcaron como «servicio recurrente».
5. **Archivos de ejemplo**: contienen las ventas de los últimos 60 días repartidas entre la «plataforma A» (clientes de Colombia) y la «plataforma B» (Quito, Miami y San Juan). El «Excel de operaciones» repite a mano cerca de un tercio de esas ventas, para tener duplicados reales.
6. **Las ventas bajan durante 2026** como consecuencia de la historia (clientes que se enfriaron). No se corrigió porque refuerza el problema que resuelve la herramienta.

## Lógica de IA

7. **Ciclo propio solo con 3 o más compras**, y nunca menos de 7 días. Con 2 compras seguidas el ciclo salía de 1 día y el cliente parecía en riesgo extremo.
8. **El backtest cuenta como «marcados»** a los clientes en riesgo o fríos en la fecha de corte, excepto los que ya llevaban más de 180 días sin comprar (contarlos inflaría el acierto sin mérito).
9. **Ajuste por TRM**: +5 puntos de riesgo solo a clientes con atraso mayor a 0,8, porque son los que estaban por comprar y podrían aplazarlo.
10. **Tres tipos de alerta**: en riesgo, fríos recuperables (menos de un año sin comprar) y «recompra próxima» (activos cuya compra estimada cae en los próximos 7 días). La última hace la herramienta proactiva incluso con clientes sanos.
11. **Prioridad** = puntaje × (0,6 + 0,4 × √(monto del cliente ÷ monto del mayor cliente)). La raíz evita que solo los clientes gigantes aparezcan arriba.
12. **Renovación**: solo se sugiere si el cliente compró ese servicio al menos 2 veces (hay un patrón) y lleva entre 1 y 3 veces su intervalo sin renovarlo. Si pasó más tiempo, probablemente ya no usa el servicio.
13. **Venta cruzada**: se parte del producto que el cliente más compra. Si en su sector hay menos de 2 clientes con ese producto, se compara con todos los clientes.
14. **Pronóstico** para el mes en curso (noviembre), porque aún no ha cerrado: promedio de los 3 meses cerrados + tendencia mensual.
15. **«Ventas del mes»** compara del 1 al 14 contra los mismos días del mes anterior, para que la comparación sea justa.
16. **Relación ventas–TRM** medida con la correlación de Pearson sobre 12 meses, explicada en palabras (débil, moderada o fuerte).

## Unión de datos

17. **Duplicado** = misma fecha, cliente, producto y cantidad, con un valor parecido (±1 %). Se usa la tolerancia porque convertir pesos a dólares cambia unos centavos.
18. **Fechas «dd/mm/aaaa»** se leen como día/mes (formato colombiano).
19. **Si no hay valor en USD**, se calcula con el valor en COP ÷ TRM (la del archivo, o la del día en nuestra base).
20. **Los archivos cargados no reemplazan los datos del tablero**: se muestran unidos y limpios, y se pueden descargar. Reemplazar la base es el siguiente paso, con backend.

## Interfaz

21. **«Marcar como contactado»** se guarda solo en memoria (se pierde al recargar), como pide el reto: sin backend.
22. **Logo**: el punto recorre la elipse con una animación CSS de 36 fotogramas calculados. Así no se deforma, y se detiene si el sistema tiene activada la opción de reducir movimiento.
23. **Reporte del mes**: por defecto muestra el último mes cerrado (octubre de 2026) y permite elegir entre los últimos 6. Para el PDF se usa la impresión del navegador, con estilos de impresión (fondo blanco, sin menú).
24. **El reporte no incluye gráficas**, para que se imprima limpio en blanco y negro.
25. **Colores de categorías**: azules, violeta, rosado, gris y dorado; no se usan verde, ámbar ni rojo para no confundir con los estados.
26. **La página «Cargar datos» se carga aparte**, porque la librería de Excel es pesada; así el resto de la app abre más rápido.
27. **El enlace «Ficha del cliente»** de la página El reto lleva a Cliente 30, un buen ejemplo de cliente en riesgo con recomendación de venta cruzada.

## Mejoras después de la primera versión

28. **Ventas en riesgo en dinero**: compra anual promedio = total comprado ÷ meses desde la primera compra × 12 (mínimo 3 meses, para no exagerar a los clientes nuevos). Se suma por separado para clientes en riesgo y fríos recuperables.
29. **Mensaje sugerido**: plantillas según el caso (renovación, cliente frío, en riesgo o al día). Deja `[nombre del contacto]` y `[tu nombre]` para que el asesor los complete; no inventa datos de contacto. «Abrir en el correo» usa `mailto:` sin destinatario.
30. **Columnas ordenables en Clientes**, con la columna nueva «Total comprado». El orden inicial sigue siendo por riesgo, de mayor a menor.
31. **«Descargar lista»** en Alertas exporta lo que se ve en pantalla (con los filtros aplicados) en CSV con BOM, para que Excel muestre bien las tildes.
32. **Sin animación en la línea de tiempo de la ficha**: si no, se reiniciaba cada vez que se pulsaba un botón y los puntos parecían desaparecer.

## Idioma (español / inglés) y tema (claro / oscuro)

33. **Traducción con `tr('español', 'english')`** dentro de cada pantalla, en lugar de un archivo enorme de claves: cada texto queda junto a su traducción y es fácil de revisar. Los textos que genera la IA se calculan una vez en los dos idiomas (`{ es, en }`).
34. **Se traducen** categorías, sectores, tipos y nombres de productos (`src/lib/catalogo.ts`). **No se traducen** los nombres de clientes («Cliente 23»), porque funcionan como identificadores del sistema, ni las ciudades.
35. **Formatos según el idioma**: en inglés se usa en-US (1,234.5 y Nov 14, 2026) y el peso se muestra como «COP 4,500,000» para no confundirlo con el dólar; en español, es-CO.
36. **Al cambiar de idioma se vuelven a pintar las pantallas**: se conservan la URL y los clientes marcados como contactados, pero se reinician los filtros y los archivos cargados en «Cargar datos».
37. **Tema oscuro por defecto** (es la identidad de la marca). El tema claro usa tonos más oscuros de dorado, azul, verde y rojo para mantener buen contraste sobre blanco.
38. **Colores como variables CSS** (`src/index.css`): Tailwind lee las variables, así que todas las pantallas cambian de tema sin tocar cada componente. Las gráficas reciben sus colores con `useTema()`.
39. **El botón principal mantiene el dorado de la marca** en ambos temas, con texto oscuro.
40. **La preferencia se guarda en el navegador** (`localStorage`), y un pequeño script en `index.html` la aplica antes de pintar para evitar un parpadeo. Si el navegador no permite guardar, la app funciona igual y solo olvida la elección al cerrar.

## Mejoras finales para el jurado

41. **Identidad igual a las diapositivas** (`presentacion/deck.css`): dorado #F5A524, azul #5B9BFF, turquesa #2DD4BF, superficies #141C36/#1C2748, bordes #2A3760 y texto #F4F1EA. El modo claro usa el «fondo claro alterno» #F4F1EA. El verde y el rojo de los estados se mantienen porque las diapositivas no los definen.
42. **Nombres de módulos como en las diapositivas**: «Cargar datos» pasa a **Centro de datos**, «Ventas y TRM» a **Panel financiero** y se crea el **Radar de clientes** (`/radar`). Las rutas (`/datos`, `/ventas`) no cambian, para no romper enlaces.
43. **«Frío» pasa a «Inactivo»** en la interfaz, como en la diapositiva 9. En el código el estado interno sigue llamándose `frio`.
44. **El modo presentación no existía**: se creó desde cero como una barra inferior con 5 pasos (Centro de datos → Radar → Ficha → Panel financiero → Cierre), con teclado (← → Esc) y notas del comunicador ocultas por defecto.
45. **Umbrales en vivo, sin guardar**: lo que se mueve en Configuración se aplica en toda la web (alertas, radar, fichas, reporte y backtest) pero se pierde al recargar. Así la demo siempre arranca con los valores del archivo `src/config/umbrales.ts`.
46. **El puntaje de riesgo usa el umbral de inactivo**: de 30 a 80 puntos entre 1× y el umbral de inactivo (antes estaba fijo en 2×).
47. **Nivel de confianza**: baja con menos de 4 compras, media de 4 a 7 y alta con 8 o más. Es una regla simple, basada en cuánta historia tiene el cliente.
48. **Valor de la oportunidad**: en una renovación es lo que ese cliente suele pagar por ese producto; en una venta cruzada, lo que se paga en promedio por él.
49. **Cliente 23 escrito a mano en el generador**, sin usar el generador aleatorio, para no cambiar a los demás clientes. Igual cambiaron un poco los totales: ahora hay 10 en riesgo y 20 inactivos, y el backtest acierta 7 de 8 (88 %). El perfil aleatorio que tenía ese cliente se reemplaza, así que los grupos quedan en 25/15/10/10 en el generador pero el Cliente 23 cuenta su propia historia.
50. **Cliente 23 en los 3 archivos**: su última compra está en el ERP (A) y repetida en el Excel; su compra anterior, en la sede internacional (B). Para reconocer «CLI-23» y «CLIENTE 023», la unión de datos ahora entiende variantes del tipo «cli/cliente + número».
51. **«USD X recuperados» del cierre** es lo que el Cliente 23 compra en un año en promedio (total ÷ meses como cliente × 12), no solo la renovación pendiente.
52. **Impacto sin inventar datos**: `horasConsolidacionManual = null` muestra «[por confirmar con Green Services]»; con un número, muestra la comparación y cuántas veces más rápido es.
53. **Banda «Demo con datos de prueba»** arriba en todas las páginas (se oculta al imprimir) y pie de página con enlaces a Privacidad y Configuración.
54. **Capturas** con Playwright en 1920×1080, modo oscuro y en español, con las animaciones detenidas para que siempre salgan iguales. Se agregó `playwright` como dependencia de desarrollo.
55. **Las diapositivas (`slides.html`) no están en el repositorio**, solo su README y `deck.css`; se usaron esos dos archivos como referencia.

56. **Puerto propio 5180** en `vite.config.ts` (con `strictPort` y apertura automática del navegador): en el computador del equipo había otro proyecto con Vite en el 5173 y el navegador abría ese en lugar de Órbita.
57. **Puerto cambiado a 5190** y sin `strictPort`: si el puerto está ocupado, Vite usa el siguiente libre y abre el navegador en esa dirección, en lugar de fallar.
58. **Dos modos de datos: Demo y Real** (selector «Datos» en el menú, guardado en el navegador con la clave `orbita-modo`; también `?modo=demo` o `?modo=real` en la dirección). Demo usa los datos inventados de `src/data/` (sin cambios, con la historia del Cliente 23). Real usa `src/data/real/`, que hoy está vacío a propósito: todo aparece en cero hasta recibir los datos de Green Services (ver `src/data/real/LEEME.md`).
59. **Cambiar de modo recarga la página**: los datos se leen una sola vez al cargar; recargar fue lo más simple y no obligó a reescribir las pantallas.
60. **La demo en vivo siempre usa el modo Demo**: si se pulsa «Iniciar demo en vivo» estando en Real, la web cambia a Demo y arranca la presentación sola.
61. En modo Real sin datos, «hoy» es la fecha actual, la TRM se muestra en 0 y un aviso arriba explica por qué todo está en cero. Los datos de demo no se volvieron «más al azar»: ya son aleatorios (con semilla fija) y así los números del guion no cambian entre ensayos.
62. **Demo al azar**: el generador se movió de `scripts/generate-data.ts` a `src/lib/generador.ts` para que también corra en el navegador. El botón «Generar otra demo al azar» (ícono de dado) del menú usa otra semilla; la semilla 2026 sigue siendo la demo original y produce exactamente los mismos archivos de antes (verificado byte a byte). El Cliente 23 mantiene su patrón fijo con cualquier semilla.
63. **La demo en vivo siempre vuelve a la demo original** (semilla 2026), para que los números del guion coincidan.
64. **Modo Real sin datos inventados**: en el Centro de datos ya no aparecen los archivos de ejemplo; en su lugar está «Lo que necesita la página» (columnas obligatorias y opcionales) y una **plantilla** CSV que trae solo los encabezados, sin filas de ejemplo.
65. **Subir datos reales desde la página**: los archivos se unen y limpian igual que en la demo, pero los clientes y productos que no existen se **crean** con el texto del archivo (en la demo se marcan como problema). Se guardan **solo en el navegador** (localStorage), no en GitHub; el botón «Borrar datos reales» los quita. Cada carga reemplaza a la anterior.
66. **«Hoy» de los datos reales = la fecha de la última venta** (el día de la exportación), para que un archivo de hace unas semanas no marque a todos como inactivos. La TRM sale de la columna TRM o de dividir pesos entre dólares, y se rellena día a día; si no viene, los valores en pesos quedan en 0 (no se inventa una TRM).
67. **Modelo predictivo = regresión logística en el navegador** (`src/lib/modelo.ts`), sin librerías ni servidor: es el modelo de la referencia del reto, se explica fácil y corre en menos de un segundo. Objetivo: «compra en los próximos 30 días». Se entrena con 12 fotos del pasado (una cada 15 días).
68. **Validación honesta**: se entrena solo con datos anteriores a hace 30 días y se prueba en esa fecha, comparando con la regla base «compró en los últimos 30 días». En la demo, el modelo gana en exhaustividad y pierde en precisión; se muestra tal cual, sin maquillar.
69. Se quitó la variable «días sin comprar» del modelo porque repetía la información del atraso (días ÷ ciclo) y confundía la lectura de los pesos; el desempeño no empeoró.
70. **Prioridad**: Alta desde 0,6, Media desde 0,35 y Baja por debajo [por confirmar con Green Services]. «Clientes prioritarios» = mayor probabilidad entre quienes no compraron en los últimos 15 días.
71. **Estilo del reto**: tema claro por defecto, con fondo lila, tarjetas blancas con sombra, morado (#6D4AFF) y turquesa (#08AAC4), títulos en Poppins y menú agrupado (Operaciones, Comercial y Ventas, Gerencia Financiera, Inteligencia artificial). Los estados pasaron a turquesa (activo), morado (en riesgo) y lavanda (inactivo), siempre con su símbolo (● ▲ ■). Se mantiene la marca Órbita: no se usa el logo de Green Services.
72. **Resumen general** con la estructura de la referencia (indicadores, ingresos mensuales COP, clientes por situación, prioritarios y desempeño del modelo). La gráfica de ingresos omite el mes en curso, que está incompleto.
73. **Pruebas**: Vitest para la lógica y Playwright para la interfaz. Las pruebas encontraron un error real que se corrigió: el Centro de datos solo leía los nombres de columna de la primera fila.
74. `npm run capturas` genera **las dos versiones**: modo oscuro en `presentacion/capturas/` (como pide el documento de mejoras) y modo claro en `presentacion/capturas/claro/` (el estilo nuevo de la web). Antes se había pasado todo a claro; se corrigió para cumplir el requisito.
75. Cada logo tiene su propio id de degradado: con dos logos en la página (menú oculto en celular) el núcleo desaparecía.
76. **Idioma y tema arriba a la derecha**, como interruptores de dos opciones (ES | EN y ☀ Claro | ☾ Oscuro): en el menú lateral quedaban por debajo del borde en pantallas de portátil (768 px y 900 px de alto). En celular van en el encabezado, junto al botón ☰.
77. **El producto se llama «Órbita»** (antes «Órbita Pulse»), a pedido del equipo. Las claves internas del navegador (`orbita-*`) no cambian, así no se pierden las preferencias guardadas.
78. **Revisión contra los 3 documentos de requisitos**: se repusieron en el Resumen general las tarjetas de ventas del mes (USD y COP con variación) y TRM de hoy, que se habían quitado en el rediseño; el dado del botón de demo al azar pasó de emoji a ícono SVG («sin emojis en la interfaz»).
79. **Centro de datos (modo Real) reconoce tres tipos de archivo**: ventas, lista de clientes (cliente + sector/ciudad/base instalada: cuentan todos, aunque no hayan comprado) y TRM (fecha + trm). Las ventas con estado «anulada», «cancelada», «rechazada» o «devuelta» no cuentan. La plantilla suma las columnas opcionales `base_instalada` y `estado`.
80. **Dispositivos**: las pruebas de interfaz corren en 11 perfiles emulados (Windows 1920×1080 al 125 %, 1366×768 y 1920×1080; iPad vertical y horizontal; Pixel 7, Galaxy S8, iPhone 13 y iPhone SE). Los iPhone se emulan con el motor de Chrome: Safari real no se probó.
81. **Rendimiento**: cada pantalla se descarga solo al abrirla, las librerías van en archivos propios (react, graficas) y el lector de Excel solo se descarga al subir un Excel. En el Resumen general las gráficas llegan después de los números. En un celular con 4G y CPU 4× más lenta, el contenido aparece en ~2 s (antes 3–4,3 s) y la primera carga baja de 924 KB a ~400 KB de JavaScript.
82. Los botones de tema crecieron a mínimo 30 px de alto para tocarlos cómodamente en pantallas táctiles.
83. **Accesibilidad WCAG 2.1 AA** verificada con axe en las 14 pantallas, tema claro y oscuro. Para lograrlo: el morado principal pasó de #6D4AFF a #603AF2 y los textos turquesa y verdes se oscurecieron un poco (contraste mínimo 4,5); las gráficas esconden sus piezas internas a los lectores de pantalla (la descripción general se mantiene); las listas con desplazamiento de la ficha se alcanzan con el teclado; la matriz de aciertos es una lista; enlace «Saltar al contenido».
84. **Validación del modelo en 6 meses** (una ventana cada 30 días) y la cifra principal es el promedio: un solo mes puede salir muy bien o muy mal por azar. Se calcula solo al mostrarla para no demorar la carga.
85. **Publicación en GitHub Pages** con `.github/workflows/publicar.yml`: se ejecuta a mano (Actions → Run workflow) hasta que se active Pages en el repositorio, para no generar fallos automáticos. La web usa la ruta base del repositorio (`BASE_URL`) y `404.html` para que los enlaces directos funcionen.
