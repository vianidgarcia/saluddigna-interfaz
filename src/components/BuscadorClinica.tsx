import { useState, type RefObject } from 'react'
import { ESTADOS, UBICACION_DEMO, buscarClinicas, ciudadesDe, type Punto } from '../data/clinics'
import { Icon } from './Icon'
import { outlineBtn } from './ui'

/* Buscador de clínicas por estado, ciudad y sucursal, con "Usar mi ubicación".
   Lo usan el paso 2 del agendado y el panel de clínicas (también el del asesor). */

const POR_PAGINA = 20
type Ubicacion = Punto & { fuente: 'real' | 'demo' }

export function useBuscadorClinica() {
  const [estado, setEstadoRaw] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [q, setQ] = useState('')
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null)
  const [buscando, setBuscando] = useState(false)
  const [limite, setLimite] = useState(POR_PAGINA)
  const reinicia = () => setLimite(POR_PAGINA)

  const setEstado = (e: string) => { setEstadoRaw(e); setCiudad(''); reinicia() } // al cambiar de estado, la ciudad se reinicia
  const limpiar = () => { setEstadoRaw(''); setCiudad(''); setQ(''); setUbicacion(null); reinicia() }

  /** Pide la ubicación al navegador; si no la comparte (o tarda), usa una ubicación de ejemplo. */
  const usarUbicacion = () => {
    setBuscando(true)
    const demo = () => { setUbicacion({ lat: UBICACION_DEMO.lat, lng: UBICACION_DEMO.lng, fuente: 'demo' }); setBuscando(false) }
    setEstadoRaw(''); setCiudad(''); setQ(''); reinicia()
    if (!('geolocation' in navigator)) return demo()
    navigator.geolocation.getCurrentPosition(
      (p) => { setUbicacion({ lat: p.coords.latitude, lng: p.coords.longitude, fuente: 'real' }); setBuscando(false) },
      demo,
      { timeout: 8000, maximumAge: 300000 },
    )
  }

  const todos = buscarClinicas({ estado, ciudad, q, desde: ubicacion })
  const activo = !!(estado || ciudad || q || ubicacion)
  return {
    estado, setEstado, ciudad, setCiudad: (c: string) => { setCiudad(c); reinicia() }, q, setQ: (x: string) => { setQ(x); reinicia() },
    ubicacion, buscando, usarUbicacion, limpiar, activo,
    total: todos.length,
    resultados: activo ? todos.slice(0, limite) : [],
    hayMas: activo && todos.length > limite,
    verMas: () => setLimite((n) => n + POR_PAGINA),
  }
}
export type Buscador = ReturnType<typeof useBuscadorClinica>

const select = 'h-12 w-full appearance-none rounded-lg border border-[#D6E4F5] bg-white pl-4 pr-10 text-base text-[#1F2933] transition-colors hover:border-[#0074D9]'

export function FiltrosClinica({ b, id, inputRef }: { b: Buscador; id: string; inputRef?: RefObject<HTMLInputElement | null> }) {
  const ciudades = ciudadesDe(b.estado)
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-estado`} className="text-base font-semibold text-[#1F2933]">Estado</label>
          <div className="relative mt-2">
            <select id={`${id}-estado`} value={b.estado} onChange={(e) => b.setEstado(e.target.value)} className={select}>
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <Icon n="left" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-[#5B6B7A]" />
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-ciudad`} className="text-base font-semibold text-[#1F2933]">Ciudad</label>
          <div className="relative mt-2">
            <select id={`${id}-ciudad`} value={b.ciudad} onChange={(e) => b.setCiudad(e.target.value)} className={select}>
              <option value="">{b.estado ? `Todas las ciudades de ${b.estado}` : 'Todas las ciudades'}</option>
              {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Icon n="left" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-[#5B6B7A]" />
          </div>
        </div>
      </div>
      <label htmlFor={`${id}-q`} className="mt-3 block text-base font-semibold text-[#1F2933]">Sucursal</label>
      <div className="relative mt-2">
        <Icon n="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
        <input ref={inputRef} id={`${id}-q`} value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Nombre de la sucursal, colonia o calle"
          className="h-12 w-full rounded-lg border border-[#D6E4F5] bg-white pl-12 pr-3 text-base text-[#1F2933] transition-colors hover:border-[#0074D9]" />
      </div>
      <button onClick={b.usarUbicacion} disabled={b.buscando} className={`${outlineBtn} mt-3 w-full sm:w-auto disabled:cursor-wait`}>
        <Icon n="target" />{b.buscando ? 'Buscando tu ubicación…' : 'Usar mi ubicación'}
      </button>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4">
        <p role="status" className="t-meta text-[#5B6B7A]">
          {!b.activo ? `${b.total} clínicas en ${ESTADOS.length} estados. Elige estado y ciudad, busca una sucursal o usa tu ubicación.`
            : `${b.total === 1 ? '1 clínica encontrada' : `${b.total} clínicas encontradas`}${b.ubicacion ? (b.ubicacion.fuente === 'real' ? ', de la más cercana a la más lejana' : ` cerca de ${UBICACION_DEMO.nombre} (ubicación de ejemplo: el navegador no compartió la tuya)`) : ''}`}
        </p>
        {b.activo && <button onClick={b.limpiar} className="inline-flex min-h-12 items-center rounded-md px-1 t-meta font-semibold text-[#005BB0] underline underline-offset-4 hover:text-[#003F7A]">Limpiar filtros</button>}
      </div>
    </div>
  )
}

/** "Mostrar más" al final de la lista de resultados. */
export function MasClinicas({ b }: { b: Buscador }) {
  if (!b.hayMas) return null
  return (
    <button onClick={b.verMas} className={`${outlineBtn} mt-2 w-full`}>
      Mostrar más clínicas <span className="font-normal">({b.resultados.length} de {b.total})</span>
    </button>
  )
}

export const fmtKm = (km: number) => `${km < 10 ? km.toFixed(1) : Math.round(km).toLocaleString('es-MX')} km`
