import { useEffect, useState } from 'react'
import { useApp } from '../context'
import { CANAL, ICONO_CANAL, TICK_MS, clinicaTexto, estadoTexto, fechaLarga, hace } from '../state/tramite'
import { Icon } from './Icon'
import { WA } from './ui'

const card = 'on-dark flex flex-col rounded-2xl bg-[#004480] p-6 text-white lg:h-full lg:p-10'
const whiteBtn = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 text-base font-semibold text-[#005BB0] transition-colors hover:bg-[#EBF4FC] active:bg-[#D6E4F5]'
const darkLink = 'inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-1 text-base font-semibold text-white underline underline-offset-4 hover:bg-white/10 active:bg-white/20'

export function ContinueCard() {
  const { tramite: t, continuar, startAgendar } = useApp()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  if (!t) {
    return (
      <section aria-labelledby="continua" className={card}>
        <h2 id="continua" className="font-head t-card text-white">Agenda tu próximo estudio</h2>
        <p className="mt-3 t-body text-white">Aún no tienes trámites en curso. Agenda en 5 pasos; si te interrumpes, aquí retomas donde te quedaste, desde la web o por WhatsApp.</p>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6 lg:mt-auto lg:pt-8">
          <button onClick={() => startAgendar()} className={whiteBtn}><Icon n="calendar" />Agendar cita</button>
          <a href={WA} target="_blank" rel="noopener" className={darkLink}><Icon n="chat" />Agendar por WhatsApp</a>
        </div>
      </section>
    )
  }

  const confirmada = t.estado === 'confirmada'
  const paso = t.estado === 'pago_pendiente' ? 5 : t.paso
  const waText = encodeURIComponent(`Hola, quiero continuar mi trámite ${t.id}`)
  return (
    <section aria-labelledby="continua" className={card}>
      <h2 id="continua" className="t-sub font-semibold text-white">{confirmada ? 'Tu próxima cita' : 'Continúa donde te quedaste'}</h2>
      <div className="mt-6">
        <h3 className="font-head t-card text-white">{t.estudio?.nombre ?? 'Cita por agendar'}</h3>
        <p className="mt-1 t-body text-white">
          {clinicaTexto(t)} · <strong className="font-bold">{confirmada && <Icon n="check" size={18} className="mr-1 inline -translate-y-px" />}{estadoTexto(t)}</strong>
        </p>
        {confirmada && t.fecha && <p className="mt-1 t-body text-white first-letter:uppercase">{fechaLarga(t.fecha)} · {t.hora}</p>}
      </div>
      {!confirmada && (
        <div className="mt-8">
          <p className="t-sub">Paso {paso} de 5</p>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={paso} aria-valuetext={`Paso ${paso} de 5`} aria-label="Avance del trámite" className="mt-2 h-2 rounded-full bg-white/25">
            <div className="h-full rounded-full bg-white transition-[width]" style={{ width: `${paso * 20}%` }} />
          </div>
        </div>
      )}
      <ul className="mt-6 flex flex-col gap-2 border-t border-white/25 pt-6 t-meta text-white">
        <li className="flex items-center gap-2"><Icon n={ICONO_CANAL[t.canalInicio]} size={20} />Iniciado en {CANAL[t.canalInicio]}</li>
        <li className="flex items-center gap-2" aria-live="polite"><Icon n={ICONO_CANAL[t.ultimoCanal]} size={20} />Último movimiento por {CANAL[t.ultimoCanal]}, {hace(t.ultimaActualizacion, now)}</li>
      </ul>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <button onClick={continuar} className={whiteBtn}>
          {confirmada ? 'Ver mi cita' : 'Continuar trámite'}<Icon n="arrow" />
        </button>
        <a href={`${WA}?text=${waText}`} target="_blank" rel="noopener" className={darkLink}>
          <Icon n="chat" />Seguir por WhatsApp
        </a>
      </div>
    </section>
  )
}
