import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  optimizeDeps: {
    include: [
      'prismjs',
      'prismjs/components/prism-typescript',
      'prismjs/components/prism-javascript',
      'mermaid'
    ]
  },
  build: {
    chunkSizeWarningLimit: 600, // 600kBに引き上げ（mermaidが大きいため）
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('mermaid')) {
            return 'mermaid';
          }
          if (id.includes('prismjs')) {
            return 'prism';
          }
          if (id.includes('rxjs')) {
            return 'rxjs';
          }
          // 大きなページを個別チャンクに分離
          if (id.includes('phase1/network-tech/http-versions')) {
            return 'http-versions';
          }
          if (id.includes('phase1/network-tech/tcp-websocket')) {
            return 'tcp-websocket';
          }
        }
      }
    }
  },
  server: {
    fs: {
      // Allow serving files from static directory in dev mode
      allow: ['..']
    }
  }
});
