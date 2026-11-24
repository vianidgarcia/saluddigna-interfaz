import { useApp } from '../context'
import { container } from './ui'

export const FOOT: Record<string, string[]> = {
  Conócenos: ['Quiénes somos', 'Nuestra misión', 'Sala de prensa'],
  Servicios: ['Laboratorio', 'Ultrasonido', 'Mastografía', 'Lentes'],
  Pacientes: ['Mis resultados', 'Preparaciones', 'Preguntas frecuentes'],
  Empresas: ['Convenios', 'Chequeos empresariales', 'Contacto'],
}
export function Footer() {
  const { toast } = useApp()
  return (
    <footer className="border-t border-[#D6E4F5] bg-white pt-10 lg:pt-16">
      <div className={container}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-8">
          {Object.entries(FOOT).map(([h, items]) => (
            <nav key={h} aria-label={h}>
              <h2 className="t-sub font-bold text-[#1F2933]">{h}</h2>
              <ul className="mt-2">{items.map((i) => <li key={i}><button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-left t-body text-[#43474A] hover:text-[#005BB0] hover:underline active:text-[#003F7A]">{i}</button></li>)}</ul>
            </nav>
          ))}
        </div>
        <div className="mt-8 flex flex-col border-t border-[#D6E4F5] py-4 t-meta lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-x-6">
            <button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-[#5B6B7A] hover:text-[#005BB0] hover:underline">Aviso de privacidad</button>
            <button onClick={() => toast()} className="inline-flex min-h-12 items-center rounded-md text-[#5B6B7A] hover:text-[#005BB0] hover:underline">Términos y condiciones</button>
          </div>
          <p className="text-[#5B6B7A]">© Salud Digna</p>
        </div>
      </div>
    </footer>
  )
}
