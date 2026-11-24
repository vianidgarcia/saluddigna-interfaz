import { useRef, useState } from 'react'
import { Ctx, type AppCtx, type View } from './context'
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
          {view === 'home' && <Home clinic={clinic} onContinue={() => go('pay')} />}
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
