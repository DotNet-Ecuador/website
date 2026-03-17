import type { NavigationLink, Site } from "./type"

export const SITE: Site = {
    author: 'DotNet Ecuador - Comunidad',
    url: 'https://dotnetecuador.com',
    title: 'DotNet Ecuador - Comunidad Tecnológica del ecosistema Microsoft',
    description: 'Comunidad líder de desarrolladores .NET en Ecuador. Aprende C#, ASP.NET Core, Azure y tecnologías Microsoft. Eventos, cursos y networking para programadores ecuatorianos.',
    shortDescription: 'Comunidad de desarrolladores .NET Ecuador - Programación C#, ASP.NET, cursos y eventos tecnológicos',
}

export const SEO_KEYWORDS = {
    primary: [
        'DotNet Ecuador',
        'desarrolladores .NET Ecuador',
        'programación C# Ecuador',
        'ASP.NET Core Ecuador',
        'comunidad programadores Ecuador',
        'cursos programación Quito',
        'eventos tecnología Ecuador',
        'Microsoft MVP Ecuador'
    ],
    secondary: [
        'bootcamp programación Ecuador',
        'desarrolladores software Quito',
        'Entity Framework Ecuador',
        'Blazor Ecuador',
        'Azure Ecuador',
        'desarrollo web Ecuador',
        'programadores Guayaquil',
        'tecnología Microsoft Ecuador'
    ],
    local: [
        'programadores Quito',
        'desarrolladores Guayaquil',
        'tecnología Cuenca',
        'software Ecuador',
        'IT Ecuador',
        'programación Ambato'
    ]
}

export const NavigationLinks: NavigationLink[] = [
    { name: 'Eventos', url: '/eventos' },
    { name: 'Voluntariado', url: '/voluntariado' },
    { name: 'Nuestro Equipo', url: '/equipo' },
    { name: 'Contacto', url: '/contacto' },
    {
        name: 'Más',
        url: '#',
        children: [
            { name: 'Proyectos', url: '/proyectos' },
            { name: 'Sobre Nosotros', url: '/sobre-nosotros' },
            { name: 'NFTs', url: '/nfts' },
            { name: 'Marca', url: '/marca' },
        ],
    },
]