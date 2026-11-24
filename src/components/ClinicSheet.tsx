import { useEffect, useRef } from 'react'
import type { Clinic } from '../data/clinics'
import { FiltrosClinica, MasClinicas, fmtKm, useBuscadorClinica } from './BuscadorClinica'
import { MapaClinicasDiferido as MapaClinicas } from './MapaDiferido'
import { Icon } from './Icon'
import { NB } from './ui'

export function ClinicSheet({ current, onSelect, onClose, titulo = 'Elige tu clínica', sinSeleccion = false }: {
  current: Clinic; onSelect: (c: Clinic) => void; onClose: () => void; titulo?: string; sinSeleccion?: boolean
}) {
  const b = useBuscadorClinica()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); prev?.focus?.() }
  }, [onClose])
  const list = b.resultados
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end lg:items-stretch">
      <div onClick={onClose} className="absolute inset-0 bg-[#1F2933]/50 [animation:fade_200ms_ease-out]" />
      <div role="dialog" aria-modal="true" aria-labelledby="sheet-t" className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-superficie [animation:sheet-up_250ms_cubic-bezier(.2,0,0,1)] lg:max-h-none lg:w-[440px] lg:rounded-none lg:[animation:sheet-right_250ms_cubic-bezier(.2,0,0,1)]">
        <div className="flex items-center justify-between border-b border-borde px-4 py-3 lg:px-6">
          <h2 id="sheet-t" className="t-card font-head text-titulo">{titulo}</h2>
          <button onClick={onClose} className="inline-flex min-h-12 items-center gap-1 rounded-md px-2 text-base font-semibold text-enlace hover:bg-resaltado active:bg-resaltado-2"><Icon n="x" />Cerrar</button>
        </div>
        <div className="px-4 pt-4 lg:px-6">
          <FiltrosClinica b={b} id="cs" inputRef={ref} />
          <div className="mt-3">
            <MapaClinicas alto="h-48 lg:h-56" clinicas={b.enMapa.map((r) => r.c)} elegida={sinSeleccion ? null : current.name} ubicacion={b.ubicacion}
              onElegir={(c) => { onSelect(c); onClose() }} />
          </div>
        </div>
        <ul className="mt-4 flex-1 overflow-y-auto px-4 pb-6 lg:px-6">
          {list.map(({ c, km }) => {
            const sel = !sinSeleccion && c.name === current.name
            return (
              <li key={c.name} className="border-t border-borde">
                <button onClick={() => { onSelect(c); onClose() }} aria-pressed={sel} className="-mx-2 flex w-[calc(100%+16px)] min-h-16 items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-resaltado active:bg-resaltado-2">
                  <span>
                    <span className="block t-sub font-bold text-titulo">{c.name}</span>
                    <span className="block t-meta text-secundario">{c.ciudad}, {c.estado}{km !== undefined && <> · {fmtKm(km)}</>}</span>
                    <span className="block t-meta text-cuerpo">{c.address}</span>
                    {c.phone && <span className="block t-meta text-secundario">Tel.{NB}{c.phone}</span>}
                  </span>
                  {sel && <span className="inline-flex items-center gap-1 t-meta font-semibold text-verde"><Icon n="check" size={18} />Elegida</span>}
                </button>
              </li>
            )
          })}
          {b.activo && !b.total && <li className="border-t border-borde py-4 t-body">No encontramos clínicas con esos filtros.</li>}
          <li><MasClinicas b={b} /></li>
        </ul>
      </div>
    </div>
  )
}
