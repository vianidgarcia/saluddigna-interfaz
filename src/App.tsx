import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

type View = 'home' | 'pay' | 'tramites' | 'resultados' | 'agendar'
type AppCtx = { go: (v: View) => void; toast: (msg?: string) => void; openClinics: () => void; scrollToId: (id: string) => void }
const Ctx = createContext<AppCtx>(null as unknown as AppCtx)
const useApp = () => useContext(Ctx)
const WA = 'https://wa.me/525539566729'
const NB = ' ' // non-breaking space

/* ---------- icons ---------- */
const P: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  tramite: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h4"/>',
  beaker: '<path d="M9 2h6M10 2v6.5L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 8.5V2"/><path d="M7.2 15h9.6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  chat: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2-5.4A8.4 8.4 0 1 1 21 11.5z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  home: '<path d="m3 11 9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
  target: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
  nav: '<path d="m3 11 19-9-9 19-2-8z"/>',
}
function Icon({ n, size = 20, className = '' }: { n: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`} dangerouslySetInnerHTML={{ __html: P[n] }} />
  )
}

/* ---------- data (clínicas reales de salud-digna.org; km = distancias de demostración) ---------- */
type Clinic = { name: string; km: number; address: string; phone: string }
const CLINICS: Clinic[] = [
  { name: 'Culiacán', km: 1.2, address: 'Ruperto L. Paliza #87, Col. Centro', phone: '(667) 712 60 83' },
  { name: 'Culiacán Cañadas', km: 2.6, address: 'Manuel J. Clouthier #1716, Col. Cañadas', phone: '(667) 712 60 83' },
  { name: 'Culiacán Colegio Militar', km: 3.4, address: 'Calz. Heroico Colegio Militar #1384, Col. Emiliano Zapata', phone: '(667) 712 60 83' },
  { name: 'Culiacán Universitarios', km: 4.1, address: 'Av. Juan de la Barrera #2419 Nte., Col. Tierra Blanca', phone: '(667) 170 9180' },
  { name: 'Culiacán La Conquista', km: 5.3, address: 'Blvd. Conquistadores #1246 Int. 2, Col. La Conquista', phone: '(667) 170 9180' },
  { name: 'Culiacán Las Torres', km: 6.0, address: 'Alcatraz #3070 Sur Local 11, Col. Bugambilias', phone: '(667) 712 60 83' },
  { name: 'Culiacán Nakayama', km: 7.2, address: 'Av. Gral. Fernando Cuen #5903-3 Sur, Col. Antonio Nakayama', phone: '(667) 170 9180' },
]
const tel = (p: string) => 'tel:+52' + p.replace(/\D/g, '')
const STUDIES: Record<string, string[]> = {
  Laboratorio: ['Biometría hemática', 'Química sanguínea de 6 elementos', 'Perfil de lípidos'],
  Ultrasonido: ['Ultrasonido obstétrico', 'Ultrasonido abdominal', 'Ultrasonido pélvico'],
  Mastografía: ['Mastografía bilateral', 'Mastografía + ultrasonido mamario', 'Densitometría ósea'],
  'Rayos X': ['Rayos X de tórax', 'Rayos X de columna lumbar', 'Rayos X de extremidades'],
  Papanicolaou: ['Papanicolaou', 'Papanicolaou + prueba de VPH', 'Colposcopia'],
  Lentes: ['Examen de la vista', 'Lentes monofocales', 'Lentes bifocales'],
}
const CHIPS = Object.keys(STUDIES)
const PACKAGES = [
  ['Paquete integral mujer', '$630'],
  ['Mastografía + densitometría', '$300'],
  ['Mastografía + electro', '$320'],
]
const NAV = ['Servicios', 'Paquetes', 'Resultados', 'Clínicas']

/* ---------- shared classes ---------- */
const container = 'mx-auto w-full max-w-[1200px] px-4 lg:px-8'
const outlineBtn = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#0074D9] bg-white px-5 text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]'
const link = 'inline-flex min-h-12 items-center gap-2 rounded-md px-1 text-base font-semibold text-[#005BB0] underline-offset-4 transition-colors hover:text-[#003F7A] hover:underline active:text-[#003F7A]'
const solidBtn = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0074D9] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#005BB0] active:bg-[#004480]'
const chip = (on: boolean) => `min-h-12 rounded-full border px-4 text-base transition-colors ${on ? 'border-[#005BB0] bg-[#EBF4FC] font-semibold text-[#005BB0]' : 'border-[#D6E4F5] bg-white text-[#1F2933] hover:border-[#0074D9] hover:bg-[#EBF4FC] active:bg-[#D6E4F5]'}`

function Logo() {
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
function Header({ clinic, onChange, onHome }: { clinic: Clinic; onChange: () => void; onHome: () => void }) {
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

/* ---------- cookies (en flujo, nunca tapa contenido) ---------- */
function Cookies({ onDone }: { onDone: () => void }) {
  const [cfg, setCfg] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  return (
    <section aria-label="Aviso de cookies" className="border-b border-[#D6E4F5] bg-[#EBF4FC]">
      <div className={`${container} py-3`}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <p className="t-body text-[#1F2933]">Usamos cookies necesarias para que el sitio funcione y, si lo permites, analíticas para mejorarlo.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onDone} className={outlineBtn}>Aceptar</button>
            <button onClick={onDone} className={outlineBtn}>Rechazar</button>
            <button onClick={() => setCfg(!cfg)} aria-expanded={cfg} aria-controls="ck-cfg" className={link}>Configurar</button>
          </div>
        </div>
        {cfg && (
          <div id="ck-cfg" className="mt-3 flex flex-col gap-1 border-t border-[#D6E4F5] pt-3 lg:flex-row lg:items-center lg:gap-8">
            <label className="flex min-h-12 items-center gap-3 text-base text-[#1F2933]">
              <input type="checkbox" checked disabled className="size-5 accent-[#005BB0]" />
              <span>Necesarias <span className="t-meta text-[#5B6B7A]">· Siempre activas</span></span>
            </label>
            <label className="flex min-h-12 items-center gap-3 text-base text-[#1F2933]">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="size-5 accent-[#005BB0]" />
              <span>Analíticas</span>
            </label>
            <button onClick={onDone} className={`${outlineBtn} lg:ml-auto`}>Guardar preferencias</button>
          </div>
        )}
      </div>
    </section>
  )
}

/* ---------- hero ---------- */
function ContinueCard({ onContinue }: { onContinue: () => void }) {
  return (
    <section aria-labelledby="continua" className="on-dark flex flex-col rounded-2xl bg-[#004480] p-6 text-white lg:h-full lg:p-10">
      <h2 id="continua" className="t-sub font-semibold text-white">Continúa donde te quedaste</h2>
      <div className="mt-6">
        <h3 className="font-head t-card text-white">Ultrasonido obstétrico</h3>
        <p className="mt-1 t-body text-white">Culiacán · <strong className="font-bold">Pago pendiente en{NB}Oxxo</strong></p>
      </div>
      <div className="mt-8">
        <p className="t-sub">Paso 4 de 5</p>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={4} aria-valuetext="Paso 4 de 5" aria-label="Avance del trámite" className="mt-2 h-2 rounded-full bg-white/25">
          <div className="h-full w-4/5 rounded-full bg-white" />
        </div>
      </div>
      <ul className="mt-6 flex flex-col gap-2 border-t border-white/25 pt-6 t-meta text-white">
        <li className="flex items-center gap-2"><Icon n="globe" size={20} />Iniciado en Web</li>
        <li className="flex items-center gap-2"><Icon n="chat" size={20} />Último movimiento por WhatsApp, hace 2{NB}h</li>
      </ul>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <button onClick={onContinue} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]">
          Continuar trámite<Icon n="arrow" />
        </button>
        <a href={WA} target="_blank" rel="noopener" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-1 text-base font-semibold text-white underline underline-offset-4 hover:bg-white/10 active:bg-white/20">
          <Icon n="chat" />Seguir por WhatsApp
        </a>
      </div>
    </section>
  )
}

function Search() {
  const { go } = useApp()
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return null
    const c = CHIPS.find((x) => x.toLowerCase() === t)
    if (c) return STUDIES[c]
    return Object.values(STUDIES).flat().filter((n) => n.toLowerCase().includes(t)).slice(0, 3)
  }, [q])
  return (
    <section aria-labelledby="q-label" className="rounded-2xl bg-white p-6 lg:h-full lg:p-8">
      <label id="q-label" htmlFor="q" className="font-head t-card text-[#1F2933]">¿Qué estudio necesitas?</label>
      <div className="relative mt-4">
        <Icon n="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
        <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. ultrasonido, mastografía" className="h-12 w-full rounded-lg border border-[#D6E4F5] bg-white pl-12 pr-12 text-base text-[#1F2933] transition-colors hover:border-[#0074D9]" />
        {q && <button aria-label="Borrar búsqueda" onClick={() => setQ('')} className="absolute right-1 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-md text-[#5B6B7A] hover:text-[#1F2933]"><Icon n="x" /></button>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Estudios frecuentes">
        {CHIPS.map((c) => <button key={c} onClick={() => setQ(c)} aria-pressed={q === c} className={chip(q === c)}>{c}</button>)}
      </div>
      {results && (
        <div className="mt-6" aria-live="polite">
          {results.length ? (
            <>
              <p className="t-meta text-[#5B6B7A]">Resultados sugeridos</p>
              <ul className="mt-1">
                {results.map((n) => (
                  <li key={n} className="flex min-h-14 items-center justify-between gap-3 border-t border-[#D6E4F5] py-2 first:border-t-0">
                    <div><p className="text-base font-semibold text-[#1F2933]">{n}</p><p className="t-meta text-[#5B6B7A]">Precio según tu clínica</p></div>
                    <button onClick={() => go('agendar')} className={`${link} shrink-0`}>Agendar cita</button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div>
              <p className="t-body text-[#1F2933]">No encontramos estudios con ese nombre.</p>
              <p className="mt-1 t-meta text-[#5B6B7A]">Prueba con uno de los estudios frecuentes de arriba o pregúntanos.</p>
              <a href={WA} target="_blank" rel="noopener" className={`${link} mt-1`}><Icon n="chat" />Pregúntanos por WhatsApp</a>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

const QUICK = [
  ['calendar', 'Agendar cita', 'Elige estudio, clínica y horario.'],
  ['file', 'Mis resultados', 'Consulta y descarga tus estudios.'],
  ['refresh', 'Cambiar cita', 'Reprograma sin perder tu lugar.'],
  ['beaker', 'Preparaciones', 'Qué hacer antes de tu estudio.'],
]

function Hero({ onContinue }: { onContinue: () => void }) {
  const { go, toast } = useApp()
  const quickAct = (t: string) => (t === 'Agendar cita' ? go('agendar') : t === 'Mis resultados' ? go('resultados') : toast())
  return (
    <div className="bg-[#ECF3F9] pb-10 pt-8 lg:pb-16 lg:pt-12">
      <div className={container}>
        <h1 className="t-greeting font-head text-[#1F2933]">Hola, Ana</h1>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          <div className="lg:col-span-7"><ContinueCard onContinue={onContinue} /></div>
          <div className="lg:col-span-5"><Search /></div>
        </div>
        <section aria-labelledby="acc-t">
          <h2 id="acc-t" className="sr-only">Acciones rápidas</h2>
          <ul id="servicios" className="mt-10 scroll-mt-24 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-16 lg:grid-cols-4 lg:gap-8">
            {QUICK.map(([i, t, d]) => (
              <li key={t} className="group relative -m-2 rounded-lg p-2 transition-colors hover:bg-[#EBF4FC] has-[:active]:bg-[#D6E4F5]">
                <Icon n={i} size={28} className="text-[#0074D9]" />
                <h3 className="mt-3 font-head t-card text-[#1F2933] group-hover:text-[#005BB0]">
                  <button onClick={() => quickAct(t)} className="rounded-md text-left after:absolute after:inset-0 after:content-['']">{t}</button>
                </h3>
                <p className="mt-1 t-body">{d}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

/* ---------- lower sections ---------- */
function ClinicRow({ clinic }: { clinic: Clinic }) {
  const { toast, openClinics } = useApp()
  return (
    <section aria-label="Tu clínica más cercana" className={`${container} pt-10 lg:pt-16`}>
      <div className="flex flex-col gap-2 border-t border-[#D6E4F5] pt-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <p className="flex items-start gap-3 t-body text-[#43474A]">
          <Icon n="pin" className="mt-0.5 text-[#0074D9]" />
          <span>Tu clínica más cercana: <strong className="font-bold text-[#1F2933]">{clinic.name}</strong> · {clinic.km.toFixed(1)}{NB}km · <a href={tel(clinic.phone)} className="text-[#005BB0] underline underline-offset-4">Tel.{NB}{clinic.phone.replace(/ /g, NB)}</a></span>
        </p>
        <div className="flex flex-wrap gap-x-6">
          <button onClick={() => toast()} className={link}><Icon n="nav" />Cómo llegar</button>
          <button onClick={openClinics} className={link}>Ver todas las clínicas</button>
        </div>
      </div>
    </section>
  )
}

function Packages() {
  const { go, toast } = useApp()
  return (
    <section id="paquetes" className={`${container} scroll-mt-16 pt-10 lg:pt-16`} aria-labelledby="paq">
      <h2 id="paq" className="t-section font-head text-[#1F2933]">Paquetes de prevención</h2>
      <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0">
        {PACKAGES.map(([t, p]) => (
          <li key={t} className="flex w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-[#D6E4F5] bg-white p-6 shadow-[0_8px_24px_-4px_rgba(0,68,128,0.24)] lg:w-auto">
            <span className="self-start rounded-full bg-[#EBF4FC] px-3 py-1 t-meta font-semibold text-[#1F2933]">Requiere cita</span>
            <h3 className="mt-4 t-card font-head text-[#1F2933]">{t}{NB}–{NB}{p}</h3>
            <p className="mt-1 t-meta text-[#5B6B7A]">IVA incluido</p>
            <button onClick={() => toast()} className={`${link} mt-4 mb-auto self-start`}>Ver preparaciones</button>
            <button onClick={() => go('agendar')} className={`${solidBtn} mt-6 w-full`}><Icon n="calendar" />Agendar cita</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Help() {
  return (
    <div id="ayuda" className="mt-10 scroll-mt-24 bg-[#ECF3F9] py-10 lg:mt-16 lg:py-12">
      <section aria-labelledby="ayuda-t" className={`${container} flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <h2 id="ayuda-t" className="t-section font-head text-[#1F2933]">¿Necesitas ayuda?</h2>
          <p className="mt-1 t-body">Asistente por WhatsApp 24/7 · Asesores de 7:00 a 21:00</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <a href={WA} target="_blank" rel="noopener" className={outlineBtn}><Icon n="chat" />Escribir por WhatsApp</a>
          <a href="tel:+525555547166" className={`${link} justify-center`}><Icon n="phone" />Llamar 55{NB}5554{NB}7166</a>
        </div>
      </section>
    </div>
  )
}

