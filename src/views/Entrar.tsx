import { useRef, useState } from 'react'
import { Logo } from '../components/Header'
import { Icon } from '../components/Icon'
import { container, link, outlineBtn, solidBtn } from '../components/ui'
import { CREDENCIALES, ROL, entrar, type Rol, type Sesion } from '../state/sesion'

const ICONO_ROL: Record<Rol, string> = { paciente: 'user', asesor: 'headset', admin: 'shield' }
const fieldInput = 'h-12 w-full rounded-lg border border-[#D6E4F5] bg-white px-4 text-base text-[#1F2933] transition-colors hover:border-[#0074D9] aria-[invalid=true]:border-2 aria-[invalid=true]:border-[#B3261E]'

export function Entrar({ onEntrar, onVolver, rolInicial = 'paciente', motivo }: {
  onEntrar: (s: Sesion) => void; onVolver: () => void; rolInicial?: Rol; motivo?: string
}) {
  const [rol, setRol] = useState<Rol>(rolInicial)
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState<string | null>(null)
  const correoRef = useRef<HTMLInputElement>(null)

  const enviar = () => {
    const r = entrar(rol, correo, clave)
    if (typeof r === 'string') { setError(r); correoRef.current?.focus(); return }
    setError(null)
    onEntrar(r)
  }
  const usar = (c: (typeof CREDENCIALES)[number]) => {
    setRol(c.rol); setCorreo(c.correo); setClave(c.clave); setError(null)
    correoRef.current?.focus()
  }
  const onEnter = (e: React.KeyboardEvent) => { if (e.key === 'Enter') enviar() }

  return (
    <div className="flex min-h-screen flex-col bg-[#ECF3F9]">
      <header className="border-b border-[#D6E4F5] bg-white">
        <div className={`${container} flex min-h-[72px] items-center`}>
          <button onClick={onVolver} className="inline-flex min-h-12 items-center rounded-md" aria-label="Salud Digna, volver a la página principal"><Logo /></button>
        </div>
      </header>
      <main id="contenido" className={`${container} flex-1 py-6 lg:py-12`}>
        <button onClick={onVolver} className={link}><Icon n="left" />Volver a la página principal</button>
        {motivo && <p role="status" className="mt-2 flex items-center gap-2 t-body font-semibold text-[#1F2933]"><Icon n="user" className="text-[#005BB0]" />{motivo}</p>}
        <div className="mt-4 grid gap-8 lg:grid-cols-12 lg:gap-8">
          <section aria-labelledby="entrar-t" className="rounded-2xl bg-white p-6 lg:col-span-7 lg:p-10">
            <h1 id="entrar-t" className="t-greeting font-head text-[#1F2933]">Entrar</h1>
            <p className="mt-2 t-body">Cada rol ve su propia vista: el paciente, su portal; asesor y administrador, la atención al paciente.</p>

            <fieldset className="mt-6">
              <legend className="text-base font-semibold text-[#1F2933]">Entrar como</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(['paciente', 'asesor', 'admin'] as Rol[]).map((r) => (
                  <label key={r} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-[#D6E4F5] px-4 py-3 transition-colors hover:border-[#0074D9] has-[:checked]:border-[#005BB0] has-[:checked]:bg-[#EBF4FC]">
                    <input type="radio" name="rol" checked={rol === r} onChange={() => { setRol(r); setError(null) }} className="size-5 shrink-0 accent-[#005BB0]" />
                    <Icon n={ICONO_ROL[r]} className="text-[#005BB0]" />
                    <span className="text-base font-semibold text-[#1F2933]">{ROL[r]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-6">
              <label htmlFor="correo" className="text-base font-semibold text-[#1F2933]">Correo</label>
              <input ref={correoRef} id="correo" type="email" autoComplete="username" value={correo}
                onChange={(e) => { setCorreo(e.target.value); setError(null) }} onKeyDown={onEnter}
                aria-invalid={!!error} aria-describedby={error ? 'entrar-e' : undefined}
                placeholder="nombre@demo.mx" className={`${fieldInput} mt-2`} />
            </div>
            <div className="mt-4">
              <label htmlFor="clave" className="text-base font-semibold text-[#1F2933]">Contraseña</label>
              <input id="clave" type="password" autoComplete="current-password" value={clave}
                onChange={(e) => { setClave(e.target.value); setError(null) }} onKeyDown={onEnter}
                aria-invalid={!!error} aria-describedby={error ? 'entrar-e' : undefined} className={`${fieldInput} mt-2`} />
              {error && <p id="entrar-e" role="alert" className="mt-2 flex items-start gap-2 t-body font-semibold text-[#B3261E]"><Icon n="alert" className="mt-0.5" />{error}</p>}
            </div>
            <button onClick={enviar} className={`${solidBtn} mt-6 w-full sm:w-auto`}>Entrar como {ROL[rol].toLowerCase()}<Icon n="arrow" /></button>
          </section>

          <section aria-labelledby="cred-t" className="lg:col-span-5">
            <h2 id="cred-t" className="t-card font-head text-[#1F2933]">Credenciales de demostración</h2>
            <p className="mt-1 t-meta text-[#5B6B7A]">Solo para la demo: no hay cuentas reales.</p>
            <ul className="mt-4 flex flex-col">
              {CREDENCIALES.map((c) => (
                <li key={c.rol} className="border-t border-[#D6E4F5] py-4 first:border-t-0 first:pt-0">
                  <p className="flex items-center gap-2 t-sub font-bold text-[#1F2933]"><Icon n={ICONO_ROL[c.rol]} className="text-[#005BB0]" />{ROL[c.rol]}</p>
                  <p className="mt-1 t-meta text-[#43474A]">{c.descripcion}</p>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 t-body">
                    <dt className="text-[#5B6B7A]">Correo</dt><dd className="font-semibold text-[#1F2933]">{c.correo}</dd>
                    <dt className="text-[#5B6B7A]">Contraseña</dt><dd className="font-semibold text-[#1F2933]">{c.clave}</dd>
                  </dl>
                  <button onClick={() => usar(c)} className={`${outlineBtn} mt-3`} aria-label={`Usar credenciales de ${ROL[c.rol]}`}>Usar estas credenciales</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}
