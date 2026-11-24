import { useApp } from '../context'
import { Back } from '../components/Back'
import { Icon } from '../components/Icon'
import { container, outlineBtn, solidBtn } from '../components/ui'
import { CANAL, ICONO_CANAL, clinicaTexto, estadoTexto, fechaLarga, hace } from '../state/tramite'

export function Tramites() {
  const { tramite: t, continuar, startAgendar } = useApp()
  if (!t) {
    return (
      <div className={`${container} py-8 lg:py-12`}>
        <Back />
        <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Mis trámites</h1>
        <div className="mt-6 max-w-3xl border-t border-[#D6E4F5] pt-6">
          <p className="t-body text-[#1F2933]">No tienes trámites en curso.</p>
          <button onClick={() => startAgendar()} className={`${solidBtn} mt-4`}><Icon n="calendar" />Agendar cita</button>
        </div>
      </div>
    )
  }
  const confirmada = t.estado === 'confirmada'
  const paso = t.estado === 'pago_pendiente' ? 5 : t.paso
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Mis trámites</h1>
      <section aria-labelledby="tr-t" className="mt-6 max-w-3xl border-t border-[#D6E4F5] pt-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 id="tr-t" className="t-card font-head text-[#1F2933]">{t.estudio?.nombre ?? 'Cita por agendar'}</h2>
            <p className="mt-1 t-body">{clinicaTexto(t)}{t.fecha && t.hora ? <> · <span className="first-letter:uppercase">{fechaLarga(t.fecha)}, {t.hora}</span></> : null}</p>
            <p className="mt-2">
              {confirmada
                ? <span className="inline-flex items-center gap-2 t-body font-semibold text-[#006D3D]"><Icon n="check" size={18} />Cita confirmada</span>
                : <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF1DB] px-3 py-1 t-meta font-semibold text-[#7A4E00]"><span aria-hidden="true" className="size-2 rounded-full bg-[#F2A00D]" />Paso {paso} de 5 · {estadoTexto(t)}</span>}
            </p>
            <p className="mt-2 t-meta text-[#5B6B7A]">Folio {t.id} (de ejemplo) · Iniciado en {CANAL[t.canalInicio]} · Último movimiento por {CANAL[t.ultimoCanal]}, {hace(t.ultimaActualizacion)}</p>
          </div>
          {confirmada
            ? <button onClick={() => startAgendar()} className={`${outlineBtn} shrink-0`}><Icon n="calendar" />Agendar otra cita</button>
            : <button onClick={continuar} className={`${solidBtn} shrink-0`}>Continuar trámite<Icon n="arrow" /></button>}
        </div>
      </section>
      <section aria-labelledby="hist-t" className="mt-10 max-w-3xl">
        <h2 id="hist-t" className="t-card font-head text-[#1F2933]">Historial del trámite</h2>
        <p className="mt-1 t-meta text-[#5B6B7A]">Cada movimiento queda registrado, sin importar el canal. Así nadie te vuelve a preguntar lo que ya dijiste.</p>
        <ol className="mt-4">
          {[...t.eventos].reverse().map((e, i) => (
            <li key={i} className="flex gap-3 border-t border-[#D6E4F5] py-3">
              <Icon n={ICONO_CANAL[e.canal]} className="mt-0.5 text-[#0074D9]" />
              <div>
                <p className="t-body text-[#1F2933]">{e.detalle}</p>
                <p className="t-meta text-[#5B6B7A]">{CANAL[e.canal]} · {hace(e.fecha)} · <code className="font-mono">{e.tipo}</code></p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
