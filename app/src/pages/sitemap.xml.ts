import type { APIRoute } from 'astro';
import { SITE } from '../config';

// Lista de todas las páginas estáticas del sitio
const staticPages = [
  '',
  '/voluntariado',
  '/equipo', 
  '/proyectos',
  '/sobre-nosotros',
  '/contacto',
  '/eventos'
];

export const GET: APIRoute = async () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => {
  const url = `${SITE.url}${page}`;
  const lastmod = new Date().toISOString().split('T')[0];
  const priority = page === '' ? '1.0' : '0.8';
  const changefreq = page === '' ? 'weekly' : 'monthly';
  
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};