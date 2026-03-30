export interface SEOMetrics {
  title: string;
  description: string;
  keywords: string[];
  targetCTR: number;
  targetPosition: number;
  competitorAnalysis: string[];
  monthlySearchVolume: number;
  difficulty: 'low' | 'medium' | 'high';
}

export interface LocalSEOConfig {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  serviceAreas: string[];
  categories: string[];
}

// Configuración de métricas SEO por página
export const SEO_PAGES_CONFIG: Record<string, SEOMetrics> = {
  '/': {
    title: 'Comunidad de Desarrolladores .NET Ecuador - Programación C# y ASP.NET',
    description: 'Comunidad líder de desarrolladores .NET en Ecuador. Aprende C#, ASP.NET Core, Azure y tecnologías Microsoft. Eventos, cursos y networking para programadores ecuatorianos.',
    keywords: [
      'DotNet Ecuador',
      'desarrolladores .NET Ecuador',
      'programación C# Ecuador',
      'ASP.NET Core Ecuador',
      'comunidad programadores Ecuador',
      'eventos tecnología Ecuador'
    ],
    targetCTR: 6,
    targetPosition: 3,
    competitorAnalysis: ['Microsoft Innovadores', 'AWS User Group Ecuador', 'Google Developer Group Ecuador'],
    monthlySearchVolume: 1200,
    difficulty: 'medium'
  },
  '/voluntariado': {
    title: 'Voluntariado DotNet Ecuador - Únete a Nuestra Comunidad Tech',
    description: 'Forma parte del equipo de voluntarios de DotNet Ecuador. Contribuye al crecimiento de la comunidad de desarrolladores .NET más grande del país.',
    keywords: [
      'voluntariado programación Ecuador',
      'voluntarios DotNet Ecuador',
      'contribuir comunidad tech Ecuador',
      'colaborar desarrollo software'
    ],
    targetCTR: 5,
    targetPosition: 5,
    competitorAnalysis: ['Code for Ecuador', 'Fundación Crisfe'],
    monthlySearchVolume: 300,
    difficulty: 'low'
  },
  '/equipo': {
    title: 'Equipo DotNet Ecuador - Conoce Nuestros Líderes Técnicos',
    description: 'Conoce al equipo de líderes y organizadores de DotNet Ecuador. Desarrolladores expertos en .NET, C#, Azure y tecnologías Microsoft.',
    keywords: [
      'equipo DotNet Ecuador',
      'líderes tech Ecuador',
      'organizadores comunidad .NET',
      'desarrolladores senior Ecuador'
    ],
    targetCTR: 4,
    targetPosition: 8,
    competitorAnalysis: [],
    monthlySearchVolume: 150,
    difficulty: 'low'
  },
  '/proyectos': {
    title: 'Proyectos Open Source DotNet Ecuador - Contribuye al Código',
    description: 'Explora los proyectos open source de DotNet Ecuador. Contribuye con código, aprende y colabora en proyectos reales con .NET y C#.',
    keywords: [
      'proyectos open source Ecuador',
      'contribuir código .NET',
      'GitHub DotNet Ecuador',
      'proyectos colaborativos programación'
    ],
    targetCTR: 5.5,
    targetPosition: 6,
    competitorAnalysis: ['Código Ecuador', 'Open Source Ecuador'],
    monthlySearchVolume: 200,
    difficulty: 'medium'
  },
  '/sobre-nosotros': {
    title: 'Sobre DotNet Ecuador - Historia y Misión de Nuestra Comunidad',
    description: 'Conoce la historia, misión y visión de DotNet Ecuador. La comunidad de desarrolladores .NET más activa de Ecuador desde 2020.',
    keywords: [
      'historia DotNet Ecuador',
      'misión comunidad tech Ecuador',
      'visión desarrolladores .NET',
      'acerca de DotNet Ecuador'
    ],
    targetCTR: 4.5,
    targetPosition: 7,
    competitorAnalysis: [],
    monthlySearchVolume: 100,
    difficulty: 'low'
  },
  '/eventos': {
    title: 'Eventos .NET Ecuador 2026 | Meetups, Talleres y Conferencias',
    description: 'Los eventos de programación .NET más importantes del Ecuador. Meetups presenciales en Quito, talleres de C# y Azure, y la DotNet Developer Conf anual. Empresas y devs bienvenidos.',
    keywords: [
      // Dev discovery
      'eventos .NET Ecuador 2026',
      'meetup .NET Ecuador',
      'meetup C# Quito',
      'taller Azure Ecuador',
      'taller Azure Quito',
      'conferencia .NET Ecuador',
      'DotNet Developer Conf Ecuador',
      'eventos programación Ecuador',
      'comunidad .NET Ecuador',
      // B2B / empresa
      'patrocinar evento tech Ecuador',
      'sponsor comunidad desarrolladores Ecuador',
      'convenio empresa tecnología Ecuador',
      'alianza estratégica tech Ecuador',
      'contratar talento .NET Ecuador',
      'visibilidad desarrolladores Ecuador',
      // Generic
      'eventos Microsoft Ecuador',
      'talleres .NET Ecuador',
      'conferencias tech Ecuador'
    ],
    targetCTR: 8,
    targetPosition: 2,
    competitorAnalysis: ['DevDay Ecuador', 'Tech Talks Ecuador', 'AWS Events Ecuador'],
    monthlySearchVolume: 800,
    difficulty: 'high'
  },
  '/contacto': {
    title: 'Contacto DotNet Ecuador - Conecta con Nuestra Comunidad',
    description: 'Contáctanos para colaboraciones, patrocinios, presentaciones o cualquier consulta sobre la comunidad DotNet Ecuador.',
    keywords: [
      'contacto DotNet Ecuador',
      'colaboraciones tech Ecuador',
      'patrocinios eventos programación',
      'consultas comunidad .NET'
    ],
    targetCTR: 3,
    targetPosition: 10,
    competitorAnalysis: [],
    monthlySearchVolume: 80,
    difficulty: 'low'
  },
  '/marca': {
    title: 'Recursos de Marca | DotNet Ecuador',
    description: 'Descarga los assets oficiales de DotNet Ecuador: logotipos, isotipos y recursos gráficos en alta calidad.',
    keywords: [
      'logo DotNet Ecuador',
      'descargar logo',
      'brand assets',
      'recursos marca DotNet'
    ],
    targetCTR: 3,
    targetPosition: 10,
    competitorAnalysis: [],
    monthlySearchVolume: 100,
    difficulty: 'low'
  },
  '/nfts': {
    title: 'NFT Collection DotNet Ecuador Developers - First Edition 2026',
    description: 'Explora la colección NFT exclusiva de DotNet Ecuador: 31 arquetipos únicos de desarrolladores .NET en Polygon. First Edition 2026 en OpenSea.',
    keywords: [
      'NFT DotNet Ecuador',
      'colección NFT desarrolladores',
      'NFT Polygon Ecuador',
      'DotNet Ecuador Developers NFT',
      'NFT programadores Ecuador',
      'First Edition 2026 NFT'
    ],
    targetCTR: 5,
    targetPosition: 5,
    competitorAnalysis: [],
    monthlySearchVolume: 150,
    difficulty: 'low'
  }
};

