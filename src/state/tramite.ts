/* Estado del trámite: simula al orquestador omnicanal. Todo es de demostración. */

export type Canal = 'web' | 'whatsapp' | 'call_center' | 'clinica'
export type MetodoPago = 'en_linea' | 'oxxo' | 'en_clinica'
export type Paso = 1 | 2 | 3 | 4 | 5
export type Estado = 'en_curso' | 'pago_pendiente' | 'confirmada'

export type Evento = { tipo: string; canal: Canal; fecha: string; detalle: string }

export type Tramite = {
  id: string
  estudio: { categoria: string; nombre: string; precio?: string } | null
  clinica: string | null
  /** true cuando el paciente eligió "Aún no lo decido" */
  clinicaPendiente: boolean
  fecha: string | null // AAAA-MM-DD
  hora: string | null // HH:MM
  /** codigoEnviado: ya se mandó un código y se espera que el paciente lo escriba */
  paciente: { nombre: string; whatsapp: string | null; verificado: boolean; codigoEnviado?: boolean }
  metodoPago: MetodoPago | null
  paso: Paso
  estado: Estado
  /** el paciente entró a editar un dato desde el resumen del paso 5 */
  desdeResumen: boolean
  canalInicio: Canal
  ultimoCanal: Canal
  ultimaActualizacion: string
  eventos: Evento[]
}

export const STORAGE_KEY = 'sd_tramite_activo'

export const PASOS: Record<Paso, string> = {
  1: 'Estudio',
  2: 'Clínica',
  3: 'Fecha y hora',
  4: 'Identificación',
  5: 'Pago',
}

export const CANAL: Record<Canal, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  call_center: 'Call Center',
  clinica: 'clínica',
}

export const METODO: Record<MetodoPago, string> = {
  en_linea: 'Pago en línea',
  oxxo: 'Pago en Oxxo',
  en_clinica: 'Pago en clínica',
}

export function loadTramite(): Tramite | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const t = JSON.parse(raw) as Tramite
    return t && t.id && Array.isArray(t.eventos) ? t : null
  } catch {
    return null
  }
}

export function saveTramite(t: Tramite | null) {
  try {
    if (t) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(t))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* almacenamiento bloqueado (ventana privada o vista previa): el flujo sigue en memoria */
  }
}

export function nuevoTramite(canal: Canal = 'web'): Tramite {
  const now = new Date().toISOString()
  return {
    id: 'SD-' + Date.now().toString(36).toUpperCase(),
    estudio: null,
    clinica: null,
    clinicaPendiente: false,
    fecha: null,
    hora: null,
    paciente: { nombre: 'Ana', whatsapp: null, verificado: false },
    metodoPago: null,
    paso: 1,
    estado: 'en_curso',
    desdeResumen: false,
    canalInicio: canal,
    ultimoCanal: canal,
    ultimaActualizacion: now,
    eventos: [{ tipo: 'tramite.iniciado', canal, fecha: now, detalle: 'Inició el agendado de una cita' }],
  }
}

/** Agrega un evento a la línea de tiempo y actualiza el último canal. */
export function conEvento(t: Tramite, tipo: string, detalle: string, canal: Canal = 'web'): Tramite {
  const fecha = new Date().toISOString()
  return { ...t, ultimoCanal: canal, ultimaActualizacion: fecha, eventos: [...t.eventos, { tipo, canal, fecha, detalle }] }
}

/** Qué pasos ya tienen su dato completo. */
export function pasoCompleto(t: Tramite, p: Paso): boolean {
  switch (p) {
    case 1: return !!t.estudio
    case 2: return !!t.clinica || t.clinicaPendiente
    case 3: return !!t.fecha && !!t.hora
    case 4: return t.paciente.verificado
    case 5: return !!t.metodoPago
  }
}

export function hace(iso: string, now = Date.now()): string {
  const min = Math.floor((now - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'hace un momento'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  return 'el ' + new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const ultimos4 = (w: string | null) => (w ? '••• ' + w.slice(-4) : '')

/** Qué le falta al paciente en cada paso (tarjeta de continuidad y Mis trámites). */
export const PENDIENTE: Record<Paso, string> = {
  1: 'Elige tu estudio',
  2: 'Elige tu clínica',
  3: 'Elige fecha y hora',
  4: 'Confirma tu WhatsApp',
  5: 'Elige cómo pagar',
}

export const ICONO_CANAL: Record<Canal, string> = { web: 'globe', whatsapp: 'chat', call_center: 'phone', clinica: 'pin' }

/** Texto de estado corto para la tarjeta y Mis trámites. */
export function estadoTexto(t: Tramite): string {
  if (t.estado === 'confirmada') return 'Cita confirmada'
  if (t.estado === 'pago_pendiente') return 'Pago pendiente en Oxxo'
  return PENDIENTE[t.paso]
}

export function clinicaTexto(t: Tramite): string {
  return t.clinica ?? (t.clinicaPendiente ? 'Clínica por decidir' : 'Clínica por elegir')
}

/** Hook para refrescar textos relativos ("hace 2 min"). */
export const TICK_MS = 30000

/** Relleno de la barra (%): el paso actual cuenta como medio segmento, así el paso 5 no se ve terminado. */
export const avance = (paso: number) => (paso - 0.5) * 20

/** Eventos que solo ven asesores y administradores. */
export const esNotaInterna = (e: Evento) => e.tipo === 'nota.interna'

/** Agrega una nota interna sin cambiar el último canal que ve el paciente. */
export function conNota(t: Tramite, texto: string, autor: string): Tramite {
  return { ...t, eventos: [...t.eventos, { tipo: 'nota.interna', canal: 'call_center', fecha: new Date().toISOString(), detalle: `${autor}: ${texto}` }] }
}

/** ¿Ya se envió un código? (trámites guardados antes de este campo: se infiere del número) */
export const codigoEnviado = (t: Tramite) => t.paciente.codigoEnviado ?? (!!t.paciente.whatsapp && !t.paciente.verificado)

export const TIPO_EVENTO: Record<string, string> = {
  'tramite.iniciado': 'Trámite iniciado',
  'tramite.paso_completado': 'Paso completado',
  'tramite.paso_regresado': 'Regresó un paso',
  'tramite.dato_editado': 'Editó un dato',
  'tramite.retomado': 'Retomó el trámite',
  'paciente.whatsapp_identificado': 'Número identificado',
  'paciente.codigo_enviado': 'Código de verificación enviado',
  'paciente.verificado': 'Identidad verificada',
  'pago.referencia_generada': 'Referencia de pago generada',
  'pago.referencia_enviada': 'Referencia enviada por WhatsApp',
  'pago.metodo_cambiado': 'Cambió el método de pago',
  'canal.mensaje_recibido': 'Mensaje recibido',
  'asesor.clinica_confirmada': 'Clínica confirmada',
  'asesor.reagendado': 'Cita reagendada',
  'cita.confirmada': 'Cita confirmada',
  'nota.interna': 'Nota interna',
}

/** "10:42" si es de hoy; "24 nov, 10:42" si no. */
export function horaEvento(iso: string): string {
  const d = new Date(iso)
  const hora = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
  return d.toDateString() === new Date().toDateString() ? hora : `${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')}, ${hora}`
}
