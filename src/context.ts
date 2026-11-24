import { createContext, useContext } from 'react'

export type View = 'home' | 'pay' | 'tramites' | 'resultados' | 'agendar'
export type AppCtx = { go: (v: View) => void; toast: (msg?: string) => void; openClinics: () => void; scrollToId: (id: string) => void }
export const Ctx = createContext<AppCtx>(null as unknown as AppCtx)
export const useApp = () => useContext(Ctx)
