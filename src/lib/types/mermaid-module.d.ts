// src/lib/types/mermaid-module.d.ts

declare module 'mermaid' {
	export interface MermaidAPI {
		initialize(config: {
			startOnLoad?: boolean;
			theme?: string;
			themeVariables?: Record<string, unknown>;
			flowchart?: Record<string, unknown>;
			sequence?: Record<string, unknown>;
			logLevel?: string;
			securityLevel?: string;
			maxTextSize?: number;
			fontFamily?: string;
			fontSize?: number;
			[key: string]: unknown;
		}): void;

		render(id: string, definition: string): Promise<{ svg: string; bindFunctions?: () => void }>;

		parse(definition: string): void;
	}

	const mermaid: MermaidAPI;
	export default mermaid;
}
