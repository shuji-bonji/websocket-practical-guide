// mdsvex.config.js
import { defineMDSveXConfig as defineConfig } from 'mdsvex';

const config = defineConfig({
	extensions: ['.svelte.md', '.md', '.svx'],

	smartypants: false, // スマートクォートを無効化

	remarkPlugins: [],
	rehypePlugins: []
});

export default config;
