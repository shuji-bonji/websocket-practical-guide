import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: [
      'prismjs',
      'prismjs/components/prism-typescript',
      'prismjs/components/prism-javascript'
    ]
  }
});
