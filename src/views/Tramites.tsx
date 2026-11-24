import { useApp } from '../context'
import { Back } from '../components/Back'
import { NB, container, solidBtn } from '../components/ui'

export function Tramites() {
  const { go } = useApp()
  return (
    <div className={`${container} py-8 lg:py-12`}>
      <Back />
      <h1 className="mt-4 t-greeting font-head text-[#1F2933]">Mis trámites</h1>
      <div className="mt-6 flex max-w-3xl flex-col gap-4 border-t border-[#D6E4F5] pt-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="t-card font-head text-[#1F2933]">Ultrasonido obstétrico</h2>
          <p className="mt-1 t-body">Culiacán · Pago pendiente en{NB}Oxxo · Paso 4 de 5</p>
        </div>
        <button onClick={() => go('pay')} className={solidBtn}>Continuar trámite</button>
      </div>
    </div>
  )
}
