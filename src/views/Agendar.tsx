import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useApp } from '../context'
import { Back } from '../components/Back'
import { SelectorHorario } from '../components/SelectorHorario'
import { Icon } from '../components/Icon'
import { CHIPS, STUDIES } from '../data/studies'
import { clinicasPorDistancia, findClinic } from '../data/clinics'
import { NB, WA, container, chip, link, outlineBtn, solidBtn } from '../components/ui'
import {
  METODO, PASOS, avance, codigoEnviado, conEvento, fechaLarga, pasoCompleto, ultimos4,
  type MetodoPago, type Paso, type Tramite,
} from '../state/tramite'

const PREGUNTA: Record<Paso, string> = {
  1: '¿Qué estudio necesitas?',
  2: '¿En qué clínica te atendemos?',
  3: '¿Qué día y a qué hora?',
  4: 'Confirma tu WhatsApp',
  5: 'Revisa tu cita y elige cómo pagar',
}
const CODIGO_DEMO = '123456'
const optionRow = 'flex min-h-14 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors has-[:checked]:border-[#005BB0] has-[:checked]:bg-[#EBF4FC]'
const radio = 'mt-0.5 size-5 shrink-0 accent-[#005BB0]'
const fieldInput = 'h-12 w-full rounded-lg border border-[#D6E4F5] bg-white px-4 text-base text-[#1F2933] transition-colors hover:border-[#0074D9] aria-[invalid=true]:border-2 aria-[invalid=true]:border-[#B3261E]'

export function Agendar() {
  const { tramite } = useApp()
  if (!tramite) return null
  if (tramite.estado === 'confirmada') return <Confirmada t={tramite} />
  return <Flujo t={tramite} />
}

