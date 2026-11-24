import { useEffect, useRef, useState } from 'react'
import { clinicasPorDistancia, type Clinic } from '../data/clinics'
import { Icon } from './Icon'
import { NB, outlineBtn } from './ui'

export function ClinicSheet({ current, onSelect, onClose }: { current: Clinic; onSelect: (c: Clinic) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [located, setLocated] = useState(false)
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => { window.removeEventListener('keydown', k); prev?.focus?.() }
  }, [onClose])
  const list = clinicasPorDistancia(q)
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end lg:items-stretch">
      <div onClick={onClose} className="absolute inset-0 bg-[#1F2933]/50 [animation:fade_200ms_ease-out]" />
      <div role="dialog" aria-modal="true" aria-labelledby="sheet-t" className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl bg-white [animation:sheet-up_250ms_cubic-bezier(.2,0,0,1)] lg:max-h-none lg:w-[440px] lg:rounded-none lg:[animation:sheet-right_250ms_cubic-bezier(.2,0,0,1)]">
        <div className="flex items-center justify-between border-b border-[#D6E4F5] px-4 py-3 lg:px-6">
          <h2 id="sheet-t" className="t-card font-head text-[#1F2933]">Elige tu clínica</h2>
          <button onClick={onClose} className="inline-flex min-h-12 items-center gap-1 rounded-md px-2 text-base font-semibold text-[#005BB0] hover:bg-[#EBF4FC] active:bg-[#D6E4F5]"><Icon n="x" />Cerrar</button>
        </div>
        <div className="px-4 pt-4 lg:px-6">
          <label htmlFor="cq" className="text-base font-semibold text-[#1F2933]">Buscar clínica</label>
          <div className="relative mt-2">
            <Icon n="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
            <input ref={ref} id="cq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Colonia o nombre" className="h-12 w-full rounded-lg border border-[#D6E4F5] pl-12 pr-3 text-base text-[#1F2933] hover:border-[#0074D9]" />
          </div>
          <button onClick={() => setLocated(true)} className={`${outlineBtn} mt-3 w-full`}><Icon n="target" />Usar mi ubicación</button>
          {located && <p role="status" className="mt-2 flex items-center gap-2 t-meta font-semibold text-[#006D3D]"><Icon n="check" size={16} />Ubicación detectada. Clínicas ordenadas por distancia.</p>}
        </div>
        <ul className="mt-4 flex-1 overflow-y-auto px-4 pb-6 lg:px-6">
          {list.map((c) => {
            const sel = c.name === current.name
            return (
              <li key={c.name} className="border-t border-[#D6E4F5]">
                <button onClick={() => { onSelect(c); onClose() }} aria-pressed={sel} className="-mx-2 flex w-[calc(100%+16px)] min-h-16 items-center justify-between gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
                  <span>
                    <span className="block t-sub font-bold text-[#1F2933]">{c.name}</span>
                    <span className="block t-meta text-[#5B6B7A]">{c.address}</span>
                    <span className="block t-meta text-[#5B6B7A]">{c.km.toFixed(1)}{NB}km · Tel.{NB}{c.phone}</span>
                  </span>
                  {sel && <span className="inline-flex items-center gap-1 t-meta font-semibold text-[#006D3D]"><Icon n="check" size={18} />Elegida</span>}
                </button>
              </li>
            )
          })}
          {!list.length && <li className="border-t border-[#D6E4F5] py-4 t-body">No encontramos clínicas con ese nombre.</li>}
        </ul>
      </div>
    </div>
  )
}
