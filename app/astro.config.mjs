// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Vite 6 with Rolldown-style hooks (filter+handler objects) doesn't apply the
// filter when called through the legacy pluginContainer.load() path used by
// Astro's dev server for on-demand compilation.  This causes @astrojs/react's
// optionsPlugin to return React-opts content for ANY id, including index.astro.
// Patch the handler to guard on the expected virtual-module id.
const fixReactOptsPlugin = {
  name: 'fix-react-opts-load',
  configResolved(config) {
    for (const plugin of config.plugins) {
      if (plugin.name === '@astrojs/react:opts') {
        const load = /** @type {any} */ (plugin.load);
        if (load && typeof load === 'object' && typeof load.handler === 'function') {
          const orig = load.handler;
          load.handler = function (id) {
            if (id !== '\0astro:react:opts') return null;
            return orig.call(this, id);
          };
        }
      }
    }
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://dotnetecuador.com',
  output: 'static',
  integrations: [tailwind(), react()],
  vite: {
    plugins: [fixReactOptsPlugin],
  },
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