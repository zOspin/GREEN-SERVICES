# Preguntas del jurado

Respuestas cortas y en lenguaje simple. **No hay cifras reales de Green Services**: lo que no sabemos va como **[por confirmar]**.

## 1. ¿Cómo sabe la IA que un cliente está en riesgo?

Aprende el ritmo de compra de **cada** cliente: cada cuántos días compra. Luego compara ese ritmo con los días que lleva sin comprar. Si un cliente compra cada 30 días y lleva 50, va 1,7 veces más lento que su ritmo normal: está **en riesgo**. Es como la panadería: si un vecino compra pan cada 3 días y lleva 10 sin aparecer, la dueña nota que algo pasó. En la ficha de cada cliente, el bloque «¿Por qué este cliente está en riesgo?» muestra los números exactos y qué tan confiable es la conclusión.

## 2. ¿Qué pasa si la IA se equivoca?

Puede equivocarse, y por eso:
- **No actúa sola**: solo sugiere a quién llamar. La persona decide; nada se envía al cliente automáticamente.
- **Dice qué tan segura está**: con menos de 4 compras, la confianza es baja y lo muestra.
- **La medimos**: «viajamos al pasado» 60 días y revisamos si los clientes que marcó de verdad dejaron de comprar. Con los datos de prueba acertó en 7 de 8 (88 %). Con datos reales hay que repetir esta medición en el piloto [por confirmar].
- **Una falsa alarma cuesta poco**: una llamada a un cliente que sí iba a comprar no le hace daño a nadie.

## 3. ¿Por qué no usar Power BI o Excel?

Power BI y Excel **muestran** lo que ya pasó, si alguien arma el reporte. Órbita Pulse:
- **une** los datos regados sin hacerlo a mano;
- **anticipa** quién está por irse según el ritmo de cada cliente;
- **dice qué hacer**: a quién llamar esta semana, por qué y qué ofrecerle.

No reemplaza esas herramientas: puede alimentarlas. Si la empresa ya usa Power BI, los resultados de Órbita Pulse se pueden ver ahí.

## 4. ¿Con qué sistemas se conecta?

Hoy, en el prototipo, recibe archivos **CSV o Excel** de cualquier plataforma: reconoce columnas con nombres distintos, fechas en varios formatos y valores en pesos o dólares. En la versión real se conectaría a los sistemas donde hoy están los datos (ERP, facturación, CRM y la fuente de la TRM). Cuáles son exactamente y cómo exportan la información está [por confirmar con Green Services].

## 5. ¿Cuánto costaría implementarlo?

No damos un precio sin conocer el detalle. Depende de:
- cuántos sistemas hay que conectar y si permiten exportar datos automáticamente;
- cuántos clientes y ventas maneja la empresa;
- dónde se aloja (servidores propios o nube privada);
- cuántas personas lo van a usar y qué ajustes piden.

El costo se definiría en el **piloto**, con los datos reales [por confirmar].

## 6. ¿Cómo protegen los datos?

- La demo usa **solo datos inventados**.
- En la versión real, los clientes llegan **anonimizados** («Cliente 23»), sin nombres ni datos de contacto.
- Los datos **no se comparten** fuera de la empresa y se procesan en un **entorno privado**.
- La IA **sugiere** y la persona **decide**.

Más detalle en la página **Privacidad** (`/privacidad`).

## 7. ¿Qué tan rápido se podría poner en marcha?

El prototipo ya funciona con datos de prueba. Lo que falta para usarlo con datos reales es: recibir una exportación real anonimizada, validar los umbrales con la empresa y medir el acierto. El tiempo depende de qué tan fácil sea obtener esos datos [por confirmar en el piloto].

## 8. ¿Qué es lo siguiente después del prototipo?

1. **Piloto con datos reales** anonimizados: validar umbrales, medir el acierto real y el tiempo que se ahorra.
2. **Conexión directa** a los sistemas de la empresa, para que los datos lleguen solos.
3. **Mejorar la IA** con lo aprendido: por ejemplo, ciclos por producto o temporadas.

---

## Pendiente por validar con la empresa

- **¿Qué es el recurso «com»?** [por confirmar]
- **¿Cuántos días sin comprar hacen a un cliente frío (inactivo)?** Hoy usamos 2 veces su ritmo o 180 días (se cambian en `src/config/umbrales.ts` y en `/configuracion`) [por confirmar].
- **¿Cuánto tarda hoy el consolidado del mes?** En la web aparece como «[por confirmar con Green Services]»; cuando lo sepamos, se escribe en `src/config/impacto.ts` [por confirmar].
- **¿Venden en USD, en COP o en ambos?** El prototipo guarda las dos monedas y convierte con la TRM del día [por confirmar].
