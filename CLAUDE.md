# Prototipo omnicanal · Salud Digna (HackaTec Nacional)

## Qué es
Portal web del paciente para el reto "Un paciente, una sola conversación". El jurado lo opera en vivo:
todo botón debe hacer algo visible y el flujo debe resistir interrupciones y cambios de canal.
Stack: React 19 + Vite + Tailwind 4 + TypeScript. Datos simulados (no hay APIs reales).

## Comandos
- `npm install` · `npm run dev` · `npm run build` (debe pasar sin errores antes de terminar cualquier tarea)
- `npx tsc --noEmit` para revisar tipos (`vite build` no los revisa).

## Estructura
- `src/App.tsx`: estado global (sesión, vista, clínica, trámite) y contexto `useApp`. Sin sesión muestra la página
  principal pública; "Iniciar sesión" (esquina superior derecha) abre `Entrar` con el rol elegido. Las acciones
  privadas (agendar, trámites, resultados, pago) piden iniciar sesión y se completan al entrar como paciente.
  Paciente ve el portal; Asesor y Administrador ven `StaffHeader` + `views/Asesor`.
- Agendado en 4 pasos (`TOTAL_PASOS`): Estudio, Clínica, Fecha y hora, Pago. El paciente se identifica por su cuenta
  del portal; por ahora NO se usa el número de teléfono como identificador.
- Fecha y hora: `SelectorHorario` (calendario + hora/minutos). Nunca permite fechas u horas pasadas (`yaPaso`).
  Solo muestra días y horas disponibles (los ocupados o pasados no se dibujan).
- Clínicas: `data/clinicasData.ts` (GENERADO: 261 sucursales reales de las páginas públicas de salud-digna.org, con
  estado, ciudad, dirección, teléfono, coordenadas y horario; no editar a mano ni inventar clínicas) y
  `data/clinics.ts` (búsqueda y distancias). `components/BuscadorClinica`: estado, ciudad, sucursal y
  "Usar mi ubicación" (geolocalización real; si no se comparte, ubicación de ejemplo en Culiacán), de 20 en 20.
  Lo usan el paso 2 del agendado y `ClinicSheet` (también el asesor).
- Mapa: `components/MapaClinicas` (Leaflet + mosaicos de OpenStreetMap, sin clave; atribución obligatoria) muestra todas
  las coincidencias del buscador; tocar un punto elige la clínica. Se carga diferido con `MapaDiferido` (no pesa en el
  inicio) y, si no se puede descargar, avisa y la lista sigue funcionando. Sin animaciones de zoom/encuadre: Leaflet
  falla si se desmonta a mitad de una animación. En pruebas automatizadas, `tile.openstreetmap.org` se sirve con una imagen vacía.
- `src/components/`: piezas de interfaz (Header, StaffHeader, Cookies, ContinueCard, Search, Packages, Help, Footer, BottomNav, ClinicSheet, BuscadorClinica, SelectorHorario, Pwa, Icon, ui).
- `src/views/`: Entrar, Home, Agendar, Pay, Tramites, Resultados, Asesor (también la usa Administrador).
- `src/data/`: clinics, studies, packages.
- `src/state/tramite.ts`: tipo `Tramite`, persistencia en localStorage (`sd_tramite_activo`) y línea de tiempo de eventos.
  Los eventos `nota.interna` solo los ven Asesor/Administrador. Las pestañas se sincronizan con el evento `storage`.
- `src/state/sesion.ts`: roles y credenciales de demostración (`sd_sesion` en localStorage + copia por pestaña en
  sessionStorage, para tener Paciente y Asesor abiertos a la vez).

## PWA
- `public/manifest.webmanifest` (íconos en `public/icons/`, atajos `?accion=agendar|tramites`) y `public/sw.js`.
- El service worker solo se registra en la versión compilada (`import.meta.env.PROD`), nunca en `npm run dev`.
  Precarga index.html y los archivos de `/assets/` que enlaza; navegación con red primero y respaldo en caché.
  Al cambiar `sw.js`, sube `VERSION` para que los clientes descarten la caché anterior.
- Probar: `npm run preview:pwa` (compila y sirve en la red local). Instalar requiere localhost o HTTPS.
- `components/Pwa.tsx`: aviso de conexión (en el flujo, no fijo) y botón "Instalar app" (solo si el navegador lo ofrece).

## Sistema visual (no cambiar sin pedirlo)
- Colores: azul acción #0074D9 (hover #005BB0), azul marino #004480 (reservado; la tarjeta de continuidad ahora es
  blanca con borde #D6E4F5 y texto oscuro, como el buscador),
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
- Clínicas: directorio completo en `data/clinicasData.ts` (261 sucursales, 32 estados). La clínica inicial del
  portal es Culiacán (Ruperto L. Paliza #87, Col. Centro, (667) 712 60 83).
- WhatsApp +52 55 3956 6729 (asistente 24/7, asesores 7:00–21:00). Call Center 55 5554 7166.
- Paquetes reales: Integral mujer $630, Mastografía + densitometría $300, Mastografía + electro $320.
- Precios de estudios individuales: NO inventar; mostrar "Precio según tu clínica".
  Cualquier monto, referencia u horario simulado debe decir "de ejemplo" o "demo".

## Reglas de trabajo
- No romper lo que ya funciona: vistas home, pay, tramites, resultados, agendar; panel de clínicas; aviso de cookies.
- Cambios pequeños y verificables; textos de interfaz en español de México.
- Al terminar: `npm run build`, revisar que ningún enlace apunte a un id inexistente
  y que todo <button> tenga onClick. Resume qué cambió y qué quedó pendiente.
