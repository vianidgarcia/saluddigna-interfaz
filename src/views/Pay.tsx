import { useState } from 'react'
import { useApp } from '../context'
import { Back } from '../components/Back'
import { Icon } from '../components/Icon'
import { WA, NB, container, outlineBtn, link, solidBtn } from '../components/ui'
import { conEvento, fechaLarga } from '../state/tramite'

/** Referencia de ejemplo de 16 dígitos, estable para cada trámite. */
function referencia(id: string) {
  let h = 2166136261
  let out = ''
  for (let i = 0; out.length < 16; i++) {
    h = Math.imul(h ^ id.charCodeAt(i % id.length) ^ i, 16777619) >>> 0
    out += String(h % 10)
  }
  return out.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function Pay() {
  const { tramite: t, update, go, startAgendar } = useApp()
  const [copied, setCopied] = useState(false)

  if (!t || t.estado !== 'pago_pendiente') {
    return (
      <div className={`${container} py-8 lg:py-12`}>
        <Back />
        <h1 className="mt-4 t-greeting font-head text-[#1F2933]">No tienes pagos pendientes</h1>
        <p className="mt-4 max-w-xl t-body">Cuando elijas pagar en Oxxo al agendar, aquí verás tu referencia.</p>
        <button onClick={() => startAgendar()} className={`${outlineBtn} mt-6`}><Icon n="calendar" />Agendar cita</button>
      </div>
    )
  }

  const REF = referencia(t.id)
  const copy = async () => {
    try { await navigator.clipboard.writeText(REF.replace(/ /g, '')) } catch { /* el portapapeles puede estar bloqueado en la vista previa */ }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 3000)
  }
  const cambiarMetodo = () => {
    update((x) => conEvento({ ...x, estado: 'en_curso', metodoPago: null, paso: 5 }, 'pago.metodo_cambiado', 'Regresó a elegir otro método de pago'))
    go('agendar')
  }
  const waText = encodeURIComponent(`Hola, esta es mi referencia de pago en Oxxo para el trámite ${t.id}: ${REF.replace(/ /g, '')}`)
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Paso 5 de 5 · Paga en{NB}Oxxo</h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="t-body text-[#1F2933]">{t.estudio?.nombre} · {t.clinica}</p>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF1DB] px-3 py-1 t-meta font-semibold text-[#7A4E00]"><span aria-hidden="true" className="size-2 rounded-full bg-[#F2A00D]" />Pago pendiente</span>
      </div>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={5} aria-valuetext="Paso 5 de 5: pago pendiente" aria-label="Avance del trámite" className="mt-6 h-2 max-w-xl rounded-full bg-[#EBF4FC]"><div className="h-full w-full rounded-full bg-[#005BB0]" /></div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <section aria-labelledby="ref-t" className="rounded-2xl border border-[#D6E4F5] bg-white p-6 shadow-[0_8px_24px_-4px_rgba(0,68,128,0.16)] lg:col-span-7 lg:p-8">
          <h2 id="ref-t" className="t-card font-head text-[#1F2933]">Tu referencia de pago</h2>
          <p className="mt-1 t-meta text-[#5B6B7A]">Referencia de ejemplo</p>
          <p className="mt-3 font-mono text-[22px] font-semibold tracking-wide text-[#1F2933] min-[400px]:text-[24px] sm:text-[28px] lg:text-[32px]">{REF.replace(/ /g, NB)}</p>
          <button onClick={copy} className={`${outlineBtn} mt-4`}><Icon n={copied ? 'check' : 'copy'} />{copied ? 'Referencia copiada' : 'Copiar referencia'}</button>
          <p role="status" className="sr-only">{copied ? 'Referencia copiada' : ''}</p>
          <dl className="mt-6 grid gap-3 border-t border-[#D6E4F5] pt-6 t-body">
            <div><dt className="t-meta text-[#5B6B7A]">Monto</dt><dd className="font-semibold text-[#1F2933]">
              {t.estudio?.precio
                ? <>{t.estudio.precio} <span className="t-meta font-normal text-[#5B6B7A]">(IVA incluido)</span></>
                : <>$350 <span className="t-meta font-normal text-[#5B6B7A]">(monto de ejemplo)</span></>}
            </dd></div>
            <div><dt className="t-meta text-[#5B6B7A]">Paga antes de tu cita</dt><dd className="font-semibold text-[#1F2933] first-letter:uppercase">
              {t.fecha ? `${fechaLarga(t.fecha)}, ${t.hora}` : '—'} <span className="t-meta font-normal text-[#5B6B7A]">(horario de demostración)</span>
            </dd></div>
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
            <a href={`${WA}?text=${waText}`} target="_blank" rel="noopener" className={solidBtn}
              onClick={() => update((x) => conEvento(x, 'pago.referencia_enviada', 'Pidió recibir la referencia en su WhatsApp', 'whatsapp'))}>
              <Icon n="chat" />Enviar referencia a mi WhatsApp
            </a>
            <button onClick={cambiarMetodo} className={`${link} justify-center`}>Cambiar método de pago</button>
          </div>
        </section>
      </div>
    </div>
  )
}
