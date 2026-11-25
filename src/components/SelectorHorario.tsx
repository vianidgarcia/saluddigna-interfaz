import { useEffect, useMemo, useRef, useState } from 'react'
import { fechaLarga, hoyISO, isoDia, yaPaso, fmtHora } from '../state/tramite'
import { Icon } from './Icon'

/* Calendario + horarios. Nunca permite fechas ni horas que ya pasaron.
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
  // cuenta los días elegidos por el usuario: solo entonces se lleva la vista a los horarios (no al restaurar)
  const [toques, setToques] = useState(0)
  const elegirDia = (v: string) => { onFecha(v); setToques((n) => n + 1) }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-8">
      <Calendario id={id} fecha={fechaValida} hoy={hoy} max={max} habilitado={habilitado} onFecha={elegirDia} />
      <div>
        {fechaValida
          ? <SelectorHora id={id} fecha={fechaValida} hora={hora} onHora={onHora} toques={toques} />
          : <p className="rounded-lg bg-resaltado px-4 py-3 t-body text-titulo">Elige un día en el calendario para ver las horas disponibles.</p>}
        {fecha && !fechaValida && <p role="status" className="mt-3 t-body text-titulo">La fecha que tenías guardada ya pasó o no tiene lugar. Elige otra.</p>}
      </div>
    </div>
  )
}

/* ---------- calendario mensual: siempre 6 semanas; solo los días disponibles se pueden elegir ---------- */
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

  // 42 celdas (6 semanas, de lunes a domingo) con los días del mes anterior y siguiente para completar
  const semanas = useMemo(() => {
    const primero = new Date(mes.y, mes.m, 1)
    const offset = (primero.getDay() + 6) % 7 // lunes = 0
    const celdas = Array.from({ length: 42 }, (_, i) => isoDia(new Date(mes.y, mes.m, 1 - offset + i)))
    return Array.from({ length: 6 }, (_, i) => celdas.slice(i * 7, i * 7 + 7))
  }, [mes])

  const enMes = (iso: string) => { const d = parse(iso); return d.getFullYear() === mes.y && d.getMonth() === mes.m }
  const elegible = (iso: string) => enMes(iso) && habilitado(iso)
  // nunca un día deshabilitado (p. ej. hoy después del último horario): no podría recibir el foco
  const tabDia = elegible(foco) ? foco : (semanas.flat().find(elegible) ?? null)
  const hayDias = semanas.flat().some(elegible)

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
  const navBtn = 'inline-flex min-h-12 items-center gap-1 rounded-lg px-2 text-base font-semibold text-enlace transition-colors hover:bg-resaltado disabled:cursor-not-allowed disabled:text-secundario disabled:hover:bg-transparent'

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p id={`${id}-mes`} className="t-sub font-bold capitalize text-titulo" aria-live="polite">{titulo}</p>
        <div className="flex items-center">
          <button onClick={() => cambiarMes(-1)} disabled={!puedeAtras} className={navBtn}><Icon n="left" /><span>Anterior</span></button>
          <button onClick={() => cambiarMes(1)} disabled={!puedeAdelante} className={navBtn}><span>Siguiente</span><Icon n="left" className="rotate-180" /></button>
        </div>
      </div>
      <table ref={grid} role="grid" aria-labelledby={`${id}-mes`} className="mt-2 w-full table-fixed border-collapse">
        <thead>
          <tr>{SEMANA.map(([c, l], i) => <th key={i} scope="col" abbr={l} className="pb-1 t-meta font-semibold text-secundario"><span aria-hidden="true">{c}</span><span className="sr-only">{l}</span></th>)}</tr>
        </thead>
        <tbody>
          {semanas.map((s, i) => (
            <tr key={i}>
              {s.map((iso) => {
                const dia = parse(iso).getDate()
                const propio = enMes(iso)
                if (!elegible(iso)) {
                  // fuera del mes o sin lugar: se ve atenuado y no se puede elegir
                  return (
                    <td key={iso} className="p-0.5 text-center">
                      <span aria-hidden={!propio} className={`mx-auto flex h-12 w-full max-w-12 items-center justify-center rounded-full text-base ${propio ? 'text-secundario' : 'text-secundario font-normal'}`}>
                        {dia}{propio && <span className="sr-only">, no disponible</span>}
                      </span>
                    </td>
                  )
                }
                const sel = iso === fecha
                const esHoy = iso === hoy
                return (
                  <td key={iso} className="p-0.5 text-center">
                    <button data-dia={iso} tabIndex={iso === tabDia ? 0 : -1} aria-pressed={sel}
                      aria-label={`${fechaLarga(iso)}${esHoy ? ', hoy' : ''}`}
                      onClick={() => { setFoco(iso); onFecha(iso) }} onKeyDown={(e) => onKey(e, iso)}
                      className={`mx-auto flex h-12 w-full max-w-12 items-center justify-center rounded-full text-base font-semibold transition-colors ${
                        sel ? 'bg-accion-hover text-white' : `text-titulo hover:bg-resaltado ${esHoy ? 'ring-2 ring-inset ring-borde-accion' : ''}`}`}>
                      {dia}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!hayDias && <p className="mt-2 rounded-lg bg-resaltado px-4 py-3 t-body text-titulo">No hay días disponibles en {titulo}. Prueba con otro mes.</p>}
      <p className="mt-2 t-meta text-secundario">Los días atenuados no están disponibles. Puedes agendar desde hoy y hasta {DIAS_MAXIMOS} días después; usa las flechas del teclado para moverte entre días.</p>
    </div>
  )
}

/* ---------- horario: los horarios libres a la vista, agrupados en mañana y tarde; un toque para elegir ---------- */
const FRANJAS: [string, (h: string) => boolean][] = [
  ['Mañana', (h) => h < '12:00'],
  ['Tarde', (h) => h >= '12:00'],
]

function SelectorHora({ id, fecha, hora, onHora, toques }: { id: string; fecha: string; hora: string | null; onHora: (h: string | null) => void; toques: number }) {
  const elegida = hora && disponible(fecha, hora) ? hora : null
  // la hora guardada ya no sirve (pasó o se ocupó): se limpia
  useEffect(() => { if (hora && !elegida) onHora(null) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const seccion = useRef<HTMLDivElement>(null)
  // al tocar un día en el teléfono, la sección de horarios queda a la vista (el calendario ocupa la pantalla)
  useEffect(() => {
    if (toques > 0 && window.matchMedia('(max-width: 1023px)').matches) seccion.current?.scrollIntoView({ block: 'start' })
  }, [toques])

  const libres = HORAS.filter((h) => disponible(fecha, h))
  return (
    <div ref={seccion} className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 id={`${id}-hl`} className="t-sub font-bold text-titulo first-letter:uppercase">{fechaLarga(fecha)}</h3>
        <span className="rounded-full bg-resaltado px-3 py-1 t-meta font-semibold text-titulo">Horarios de demostración</span>
      </div>
      <p className="mt-1 t-meta text-secundario">{libres.length === 1 ? '1 horario disponible' : `${libres.length} horarios disponibles`}. Toca el que prefieras.</p>
      {/* mañana a la izquierda, tarde a la derecha; el cartel de la cita va debajo de las dos */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-6">
      {FRANJAS.map(([nombre, enFranja]) => {
        const horas = libres.filter(enFranja)
        return (
          <div key={nombre} className="min-w-0">
            <p id={`${id}-${nombre}`} className="text-base font-semibold text-titulo">{nombre}</p>
            {!horas.length && <p className="mt-2 t-meta text-secundario">Sin horarios este día</p>}
            {horas.length > 0 && <div role="group" aria-labelledby={`${id}-${nombre}`} className="mt-2 grid grid-cols-2 gap-2 max-[359px]:grid-cols-1">
              {horas.map((h) => {
                const on = elegida === h
                return (
                  <button key={h} onClick={() => onHora(h)} aria-pressed={on} aria-label={fmtHora(h)}
                    className={`min-h-12 whitespace-nowrap rounded-lg border px-1 text-base font-semibold transition-colors ${on ? 'border-accion-hover bg-accion-hover text-white' : 'border-borde bg-superficie text-titulo hover:border-borde-accion hover:bg-resaltado'}`}>
                    {fmtHora(h)}
                  </button>
                )
              })}
            </div>}
          </div>
        )
      })}
      </div>
      <div role="status" className="mt-4">
        {elegida && (
          <p className="flex items-start gap-2 rounded-lg bg-resaltado px-4 py-3 t-body text-titulo">
            <Icon n="calendar" className="mt-0.5 text-enlace" />
            <span>Tu cita: <strong className="font-bold first-letter:uppercase">{fechaLarga(fecha)}, {fmtHora(elegida)}</strong></span>
          </p>
        )}
      </div>
    </div>
  )
}
