import type { HttpContext } from '@adonisjs/core/http'

const PORTFOLIO_ENTRIES = [
  { type: 'project', title: 'GBA Explorer', summary: 'Exploration de données et visualisation orientée produit.', highlighted: true },
  { type: 'event', title: 'Z Event', summary: 'Ops et support technique live sur événement à forte audience.', highlighted: true },
  { type: 'project', title: 'Kick League', summary: 'Outils autour de workflows live et automatisation.', highlighted: true },
  { type: 'experience', title: 'Humanity — Équipe #1', summary: 'Coordination produit et implémentation terrain.', highlighted: false },
  { type: 'experience', title: 'Humanity — Équipe #2', summary: 'Support cross-team, livraison stable et maintenable.', highlighted: false },
  { type: 'project', title: 'stream remote', summary: 'Pilotage distant de sessions stream.', highlighted: true },
  { type: 'project', title: 'stream widget', summary: 'Widgets interactifs temps réel pour le live.', highlighted: true },
  { type: 'project', title: 'stream relay', summary: 'Passerelle de données fiable entre sources live.', highlighted: false },
  { type: 'project', title: 'stream backbone', summary: 'Fondation technique de la suite stream.', highlighted: false }
]

const JOURNEY = {
  education: [
    {
      school: 'ESGI Aix-en-Provence',
      program: 'Master Architecture Logicielle',
      level: 'M1',
      startYear: 2025,
      ongoing: true
    },
    {
      school: 'ESGI Aix-en-Provence',
      program: 'Bachelor Ingénierie du Web',
      level: 'B3',
      startYear: 2024,
      endYear: 2025
    }
  ],
  work: [
    {
      company: 'All Broadcast',
      role: 'Alternant développeur',
      startDate: '2025-09-01',
      summary: 'Développement d’outils internes/externes pour les opérations et besoins clients.'
    },
    {
      company: 'Kamai',
      role: 'Product Engineer',
      startDate: '2022-09-01',
      endDate: '2025-08-31',
      summary: 'Intégrité du développement produit, contenu et écosystème Kamai.'
    }
  ],
  creatorOps: {
    since: '2022-04-01',
    ecosystems: ['OBS', 'Streamlabs', 'StreamElements'],
    summary: 'Conception et maintenance d’outils stream sur mesure pour l’interactivité live.'
  }
}

export default class PortfolioController {
  async index({ response }: HttpContext) {
    return response.ok({ entries: PORTFOLIO_ENTRIES })
  }

  async journey({ response }: HttpContext) {
    return response.ok(JOURNEY)
  }
}
