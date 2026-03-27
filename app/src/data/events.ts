export interface EventSpeaker {
  name: string
  role: string
  avatar?: string
  avatarScale?: number
}

export type EventType = 'meetup' | 'workshop' | 'conference' | 'webinar' | 'panel' | 'taller' | 'charla'
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
  image?: string
  featured?: boolean
  pinned?: boolean
  networking?: boolean
  price?: string
  limitedCapacity?: boolean
  registrationComingSoon?: boolean
}

export const EVENTS: Event[] = [
  {
    id: 2,
    title: 'AI Workflows con Azure y .NET',
    description:
      'En esta meetup presencial de Dotnet Ecuador en Quito, Cristopher Coronado — Microsoft MVP en AI, Senior AI Engineer con 6+ años construyendo sistemas cloud-native en banca y energía — nos va a mostrar cómo se construye un AI Workflow real con Azure y .NET.\n\nAl salir del evento vas a entender:\n• Cómo estructurar un workflow de IA que sobreviva en producción\n• Qué servicios de Azure AI realmente valen en sistemas .NET empresariales\n• Cómo pasar de "llamadas básicas a la API" hacia flujos de trabajo funcionales\n• Las decisiones de arquitectura que Cristopher tomó — y por qué\n\nY vas a conocer en persona a otros devs .NET de Quito que construyen con AI. El cupo es limitado.',
    type: 'taller',
    format: 'presencial',
    status: 'confirmed',
    date: '2026-04-25',
    time: '16:00',
    endTime: '18:00',
    location: 'Por confirmar',
    speakers: [
      {
        name: 'Cristopher Coronado',
        role: 'Microsoft MVP en AI · Senior AI Engineer',
        avatar: 'https://i.imgur.com/qdLPSjf.jpeg',
      },
    ],
    networking: true,
    limitedCapacity: true,
    price: '$5',
    registrationComingSoon: true,
    tags: ['Azure', '.NET', 'AI', 'Workflows', 'Cloud'],
  },
  {
    id: 3,
    title: 'Spec-Driven Development en proyectos .NET con Claude Code',
    description:
      '¿Qué pasa cuando un LLM tiene contexto real del sistema antes de escribir la primera línea de código? En esta sesión veremos cómo aplicar Spec Driven Development en proyectos .NET usando Claude Code: desde la definición de specs técnicas hasta la generación y validación de implementaciones con IA.',
    type: 'charla',
    format: 'presencial',
    status: 'confirmed',
    date: '2026-05-16',
    time: '10:00',
    endTime: '11:30',
    location: 'Quito',
    speakers: [
      {
        name: 'Byron Duarte',
        role: 'Software Architect · Claude Certified Architect',
        avatar: '/equipo/byron_duarte.png',
        avatarScale: 1.4,
      },
    ],
    networking: true,
    limitedCapacity: true,
    price: '$5',
    registrationComingSoon: true,
    tags: ['Claude Code', '.NET', 'AI', 'Spec-Driven Development'],
  },
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
    networking: true,
    limitedCapacity: true,
    price: '$20',
    tags: ['IA Agéntica', 'Empresas', 'Innovación'],
    image: 'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=1,background=white,quality=75,width=400,height=400/event-covers/8f/757198da-4406-4572-9d44-828ab0c20a13.png',
    registrationUrl: 'https://luma.com/hpxixb6l',
    featured: true,
    pinned: true,
  },
  {
    id: 4,
    title: 'DotNet Developer Conf 2026',
    description:
      'La conferencia anual de la comunidad .NET en Ecuador. Un día dedicado a lo que realmente importa: código en producción, decisiones de arquitectura con trade-offs reales, y el estado actual del ecosistema .NET desde la perspectiva de quienes lo usan a diario.\n\nEs una jornada construida por y para quienes quieren salir con algo concreto que puedan aplicar la semana siguiente.\n\n4 charlas técnicas de fondo · demos en vivo · panel con speakers · after party · transmisión en vivo.',
    type: 'conference',
    format: 'híbrido',
    status: 'confirmed',
    date: '2026-11-14',
    time: '09:00',
    endTime: '13:00',
    location: 'Por confirmar',
    image: 'https://raw.githubusercontent.com/dotnet/brand/main/wallpapers/desktop-wallpaper/shapes-02/1920x1080.png',
    registrationComingSoon: true,
    networking: true,
    limitedCapacity: true,
    price: 'Gratis',
    featured: true,
    tags: ['.NET', 'Conferencia', 'Arquitectura', 'Ecuador'],
  },
  // TODO: Add more events
]
