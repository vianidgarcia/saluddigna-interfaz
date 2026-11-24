# Prototipo omnicanal · Salud Digna (HackaTec Nacional)

## Qué es
Portal web del paciente para el reto "Un paciente, una sola conversación". El jurado lo opera en vivo:
todo botón debe hacer algo visible y el flujo debe resistir interrupciones y cambios de canal.
Stack: React 19 + Vite + Tailwind 4 + TypeScript. Datos simulados (no hay APIs reales).

## Comandos
- `npm install` · `npm run dev` · `npm run build` (debe pasar sin errores antes de terminar cualquier tarea)
- `npx tsc --noEmit` para revisar tipos (`vite build` no los revisa).

## Estructura
- `src/App.tsx`: estado global (vista, clínica, trámite) y contexto `useApp`.
- `src/components/`: piezas de interfaz (Header, Cookies, ContinueCard, Search, Packages, Help, Footer, BottomNav, ClinicSheet, Icon, ui).
- `src/views/`: Home, Agendar, Pay, Tramites, Resultados.
- `src/data/`: clinics, studies, packages.
- `src/state/tramite.ts`: tipo `Tramite`, persistencia en localStorage (`sd_tramite_activo`) y línea de tiempo de eventos.

## Sistema visual (no cambiar sin pedirlo)
- Colores: azul acción #0074D9 (hover #005BB0), azul marino #004480 (tarjeta de continuidad),
  fondo de banda #ECF3F9, superficie resaltada #EBF4FC, bordes #D6E4F5,
  texto títulos #1F2933, cuerpo #43474A, secundario #5B6B7A.
  Ámbar #F2A00D SOLO para viñetas/estado pendiente (insignia: fondo #FDF1DB, texto #7A4E00).
  Verde #006D3D SOLO para confirmación final. Nunca gris plano.
- Tipografía: títulos Montserrat 700 (utilidad `font-head`); todo lo demás Open Sans.
  Escala ya definida en src/index.css: t-greeting, t-section, t-card, t-sub, t-body, t-meta.
- Estructura: un solo contenedor max-w-[1200px] px-4 lg:px-8; bandas de fondo a todo el ancho;
  máximo un nivel de tarjetas (nunca tarjeta dentro de tarjeta).
- Un solo botón primario relleno por vista. Secundarios: borde. Terciarios: enlace.

## Accesibilidad (obligatorio)
- Contraste AA, objetivos táctiles ≥48px, etiquetas visibles en campos, íconos siempre con texto.
- Anillo de enfoque: reglas en src/index.css; dentro de fondos oscuros usar la clase `on-dark`.
- Encabezados en orden lógico; barras de progreso con aria-valuenow/aria-valuetext;
  mensajes dinámicos con role="status".
- Cookies en el flujo de la página (nunca fijas ni modales).

## Datos reales (no inventar otros)
- Clínicas de Culiacán: Culiacán (Ruperto L. Paliza #87, Col. Centro, (667) 712 60 83), Cañadas,
  Colegio Militar, Universitarios, La Conquista, Las Torres, Nakayama (ya están en CLINICS).
- WhatsApp +52 55 3956 6729 (asistente 24/7, asesores 7:00–21:00). Call Center 55 5554 7166.
- Paquetes reales: Integral mujer $630, Mastografía + densitometría $300, Mastografía + electro $320.
- Precios de estudios individuales: NO inventar; mostrar "Precio según tu clínica".
  Cualquier monto, referencia u horario simulado debe decir "de ejemplo" o "demo".

## Reglas de trabajo
- No romper lo que ya funciona: vistas home, pay, tramites, resultados, agendar; panel de clínicas; aviso de cookies.
- Cambios pequeños y verificables; textos de interfaz en español de México.
- Al terminar: `npm run build`, revisar que ningún enlace apunte a un id inexistente
  y que todo <button> tenga onClick. Resume qué cambió y qué quedó pendiente.
