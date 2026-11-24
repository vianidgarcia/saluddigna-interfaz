import { useEffect, useState, type ReactNode } from 'react'
import { useApp } from '../context'
import { Icon } from '../components/Icon'
import { ClinicSheet } from '../components/ClinicSheet'
import { SelectorHorario } from '../components/SelectorHorario'
import { container, link, outlineBtn, solidBtn } from '../components/ui'
import { CLINICA_INICIAL, findClinic } from '../data/clinics'
import {
  CANAL, ICONO_CANAL, METODO, PASOS, TIPO_EVENTO, TICK_MS, avance, conEvento, conNota, esNotaInterna,
  fechaLarga, hace, horaEvento, TOTAL_PASOS, yaPaso, type Tramite,
} from '../state/tramite'

const fieldInput = 'w-full rounded-lg border border-[#D6E4F5] bg-white px-4 text-base text-[#1F2933] transition-colors hover:border-[#0074D9]'
const sinAcentos = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function coincide(t: Tramite, q: string): boolean {
  const texto = sinAcentos(q.trim())
  if (!texto) return false
  return sinAcentos(t.paciente.nombre).includes(texto) || t.paciente.cuenta.toLowerCase().includes(texto)
}

const Pendiente = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-[#FDF1DB] px-3 py-1 t-meta font-semibold text-[#7A4E00]">
    <span aria-hidden="true" className="size-2 rounded-full bg-[#F2A00D]" />{children}
  </span>
)

export function Asesor() {
  const { tramite: t, sesion } = useApp()
  const [q, setQ] = useState('')
  const [buscado, setBuscado] = useState<string | null>(null)
  const [abierta, setAbierta] = useState(false)
  useEffect(() => { if (!t) setAbierta(false) }, [t])

  const buscar = () => { setBuscado(q); setAbierta(false) }
  const encontrado = t && buscado !== null && coincide(t, buscado)

  return (
    <div className={`${container} py-8 lg:py-12`}>
      <h1 className="t-greeting font-head text-[#1F2933]">Atención al paciente</h1>
      <p className="mt-2 max-w-3xl t-body">Busca al paciente y retoma su trámite con todo lo que ya hizo en web, WhatsApp o Call Center, sin volver a pedirle sus datos.</p>

      <section className="mt-6 max-w-3xl">
        <label id="buscar-l" htmlFor="buscar" className="text-base font-semibold text-[#1F2933]">Buscar paciente por nombre o cuenta</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Icon n="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5B6B7A]" />
            <input id="buscar" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && buscar()}
              aria-describedby="buscar-h" placeholder="Ej. Ana o ana@demo.mx" className={`${fieldInput} h-12 pl-12`} />
          </div>
          <button onClick={buscar} className={outlineBtn}><Icon n="search" />Buscar</button>
        </div>
        <p id="buscar-h" className="mt-1 t-meta text-[#5B6B7A]">Prueba con “Ana” o con su cuenta del portal (ana@demo.mx).</p>

        <div role="status" className="mt-4">
          {!t && <p className="rounded-lg bg-[#EBF4FC] px-4 py-3 t-body text-[#1F2933]">No hay trámites activos. Inicia uno desde el portal del paciente.</p>}
          {t && buscado !== null && !encontrado && <p className="t-body text-[#1F2933]">No encontramos pacientes con “{buscado}”. Revisa el nombre o la cuenta.</p>}
        </div>
        {t && encontrado && (
          <ul aria-label="Resultados de búsqueda">
            <li className="flex flex-col gap-2 border-y border-[#D6E4F5] py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="t-sub font-bold text-[#1F2933]">{t.paciente.nombre}<span className="font-normal text-[#43474A]"> · {t.paciente.cuenta}</span></p>
                <p className="t-meta text-[#5B6B7A]">{t.estudio?.nombre ?? 'Estudio por elegir'} · Folio {t.id} (de ejemplo)</p>
              </div>
              <button onClick={() => setAbierta(true)} aria-pressed={abierta} className={`${link} shrink-0`}>{abierta ? 'Ficha abierta' : 'Abrir ficha'}<Icon n="arrow" /></button>
            </li>
          </ul>
        )}
      </section>

      {t && abierta && <Ficha t={t} />}
      {sesion?.rol === 'admin' && <PanelAdmin />}
    </div>
  )
}

