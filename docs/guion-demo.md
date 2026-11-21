# Guion de la demo: la historia del Cliente 23 (3 minutos)

La demo en vivo empieza justo después de la **diapositiva 16** («¡Gracias!» → demo en vivo) y cuenta la historia de **un solo cliente**, el **Cliente 23**, de principio a fin.

## Antes de empezar

1. Abre la terminal en la carpeta del proyecto y corre `npm run dev`.
2. Abre http://localhost:5190/reto en el navegador, en pantalla completa (F11).
3. Revisa que el menú diga **ES** y el tema que prefieras: si el proyector se ve lavado, pulsa **Claro**.
4. Pulsa **«Iniciar demo en vivo (Cliente 23)»** (también está en el menú). Aparece una barra abajo con los 5 pasos.
5. Para avanzar: botón **Siguiente** o flecha **→** del teclado. Para volver: **←**. Para salir: **Esc**.
6. El botón **«Notas del comunicador»** muestra en la barra lo que dice Mateo en cada paso. Ábrelo solo si lo necesitas: el público también lo ve.

## Los 5 pasos

| Paso | Tiempo | Pantalla | Qué se ve | Qué dice el comunicador |
|---|---|---|---|---|
| 1 | 0:00 – 0:40 | **Centro de datos** | Se cargan solos los 3 archivos (ERP, sede internacional y Excel de Operaciones). Abajo aparece **«Así llegó el Cliente 23: regado y repetido»**. | «Estos son tres archivos como llegan hoy: el ERP, la sede internacional y el Excel que Operaciones llena a mano. Miren al Cliente 23: en uno se llama "Cliente 23", en otro "CLI-23" y en el Excel "CLIENTE 023", y su última compra estaba dos veces. Órbita lo reconoce como un solo cliente y quita el duplicado. Esto hoy se hace a mano en Excel cada mes.» |
| 2 | 0:40 – 1:10 | **Radar de clientes** | Cada punto es un cliente. El del **Cliente 23 parpadea** en el anillo **«en riesgo»**; a la derecha se ve por qué. | «Con los datos unidos, la IA ubica a cada cliente. Cerca del centro compran a su ritmo; hacia afuera se van atrasando. El punto que parpadea es el Cliente 23, en el anillo "en riesgo". Nadie tuvo que buscarlo: la IA lo marcó sola.» |
| 3 | 1:10 – 2:00 | **Ficha del Cliente 23** | El bloque **«¿Por qué este cliente está en riesgo?»** con la barra de ritmo y la confianza, y debajo la **Recomendación de IA**: renovación de su suscripción de nube por **US$ 4.800**. | «La pregunta que siempre nos hacen: ¿cómo sabe eso la IA? Aquí está: compra cada 30 días y lleva 50 sin comprar, 1,7 veces su ritmo normal. La barra lo muestra, y la confianza es alta porque tiene 16 compras. Y nos dice qué ofrecerle: su renovación de nube está vencida, son US$ 4.800, y ya hay un mensaje listo para enviar. La IA sugiere; la persona decide.» |
| 4 | 2:00 – 2:30 | **Panel financiero** | La tarjeta **«Recuperar a un cliente: lo que está en juego»**: lo que compra al año (**US$ 69.927**), la oportunidad inmediata (**US$ 4.800**) y el **efecto de la TRM**. | «Para Gerencia Financiera: el Cliente 23 compra cerca de 70 mil dólares al año. Y miren la TRM: con el dólar 6 % más caro, la misma renovación le cuesta más pesos que hace un mes. Por eso la IA sugiere ofrecer precio fijo en pesos o pago diferido.» |
| 5 | 2:30 – 3:00 | **Cierre** | **«Llamar hoy al Cliente 23 = US$ 69.927 recuperados al año»**, con el % de acierto. | «Y así con cada cliente, todas las semanas, sin esperar el Excel del mes. Llamar hoy al Cliente 23 es recuperar lo que compra en un año. En la prueba de 60 días, la IA acertó en 7 de 8 clientes que marcó en riesgo. Esto es Órbita: inteligencia que gira a tu alrededor.» |

> Los valores (US$ 4.800, US$ 69.927, 50 días, 7 de 8) salen de los **datos inventados** de la demo. Si se regeneran los datos, revisa que coincidan en pantalla antes de presentar.

## Si sobra tiempo o el jurado pide más

- **Evaluación del modelo** (`/modelo`): «La IA no solo marca riesgos: estima quién comprará en 30 días. Y la validamos: la entrenamos con el pasado y comparamos con lo que pasó. Detecta al 91 % de los que compraron, con más falsas alarmas que una regla simple; por eso la persona revisa.»
- **Demo al azar**: en el menú, «Generar otra demo al azar» (ícono de dado). Frase: «No es una pantalla preparada: estos son otros clientes inventados y la IA los analiza igual.» Para volver, «volver a la original» (o pulsa «Iniciar demo en vivo», que siempre usa la original).
- **Modo Real**: selector «Datos → Real». Todo queda en cero; en el Centro de datos se ve qué columnas necesita la página y la plantilla. Frase: «El día que Green Services nos dé su exportación, la sube aquí y listo.»
- **Configuración** (`/configuracion`): mueve el control «En riesgo desde» y muestra cómo cambian los estados en vivo. Frase: «Estos valores se ajustan con la empresa.»
- **Reporte del mes** (`/reporte`): el informe que antes tomaba días se escribe solo.
- **Privacidad** (`/privacidad`): enlazada en el pie de página.
- Para preguntas difíciles, ver `docs/preguntas-jurado.md`.

## Plan B (si algo falla)

- Si no funciona el modo presentación, recorre a mano: `/datos?demo=1` → `/radar?destacar=CLI-023` → `/clientes/CLI-023` → `/ventas?cliente=CLI-023` → `/cierre`.
- Si no funciona la web, usa las capturas de `presentacion/capturas/` (se generan con `npm run capturas`).