/* ---------- contenedor del flujo ---------- */
function Flujo({ t }: { t: Tramite }) {
  const { update, go } = useApp()
  const paso = t.paso
  const headRef = useRef<HTMLHeadingElement>(null)
  const mounted = useRef(false)
  useEffect(() => {
    // al cambiar de paso: arriba y foco en la pregunta (lectores de pantalla la anuncian)
    if (mounted.current) window.scrollTo(0, 0)
    mounted.current = true
    headRef.current?.focus({ preventScroll: true })
  }, [paso])

  const irA = (p: Paso, tipo: string, detalle: string, extra: Partial<Tramite> = {}) =>
    update((x) => conEvento({ ...x, ...extra, paso: p }, tipo, detalle))

  const detalle = (p: Paso): string => {
    if (p === 1) return t.estudio?.nombre ?? ''
    if (p === 2) return t.clinica ?? 'Clínica pendiente'
    if (p === 3) return t.fecha ? `${fechaLarga(t.fecha)}, ${t.hora}` : ''
    if (p === 4) return `WhatsApp verificado ${ultimos4(t.paciente.whatsapp)}`
    return ''
  }

  const siguiente = () => {
    const pasos: Paso[] = [1, 2, 3, 4, 5]
    // desde el resumen: volver al primer dato que falte (o al resumen)
    const next: Paso = t.desdeResumen
      ? pasos.find((p) => p > paso && p < 5 && !pasoCompleto(t, p)) ?? 5
      : (Math.min(paso + 1, 5) as Paso)
    irA(next, 'tramite.paso_completado', `Paso ${paso} (${PASOS[paso]}): ${detalle(paso)}`, { desdeResumen: next === 5 ? false : t.desdeResumen })
  }
  const atras = () => irA((paso - 1) as Paso, 'tramite.paso_regresado', `Regresó al paso ${paso - 1}: ${PASOS[(paso - 1) as Paso]}`)
  const cambiar = (p: Paso) => irA(p, 'tramite.dato_editado', `Abrió “Cambiar” en ${PASOS[p]} desde el resumen`, { desdeResumen: true })

  /* qué falta para continuar en cada paso */
  let falta: string | null = null
  if (paso === 1 && !t.estudio) falta = 'Elige una categoría y luego tu estudio para continuar.'
  if (paso === 2 && !pasoCompleto(t, 2)) falta = 'Elige una clínica o marca “Aún no lo decido” para continuar.'
  if (paso === 3 && !t.fecha) falta = 'Elige un día para ver los horarios.'
  if (paso === 3 && t.fecha && !t.hora) falta = 'Elige un horario para continuar.'
  if (paso === 4 && !t.paciente.verificado) falta = codigoEnviado(t) ? 'Escribe el código que te enviamos para continuar.' : 'Verifica tu número de WhatsApp para continuar.'
  if (paso === 5) falta = !t.clinica ? 'Elige una clínica para confirmar tu cita (toca “Cambiar” en Clínica).' : !t.metodoPago ? 'Elige cómo quieres pagar para continuar.' : null

  const confirmar = () => {
    if (t.metodoPago === 'oxxo') {
      update((x) => conEvento({ ...x, estado: 'pago_pendiente', desdeResumen: false }, 'pago.referencia_generada', 'Referencia de pago en Oxxo generada (demo)'))
      go('pay')
      return
    }
    update((x) => conEvento({ ...x, estado: 'confirmada', desdeResumen: false }, 'cita.confirmada', `${METODO[x.metodoPago!]} · ${x.fecha ? fechaLarga(x.fecha) : ''} ${x.hora ?? ''}`))
    window.scrollTo(0, 0)
  }
  const primario = paso === 5
    ? (t.metodoPago === 'oxxo' ? 'Generar referencia de pago' : 'Confirmar cita')
    : t.desdeResumen ? 'Guardar y continuar' : 'Continuar'

  return (
    <div className={`${container} py-4 lg:py-12`}>
      <Back />
      <h1 className="mt-2 t-section font-head text-[#1F2933] lg:mt-4">Agendar cita</h1>
      <Progreso paso={paso} />
      <div className="mt-6 max-w-3xl lg:mt-8">
        <h2 ref={headRef} tabIndex={-1} data-focus-target className="t-card font-head text-[#1F2933]">
          <span className="sr-only">Paso {paso} de 5: </span>{PREGUNTA[paso]}
        </h2>
        {paso === 1 && <p className="mt-1 t-meta text-[#5B6B7A]">Guardamos tu avance en cada paso. Si te interrumpes, retómalo desde el inicio o por WhatsApp.</p>}
        <div className="mt-6">
          {paso === 1 && <PasoEstudio t={t} />}
          {paso === 2 && <PasoClinica t={t} />}
          {paso === 3 && <PasoFecha t={t} />}
          {paso === 4 && <PasoIdentificacion t={t} />}
          {paso === 5 && <PasoPago t={t} onCambiar={cambiar} />}
        </div>
        <div className="mt-8 border-t border-[#D6E4F5] pt-6">
            {falta && <p id="falta" className="mb-3 t-body text-[#43474A]">{falta}</p>}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {paso > 1
                ? <button onClick={atras} className={outlineBtn}><Icon n="left" />Atrás</button>
                : <button onClick={() => go('home')} className={outlineBtn}><Icon n="left" />Atrás</button>}
              <button onClick={paso === 5 ? confirmar : siguiente} disabled={!!falta} aria-describedby={falta ? 'falta' : undefined} className={solidBtn}>
                {primario}<Icon n="arrow" />
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}

function Progreso({ paso }: { paso: Paso }) {
  return (
    <div className="mt-3 max-w-3xl lg:mt-4">
      <p className="t-sub font-semibold text-[#1F2933]">Paso {paso} de 5 · {PASOS[paso]}</p>
      <div role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={paso} aria-valuetext={`Paso ${paso} de 5: ${PASOS[paso]}`} aria-label="Avance del agendado" className="mt-2 h-2 rounded-full bg-[#EBF4FC]">
        <div className="h-full rounded-full bg-[#005BB0] transition-[width]" style={{ width: `${avance(paso)}%` }} />
      </div>
      <ol className="mt-2 hidden grid-cols-5 gap-2 t-meta sm:grid" aria-hidden="true">
        {([1, 2, 3, 4, 5] as Paso[]).map((p) => (
          <li key={p} className={p === paso ? 'font-semibold text-[#005BB0]' : p < paso ? 'text-[#43474A]' : 'text-[#5B6B7A]'}>{p}. {PASOS[p]}</li>
        ))}
      </ol>
    </div>
  )
}

/* ---------- paso 1: estudio ---------- */
function PasoEstudio({ t }: { t: Tramite }) {
  const { update } = useApp()
  const inicial = t.estudio && CHIPS.includes(t.estudio.categoria) ? t.estudio.categoria : null
  const [cat, setCat] = useState<string | null>(inicial)
  const paquete = t.estudio && !CHIPS.includes(t.estudio.categoria) ? t.estudio : null
  return (
    <>
      {paquete && (
        <p className="mb-6 rounded-lg bg-[#EBF4FC] px-4 py-3 t-body text-[#1F2933]" role="status">
          Elegiste: <strong className="font-bold">{paquete.nombre}{paquete.precio ? ` – ${paquete.precio}` : ''}</strong>{paquete.precio ? ' (IVA incluido)' : ''}. Puedes continuar o elegir otro estudio.
        </p>
      )}
      <p className="text-base font-semibold text-[#1F2933]" id="cat-l">Categoría</p>
      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="cat-l">
        {CHIPS.map((c) => <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={chip(cat === c)}>{c}</button>)}
      </div>
      {cat && (
        <fieldset className="mt-6">
          <legend className="text-base font-semibold text-[#1F2933]">Estudios de {cat.toLowerCase()}</legend>
          <div className="mt-2 flex flex-col gap-2">
            {STUDIES[cat].map((n) => (
              <label key={n} className={`${optionRow} border-[#D6E4F5] hover:border-[#0074D9]`}>
                <input type="radio" name="estudio" className={radio} checked={t.estudio?.nombre === n}
                  onChange={() => update((x) => ({ ...x, estudio: { categoria: cat, nombre: n } }))} />
                <span><span className="block text-base font-semibold text-[#1F2933]">{n}</span><span className="block t-meta text-[#5B6B7A]">Precio según tu clínica</span></span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
    </>
  )
}

/* ---------- paso 2: clínica ---------- */
function PasoClinica({ t }: { t: Tramite }) {
  const { update } = useApp()
  const list = clinicasPorDistancia()
  return (
    <fieldset>
      <legend className="text-base font-semibold text-[#1F2933]">Clínicas en Culiacán, de la más cercana a la más lejana</legend>
      <div className="mt-2 flex flex-col gap-2">
        {list.map((c, i) => (
          <label key={c.name} className={`${optionRow} border-[#D6E4F5] hover:border-[#0074D9]`}>
            <input type="radio" name="clinica" className={radio} checked={t.clinica === c.name}
              onChange={() => update((x) => ({ ...x, clinica: c.name, clinicaPendiente: false }))} />
            <span>
              <span className="block text-base font-semibold text-[#1F2933]">{c.name}{i === 0 && <span className="ml-2 t-meta font-semibold text-[#005BB0]">Más cercana</span>}</span>
              <span className="block t-meta text-[#5B6B7A]">{c.address}</span>
              <span className="block t-meta text-[#5B6B7A]">{c.km.toFixed(1)}{NB}km (distancia de ejemplo) · Tel.{NB}{c.phone}</span>
            </span>
          </label>
        ))}
        <label className={`${optionRow} border-dashed border-[#D6E4F5] hover:border-[#0074D9]`}>
          <input type="radio" name="clinica" className={radio} checked={t.clinicaPendiente}
            onChange={() => update((x) => ({ ...x, clinica: null, clinicaPendiente: true }))} />
          <span>
            <span className="block text-base font-semibold text-[#1F2933]">Aún no lo decido</span>
            <span className="block t-meta text-[#5B6B7A]">Puedes seguir y elegirla antes de confirmar tu cita.</span>
          </span>
        </label>
      </div>
    </fieldset>
  )
}

/* ---------- paso 3: fecha y hora ---------- */
function PasoFecha({ t }: { t: Tramite }) {
  const { update } = useApp()
  return <SelectorHorario fecha={t.fecha} hora={t.hora}
    onFecha={(v) => update((x) => ({ ...x, fecha: v, hora: x.fecha === v ? x.hora : null }))}
    onHora={(h) => update((x) => ({ ...x, hora: h }))} />
}

/* ---------- paso 4: identificación ---------- */
function ErrorCampo({ id, children }: { id: string; children: ReactNode }) {
  return <p id={id} role="alert" className="mt-2 flex items-start gap-2 t-body font-semibold text-[#B3261E]"><Icon n="alert" className="mt-0.5" />{children}</p>
}

function PasoIdentificacion({ t }: { t: Tramite }) {
  const { update, toast } = useApp()
  // si el número ya se conoce (p. ej. llegó por WhatsApp), se precarga: no se vuelve a pedir
  const [tel, setTel] = useState(() => (t.paciente.whatsapp ?? '').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3'))
  const [telErr, setTelErr] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [codeErr, setCodeErr] = useState<string | null>(null)
  const p = t.paciente

  const enviar = () => {
    const d = tel.replace(/\D/g, '')
    if (d.length !== 10) {
      setTelErr(d.length ? `Tu número debe tener 10 dígitos; escribiste ${d.length}. Ej. 667 123 4567.` : 'Escribe tu número de WhatsApp de 10 dígitos. Ej. 667 123 4567.')
      return
    }
    setTelErr(null)
    setCode('')
    update((x) => conEvento({ ...x, paciente: { ...x.paciente, whatsapp: d, verificado: false, codigoEnviado: true } }, 'paciente.codigo_enviado', `Código enviado por WhatsApp a ${ultimos4(d)} (demo)`))
  }
  const verificar = () => {
    const c = code.replace(/\D/g, '')
    if (c.length !== 6) { setCodeErr('El código tiene 6 dígitos.'); return }
    if (c !== CODIGO_DEMO) { setCodeErr('El código no coincide. Revísalo e intenta de nuevo.'); return }
    setCodeErr(null)
    update((x) => conEvento({ ...x, paciente: { ...x.paciente, verificado: true } }, 'paciente.verificado', `WhatsApp ${ultimos4(x.paciente.whatsapp)} verificado`))
  }
  const otroNumero = () => { setTel(''); setCode(''); setCodeErr(null); update((x) => ({ ...x, paciente: { ...x.paciente, whatsapp: null, verificado: false, codigoEnviado: false } })) }

  if (p.verificado) {
    return (
      <div role="status" className="flex flex-col gap-1 rounded-lg bg-[#EBF4FC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 t-body text-[#1F2933]"><Icon n="check" className="text-[#005BB0]" />Número verificado: <strong className="font-bold">{ultimos4(p.whatsapp)}</strong></p>
        <button onClick={otroNumero} className={link}>Usar otro número</button>
      </div>
    )
  }

  if (!codigoEnviado(t)) {
    return (
      <div>
        <label htmlFor="wa" className="text-base font-semibold text-[#1F2933]">Número de WhatsApp</label>
        <p id="wa-h" className="t-meta text-[#5B6B7A]">10 dígitos, sin +52. Ahí te enviaremos un código y los detalles de tu cita.</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="sm:w-80">
          <input id="wa" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14} value={tel}
            onChange={(e) => { setTel(e.target.value); if (telErr) setTelErr(null) }}
            onKeyDown={(e) => e.key === 'Enter' && enviar()}
            aria-invalid={!!telErr} aria-describedby={telErr ? 'wa-h wa-e' : 'wa-h'} placeholder="Ej. 667 123 4567" className={fieldInput} />
          {telErr && <ErrorCampo id="wa-e">{telErr}</ErrorCampo>}
          </div>
          <button onClick={enviar} className={outlineBtn}><Icon n="chat" />Enviar código</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p role="status" className="t-body text-[#1F2933]">Enviamos un código de 6 dígitos a tu WhatsApp <strong className="font-bold">{ultimos4(p.whatsapp)}</strong>.</p>
      <div className="mt-1 flex flex-wrap gap-x-6">
        <button onClick={otroNumero} className={link}>Cambiar número</button>
        <button onClick={() => toast('Código reenviado (demo)')} className={link}>Reenviar código</button>
      </div>
      <label htmlFor="otp" className="mt-4 block text-base font-semibold text-[#1F2933]">Código de verificación</label>
      <p id="otp-h" className="mt-1 inline-block rounded-md bg-[#EBF4FC] px-3 py-1 t-meta font-semibold text-[#1F2933]">Código de demostración: {CODIGO_DEMO}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="sm:w-80">
        <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); if (codeErr) setCodeErr(null) }}
          onKeyDown={(e) => e.key === 'Enter' && verificar()}
          aria-invalid={!!codeErr} aria-describedby={codeErr ? 'otp-h otp-e' : 'otp-h'} placeholder="6 dígitos" className={`${fieldInput} font-mono tracking-widest`} />
        {codeErr && <ErrorCampo id="otp-e">{codeErr}</ErrorCampo>}
        </div>
        <button onClick={verificar} className={outlineBtn}><Icon n="check" />Verificar código</button>
      </div>
    </div>
  )
}

/* ---------- paso 5: resumen editable + pago ---------- */
const OPCIONES: [MetodoPago, string][] = [
  ['en_linea', 'Con tarjeta de débito o crédito. En esta demo el cobro es simulado.'],
  ['oxxo', 'Te damos una referencia para pagar en efectivo en cualquier Oxxo.'],
  ['en_clinica', 'Pagas en recepción el día de tu cita.'],
]

function Resumen({ t, onCambiar }: { t: Tramite; onCambiar?: (p: Paso) => void }) {
  const c = findClinic(t.clinica)
  const filas: [Paso, string, ReactNode][] = [
    [1, 'Estudio', <>{t.estudio?.nombre}<span className="block t-meta font-normal text-[#5B6B7A]">{t.estudio?.precio ? `${t.estudio.precio} IVA incluido` : 'Precio según tu clínica'}</span></>],
    [2, 'Clínica', c
      ? <>{c.name}<span className="block t-meta font-normal text-[#5B6B7A]">{c.address} · Tel.{NB}{c.phone}</span></>
      : <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF1DB] px-3 py-1 t-meta font-semibold text-[#7A4E00]"><span aria-hidden="true" className="size-2 rounded-full bg-[#F2A00D]" />Clínica pendiente</span>],
    [3, 'Fecha y hora', t.fecha ? <span className="first-letter:uppercase">{fechaLarga(t.fecha)} · {t.hora}<span className="block t-meta font-normal text-[#5B6B7A]">Horario de demostración</span></span> : '—'],
    [4, 'WhatsApp', <>{ultimos4(t.paciente.whatsapp)}{t.paciente.verificado && <span className="block t-meta font-normal text-[#5B6B7A]">Verificado</span>}</>],
  ]
  return (
    <dl className="divide-y divide-[#D6E4F5]">
      {filas.map(([p, k, v]) => (
        <div key={k} className="flex items-start justify-between gap-4 py-3 first:pt-0">
          <div>
            <dt className="t-meta text-[#5B6B7A]">{k}</dt>
            <dd className="t-body font-semibold text-[#1F2933]">{v}</dd>
          </div>
          {onCambiar && <button onClick={() => onCambiar(p)} aria-label={`Cambiar ${k.toLowerCase()}`} className={`${link} shrink-0`}>Cambiar</button>}
        </div>
      ))}
    </dl>
  )
}

function PasoPago({ t, onCambiar }: { t: Tramite; onCambiar: (p: Paso) => void }) {
  const { update } = useApp()
  return (
    <>
      <section aria-labelledby="res-t" className="rounded-2xl border border-[#D6E4F5] bg-white p-6">
        <h3 id="res-t" className="t-sub font-bold text-[#1F2933]">Resumen de tu cita</h3>
        <div className="mt-4"><Resumen t={t} onCambiar={onCambiar} /></div>
      </section>
      <fieldset className="mt-8">
        <legend className="text-base font-semibold text-[#1F2933]">¿Cómo quieres pagar?</legend>
        <div className="mt-2 flex flex-col gap-2">
          {OPCIONES.map(([m, d]) => (
            <label key={m} className={`${optionRow} border-[#D6E4F5] hover:border-[#0074D9]`}>
              <input type="radio" name="pago" className={radio} checked={t.metodoPago === m}
                onChange={() => update((x) => ({ ...x, metodoPago: m }))} />
              <span><span className="block text-base font-semibold text-[#1F2933]">{METODO[m]}</span><span className="block t-meta text-[#5B6B7A]">{d}</span></span>
            </label>
          ))}
        </div>
      </fieldset>
    </>
  )
}

/* ---------- confirmación final ---------- */
function Confirmada({ t }: { t: Tramite }) {
  const { go } = useApp()
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => { ref.current?.focus({ preventScroll: true }) }, [])
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <div className="mt-4 max-w-3xl">
        <h1 ref={ref} tabIndex={-1} data-focus-target className="flex items-center gap-3 t-greeting font-head text-[#006D3D]">
          <Icon n="check" size={36} />Cita confirmada
        </h1>
        <p role="status" className="mt-2 t-body text-[#1F2933]">
          Te enviamos los detalles a tu WhatsApp {ultimos4(t.paciente.whatsapp)} (demo). {t.metodoPago === 'en_clinica' ? 'Pagas en recepción el día de tu cita.' : 'Pago en línea simulado: no se hizo ningún cobro.'}
        </p>
        <section aria-labelledby="conf-t" className="mt-6 rounded-2xl border border-[#D6E4F5] bg-white p-6">
          <h2 id="conf-t" className="t-sub font-bold text-[#1F2933]">Detalles de tu cita</h2>
          <div className="mt-4"><Resumen t={t} /></div>
          <dl className="mt-3 grid gap-3 border-t border-[#D6E4F5] pt-3 sm:grid-cols-2">
            <div><dt className="t-meta text-[#5B6B7A]">Pago</dt><dd className="t-body font-semibold text-[#1F2933]">{t.metodoPago ? METODO[t.metodoPago] : '—'}</dd></div>
            <div><dt className="t-meta text-[#5B6B7A]">Folio</dt><dd className="t-body font-semibold text-[#1F2933]">{t.id} <span className="t-meta font-normal text-[#5B6B7A]">(folio de ejemplo)</span></dd></div>
          </dl>
        </section>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <button onClick={() => go('tramites')} className={solidBtn}>Ver mis trámites</button>
          <a href={`${WA}?text=${encodeURIComponent(`Hola, quiero ver mi cita ${t.id}`)}`} target="_blank" rel="noopener" className={`${link} justify-center`}><Icon n="chat" />Abrir en WhatsApp</a>
        </div>
      </div>
    </div>
  )
}

export { Resumen }
