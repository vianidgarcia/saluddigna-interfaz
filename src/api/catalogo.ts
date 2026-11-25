/* Puente entre los catálogos del portal y los del orquestador.
 *
 * El portal nombra las cosas por su NOMBRE (data/studies.ts, data/clinicasData.ts con las 261
 * sucursales reales). El orquestador las identifica por UUID. Aquí se emparejan por nombre
 * normalizado, con memoria para no volver a pedir el catálogo en cada paso.
 *
 * Si algo no empareja NO se inventa un id: se devuelve null y quien llama avisa. Es el síntoma de
 * que el catálogo de la base (core.clinicas / core.estudios) no trae lo mismo que el portal; la
 * solución de fondo es generar el seed de la base desde data/clinicasData.ts.
 */
import { catalogoEstudios, clinicasParaEstudio, type Cliente, type Clinica, type Estudio } from './api'
import { normalizar } from './mapa'

let estudios: Estudio[] | null = null
const clinicasPorEstudio = new Map<string, Clinica[]>()

/** Catálogo de estudios del orquestador (se pide una vez por sesión). */
export async function listaEstudios(c: Cliente): Promise<Estudio[]> {
  if (!estudios) estudios = await catalogoEstudios(c)
  return estudios
}

/** uuid del estudio cuyo nombre usa el portal. null si el catálogo de la base no lo tiene. */
export async function idEstudio(c: Cliente, nombre: string): Promise<string | null> {
  const n = normalizar(nombre)
  const lista = await listaEstudios(c)
  const exacto = lista.find((e) => normalizar(e.nombre) === n)
  if (exacto) return exacto.id
  // Tolerancia: el portal dice "Mastografía bilateral" y la base "Mastografía (bilateral)".
  const parcial = lista.find((e) => normalizar(e.nombre).includes(n) || n.includes(normalizar(e.nombre)))
  return parcial?.id ?? null
}

/** Clínicas que la base ofrece para ese estudio (con memoria por estudio). */
export async function listaClinicas(c: Cliente, estudioId: string): Promise<Clinica[]> {
  const previo = clinicasPorEstudio.get(estudioId)
  if (previo) return previo
  const lista = await clinicasParaEstudio(c, estudioId)
  clinicasPorEstudio.set(estudioId, lista)
  return lista
}

/**
 * uuid de la clínica cuyo nombre usa el portal.
 * El portal guarda nombres como "Culiacán Centro" y la base puede traer "Clínica Culiacán Centro":
 * se compara normalizado y, si no, por contenido en cualquiera de los dos sentidos.
 */
export async function idClinica(c: Cliente, estudioId: string, nombre: string): Promise<string | null> {
  const n = normalizar(nombre)
  const lista = await listaClinicas(c, estudioId)
  const exacto = lista.find((x) => normalizar(x.nombre) === n)
  if (exacto) return exacto.id
  const parcial = lista.find((x) => normalizar(x.nombre).includes(n) || n.includes(normalizar(x.nombre)))
  return parcial?.id ?? null
}

/** Olvida los catálogos (tras "Reiniciar demo" o un cambio de catálogo en la base). */
export function olvidarCatalogos() {
  estudios = null
  clinicasPorEstudio.clear()
}
