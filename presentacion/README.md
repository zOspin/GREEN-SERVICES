# Presentación — Órbita (Estud-IA)

Presentación del equipo **Órbita** para el hackatón Estud-IA (reto 4, IA en operaciones, Green Services and Solutions SAS). Se hizo en Claude (Slides) y aquí está su código fuente para que Claude Code la analice y mantenga la web coherente con ella.

## Archivos

- `slides.html`: las 16 diapositivas, cada una es un `<section>` de 1920×1080 px. Dentro de cada `<aside>` están las notas del orador (lo que dice el comunicador).
- `deck.css`: los estilos compartidos (colores, tipografías, tarjetas y animaciones).

## Orden de las diapositivas

1. **portada**: "Órbita · Inteligencia que gira a tu alrededor", con el logo de la órbita animado.
2. **equipo**: Daniel (coordinador), Mateo (comunicador), Emmanuel (diseñador), Juan Pablo y Manuel (investigadores) y Vanessa (documentación).
3. **empresa**: quién es Green Services.
4. **problema**: "Los datos existen, pero llegan tarde" (regados, a mano, reactivo).
5. **quienes**: las 3 áreas afectadas (Operaciones, Comercial y ventas, Gerencia Financiera).
6. **preguntas**: las 3 preguntas "¿Cómo podríamos…?".
7. **solucion**: una plataforma, tres soluciones.
8. **flujo**: Entran → Se unen → La IA analiza → Avisa → Actúan.
9. **ia**: la IA explicada con el ejemplo de la panadería y los estados activo / en riesgo / inactivo.
10. **modulo-ops**: Centro de datos (espacio para captura de la web).
11. **modulo-com**: Radar de clientes (dibujo del radar; reemplazar por captura).
12. **modulo-fin**: Panel financiero (espacio para captura de la web).
13. **antes-ahora**: Antes vs. Con Órbita.
14. **evidencia**: lo que sabemos, lo que suponemos y lo que falta.
15. **siguientes**: Hoy (prototipo) → Piloto con datos reales → Conexión directa.
16. **cierre**: "¡Gracias!" y paso a la demo en vivo.

## Identidad visual (debe coincidir con la web)

- **Fondo oscuro:** #0B1020. **Superficies:** #141C36 y #1C2748. **Bordes:** #2A3760.
- **Texto claro:** #F4F1EA. **Texto secundario:** #B9C3DA.
- **Acento dorado:** #F5A524.
- **Color por área:** Operaciones azul #5B9BFF, Comercial dorado #F5A524, Financiera turquesa #2DD4BF.
- **Fondo claro alterno:** #F4F1EA, con texto #131A2E.
- **Tipografías:** Space Grotesk para los títulos e Inter para el texto.
- **Nombres de los módulos:** Centro de datos, Radar de clientes y Panel financiero.

## Qué se le pide a Claude Code

1. Revisar que la web use los mismos nombres de módulos, colores, tipografías y mensajes que la presentación.
2. Que el "Modo presentación" de la web continúe donde termina esta presentación (diapositiva 16 → demo en vivo).
3. Sugerir qué capturas de la web poner en las diapositivas 10, 11 y 12.
