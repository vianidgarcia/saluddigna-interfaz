import { useState } from 'react'
import { useApp } from '../context'
import type { Clinic } from '../data/clinics'
import { Icon } from './Icon'
import { container } from './ui'

const NAV = ['Servicios', 'Paquetes', 'Resultados', 'Clínicas']

export function Logo() {
  return (
    <svg width="144" height="36" viewBox="0 0 144 36" role="img" aria-label="Salud Digna">
      <text x="0" y="21" fill="#008B50" fontWeight="700" fontSize="20" fontFamily="Open Sans, sans-serif">Salud</text>
      <text x="55" y="21" fill="#1F2933" fontWeight="700" fontSize="20" fontFamily="Open Sans, sans-serif">Digna</text>
      <circle cx="114" cy="19" r="2" fill="#008B50" />
      <text x="0" y="33" fill="#008B50" fontWeight="600" fontSize="9.5" fontFamily="Open Sans, sans-serif">La salud es para todos</text>
    </svg>
  )
}

/* ---------- header ---------- */
export function Header({ clinic, onChange, onHome }: { clinic: Clinic; onChange: () => void; onHome: () => void }) {
  const [open, setOpen] = useState(false)
  const { go, toast, openClinics, scrollToId } = useApp()
  const navAct = (n: string) => { setOpen(false); if (n === 'Servicios') scrollToId('servicios'); else if (n === 'Paquetes') scrollToId('paquetes'); else if (n === 'Resultados') go('resultados'); else openClinics() }
  const item = 'inline-flex min-h-12 items-center rounded-md px-3 text-base font-semibold text-[#1F2933] transition-colors hover:bg-[#EBF4FC] hover:text-[#005BB0] active:bg-[#D6E4F5]'
  return (
    <header className="sticky top-0 z-30 border-b border-[#D6E4F5] bg-white">
      <div className={`${container} flex min-h-[72px] items-center justify-between gap-4`}>
        <div className="flex items-center gap-6">
          <button onClick={onHome} className="inline-flex min-h-12 items-center rounded-md" aria-label="Salud Digna, ir al inicio"><Logo /></button>
          <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => n === 'Servicios' || n === 'Paquetes'
              ? <a key={n} href={n === 'Servicios' ? '#servicios' : '#paquetes'} onClick={(e) => { e.preventDefault(); navAct(n) }} className={item}>{n}</a>
              : <button key={n} onClick={() => navAct(n)} className={item}>{n}</button>)}
          </nav>
        </div>
        <div className="hidden items-center gap-4 lg:flex">
          <button onClick={onChange} className="inline-flex min-h-12 items-center gap-2 rounded-md px-3 text-base text-[#1F2933] transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
            <Icon n="pin" className="text-[#005BB0]" />
            <span>{clinic.name} ·</span><span className="font-semibold text-[#005BB0] underline underline-offset-4">Cambiar</span>
          </button>
          <button onClick={() => go('tramites')} className={item}>Mis trámites</button>
          <button onClick={() => toast()} aria-label="Perfil de Ana" className="grid size-12 place-items-center rounded-full bg-[#EBF4FC] text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#D6E4F5] active:bg-[#C4D9F0]">A</button>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={() => toast()} aria-label="Perfil de Ana" className="grid size-12 place-items-center rounded-full bg-[#EBF4FC] text-base font-semibold text-[#005BB0] active:bg-[#D6E4F5]">A</button>
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-12 min-w-12 flex-col items-center justify-center rounded-md text-[#1F2933] hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
            <Icon n={open ? 'x' : 'menu'} size={22} /><span className="t-meta">Menú</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#D6E4F5] bg-white pb-3 lg:hidden">
          <nav aria-label="Menú móvil" className={`${container} flex flex-col`}>
            {NAV.map((n) => <button key={n} onClick={() => navAct(n)} className={`${item} w-full`}>{n}</button>)}
            <button onClick={() => { setOpen(false); go('tramites') }} className={`${item} w-full`}>Mis trámites</button>
            <button onClick={() => { setOpen(false); onChange() }} className={`${item} w-full gap-2`}>
              <Icon n="pin" className="text-[#005BB0]" />{clinic.name} · <span className="ml-1 text-[#005BB0] underline underline-offset-4">Cambiar</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
