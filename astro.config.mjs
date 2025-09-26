// @ts-check
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import vercel from '@astrojs/vercel';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  site: 'https://metodolux.com.br',
  integrations: [preact()],

  vite: {
    plugins: [tailwindcss()]
  }
});