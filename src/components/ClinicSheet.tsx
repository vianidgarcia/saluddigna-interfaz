import { useEffect, useRef, useState } from 'react'
import type { Clinic } from '../data/clinics'
import { FiltrosClinica, useBuscadorClinica } from './BuscadorClinica'
import { Icon } from './Icon'
import { NB, outlineBtn } from './ui'

export function ClinicSheet({ current, onSelect, onClose, titulo = 'Elige tu clínica', sinSeleccion = false }: {
  current: Clinic; onSelect: (c: Clinic) => void; onClose: () => void; titulo?: string; sinSeleccion?: boolean
}) {
  const b = useBuscadorClinica()
  const [located, setLocated] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); prev?.focus?.() }
  }, [onClose])
  const list = b.lista
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end lg:items-stretch">
      <div onClick={onClose} className="absolute inset-0 bg-[#1F2933]/50 [animation:fade_200ms_ease-out]" />
      <div role="dialog" aria-modal="true" aria-labelledby="sheet-t" className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white [animation:sheet-up_250ms_cubic-bezier(.2,0,0,1)] lg:max-h-none lg:w-[440px] lg:rounded-none lg:[animation:sheet-right_250ms_cubic-bezier(.2,0,0,1)]">
        <div className="flex items-center justify-between border-b border-[#D6E4F5] px-4 py-3 lg:px-6">
          <h2 id="sheet-t" className="t-card font-head text-[#1F2933]">{titulo}</h2>
          <button onClick={onClose} className="inline-flex min-h-12 items-center gap-1 rounded-md px-2 text-base font-semibold text-[#005BB0] hover:bg-[#EBF4FC] active:bg-[#D6E4F5]"><Icon n="x" />Cerrar</button>
        </div>
        <div className="px-4 pt-4 lg:px-6">
          <FiltrosClinica b={b} id="cs" inputRef={ref} />
          <button onClick={() => { b.limpiar(); b.setEstado('Sinaloa'); b.setCiudad('Culiacán'); setLocated(true) }} className={`${outlineBtn} mt-1 w-full`}><Icon n="target" />Usar mi ubicación</button>
          {located && <p role="status" className="mt-2 flex items-center gap-2 t-meta font-semibold text-[#006D3D]"><Icon n="check" size={16} />Ubicación de ejemplo: Culiacán, Sinaloa. Clínicas ordenadas por distancia.</p>}
        </div>
        <ul className="mt-4 flex-1 overflow-y-auto px-4 pb-6 lg:px-6">
          {list.map((c) => {
            const sel = !sinSeleccion && c.name === current.name
            return (
              <li key={c.name} className="border-t border-[#D6E4F5]">
                <button onClick={() => { onSelect(c); onClose() }} aria-pressed={sel} className="-mx-2 flex w-[calc(100%+16px)] min-h-16 items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
                  <span>
                    <span className="block t-sub font-bold text-[#1F2933]">{c.name}</span>
                    <span className="block t-meta text-[#5B6B7A]">{c.address} · {c.ciudad}, {c.estado}</span>
                    <span className="block t-meta text-[#5B6B7A]">{c.km !== undefined && <>{c.km.toFixed(1)}{NB}km · </>}Tel.{NB}{c.phone}</span>
                  </span>
                  {sel && <span className="inline-flex items-center gap-1 t-meta font-semibold text-[#006D3D]"><Icon n="check" size={18} />Elegida</span>}
                </button>
              </li>
            )
          })}
          {!list.length && <li className="border-t border-[#D6E4F5] py-4 t-body">No encontramos clínicas con esos filtros.</li>}
        </ul>
      </div>
    </div>
  )
}
