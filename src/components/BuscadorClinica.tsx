import { useState, type RefObject } from 'react'
import { ESTADOS, buscarClinicas, ciudadesDe } from '../data/clinics'
import { Icon } from './Icon'

/* Buscador de clínicas por estado, ciudad y sucursal. Lo usan el paso 2 del agendado y el panel de clínicas. */

export function useBuscadorClinica(inicial: { estado?: string; ciudad?: string } = {}) {
  const [estado, setEstadoRaw] = useState(inicial.estado ?? '')
  const [ciudad, setCiudad] = useState(inicial.ciudad ?? '')
  const [q, setQ] = useState('')
  const setEstado = (e: string) => { setEstadoRaw(e); setCiudad('') } // al cambiar de estado, la ciudad se reinicia
  const limpiar = () => { setEstadoRaw(''); setCiudad(''); setQ('') }
  const lista = buscarClinicas({ estado, ciudad, q })
  return { estado, setEstado, ciudad, setCiudad, q, setQ, limpiar, lista, activo: !!(estado || ciudad || q) }
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
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4">
        <p role="status" className="t-meta text-[#5B6B7A]">
          {b.lista.length === 1 ? '1 clínica encontrada' : `${b.lista.length} clínicas encontradas`}
        </p>
        {b.activo && <button onClick={b.limpiar} className="inline-flex min-h-12 items-center rounded-md px-1 t-meta font-semibold text-[#005BB0] underline underline-offset-4 hover:text-[#003F7A]">Limpiar filtros</button>}
      </div>
    </div>
  )
}