const FOOT: Record<string, string[]> = {
  Conócenos: ['Quiénes somos', 'Nuestra misión', 'Sala de prensa'],
  Servicios: ['Laboratorio', 'Ultrasonido', 'Mastografía', 'Lentes'],
  Pacientes: ['Mis resultados', 'Preparaciones', 'Preguntas frecuentes'],
  Empresas: ['Convenios', 'Chequeos empresariales', 'Contacto'],
}
function Footer() {
  const { toast } = useApp()
  return (
    <footer className="border-t border-[#D6E4F5] bg-white pt-10 lg:pt-16">
      <div className={container}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-8">
          {Object.entries(FOOT).map(([h, items]) => (
            <nav key={h} aria-label={h}>
              <h2 className="t-sub font-bold text-[#1F2933]">{h}</h2>
              <ul className="mt-2">{items.map((i) => <li key={i}><button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-left t-body text-[#43474A] hover:text-[#005BB0] hover:underline active:text-[#003F7A]">{i}</button></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="mt-8 flex flex-col border-t border-[#D6E4F5] py-4 t-meta lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6">
            <button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-[#5B6B7A] hover:text-[#005BB0] hover:underline">Aviso de privacidad</button>
            <button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-[#5B6B7A] hover:text-[#005BB0] hover:underline">Términos y condiciones</button>
          </div>
          <p className="text-[#5B6B7A]">© Salud Digna</p>
        </div>
      </div>
    </footer>
  )
}

function BottomNav({ view }: { view: View }) {
  const { go, toast } = useApp()
  const items: [string, string, () => void, boolean][] = [
    ['home', 'Inicio', () => go('home'), view === 'home'],
    ['tramite', 'Mis trámites', () => go('tramites'), view === 'tramites'],
    ['file', 'Resultados', () => go('resultados'), view === 'resultados'],
    ['user', 'Perfil', () => toast(), false],
  ]
  return (
    <nav aria-label="Navegación inferior" className="fixed inset-x-0 bottom-0 z-30 border-t border-[#D6E4F5] bg-white lg:hidden">
      <ul className="grid grid-cols-4">
        {items.map(([i, t, act, on]) => (
          <li key={t}><button onClick={act} aria-current={on ? 'page' : undefined} className={`flex h-16 w-full flex-col items-center justify-center gap-0.5 t-meta active:bg-[#EBF4FC] ${on ? 'font-semibold text-[#005BB0]' : 'text-[#43474A]'}`}><Icon n={i} />{t}</button></li>
        ))}
      </ul>
    </nav>
  )
}

/* ---------- clinic sheet ---------- */
function ClinicSheet({ current, onSelect, onClose }: { current: Clinic; onSelect: (c: Clinic) => void; onClose: () => void }) {
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
  const list = CLINICS.filter((c) => (c.name + c.address).toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.km - b.km)
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

/* ---------- views ---------- */
function Back() {
  const { go } = useApp()
  return <button onClick={() => go('home')} className={link}><Icon n="left" />Volver al inicio</button>
}

const REF = '9300 0145 2287 6630'
function Pay() {
  const { toast } = useApp()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(REF.replace(/ /g, '')) } catch { /* el portapapeles puede estar bloqueado en la vista previa */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 3000)
  }
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Paso 4 de 5 · Paga en{NB}Oxxo</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="t-body text-[#1F2933]">Ultrasonido obstétrico · Culiacán</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF1DB] px-3 py-1 t-meta font-semibold text-[#7A4E00]"><span aria-hidden="true" className="size-2 rounded-full bg-[#F2A00D]" />Pago pendiente</span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={4} aria-valuetext="Paso 4 de 5" aria-label="Avance del trámite" className="mt-6 h-2 max-w-xl rounded-full bg-[#EBF4FC]"><div className="h-full w-4/5 rounded-full bg-[#005BB0]" /></div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section aria-labelledby="ref-t" className="rounded-2xl border border-[#D6E4F5] bg-white p-6 shadow-[0_8px_24px_-4px_rgba(0,68,128,0.16)] lg:col-span-7 lg:p-8">
          <h2 id="ref-t" className="t-card font-head text-[#1F2933]">Tu referencia de pago</h2>
          <p className="mt-4 font-mono text-[28px] font-semibold tracking-wide text-[#1F2933] lg:text-[32px]">{REF.replace(/ /g, NB)}</p>
          <button onClick={copy} className={`${outlineBtn} mt-4`}><Icon n={copied ? 'check' : 'copy'} />{copied ? 'Referencia copiada' : 'Copiar referencia'}</button>
          <p role="status" className="sr-only">{copied ? 'Referencia copiada' : ''}</p>
          <dl className="mt-6 grid gap-3 border-t border-[#D6E4F5] pt-6 t-body">
            <div><dt className="t-meta text-[#5B6B7A]">Monto</dt><dd className="font-semibold text-[#1F2933]">$350 <span className="t-meta font-normal text-[#5B6B7A]">(monto de ejemplo)</span></dd></div>
            <div><dt className="t-meta text-[#5B6B7A]">Paga antes del</dt><dd className="font-semibold text-[#1F2933]">26 de noviembre de 2026, 23:59</dd></div>
          </dl>
        </section>
        <section aria-labelledby="pasos-t" className="lg:col-span-5">
          <h2 id="pasos-t" className="t-card font-head text-[#1F2933]">Cómo pagar</h2>
          <ol className="mt-4 flex flex-col gap-3 t-body">
            <li>1. Acude a cualquier Oxxo.</li>
            <li>2. Indica que harás un pago de servicio.</li>
            <li>3. Dicta la referencia y paga el monto exacto.</li>
          </ol>
          <div className="mt-6 flex flex-col gap-2">
            <a href={WA} target="_blank" rel="noopener" className={solidBtn}><Icon n="chat" />Enviar referencia a mi WhatsApp</a>
            <button onClick={() => toast()} className={`${link} justify-center`}>Cambiar método de pago</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Tramites() {
  const { go } = useApp()
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Mis trámites</h1>
      <div className="mt-6 flex max-w-3xl flex-col gap-4 border-t border-[#D6E4F5] pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="t-card font-head text-[#1F2933]">Ultrasonido obstétrico</h2>
          <p className="mt-1 t-body">Culiacán · Pago pendiente en{NB}Oxxo · Paso 4 de 5</p>
        </div>
        <button onClick={() => go('pay')} className={solidBtn}>Continuar trámite</button>
      </div>
    </div>
  )
}

function Resultados() {
  const { toast } = useApp()
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Mis resultados</h1>
      <p className="mt-4 max-w-xl t-body">Aún no tienes resultados. Te avisaremos por WhatsApp cuando estén listos.</p>
      <button onClick={() => toast()} className={`${link} mt-2`}>Ver preparaciones</button>
    </div>
  )
}

function Agendar({ onNext }: { onNext: () => void }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-section font-head text-[#1F2933]">Agendar cita · Paso 1 de 5: Elige tu estudio</h1>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Estudios">
        {CHIPS.map((c) => <button key={c} onClick={() => setSel(c)} aria-pressed={sel === c} className={chip(sel === c)}>{c}</button>)}
      </div>
      {sel && <button onClick={onNext} className={`${solidBtn} mt-8`}>Siguiente: elige clínica<Icon n="arrow" /></button>}
    </div>
  )
}

/* ---------- app ---------- */
export default function App() {
  const [view, setView] = useState<View>('home')
  const [clinic, setClinic] = useState(CLINICS[0])
  const [sheet, setSheet] = useState(false)
  const [cookies, setCookies] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const go = (v: View) => { setView(v); window.scrollTo(0, 0) }
  const toast = (msg = 'Disponible en la versión completa') => {
    setToastMsg(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastMsg(null), 3000)
  }
  const scrollToId = (id: string) => {
    setView('home')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  const ctx: AppCtx = { go, toast, openClinics: () => setSheet(true), scrollToId }
  return (
    <Ctx.Provider value={ctx}>
      <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-[#005BB0] focus:shadow-lg">Saltar al contenido</a>
        <Header clinic={clinic} onChange={() => setSheet(true)} onHome={() => go('home')} />
        {cookies && <Cookies onDone={() => setCookies(false)} />}
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {view === 'home' && (
            <>
              <Hero onContinue={() => go('pay')} />
              <ClinicRow clinic={clinic} />
              <Packages />
              <Help />
            </>
          )}
          {view === 'pay' && <Pay />}
          {view === 'tramites' && <Tramites />}
          {view === 'resultados' && <Resultados />}
          {view === 'agendar' && <Agendar onNext={() => setSheet(true)} />}
        </main>
        <Footer />
        <BottomNav view={view} />
        {sheet && <ClinicSheet current={clinic} onSelect={setClinic} onClose={() => setSheet(false)} />}
        <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 lg:bottom-8">
          {toastMsg && <div className="rounded-lg bg-[#1F2933] px-5 py-3 text-base text-white shadow-lg">{toastMsg}</div>}
        </div>
      </div>
    </Ctx.Provider>
  )
}