// Configuración SEO local para Ecuador
export const LOCAL_SEO_CONFIG: LocalSEOConfig = {
  businessName: 'DotNet Ecuador',
  address: 'Ecuador',
  phone: '+593',
  email: 'contacto@dotnetecuador.com',
  coordinates: {
    lat: -0.1807,
    lng: -78.4678
  },
  serviceAreas: [
    'Quito',
    'Guayaquil', 
    'Cuenca',
    'Ambato',
    'Santo Domingo',
    'Machala',
    'Durán',
    'Manta',
    'Riobamba',
    'Loja'
  ],
  categories: [
    'Software Development Community',
    'Programming Education',
    'Technology Meetups',
    'Developer Training',
    'Open Source Projects'
  ]
};

// Keywords objetivo por ciudad
export const CITY_KEYWORDS = {
  quito: [
    'programadores Quito',
    'desarrolladores Quito',
    'eventos tech Quito',
    'cursos programación Quito',
    'bootcamp Quito',
    'comunidad desarrolladores Quito'
  ],
  guayaquil: [
    'programadores Guayaquil',
    'desarrolladores Guayaquil', 
    'eventos tech Guayaquil',
    'cursos programación Guayaquil',
    'comunidad desarrolladores Guayaquil'
  ],
  cuenca: [
    'programadores Cuenca',
    'desarrolladores Cuenca',
    'tecnología Cuenca',
    'software Cuenca'
  ]
};

// Configuración de tracking de métricas
export const SEO_TRACKING_CONFIG = {
  googleSearchConsole: {
    siteUrl: 'https://dotnetecuador.com',
    ownerEmail: 'contacto@dotnetecuador.com'
  },
  targetMetrics: {
    organicTraffic: {
      current: 0,
      target: 5000,
      timeframe: '6 months'
    },
    averagePosition: {
      current: 50,
      target: 10,
      timeframe: '3 months'
    },
    clickThroughRate: {
      current: 2,
      target: 6,
      timeframe: '4 months'
    },
    indexedPages: {
      current: 0,
      target: 8,
      timeframe: '1 month'
    }
  },
  competitors: [
    'microsoft.com/es-es/events',
    'aws.amazon.com/es/events',
    'developers.google.com/events',
    'tech-talks.com',
    'meetup.com/es'
  ],
  monitoringFrequency: 'weekly'
};