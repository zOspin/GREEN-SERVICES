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

