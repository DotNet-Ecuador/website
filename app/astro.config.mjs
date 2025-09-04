// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://dotnetecuador.com',
  integrations: [tailwind()],
  compressHTML: true,
  build: {
    assets: '_astro'
  },
  image: {
    domains: [
      'media.licdn.com', 
      'conferencealert.com', 
      'www.unr.edu', 
      'lh3.googleusercontent.com', 
      'encrypted-tbn0.gstatic.com',
      'i.imgur.com'
    ],
  },
});