/* clínicas reales de salud-digna.org; km = distancias de demostración */

export type Clinic = { name: string; km: number; address: string; phone: string }
export const CLINICS: Clinic[] = [
  { name: 'Culiacán', km: 1.2, address: 'Ruperto L. Paliza #87, Col. Centro', phone: '(667) 712 60 83' },
  { name: 'Culiacán Cañadas', km: 2.6, address: 'Manuel J. Clouthier #1716, Col. Cañadas', phone: '(667) 712 60 83' },
  { name: 'Culiacán Colegio Militar', km: 3.4, address: 'Calz. Heroico Colegio Militar #1384, Col. Emiliano Zapata', phone: '(667) 712 60 83' },
  { name: 'Culiacán Universitarios', km: 4.1, address: 'Av. Juan de la Barrera #2419 Nte., Col. Tierra Blanca', phone: '(667) 170 9180' },
  { name: 'Culiacán La Conquista', km: 5.3, address: 'Blvd. Conquistadores #1246 Int. 2, Col. La Conquista', phone: '(667) 170 9180' },
  { name: 'Culiacán Las Torres', km: 6.0, address: 'Alcatraz #3070 Sur Local 11, Col. Bugambilias', phone: '(667) 712 60 83' },
  { name: 'Culiacán Nakayama', km: 7.2, address: 'Av. Gral. Fernando Cuen #5903-3 Sur, Col. Antonio Nakayama', phone: '(667) 170 9180' },
]
export const tel = (p: string) => 'tel:+52' + p.replace(/\D/g, '')
