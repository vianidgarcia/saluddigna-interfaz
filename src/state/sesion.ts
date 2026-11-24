/* Acceso por rol simulado. Credenciales de demostración: no hay autenticación real. */

/** Solo el personal inicia sesión; el paciente usa el portal sin cuenta. */
export type Rol = 'asesor' | 'admin'
export type Sesion = { rol: Rol; correo: string; nombre: string; inicio: string }

export const SESION_KEY = 'sd_sesion'
/** copia por pestaña: permite tener Paciente y Asesor abiertos a la vez en dos pestañas */
const SESION_TAB_KEY = 'sd_sesion_pestana'

export const ROL: Record<Rol, string> = { asesor: 'Asesor', admin: 'Administrador' }

export const CREDENCIALES: { rol: Rol; correo: string; clave: string; nombre: string; descripcion: string }[] = [
  { rol: 'asesor', correo: 'asesor@demo.mx', clave: 'demo123', nombre: 'Asesor Call Center', descripcion: 'Atención al paciente: ficha, línea de tiempo y acciones.' },
  { rol: 'admin', correo: 'admin@demo.mx', clave: 'demo123', nombre: 'Administración', descripcion: 'Lo mismo que el asesor, más el control de la demo.' },
]

const parse = (raw: string | null): Sesion | null => {
  if (!raw) return null
  try {
    const s = JSON.parse(raw) as Sesion
    return s && (s.rol === 'asesor' || s.rol === 'admin') ? s : null
  } catch {
    return null
  }
}

export function loadSesion(): Sesion | null {
  try {
    return parse(window.sessionStorage.getItem(SESION_TAB_KEY)) ?? parse(window.localStorage.getItem(SESION_KEY))
  } catch {
    return null
  }
}

export function saveSesion(s: Sesion | null) {
  try {
    if (s) {
      const raw = JSON.stringify(s)
      window.localStorage.setItem(SESION_KEY, raw)
      window.sessionStorage.setItem(SESION_TAB_KEY, raw)
    } else {
      window.localStorage.removeItem(SESION_KEY)
      window.sessionStorage.removeItem(SESION_TAB_KEY)
    }
  } catch {
    /* sin almacenamiento: la sesión vive solo en memoria */
  }
}

/** Valida contra las credenciales de demostración. Devuelve la sesión o un mensaje de error. */
export function entrar(rol: Rol, correo: string, clave: string): Sesion | string {
  const c = CREDENCIALES.find((x) => x.correo === correo.trim().toLowerCase())
  if (!c || c.clave !== clave) return 'Correo o contraseña incorrectos. Usa las credenciales de demostración de abajo.'
  if (c.rol !== rol) return `Ese correo es de ${ROL[c.rol]}. Cambia el rol o usa otra cuenta.`
  return { rol, correo: c.correo, nombre: c.nombre, inicio: new Date().toISOString() }
}
