// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://dotnetecuador.com',
  output: 'static',
  integrations: [tailwind(), react()],
  compressHTML: true,
  build: {
    assets: '_astro'
  },
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'https://api.dotnetecuador.com',
          changeOrigin: true,
          secure: true,
        }
      }
    }
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