import { useState } from 'react'
import { container, outlineBtn, link } from './ui'

export function Cookies({ onDone }: { onDone: () => void }) {
  const [cfg, setCfg] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  return (
    <section aria-label="Aviso de cookies" className="border-b border-[#D6E4F5] bg-[#EBF4FC]">
      <div className={`${container} py-3`}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <p className="t-body text-[#1F2933]">Usamos cookies necesarias para que el sitio funcione y, si lo permites, analíticas para mejorarlo.</p>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={onDone} className={outlineBtn}>Aceptar</button>
            <button onClick={onDone} className={outlineBtn}>Rechazar</button>
            <button onClick={() => setCfg(!cfg)} aria-expanded={cfg} aria-controls="ck-cfg" className={link}>Configurar</button>
          </div>
        </div>
        {cfg && (
          <div id="ck-cfg" className="mt-3 flex flex-col gap-1 border-t border-[#D6E4F5] pt-3 lg:flex-row lg:items-center lg:gap-8">
            <label className="flex min-h-12 items-center gap-3 text-base text-[#1F2933]">
              <input type="checkbox" checked disabled className="size-5 accent-[#005BB0]" />
              <span>Necesarias <span className="t-meta text-[#5B6B7A]">· Siempre activas</span></span>
            </label>
            <label className="flex min-h-12 items-center gap-3 text-base text-[#1F2933]">
              <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="size-5 accent-[#005BB0]" />
              <span>Analíticas</span>
            </label>
            <button onClick={onDone} className={`${outlineBtn} lg:ml-auto`}>Guardar preferencias</button>
          </div>
        )}
      </div>
    </section>
  )
}
