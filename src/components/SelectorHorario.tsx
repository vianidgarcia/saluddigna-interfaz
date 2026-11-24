import { fechaLarga } from '../state/tramite'

/* Días y horarios de demostración, compartidos por el agendado y la vista del asesor. */
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const proximosDias = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d })
export const HORAS = Array.from({ length: 21 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
/** ocupación de demostración, estable para cada día y hora */
export const ocupado = (fecha: string, hora: string) => {
  let h = 0
  for (const ch of fecha + hora) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 4 === 0
}

export function SelectorHorario({ fecha, hora, onFecha, onHora, id = 'h' }: {
  fecha: string | null; hora: string | null; onFecha: (v: string) => void; onHora: (h: string) => void; id?: string
}) {
  const dias = proximosDias()
  return (
    <>
      <p id={`${id}-dia`} className="text-base font-semibold text-[#1F2933]">Día</p>
      <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7" role="group" aria-labelledby={`${id}-dia`}>
        {dias.map((d) => {
          const v = iso(d)
          const on = fecha === v
          return (
            <button key={v} onClick={() => onFecha(v)} aria-pressed={on}
              aria-label={fechaLarga(v)}
              className={`min-h-14 rounded-lg border px-1 py-2 text-center transition-colors ${on ? 'border-[#005BB0] bg-[#EBF4FC] text-[#005BB0]' : 'border-[#D6E4F5] bg-white text-[#1F2933] hover:border-[#0074D9] hover:bg-[#EBF4FC]'}`}>
              <span className="block t-meta capitalize">{d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')}</span>
              <span className="block text-base font-semibold">{d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }).replace('.', '')}</span>
            </button>
          )
        })}
      </div>
      {fecha && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p id={`${id}-hora`} className="text-base font-semibold text-[#1F2933]">Horario</p>
            <span className="rounded-full bg-[#EBF4FC] px-3 py-1 t-meta font-semibold text-[#1F2933]">Horarios de demostración</span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-7" role="group" aria-labelledby={`${id}-hora`}>
            {HORAS.map((h) => {
              const busy = ocupado(fecha, h)
              const on = hora === h
              return (
                <button key={h} disabled={busy} aria-pressed={on} onClick={() => onHora(h)}
                  className={`min-h-12 rounded-lg border px-2 text-base transition-colors ${busy ? 'cursor-not-allowed border-dashed border-[#D6E4F5] bg-[#ECF3F9] text-[#5B6B7A]' : on ? 'border-[#005BB0] bg-[#EBF4FC] font-semibold text-[#005BB0]' : 'border-[#D6E4F5] bg-white text-[#1F2933] hover:border-[#0074D9] hover:bg-[#EBF4FC]'}`}>
                  {h}{busy && <span className="block t-meta leading-none">Ocupado</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

