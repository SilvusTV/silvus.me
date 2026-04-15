import type { HttpContext } from '@adonisjs/core/http'

const entries = [
  { type: 'project', title: 'GBA Explorer', summary: 'Exploration de données et visualisation produit.', highlighted: true },
  { type: 'event', title: 'Z Event', summary: 'Ops technique sur live à forte audience.', highlighted: true },
  { type: 'project', title: 'Kick League', summary: 'Automatisation et outillage broadcast.', highlighted: true },
  { type: 'experience', title: 'Humanity — Team 1', summary: 'Livraison produit et coordination.', highlighted: false },
  { type: 'experience', title: 'Humanity — Team 2', summary: 'Stabilité, qualité, maintenabilité.', highlighted: false },
  { type: 'project', title: 'stream remote', summary: 'Pilotage stream à distance.', highlighted: true },
  { type: 'project', title: 'stream widget', summary: 'Widgets interactifs temps réel.', highlighted: true },
  { type: 'project', title: 'stream relay', summary: 'Relais fiable des signaux live.', highlighted: false },
  { type: 'project', title: 'stream backbone', summary: 'Socle de la suite stream.', highlighted: false }
]

const journey = {
  education: [
    { school: 'ESGI Aix-en-Provence', program: 'Master Architecture Logicielle', level: 'M1', startYear: 2025, ongoing: true },
    { school: 'ESGI Aix-en-Provence', program: 'Bachelor Ingénierie du Web', level: 'B3', startYear: 2024, endYear: 2025 }
  ],
  work: [
    { company: 'All Broadcast', role: 'Alternant développeur', startDate: '2025-09-01', summary: 'Développement d’outils internes/externes clients et ops.' },
    { company: 'Kamai', role: 'Product Engineer', startDate: '2022-09-01', endDate: '2025-08-31', summary: 'Développement produit, contenu et écosystème.' }
  ],
  creatorOps: {
    since: '2022-04-01',
    ecosystems: ['OBS', 'Streamlabs', 'StreamElements'],
    summary: 'Conception et maintenance d’outils stream sur mesure.'
  }
}

export default class PortfolioController {
  index({ response }: HttpContext) {
    return response.ok({ entries })
  }

  journey({ response }: HttpContext) {
    return response.ok(journey)
  }
}
