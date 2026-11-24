import { useState } from 'react'
import { Back } from '../components/Back'
import { Icon } from '../components/Icon'
import { CHIPS } from '../data/studies'
import { container, chip, solidBtn } from '../components/ui'

export function Agendar({ onNext }: { onNext: () => void }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-section font-head text-[#1F2933]">Agendar cita · Paso 1 de 5: Elige tu estudio</h1>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Estudios">
        {CHIPS.map((c) => <button key={c} onClick={() => setSel(c)} aria-pressed={sel === c} className={chip(sel === c)}>{c}</button>)}
      </div>
      {sel && <button onClick={onNext} className={`${solidBtn} mt-8`}>Siguiente: elige clínica<Icon n="arrow" /></button>}
    </div>
  )
}
