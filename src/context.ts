import { createContext, useContext } from 'react'
import type { Tramite } from './state/tramite'

export type View = 'home' | 'pay' | 'tramites' | 'resultados' | 'agendar'
export type EstudioElegido = NonNullable<Tramite['estudio']>
export type AppCtx = {
  go: (v: View) => void
  toast: (msg?: string) => void
  openClinics: () => void
  scrollToId: (id: string) => void
  /** trámite activo (null si no hay) */
  tramite: Tramite | null
  /** aplica un cambio al trámite activo y lo guarda (checkpoint) */
  update: (fn: (t: Tramite) => Tramite) => void
  /** abre el flujo de agendado; con estudio lo deja preseleccionado */
  startAgendar: (estudio?: EstudioElegido) => void
  /** abre el paso exacto donde se quedó el paciente */
  continuar: () => void
  simularWhatsApp: () => void
  reiniciarDemo: () => void
}
export const Ctx = createContext<AppCtx>(null as unknown as AppCtx)
export const useApp = () => useContext(Ctx)
