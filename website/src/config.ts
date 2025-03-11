import type { NavigationLink, Site } from "./type"

export const SITE: Site = {
    author: 'DotNet Ecuador - Comunidad',
    url: 'https://dotnetecuador.com',
    title: 'DotNet Ecuador - Comunidad Tecnológica del ecosistema Microsoft',
    description: 'Es una comunidad de desarrolladores .NET, estudiantes y empresas tecnológicas enfocada en el crecimiento profesional colectivo en tecnologías Microsoft. Basada en colaboración, innovación y aprendizaje continuo.',
    shortDescription: 'Comunidad de desarrolladores .NET, estudiantes y empresas tecnológicas enfocada en el crecimiento profesional colectivo.',
}

export const NavigationLinks: NavigationLink[] = [
    { name: 'Inicio', url: '/' },
    { name: 'Sobre Nosotros', url: '/sobre-nosotros' },
    { name: 'Voluntariado', url: '/voluntariaodo' },
    { name: 'Nuestro Equipo', url: '/equipo' },
    { name: 'Eventos', url: '/eventos' },
]