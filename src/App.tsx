import { useRef, useState } from 'react'
import { Ctx, type AppCtx, type EstudioElegido, type View } from './context'
import { CLINICS } from './data/clinics'
import { Header } from './components/Header'
import { Cookies } from './components/Cookies'
import { Footer } from './components/Footer'
import { BottomNav } from './components/BottomNav'
import { ClinicSheet } from './components/ClinicSheet'
import { Home } from './views/Home'
import { Pay } from './views/Pay'
import { Tramites } from './views/Tramites'
import { Resultados } from './views/Resultados'
import { Agendar } from './views/Agendar'
import { PASOS, conEvento, loadTramite, nuevoTramite, saveTramite, type Tramite } from './state/tramite'

const VIEW_KEY = 'sd_vista'
const VIEWS: View[] = ['home', 'pay', 'tramites', 'resultados', 'agendar']

/** La vista se recuerda por pestaña: al recargar a mitad del flujo se vuelve a la misma pantalla. */
function loadView(t: Tramite | null): View {
  try {
    const v = window.sessionStorage.getItem(VIEW_KEY) as View | null
    if (!v || !VIEWS.includes(v)) return 'home'
    if ((v === 'agendar' || v === 'pay') && !t) return 'home'
    return v
  } catch {
    return 'home'
  }
}

export default function App() {
  const [tramite, setTramite] = useState<Tramite | null>(loadTramite)
  const tRef = useRef(tramite)
  const [view, setView] = useState<View>(() => loadView(tramite))
  const [clinic, setClinic] = useState(CLINICS[0])
  const [sheet, setSheet] = useState(false)
  const [cookies, setCookies] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const go = (v: View) => {
    setView(v)
    try { window.sessionStorage.setItem(VIEW_KEY, v) } catch { /* sin almacenamiento */ }
    window.scrollTo(0, 0)
  }
  const toast = (msg = 'Disponible en la versión completa') => {
    setToastMsg(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToastMsg(null), 3000)
  }
  const scrollToId = (id: string) => {
    go('home')
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  /* ---- orquestador simulado ---- */
  const commit = (t: Tramite | null) => { tRef.current = t; setTramite(t); saveTramite(t) }
  const update = (fn: (t: Tramite) => Tramite) => { if (tRef.current) commit(fn(tRef.current)) }

  const startAgendar = (estudio?: EstudioElegido) => {
    let t = tRef.current
    if (!t || t.estado === 'confirmada') t = nuevoTramite('web')
    if (estudio) {
      // estudio preseleccionado: al continuar se salta al primer dato que falte
      t = { ...t, estudio, paso: 1, estado: 'en_curso', metodoPago: t.estado === 'pago_pendiente' ? null : t.metodoPago, desdeResumen: true }
    } else if (t.estado === 'pago_pendiente') {
      go('pay'); return
    }
    commit(t)
    go('agendar')
  }

  const continuar = () => {
    const t = tRef.current
    if (!t) return startAgendar()
    if (t.estado === 'confirmada') return go('tramites')
    const destino = t.estado === 'pago_pendiente' ? 'el pago en Oxxo' : `el paso ${t.paso}: ${PASOS[t.paso]}`
    commit(conEvento(t, 'tramite.retomado', `Retomó en ${destino}`))
    go(t.estado === 'pago_pendiente' ? 'pay' : 'agendar')
  }

  const simularWhatsApp = () => {
    const t = tRef.current
    if (!t) { toast('Primero agenda una cita para simular el regreso por WhatsApp'); return }
    commit(conEvento(t, 'canal.mensaje_recibido', 'Escribió por WhatsApp “¿Cómo va mi cita?” y el asistente respondió con su avance (demo)', 'whatsapp'))
    go('home')
    toast('Demo: se registró un mensaje por WhatsApp')
  }

  const reiniciarDemo = () => {
    commit(null)
    go('home')
    toast('Demo reiniciada: no hay trámites en curso')
  }

  const ctx: AppCtx = { go, toast, openClinics: () => setSheet(true), scrollToId, tramite, update, startAgendar, continuar, simularWhatsApp, reiniciarDemo }
  const activeView: View = (view === 'agendar' && !tramite) ? 'home' : view
  return (
    <Ctx.Provider value={ctx}>
      <div className="flex min-h-screen flex-col pb-16 lg:pb-0">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-[#005BB0] focus:shadow-lg">Saltar al contenido</a>
        <Header clinic={clinic} onChange={() => setSheet(true)} onHome={() => go('home')} />
        {cookies && <Cookies onDone={() => setCookies(false)} />}
        <main id="contenido" tabIndex={-1} className="flex-1 focus:outline-none">
          {activeView === 'home' && <Home clinic={clinic} />}
          {activeView === 'pay' && <Pay />}
          {activeView === 'tramites' && <Tramites />}
          {activeView === 'resultados' && <Resultados />}
          {activeView === 'agendar' && <Agendar />}
        </main>
        <Footer />
        <BottomNav view={activeView} />
        {sheet && <ClinicSheet current={clinic} onSelect={setClinic} onClose={() => setSheet(false)} />}
        <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 lg:bottom-8">
          {toastMsg && <div className="rounded-lg bg-[#1F2933] px-5 py-3 text-base text-white shadow-lg">{toastMsg}</div>}
        </div>
      </div>
    </Ctx.Provider>
  )
}
