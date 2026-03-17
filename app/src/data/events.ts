export interface EventSpeaker {
  name: string
  role: string
}

export type EventType = 'meetup' | 'workshop' | 'conference' | 'webinar' | 'panel'
export type EventFormat = 'presencial' | 'virtual' | 'híbrido'
export type EventStatus = 'confirmed' | 'tentative'

export interface Event {
  id: number
  title: string
  description: string
  type: EventType
  format: EventFormat
  status: EventStatus
  /** ISO date "2026-07-18" — confirmed events only */
  date?: string
  time?: string
  endTime?: string
  /** Approximate period — tentative events only, e.g. "Agosto 2026" | "Q3 2026" */
  tentativeDate?: string
  location?: string
  locationUrl?: string
  speakers?: EventSpeaker[]
  registrationUrl?: string
  tags?: string[]
}

export const EVENTS: Event[] = [
  {
    id: 1,
    title: 'Empresas en la era de la inteligencia artificial agéntica',
    description:
      'La inteligencia artificial está evolucionando hacia sistemas capaces de ejecutar tareas y operar dentro de procesos empresariales. En este panel, líderes empresariales y expertos analizarán cómo los agentes de inteligencia artificial están empezando a incorporarse en las organizaciones, cómo están explorando estas capacidades, qué casos empiezan a aparecer y qué impacto pueden tener en la forma en que trabajan las empresas.',
    type: 'panel',
    format: 'presencial',
    status: 'confirmed',
    date: '2026-07-18',
    time: '18:00',
    endTime: '21:00',
    location: 'Por confirmar',
    tags: ['IA Agéntica', 'Empresas', 'Innovación'],
  },
  // TODO: Add more events
]
