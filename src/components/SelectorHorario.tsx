import { useEffect, useMemo, useRef, useState } from 'react'
import { fechaLarga, hoyISO, isoDia, yaPaso } from '../state/tramite'
import { Icon } from './Icon'

/* Calendario + selector de hora. Nunca permite fechas ni horas que ya pasaron.
   La ocupación es de demostración, estable para cada día y hora. */

export const DIAS_MAXIMOS = 90
export const HORAS = Array.from({ length: 21 }, (_, i) => `${String(8 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
export const ocupado = (fecha: string, hora: string) => {
  let h = 0
  for (const ch of fecha + hora) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 4 === 0
}
/** ¿Se puede reservar este horario? (no pasado y no ocupado) */
export const disponible = (fecha: string, hora: string) => !yaPaso(fecha, hora) && !ocupado(fecha, hora)
const hayLugar = (fecha: string) => HORAS.some((h) => disponible(fecha, h))

const MESES = Array.from({ length: 12 }, (_, i) => new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'long' }))
const SEMANA: [string, string][] = [['L', 'lunes'], ['M', 'martes'], ['M', 'miércoles'], ['J', 'jueves'], ['V', 'viernes'], ['S', 'sábado'], ['D', 'domingo']]
const parse = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }
const sumarDias = (iso: string, n: number) => { const d = parse(iso); d.setDate(d.getDate() + n); return isoDia(d) }

export function SelectorHorario({ fecha, hora, onFecha, onHora, id = 'h' }: {
  fecha: string | null; hora: string | null; onFecha: (v: string) => void; onHora: (h: string | null) => void; id?: string
}) {
  const hoy = hoyISO()
  const max = sumarDias(hoy, DIAS_MAXIMOS)
  const habilitado = (iso: string) => iso >= hoy && iso <= max && hayLugar(iso)
  // fecha guardada que ya pasó: se trata como no elegida
  const fechaValida = fecha && habilitado(fecha) ? fecha : null

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:gap-10">
      <Calendario id={id} fecha={fechaValida} hoy={hoy} max={max} habilitado={habilitado} onFecha={onFecha} />
      <div>
        {fechaValida
          ? <SelectorHora key={fechaValida} id={id} fecha={fechaValida} hora={hora} onHora={onHora} />
          : <p className="rounded-lg bg-[#EBF4FC] px-4 py-3 t-body text-[#1F2933]">Elige un día en el calendario para ver las horas disponibles.</p>}
        {fecha && !fechaValida && <p role="status" className="mt-3 t-body text-[#1F2933]">La fecha que tenías guardada ya pasó o no tiene lugar. Elige otra.</p>}
      </div>
    </div>
  )
}

/* ---------- calendario mensual ---------- */
function Calendario({ id, fecha, hoy, max, habilitado, onFecha }: {
  id: string; fecha: string | null; hoy: string; max: string; habilitado: (iso: string) => boolean; onFecha: (v: string) => void
}) {
  const inicio = parse(fecha ?? hoy)
  const [mes, setMes] = useState({ y: inicio.getFullYear(), m: inicio.getMonth() })
  // día que recibe el foco con Tab (navegación con flechas dentro de la cuadrícula)
  const [foco, setFoco] = useState<string>(fecha ?? hoy)
  const moverFoco = useRef(false)
  const grid = useRef<HTMLTableElement>(null)

  const hoyD = parse(hoy)
  const maxD = parse(max)
  const puedeAtras = mes.y > hoyD.getFullYear() || (mes.y === hoyD.getFullYear() && mes.m > hoyD.getMonth())
  const puedeAdelante = mes.y < maxD.getFullYear() || (mes.y === maxD.getFullYear() && mes.m < maxD.getMonth())

  const semanas = useMemo(() => {
    const primero = new Date(mes.y, mes.m, 1)
    const offset = (primero.getDay() + 6) % 7 // lunes = 0
    const dias = new Date(mes.y, mes.m + 1, 0).getDate()
    const celdas: (string | null)[] = [...Array(offset).fill(null), ...Array.from({ length: dias }, (_, i) => isoDia(new Date(mes.y, mes.m, i + 1)))]
    while (celdas.length % 7) celdas.push(null)
    return Array.from({ length: celdas.length / 7 }, (_, i) => celdas.slice(i * 7, i * 7 + 7))
  }, [mes])

  // si el día enfocable no está en el mes visible, usa el primero habilitado
  const enMes = (iso: string) => { const d = parse(iso); return d.getFullYear() === mes.y && d.getMonth() === mes.m }
  // nunca un día deshabilitado (p. ej. hoy después del último horario): no podría recibir el foco
  const tabDia = enMes(foco) && habilitado(foco) ? foco : (semanas.flat().find((d) => d && habilitado(d)) ?? semanas.flat().find(Boolean)!)

  useEffect(() => {
    if (!moverFoco.current) return
    moverFoco.current = false
    grid.current?.querySelector<HTMLButtonElement>(`[data-dia="${foco}"]`)?.focus()
  }, [foco, mes])

  const cambiarMes = (delta: number) => setMes(({ y, m }) => { const d = new Date(y, m + delta, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  const onKey = (e: React.KeyboardEvent, iso: string) => {
    const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (!paso) return
    e.preventDefault()
    // salta días sin lugar en la misma dirección; se detiene en los límites (hoy y el máximo)
    let destino = sumarDias(iso, paso)
    while (destino >= hoy && destino <= max && !habilitado(destino)) destino = sumarDias(destino, paso)
    if (destino < hoy || destino > max) return
    const d = parse(destino)
    setMes({ y: d.getFullYear(), m: d.getMonth() })
    moverFoco.current = true
    setFoco(destino)
  }

  const titulo = `${MESES[mes.m]} ${mes.y}`
  const navBtn = 'inline-flex min-h-12 items-center gap-1 rounded-lg border border-[#D6E4F5] bg-white px-3 text-base font-semibold text-[#005BB0] transition-colors hover:border-[#0074D9] hover:bg-[#EBF4FC] disabled:cursor-not-allowed disabled:border-[#D6E4F5] disabled:bg-[#ECF3F9] disabled:text-[#5B6B7A]'

  return (
    <div>
      <div className="grid grid-cols-2 items-center gap-2 sm:flex sm:justify-between">
        <p id={`${id}-mes`} className="col-span-2 order-first text-center t-sub font-bold capitalize text-[#1F2933] sm:order-none" aria-live="polite">{titulo}</p>
        <button onClick={() => cambiarMes(-1)} disabled={!puedeAtras} className={`${navBtn} justify-center sm:order-first`}><Icon n="left" /><span>Anterior</span></button>
        <button onClick={() => cambiarMes(1)} disabled={!puedeAdelante} className={`${navBtn} justify-center`}><span>Siguiente</span><Icon n="left" className="rotate-180" /></button>
      </div>
      <table ref={grid} role="grid" aria-labelledby={`${id}-mes`} className="mt-3 w-full table-fixed border-separate border-spacing-0 sm:border-spacing-1">
        <thead>
          <tr>{SEMANA.map(([c, l], i) => <th key={i} scope="col" abbr={l} className="pb-1 t-meta font-semibold text-[#5B6B7A]"><span aria-hidden="true">{c}</span><span className="sr-only">{l}</span></th>)}</tr>
        </thead>
        <tbody>
          {semanas.map((s, i) => (
            <tr key={i}>
              {s.map((iso, j) => {
                if (!iso) return <td key={j} />
                const ok = habilitado(iso)
                const sel = iso === fecha
                const esHoy = iso === hoy
                const motivo = iso < hoy ? ', ya pasó' : iso > max ? ', fuera de rango' : !ok ? ', sin lugar' : ''
                return (
                  <td key={j} className="p-0">
                    <button data-dia={iso} tabIndex={iso === tabDia ? 0 : -1} disabled={!ok} aria-pressed={sel}
                      aria-label={`${fechaLarga(iso)}${esHoy ? ', hoy' : ''}${motivo}`}
                      onClick={() => { setFoco(iso); onFecha(iso) }} onKeyDown={(e) => onKey(e, iso)}
                      className={`flex h-12 w-full flex-col items-center justify-center rounded-lg text-base transition-colors ${
                        sel ? 'bg-[#005BB0] font-semibold text-white'
                          : ok ? `border ${esHoy ? 'border-[#005BB0]' : 'border-[#D6E4F5]'} bg-white text-[#1F2933] hover:border-[#0074D9] hover:bg-[#EBF4FC]`
                            : 'cursor-not-allowed text-[#5B6B7A] line-through decoration-[#5B6B7A]/60'}`}>
                      <span>{parse(iso).getDate()}</span>
                      {esHoy && <span className={`text-[11px] leading-none ${sel ? 'text-white' : 'text-[#005BB0]'}`} aria-hidden="true">Hoy</span>}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 t-meta text-[#5B6B7A]">Puedes agendar desde hoy y hasta {DIAS_MAXIMOS} días después. Usa las flechas del teclado para moverte entre días.</p>
    </div>
  )
}

/* ---------- selector de hora: hora + minutos ---------- */
function SelectorHora({ id, fecha, hora, onHora }: { id: string; fecha: string; hora: string | null; onHora: (h: string | null) => void }) {
  const inicial = hora && disponible(fecha, hora) ? hora : null
  const [hh, setHh] = useState(inicial?.slice(0, 2) ?? '')
  const [mm, setMm] = useState(inicial?.slice(3) ?? '')
  // la hora guardada ya no sirve (pasó o se ocupó): se limpia
  useEffect(() => { if (hora && !inicial) onHora(null) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const horas = Array.from(new Set(HORAS.map((h) => h.slice(0, 2))))
  const minutosDe = (h: string) => HORAS.filter((x) => x.startsWith(h + ':')).map((x) => x.slice(3))
  const libres = (h: string) => minutosDe(h).filter((m) => disponible(fecha, `${h}:${m}`))
  const siguiente = HORAS.find((h) => disponible(fecha, h)) ?? null

  const elegirHora = (h: string) => {
    setHh(h)
    const m = libres(h)[0] ?? ''
    setMm(m)
    onHora(m ? `${h}:${m}` : null)
  }
  const elegirMin = (m: string) => { setMm(m); onHora(hh && m ? `${hh}:${m}` : null) }
  const usar = (h: string) => { setHh(h.slice(0, 2)); setMm(h.slice(3)); onHora(h) }

  const select = 'h-12 w-full appearance-none rounded-lg border border-[#D6E4F5] bg-white pl-4 pr-10 text-base text-[#1F2933] transition-colors hover:border-[#0074D9]'
  const elegida = hh && mm ? `${hh}:${mm}` : null

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="t-sub font-bold text-[#1F2933] first-letter:uppercase">{fechaLarga(fecha)}</p>
        <span className="rounded-full bg-[#EBF4FC] px-3 py-1 t-meta font-semibold text-[#1F2933]">Horarios de demostración</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-hh`} className="text-base font-semibold text-[#1F2933]">Hora</label>
          <div className="relative mt-2">
            <select id={`${id}-hh`} value={hh} onChange={(e) => elegirHora(e.target.value)} className={select}>
              <option value="" disabled>Elige</option>
              {horas.map((h) => {
                const n = libres(h).length
                return <option key={h} value={h} disabled={!n}>{h} h{n ? '' : ' · sin lugar'}</option>
              })}
            </select>
            <Icon n="left" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-[#5B6B7A]" />
          </div>
        </div>
        <div>
          <label htmlFor={`${id}-mm`} className="text-base font-semibold text-[#1F2933]">Minutos</label>
          <div className="relative mt-2">
            <select id={`${id}-mm`} value={mm} onChange={(e) => elegirMin(e.target.value)} disabled={!hh} className={`${select} disabled:cursor-not-allowed disabled:bg-[#ECF3F9] disabled:text-[#5B6B7A]`}>
              <option value="" disabled>{hh ? 'Elige' : 'Primero la hora'}</option>
              {hh && minutosDe(hh).map((m) => {
                const ok = disponible(fecha, `${hh}:${m}`)
                return <option key={m} value={m} disabled={!ok}>:{m}{ok ? '' : yaPaso(fecha, `${hh}:${m}`) ? ' · ya pasó' : ' · ocupado'}</option>
              })}
            </select>
            <Icon n="left" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 -rotate-90 text-[#5B6B7A]" />
          </div>
        </div>
      </div>
      <div role="status" className="mt-4">
        {elegida
          ? <p className="flex items-center gap-2 rounded-lg bg-[#EBF4FC] px-4 py-3 t-body text-[#1F2933]"><Icon n="calendar" className="text-[#005BB0]" />Tu cita: <strong className="font-bold">{elegida} h</strong></p>
          : siguiente && (
            <div className="flex flex-wrap items-center gap-x-3 t-body text-[#1F2933]">
              <span>Próximo horario libre: <strong className="font-bold">{siguiente} h</strong></span>
              <button onClick={() => usar(siguiente)} className="inline-flex min-h-12 items-center rounded-md px-1 font-semibold text-[#005BB0] underline underline-offset-4 hover:text-[#003F7A]">Usar este horario</button>
            </div>
          )}
      </div>
    </div>
  )
}
