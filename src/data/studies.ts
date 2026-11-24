

export const STUDIES: Record<string, string[]> = {
  Laboratorio: ['Biometría hemática', 'Química sanguínea de 6 elementos', 'Perfil de lípidos'],
  Ultrasonido: ['Ultrasonido obstétrico', 'Ultrasonido abdominal', 'Ultrasonido pélvico'],
  Mastografía: ['Mastografía bilateral', 'Mastografía + ultrasonido mamario', 'Densitometría ósea'],
  'Rayos X': ['Rayos X de tórax', 'Rayos X de columna lumbar', 'Rayos X de extremidades'],
  Papanicolaou: ['Papanicolaou', 'Papanicolaou + prueba de VPH', 'Colposcopia'],
  Lentes: ['Examen de la vista', 'Lentes monofocales', 'Lentes bifocales'],
}
export const CHIPS = Object.keys(STUDIES)
export const categoriaDe = (nombre: string) => CHIPS.find((c) => STUDIES[c].includes(nombre)) ?? ''
