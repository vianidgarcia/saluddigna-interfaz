/* Clínicas reales de salud-digna.org. km = distancia de demostración (solo donde se simula la ubicación).
   Para agregar clínicas basta con sumar filas con su estado y ciudad: el buscador se arma solo. */

export type Clinic = { name: string; estado: string; ciudad: string; address: string; phone: string; km?: number }
export const CLINICS: Clinic[] = [
  { name: 'Culiacán', estado: 'Sinaloa', ciudad: 'Culiacán', km: 1.2, address: 'Ruperto L. Paliza #87, Col. Centro', phone: '(667) 712 60 83' },
  { name: 'Culiacán Cañadas', estado: 'Sinaloa', ciudad: 'Culiacán', km: 2.6, address: 'Manuel J. Clouthier #1716, Col. Cañadas', phone: '(667) 712 60 83' },
  { name: 'Culiacán Colegio Militar', estado: 'Sinaloa', ciudad: 'Culiacán', km: 3.4, address: 'Calz. Heroico Colegio Militar #1384, Col. Emiliano Zapata', phone: '(667) 712 60 83' },
  { name: 'Culiacán Universitarios', estado: 'Sinaloa', ciudad: 'Culiacán', km: 4.1, address: 'Av. Juan de la Barrera #2419 Nte., Col. Tierra Blanca', phone: '(667) 170 9180' },
  { name: 'Culiacán La Conquista', estado: 'Sinaloa', ciudad: 'Culiacán', km: 5.3, address: 'Blvd. Conquistadores #1246 Int. 2, Col. La Conquista', phone: '(667) 170 9180' },
  { name: 'Culiacán Las Torres', estado: 'Sinaloa', ciudad: 'Culiacán', km: 6.0, address: 'Alcatraz #3070 Sur Local 11, Col. Bugambilias', phone: '(667) 712 60 83' },
  { name: 'Culiacán Nakayama', estado: 'Sinaloa', ciudad: 'Culiacán', km: 7.2, address: 'Av. Gral. Fernando Cuen #5903-3 Sur, Col. Antonio Nakayama', phone: '(667) 170 9180' },
]
export const tel = (p: string) => 'tel:+52' + p.replace(/\D/g, '')
export const findClinic = (name: string | null) => CLINICS.find((c) => c.name === name) ?? null
const norm = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
const porNombre = (a: string, b: string) => a.localeCompare(b, 'es')

export const ESTADOS = Array.from(new Set(CLINICS.map((c) => c.estado))).sort(porNombre)
export const ciudadesDe = (estado: string) =>
  Array.from(new Set(CLINICS.filter((c) => !estado || c.estado === estado).map((c) => c.ciudad))).sort(porNombre)

/** Buscador por estado, ciudad y sucursal (nombre, colonia o dirección). Sin acentos ni mayúsculas.
    Orden: por distancia de demostración cuando existe; si no, por estado, ciudad y nombre. */
export function buscarClinicas({ estado = '', ciudad = '', q = '' }: { estado?: string; ciudad?: string; q?: string } = {}) {
  const t = norm(q)
  return CLINICS
    .filter((c) => (!estado || c.estado === estado) && (!ciudad || c.ciudad === ciudad) && (!t || norm(`${c.name} ${c.address} ${c.ciudad}`).includes(t)))
    .sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9) || porNombre(a.estado, b.estado) || porNombre(a.ciudad, b.ciudad) || porNombre(a.name, b.name))
}
/** Compatibilidad: búsqueda solo por texto. */
export const clinicasPorDistancia = (q = '') => buscarClinicas({ q })
