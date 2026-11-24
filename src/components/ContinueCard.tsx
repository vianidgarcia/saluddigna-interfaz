import { Icon } from './Icon'
import { WA, NB } from './ui'

export function ContinueCard({ onContinue }: { onContinue: () => void }) {
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
