/**
 * Slugs de eventos activos.
 * Son el único dato que el frontend mantiene — necesarios para que
 * Astro genere las rutas estáticas en build time.
 * Toda la información del evento (nombre, fecha, precio, speakers, etc.)
 * vive en la base de datos y se fetcha de GET /api/v1/eventos/{slug}.
 */
export const EVENT_SLUGS = [
  'ai-workflows-azure-abril-2026',
  'spec-driven-development-mayo-2026',
  'ia-agentica-empresas-julio-2026',
  'dotnet-developer-conf-2026',
]
