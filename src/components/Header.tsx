import { useEffect, useRef, useState } from 'react'
import { ROL, type Rol } from '../state/sesion'
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
  const { go, toast, openClinics, scrollToId, salir, sesion } = useApp()
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
          {sesion ? (
            <>
              <button onClick={() => go('tramites')} className={item}>Mis trámites</button>
              <button onClick={() => toast()} aria-label={`Perfil de ${sesion.nombre}`} className="grid size-12 place-items-center rounded-full bg-[#EBF4FC] text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#D6E4F5] active:bg-[#C4D9F0]">{sesion.nombre.charAt(0)}</button>
              <button onClick={salir} className={`${item} gap-2`}><Icon n="logout" />Salir</button>
            </>
          ) : <MenuEntrar />}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {sesion
            ? <button onClick={() => toast()} aria-label={`Perfil de ${sesion.nombre}`} className="grid size-12 place-items-center rounded-full bg-[#EBF4FC] text-base font-semibold text-[#005BB0] active:bg-[#D6E4F5]">{sesion.nombre.charAt(0)}</button>
            : <MenuEntrar />}
          <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex min-h-12 min-w-12 flex-col items-center justify-center rounded-md text-[#1F2933] hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
            <Icon n={open ? 'x' : 'menu'} size={22} /><span className="t-meta">Menú</span>
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#D6E4F5] bg-white pb-3 lg:hidden">
          <nav aria-label="Menú móvil" className={`${container} flex flex-col`}>
            {NAV.map((n) => <button key={n} onClick={() => navAct(n)} className={`${item} w-full`}>{n}</button>)}
            {sesion && <button onClick={() => { setOpen(false); go('tramites') }} className={`${item} w-full`}>Mis trámites</button>}
            <button onClick={() => { setOpen(false); onChange() }} className={`${item} w-full gap-2`}>
              <Icon n="pin" className="text-[#005BB0]" />{clinic.name} · <span className="ml-1 text-[#005BB0] underline underline-offset-4">Cambiar</span>
            </button>
            {sesion && <button onClick={() => { setOpen(false); salir() }} className={`${item} w-full gap-2`}><Icon n="logout" />Salir</button>}
          </nav>
        </div>
      )}
    </header>
  )
}

/* ---------- iniciar sesión (esquina superior derecha, visitante) ---------- */
const OPCIONES_ROL: [Rol, string, string][] = [
  ['paciente', 'user', 'Agenda, pagos y resultados'],
  ['asesor', 'headset', 'Atención al paciente (Call Center)'],
  ['admin', 'shield', 'Atención al paciente y control de la demo'],
]

function MenuEntrar() {
  const { abrirEntrar } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    ref.current?.querySelector<HTMLButtonElement>('[data-opcion]')?.focus()
    const fuera = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus() } }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button ref={btn} onClick={() => setOpen(!open)} aria-expanded={open} aria-controls={open ? 'menu-entrar' : undefined}
        className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[#0074D9] bg-white px-4 text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
        <Icon n="user" /><span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Iniciar sesión</span><Icon n="left" size={16} className={`transition-transform ${open ? 'rotate-90' : '-rotate-90'}`} />
      </button>
      {open && (
        <div id="menu-entrar" className="absolute right-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-[#D6E4F5] bg-white p-2 shadow-[0_8px_24px_-4px_rgba(0,68,128,0.24)]">
          <p className="px-3 pb-1 pt-2 t-meta font-semibold text-[#5B6B7A]">Entrar como</p>
          <ul>
            {OPCIONES_ROL.map(([r, ic, d]) => (
              <li key={r}>
                <button data-opcion onClick={() => { setOpen(false); abrirEntrar(r) }}
                  className="flex min-h-14 w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
                  <Icon n={ic} className="text-[#005BB0]" />
                  <span><span className="block text-base font-semibold text-[#1F2933]">{ROL[r]}</span><span className="block t-meta text-[#5B6B7A]">{d}</span></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