/* ---------- ficha del paciente ---------- */
function Ficha({ t }: { t: Tramite }) {
  const { update, sesion } = useApp()
  const [aviso, setAviso] = useState<string | null>(null)
  const [clinicas, setClinicas] = useState(false)
  const [reagendar, setReagendar] = useState(false)
  const [nf, setNf] = useState<string | null>(t.fecha)
  const [nh, setNh] = useState<string | null>(t.hora)
  const [nota, setNota] = useState('')
  const [, tick] = useState(0)
  useEffect(() => { const id = window.setInterval(() => tick((n) => n + 1), TICK_MS); return () => window.clearInterval(id) }, [])

  const p = t.paciente
  const confirmada = t.estado === 'confirmada'
  const paso = t.estado === 'en_curso' ? t.paso : TOTAL_PASOS
  const c = findClinic(t.clinica)
  const falta = [!t.estudio && 'estudio', !t.clinica && 'clínica', !(t.fecha && t.hora && !yaPaso(t.fecha, t.hora)) && 'fecha y hora vigentes'].filter(Boolean) as string[]
  const autor = sesion?.rol === 'admin' ? 'Administración' : 'Asesor'
  const avisar = (m: string) => setAviso(m)

  const confirmarClinica = (nombre: string) => {
    update((x) => conEvento({ ...x, clinica: nombre, clinicaPendiente: false }, 'asesor.clinica_confirmada', `${autor} confirmó la clínica ${nombre}`, 'call_center'))
    avisar(`Clínica confirmada: ${nombre}`)
  }
  const guardarHorario = () => {
    if (!nf || !nh) return
    update((x) => conEvento({ ...x, fecha: nf, hora: nh }, 'asesor.reagendado', `${autor} reagendó a ${fechaLarga(nf)}, ${nh} (horario de demostración)`, 'call_center'))
    setReagendar(false)
    avisar(`Cita reagendada: ${fechaLarga(nf)}, ${nh}`)
  }
  const reenviarReferencia = () => {
    update((x) => conEvento(x, 'pago.referencia_enviada', `${autor} reenvió la referencia de pago en Oxxo por WhatsApp (demo)`, 'call_center'))
    avisar('Referencia enviada')
  }
  const cerrar = () => {
    update((x) => conEvento({ ...x, estado: 'confirmada', paso: TOTAL_PASOS, metodoPago: x.metodoPago ?? 'en_clinica', desdeResumen: false },
      'cita.confirmada', `${autor} cerró el trámite como confirmado · ${x.fecha ? fechaLarga(x.fecha) : ''} ${x.hora ?? ''} · ${METODO[x.metodoPago ?? 'en_clinica']}`, 'call_center'))
    avisar('Trámite cerrado: cita confirmada')
  }
  const guardarNota = () => {
    const texto = nota.trim()
    if (!texto) return
    update((x) => conNota(x, texto, autor))
    setNota('')
    avisar('Nota interna guardada')
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
      <div className="flex flex-col gap-8 lg:col-span-7">
        {/* paciente */}
        <section aria-labelledby="fp-t" className="rounded-2xl border border-[#D6E4F5] bg-white p-6">
          <h2 id="fp-t" className="t-card font-head text-[#1F2933]">Ficha del paciente</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><dt className="t-meta text-[#5B6B7A]">Nombre</dt><dd className="t-body font-semibold text-[#1F2933]">{p.nombre}</dd></div>
            <div><dt className="t-meta text-[#5B6B7A]">Cuenta del portal</dt><dd className="t-body font-semibold text-[#1F2933] break-words">{p.cuenta}</dd></div>
          </dl>
        </section>

        {/* trámite */}
        <section aria-labelledby="ft-t" className="rounded-2xl border border-[#D6E4F5] bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ft-t" className="t-card font-head text-[#1F2933]">Estado del trámite</h2>
            {confirmada
              ? <span className="inline-flex items-center gap-2 t-body font-semibold text-[#006D3D]"><Icon n="check" size={18} />Cita confirmada</span>
              : t.estado === 'pago_pendiente' ? <Pendiente>Pago pendiente en Oxxo</Pendiente> : <Pendiente>En curso</Pendiente>}
          </div>
          <div className="mt-4">
            <p className="t-sub font-semibold text-[#1F2933]">Paso {paso} de {TOTAL_PASOS} · {PASOS[paso]}</p>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={TOTAL_PASOS} aria-valuenow={paso} aria-valuetext={`Paso ${paso} de ${TOTAL_PASOS}: ${PASOS[paso]}${confirmada ? ', confirmado' : ''}`} aria-label="Avance del trámite" className="mt-2 h-2 rounded-full bg-[#EBF4FC]">
              <div className="h-full rounded-full bg-[#005BB0]" style={{ width: `${confirmada ? 100 : avance(paso)}%` }} />
            </div>
          </div>
          <dl className="mt-4 divide-y divide-[#D6E4F5]">
            <Fila k="Estudio">{t.estudio?.nombre ?? <Pendiente>Sin elegir</Pendiente>}</Fila>
            <Fila k="Clínica">{c ? <>{c.name}<span className="block t-meta font-normal text-[#5B6B7A]">{c.address}</span></> : <Pendiente>Pendiente</Pendiente>}</Fila>
            <Fila k="Fecha y hora">{t.fecha && t.hora ? <span className="first-letter:uppercase">{fechaLarga(t.fecha)} · {t.hora}</span> : <Pendiente>Sin elegir</Pendiente>}</Fila>
            <Fila k="Método de pago">{t.metodoPago ? METODO[t.metodoPago] : <Pendiente>Sin elegir</Pendiente>}</Fila>
            <Fila k="Canales">Inició en {CANAL[t.canalInicio]} · último movimiento por {CANAL[t.ultimoCanal]}, {hace(t.ultimaActualizacion)}</Fila>
          </dl>
        </section>

        {/* acciones */}
        <section aria-labelledby="fa-t">
          <h2 id="fa-t" className="t-card font-head text-[#1F2933]">Acciones</h2>
          <p className="mt-1 t-meta text-[#5B6B7A]">Cada acción actualiza el mismo trámite y queda en la línea de tiempo como Call Center.</p>
          <p role="status" className="mt-3 min-h-0 t-body font-semibold text-[#1F2933] empty:hidden">{aviso && <span className="inline-flex items-center gap-2 rounded-lg bg-[#EBF4FC] px-3 py-2"><Icon n="check" size={18} className="text-[#005BB0]" />{aviso}</span>}</p>
          {confirmada ? (
            <p className="mt-4 flex items-center gap-2 t-body font-semibold text-[#006D3D]"><Icon n="check" />El trámite está cerrado como confirmado. El paciente ya lo ve en su portal.</p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-3">
                {!t.clinica && <button onClick={() => setClinicas(true)} className={outlineBtn}><Icon n="pin" />Confirmar clínica</button>}
                <button onClick={() => { setReagendar(!reagendar); setNf(t.fecha); setNh(t.hora) }} aria-expanded={reagendar} aria-controls={reagendar ? 'reag' : undefined} className={outlineBtn}><Icon n="calendar" />Reagendar</button>
                {t.metodoPago === 'oxxo' && <button onClick={reenviarReferencia} className={outlineBtn}><Icon n="chat" />Reenviar referencia por WhatsApp</button>}
              </div>
              {reagendar && (
                <div id="reag" className="mt-4 border-t border-[#D6E4F5] pt-4">
                  <div className="flex flex-wrap items-center gap-x-3"><p className="t-sub font-bold text-[#1F2933]">Nueva fecha y hora</p></div>
                  <div className="mt-2">
                    <SelectorHorario id="reag" fecha={nf} hora={nh} onFecha={(v) => { if (v !== nf) setNh(null); setNf(v) }} onHora={setNh} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={guardarHorario} disabled={!nf || !nh} aria-describedby={!nf || !nh ? 'reag-h' : undefined}
                      className={`${outlineBtn} disabled:cursor-not-allowed disabled:border-[#D6E4F5] disabled:bg-[#ECF3F9] disabled:text-[#43474A]`}><Icon n="check" />Guardar nuevo horario</button>
                    <button onClick={() => setReagendar(false)} className={link}>Cancelar</button>
                  </div>
                  {(!nf || !nh) && <p id="reag-h" className="mt-1 t-meta text-[#5B6B7A]">{!nf ? 'Elige un día.' : 'Elige un horario.'}</p>}
                </div>
              )}
              <div className="mt-6 border-t border-[#D6E4F5] pt-6">
                {falta.length > 0 && <p id="cerrar-h" className="mb-3 t-body text-[#43474A]">Para cerrar falta: {falta.join(', ')}.</p>}
                <button onClick={cerrar} disabled={falta.length > 0} aria-describedby={falta.length ? 'cerrar-h' : undefined} className={`${solidBtn} w-full sm:w-auto`}>
                  <Icon n="check" />Cerrar trámite como confirmado
                </button>
                {!t.metodoPago && falta.length === 0 && <p className="mt-1 t-meta text-[#5B6B7A]">Sin método de pago elegido: se registrará como pago en clínica.</p>}
              </div>
            </>
          )}
        </section>

        {/* nota interna */}
        <section>
          <label id="nota-l" htmlFor="nota" className="flex items-center gap-2 t-card font-head text-[#1F2933]"><Icon n="note" />Nota interna</label>
          <p id="nota-h" className="mt-1 t-meta text-[#5B6B7A]">Solo la ven asesores y administradores; no aparece en el portal del paciente.</p>
          <textarea id="nota" value={nota} onChange={(e) => setNota(e.target.value)} rows={3} aria-describedby="nota-h"
            placeholder="Ej. Prefiere que le llamen por la tarde." className={`${fieldInput} mt-2 py-3`} />
          <button onClick={guardarNota} disabled={!nota.trim()} className={`${outlineBtn} mt-2 disabled:cursor-not-allowed disabled:border-[#D6E4F5] disabled:bg-[#ECF3F9] disabled:text-[#43474A]`}><Icon n="note" />Guardar nota</button>
        </section>
      </div>

      <div className="lg:col-span-5"><Linea t={t} /></div>

      {clinicas && (
        <ClinicSheet titulo="Confirmar clínica del paciente" current={CLINICA_INICIAL} sinSeleccion
          onSelect={(cl) => confirmarClinica(cl.name)} onClose={() => setClinicas(false)} />
      )}
    </div>
  )
}

