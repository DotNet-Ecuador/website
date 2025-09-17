import type { APIRoute } from 'astro';
import { SITE } from '../config';

export const GET: APIRoute = async () => {
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${SITE.url}/sitemap.xml

# Crawl-delay para bots responsables
Crawl-delay: 1

# Bloquear páginas de desarrollo/testing
Disallow: /spinner-demo
Disallow: /api/
Disallow: /_astro/

# Permitir bots de motores de búsqueda principales
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
};