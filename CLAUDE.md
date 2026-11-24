# Prototipo omnicanal · Salud Digna (HackaTec Nacional)

## Qué es
Portal web del paciente para el reto "Un paciente, una sola conversación". El jurado lo opera en vivo:
todo botón debe hacer algo visible y el flujo debe resistir interrupciones y cambios de canal.
Stack: React 19 + Vite + Tailwind 4 + TypeScript. Datos simulados (no hay APIs reales).

## Comandos
- `npm install` · `npm run dev` · `npm run build` (debe pasar sin errores antes de terminar cualquier tarea)
- `npx tsc --noEmit` para revisar tipos (`vite build` no los revisa).

## Estructura
- `src/App.tsx`: estado global (sesión del personal, vista, clínica, trámite) y contexto `useApp`.
  EL PACIENTE NO TIENE CUENTA: usa todo el portal sin iniciar sesión (no hay usuario de prueba de paciente).
  "Iniciar sesión" (esquina superior derecha; "Entrar" por debajo de 1280 px) es solo para el personal: Asesor y
  Administrador, que ven `StaffHeader` + `views/Asesor`.
- Agendado en 4 pasos (`TOTAL_PASOS`): Estudio, Clínica, Fecha y hora, Pago. El trámite se identifica por su FOLIO
  (`id`, p. ej. SD-MX…) y el nombre que se pide en el paso 4 ("¿A nombre de quién es la cita?"); el asesor busca por
  cualquiera de los dos. No se usa teléfono ni cuenta como identificador.
- Fecha y hora: `SelectorHorario`. Calendario de 6 semanas fijas: los días de otros meses y los días sin lugar se
  ven atenuados y no se pueden elegir; solo los días disponibles son botones. Hora: campo "Hora de la cita" con panel
  de dos columnas (hora y minutos, estilo time picker digital, sin librerías) que solo lista horarios libres.
  Nunca permite fechas u horas pasadas (`yaPaso`).
- Clínicas: `data/clinicasData.ts` (GENERADO: 261 sucursales reales de las páginas públicas de salud-digna.org, con
  estado, ciudad, dirección, teléfono, coordenadas y horario; no editar a mano ni inventar clínicas) y
  `data/clinics.ts` (búsqueda y distancias). `components/BuscadorClinica`: estado, ciudad, sucursal y
  "Usar mi ubicación" (geolocalización real; si no se comparte, ubicación de ejemplo en Culiacán), de 20 en 20.
  Lo usan el paso 2 del agendado y `ClinicSheet` (también el asesor).
- Mapa: `components/MapaClinicas` (Leaflet + mosaicos de OpenStreetMap, sin clave; atribución obligatoria) muestra todas
  las coincidencias del buscador; tocar un punto elige la clínica. Se carga diferido con `MapaDiferido` (no pesa en el
  inicio) y, si no se puede descargar, avisa y la lista sigue funcionando. Sin animaciones de zoom/encuadre: Leaflet
  falla si se desmonta a mitad de una animación. En pruebas automatizadas, `tile.openstreetmap.org` se sirve con una imagen vacía.
- `src/components/`: piezas de interfaz (Header, StaffHeader, Cookies, ContinueCard, Search, Packages, Help, Footer, BottomNav, ClinicSheet, BuscadorClinica, MapaClinicas, MapaDiferido, SelectorHorario, Pwa, Tema, Icon, ui).
- `src/views/`: Entrar, Home, Agendar, Pay, Tramites, Resultados, Asesor (también la usa Administrador).
- `src/data/`: clinics, studies, packages.
- `src/state/tramite.ts`: tipo `Tramite`, persistencia en localStorage (`sd_tramite_activo`) y línea de tiempo de eventos.
  Los eventos `nota.interna` solo los ven Asesor/Administrador. Las pestañas se sincronizan con el evento `storage`.
- `src/state/sesion.ts`: roles del personal (asesor, admin) y credenciales de demostración (`sd_sesion` en localStorage +
  copia por pestaña en sessionStorage, para tener el portal y la vista del asesor abiertos a la vez).
- Pagos: `src/state/pasarela.ts` es una pasarela SIMULADA (tarjeta con verificación 3-D Secure, efectivo en tienda y
  SPEI) cuya respuesta imita un cargo real (id, estado, autorización), para reemplazarla por una integración real
  (con servidor y llave privada) sin tocar la interfaz. `views/Pay.tsx`: checkout por método. Tarjetas de prueba:
  4111…1111 y 5555…4444 aprobadas, 4000…3220 pide código 123456, 4000…0002 rechazada, 4000…9995 sin fondos.
  Nunca se guarda el número completo ni el CVV (solo marca y últimos 4); los campos tienen autocomplete="off".
  Los eventos del pago usan el canal `pasarela`. Pendiente por definir: liga de pago enviada por el asesor.

## PWA
- `public/manifest.webmanifest` (íconos en `public/icons/`, atajos `?accion=agendar|tramites`) y `public/sw.js`.
- El service worker solo se registra en la versión compilada (`import.meta.env.PROD`), nunca en `npm run dev`.
  Precarga index.html y los archivos de `/assets/` que enlaza; navegación con red primero y respaldo en caché.
  Al cambiar `sw.js`, sube `VERSION` para que los clientes descarten la caché anterior.
- Probar: `npm run preview:pwa` (compila y sirve en la red local). Instalar requiere localhost o HTTPS.
- `components/Pwa.tsx`: aviso de conexión (en el flujo, no fijo) y botón "Instalar app" (solo si el navegador lo ofrece).

## Sistema visual (no cambiar sin pedirlo)
- Colores con nombre (src/index.css, `@theme`): usa SIEMPRE las clases con nombre, nunca hex sueltos:
  `text-titulo` #1F2933, `text-cuerpo` #43474A, `text-secundario` #5B6B7A, `text-enlace` #005BB0, `text-icono` #0074D9,
  `bg-accion` #0074D9 (hover `bg-accion-hover` #005BB0, activo `bg-accion-activo` #004480), `bg-superficie` (blanco),
  `bg-banda` #ECF3F9, `bg-resaltado` #EBF4FC, `bg-resaltado-2` #D6E4F5, `border-borde` #D6E4F5, `border-borde-accion`.
  Ámbar SOLO para pendiente (`bg-ambar`, `bg-ambar-fondo`, `text-ambar-texto`). Verde `text-verde` SOLO para
  confirmación final. Error `text-error`/`border-error`. Nunca gris plano.
- Modo oscuro: `data-tema="oscuro"` en <html> redefine esas variables (index.html lo fija antes de pintar según
  `sd_tema` o la preferencia del sistema; `components/Tema.tsx` lo alterna). Los rellenos de acción conservan su azul.
  El botón está en el encabezado (≥1280 px), en "Menú" (móvil), en el pie, en Entrar y en el encabezado del personal.
  El encabezado del portal va justo de ancho: sus botones no se envuelven (whitespace-nowrap); revisa 1024, 1280 y
  1440 px al agregarle algo. Únicas excepciones con color fijo: el aviso flotante (toast)
  y el fondo del panel de clínicas (#1F2933).
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