const Fila = ({ k, children }: { k: string; children: ReactNode }) => (
  <div className="py-3 first:pt-0"><dt className="t-meta text-[#5B6B7A]">{k}</dt><dd className="t-body font-semibold text-[#1F2933]">{children}</dd></div>
)

/* ---------- línea de tiempo unificada ---------- */
function Linea({ t }: { t: Tramite }) {
  const eventos = [...t.eventos].reverse()
  return (
    <section aria-labelledby="lt-t" className="lg:sticky lg:top-24">
      <h2 id="lt-t" className="t-card font-head text-[#1F2933]">Línea de tiempo</h2>
      <p className="mt-1 t-meta text-[#5B6B7A]">Todos los canales en una sola conversación. Lo más reciente arriba.</p>
      <ol className="mt-4" aria-live="polite">
        {eventos.map((e, i) => {
          const nota = esNotaInterna(e)
          return (
            <li key={`${e.fecha}-${i}`} className={`flex gap-3 border-t border-[#D6E4F5] py-3 ${nota ? '-mx-3 rounded-lg border-t-0 bg-[#EBF4FC] px-3' : ''}`}>
              <Icon n={nota ? 'note' : ICONO_CANAL[e.canal]} className="mt-1 text-[#0074D9]" />
              <div className="min-w-0">
                <p className="t-meta text-[#5B6B7A]"><time dateTime={e.fecha}>{horaEvento(e.fecha)}</time> · {nota ? 'Nota interna · solo personal' : CANAL[e.canal]}</p>
                <p className="t-body font-semibold text-[#1F2933]">{TIPO_EVENTO[e.tipo] ?? e.tipo}</p>
                <p className="t-body break-words">{e.detalle}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

/* ---------- solo administrador ---------- */
function PanelAdmin() {
  const { tramite: t, reiniciarDemo } = useApp()
  const [confirmar, setConfirmar] = useState(false)
  const porCanal = (['web', 'whatsapp', 'call_center'] as const).map((c) => [c, t ? t.eventos.filter((e) => e.canal === c && !esNotaInterna(e)).length : 0] as const)
  return (
    <section aria-labelledby="adm-t" className="mt-12 border-t border-[#D6E4F5] pt-8">
      <h2 id="adm-t" className="flex items-center gap-2 t-card font-head text-[#1F2933]"><Icon n="shield" />Administración de la demo</h2>
      <p className="mt-1 t-meta text-[#5B6B7A]">Visible solo para el rol Administrador.</p>
      <dl className="mt-4 grid grid-cols-3 gap-4 sm:max-w-lg">
        {porCanal.map(([c, n]) => (
          <div key={c}><dt className="flex items-center gap-1 t-meta text-[#5B6B7A]"><Icon n={ICONO_CANAL[c]} size={16} />{CANAL[c]}</dt><dd className="font-head t-card text-[#1F2933]">{n}</dd></div>
        ))}
      </dl>
      <p className="mt-1 t-meta text-[#5B6B7A]">Movimientos del trámite activo por canal.</p>
      <div className="mt-4" role="status">
        {!confirmar
          ? <button onClick={() => setConfirmar(true)} disabled={!t} className={`${outlineBtn} disabled:cursor-not-allowed disabled:border-[#D6E4F5] disabled:bg-[#ECF3F9] disabled:text-[#43474A]`}><Icon n="refresh" />Reiniciar demo</button>
          : (
            <div className="flex flex-wrap items-center gap-x-4">
              <span className="t-body text-[#1F2933]">¿Borrar el trámite de demostración?</span>
              <button onClick={() => { setConfirmar(false); reiniciarDemo() }} className={link}>Sí, borrar</button>
              <button onClick={() => setConfirmar(false)} className={link}>Cancelar</button>
            </div>
          )}
      </div>
    </section>
  )
}
