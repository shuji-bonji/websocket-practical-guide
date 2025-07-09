import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import mdsvexConfig from './mdsvex.config.js';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
  kit: {
    // Configure for GitHub Pages static deployment
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      base: dev ? '' : '/websocket-practical-guide'
    },
    prerender: {
      handleHttpError: ({ path, referrer, message }) => {
        // For Phase 1, ignore 404s for routes that are not yet implemented
        if (message.includes('404')) {
          console.warn(
            `Skipping prerender for missing route: ${path} (referenced from ${referrer})`
          );
          return;
        }
        // Re-throw other errors
        throw new Error(message);
      }
    }
  },
  extensions: ['.svelte', '.svx', '.md']
};

export default config;
